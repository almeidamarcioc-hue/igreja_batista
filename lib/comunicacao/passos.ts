import { getDb } from '@/lib/db'
import { PROCEDIMENTOS, Passo } from '@/lib/comunicacao/procedimentos'

// Os passos exibidos no checklist não são só o que está em procedimentos.ts:
// o coordenador pode remover um passo padrão (area_passos_desabilitados),
// editar o texto dele (area_passos_override) e acrescentar passos
// (checklist_passos_customizados). Esta função resolve o resultado final e é
// usada tanto pela API de gestão quanto pela de progresso — antes cada lado
// montava a lista por conta própria e o checklist ignorava as alterações.

export interface PassosEfetivos {
  pre: Passo[]
  operacao: Passo[]
  pos: Passo[]
}

function passoVazio(): Omit<Passo, 'id' | 'titulo' | 'descricao'> {
  return { aviso: '', imagem: '', critico: false }
}

// initDb() só roda quando alguém chama /api/init, então a tabela nova pode não
// existir em produção. Criar aqui (idempotente) segue o padrão já usado em
// /api/comunicacao/finalizar e evita 500 no primeiro acesso após o deploy.
export async function garantirTabelaOverride(): Promise<void> {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS area_passos_override (
      id SERIAL PRIMARY KEY,
      area_id VARCHAR(50) NOT NULL,
      passo_id VARCHAR(50) NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(area_id, passo_id)
    )
  `
}

export async function obterPassosEfetivos(areaId: string): Promise<PassosEfetivos | null> {
  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
  if (!area) return null

  const sql = getDb()
  await garantirTabelaOverride()

  const [desabilitados, overrides, customizados] = await Promise.all([
    sql`SELECT passo_id FROM area_passos_desabilitados WHERE area_id = ${areaId}`,
    sql`SELECT passo_id, titulo, descricao FROM area_passos_override WHERE area_id = ${areaId}`,
    sql`
      SELECT DISTINCT ON (titulo) id, titulo, descricao, tipo, criado_em
      FROM checklist_passos_customizados
      WHERE area_id = ${areaId}
      ORDER BY titulo, criado_em DESC
    `,
  ])

  const desabilitadosIds = new Set(desabilitados.map((d: any) => String(d.passo_id)))
  const overridePorPasso = new Map<string, { titulo: string; descricao: string }>(
    overrides.map((o: any) => [
      String(o.passo_id),
      { titulo: String(o.titulo), descricao: String(o.descricao ?? '') },
    ])
  )

  const aplicar = (passos: Passo[]): Passo[] =>
    passos
      .filter(p => !desabilitadosIds.has(p.id))
      .map(p => {
        const ov = overridePorPasso.get(p.id)
        return ov ? { ...p, titulo: ov.titulo, descricao: ov.descricao } : p
      })

  const resultado: PassosEfetivos = {
    pre: aplicar(area.fases.pre),
    operacao: aplicar(area.fases.operacao),
    pos: aplicar(area.fases.pos),
  }

  // Passos acrescentados pelo coordenador entram no fim da sua fase
  for (const c of customizados as any[]) {
    const passo: Passo = {
      id: String(c.id),
      titulo: String(c.titulo),
      descricao: String(c.descricao ?? ''),
      ...passoVazio(),
    }
    const fase = String(c.tipo ?? 'pre')
    if (fase === 'operacao') resultado.operacao.push(passo)
    else if (fase === 'pos') resultado.pos.push(passo)
    else resultado.pre.push(passo)
  }

  return resultado
}
