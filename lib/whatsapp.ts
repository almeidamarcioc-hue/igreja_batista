export function formatarTelefone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

export function gerarUrl(telefone: string, mensagem: string): string | null {
  const numero = formatarTelefone(telefone)
  if (numero.length < 12) return null
  const texto = mensagem.normalize ? mensagem.normalize('NFC') : mensagem
  return `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`
}

export function preencherTemplate(template: string, dados: Record<string, string>): string {
  let resultado = template
  for (const [chave, valor] of Object.entries(dados)) {
    const regex = new RegExp(`\\{${chave}\\}`, 'g')
    resultado = resultado.replace(regex, valor ?? '')
  }
  return resultado
}

const WHATSAPP_WINDOW_NAME = 'whatsapp_notificacao'

export function abrirWhatsApp(telefone: string, mensagem: string): void {
  const url = gerarUrl(telefone, mensagem)
  if (!url) return

  try {
    const existingWindow = window.open('', WHATSAPP_WINDOW_NAME)
    if (existingWindow && !existingWindow.closed) {
      existingWindow.location.href = url
      existingWindow.focus()
      return
    }
  } catch {
    // ignore and open a new window if recovery fails
  }

  const whatsappWindow = window.open(url, WHATSAPP_WINDOW_NAME)
  if (whatsappWindow) whatsappWindow.focus()
}
