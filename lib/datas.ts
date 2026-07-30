// Datas no formato 'YYYY-MM-DD' (culto_data) precisam ser lidas como data local.
// `new Date('2026-07-29')` é interpretado como meia-noite UTC: no servidor (UTC)
// resulta em 29/07, no navegador em BRT (-3h) resulta em 28/07. Isso gerava texto
// diferente entre servidor e cliente (erro de hidratação React #418) e exibia a
// data um dia atrasada.

/** Converte 'YYYY-MM-DD' (ou ISO com hora) em Date no fuso local, sem deslocar o dia. */
export function parseDataLocal(valor: string | Date): Date {
  if (valor instanceof Date) return valor

  const soData = String(valor).split('T')[0]
  const partes = soData.split('-')
  if (partes.length === 3) {
    const [ano, mes, dia] = partes.map(Number)
    if (!Number.isNaN(ano) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
      return new Date(ano, mes - 1, dia)
    }
  }
  return new Date(valor)
}

/** Formata 'YYYY-MM-DD' em pt-BR de forma estável entre servidor e cliente. */
export function formatarDataBR(valor: string | Date, opcoes?: Intl.DateTimeFormatOptions): string {
  return parseDataLocal(valor).toLocaleDateString('pt-BR', opcoes)
}
