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

const WHATSAPP_WINDOW_NAME = 'whatsapp-messages'
let whatsappWindow: Window | null = null

function obterJanelaWhatsApp(url: string): Window | null {
  try {
    const existing = window.open('', WHATSAPP_WINDOW_NAME)
    if (existing && !existing.closed) {
      existing.location.href = url
      existing.focus()
      return existing
    }
  } catch {
    // se não for possível acessar a aba existente, criamos uma nova
  }
  return window.open(url, WHATSAPP_WINDOW_NAME)
}

export function abrirWhatsApp(telefone: string, mensagem: string): void {
  const url = gerarUrl(telefone, mensagem)
  if (!url) return

  if (whatsappWindow && !whatsappWindow.closed) {
    whatsappWindow.location.href = url
    whatsappWindow.focus()
  } else {
    whatsappWindow = obterJanelaWhatsApp(url)
  }
}
