import { NextResponse } from 'next/server'
import {
  getLembretesPendentes,
  marcarLembreteEnviado,
  getConfiguracoes,
  Agendamento,
} from '@/lib/db'
import { preencherTemplate, gerarUrl } from '@/lib/whatsapp'
import { enviarMensagem, isConfigurado, getStatus } from '@/lib/evolutionApi'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * GET /api/scheduler
 *
 * Chamado periodicamente pelo Vercel Cron (a cada 30 min).
 * Verifica lembretes pendentes, gera as URLs do WhatsApp e marca como enviados.
 * Como o servidor não pode abrir o browser, retorna a lista com as URLs geradas
 * para que o cliente possa processá-las, e marca os registros como enviados.
 */
export async function GET() {
  try {
    const pendentes = await getLembretesPendentes()
    const config = await getConfiguracoes()

    const waAtivo = isConfigurado() && (await getStatus()) === 'open'

    const resultados: Array<{
      agendamento: Agendamento
      fiel: { enviado: boolean; erro?: string; url?: string | null }
      pastor: { enviado: boolean; erro?: string; url?: string | null }
    }> = []

    for (const agendamento of pendentes) {
      let dataFormatada = agendamento.data
      try {
        dataFormatada = format(new Date(`${agendamento.data}T00:00:00`), "dd/MM/yyyy (EEEE)", { locale: ptBR })
      } catch { /* mantém original */ }

      const templateData: Record<string, string> = {
        nome: agendamento.nome_fiel,
        nome_fiel: agendamento.nome_fiel,
        pastor: agendamento.pastor_nome ?? '',
        pastor_nome: agendamento.pastor_nome ?? '',
        data: dataFormatada,
        hora: agendamento.hora?.slice(0, 5) ?? '',
        assunto: agendamento.assunto,
        telefone: agendamento.telefone,
      }

      const msgFiel = preencherTemplate(
        config.msg_lembrete || 'Olá {nome}! Lembrete: agendamento com {pastor} em {data} às {hora}.',
        templateData
      )
      const msgPastor = preencherTemplate(
        config.msg_pastor || 'Lembrete: {nome_fiel} - {assunto} - {data} às {hora}.',
        templateData
      )

      let fiel: (typeof resultados[0])['fiel']
      let pastor: (typeof resultados[0])['pastor']

      if (waAtivo) {
        // Envio automático via Evolution API
        const resFiel = agendamento.telefone
          ? await enviarMensagem(agendamento.telefone, msgFiel)
          : { ok: false, erro: 'Sem telefone' }
        const resPastor = agendamento.pastor_tel
          ? await enviarMensagem(agendamento.pastor_tel, msgPastor)
          : { ok: false, erro: 'Pastor sem telefone' }
        fiel = { enviado: resFiel.ok, erro: resFiel.erro }
        pastor = { enviado: resPastor.ok, erro: resPastor.erro }
      } else {
        // Fallback: gera URLs para envio manual
        fiel = { enviado: false, url: agendamento.telefone ? gerarUrl(agendamento.telefone, msgFiel) : null }
        pastor = { enviado: false, url: agendamento.pastor_tel ? gerarUrl(agendamento.pastor_tel, msgPastor) : null }
      }

      resultados.push({ agendamento, fiel, pastor })
      await marcarLembreteEnviado(agendamento.id)
    }

    return NextResponse.json({
      success: true,
      waAtivo,
      processados: resultados.length,
      lembretes: resultados,
    })
  } catch (error) {
    console.error('Erro no scheduler:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
