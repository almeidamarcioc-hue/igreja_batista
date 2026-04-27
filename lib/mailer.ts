import nodemailer from 'nodemailer'

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) throw new Error('GMAIL_USER e GMAIL_APP_PASSWORD não configurados.')
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  })
}

export async function enviarEmailRecuperacaoSenha(params: {
  para: string
  nome: string
  token: string
  baseUrl: string
}): Promise<void> {
  const { para, nome, token, baseUrl } = params
  const link = `${baseUrl}/login/redefinir?token=${token}`
  const from = process.env.GMAIL_USER

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
        <tr>
          <td style="background:linear-gradient(135deg,#1F1F4D,#2E2E66);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.6);">Igreja Batista Transformação</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:400;color:#fff;">Redefinição de senha</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Olá, <strong>${nome}</strong>.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
              Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#4848A8;border-radius:8px;">
                  <a href="${link}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:.02em;">
                    Redefinir senha
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:#999;text-align:center;">Ou copie e cole este link no navegador:</p>
            <p style="margin:0 0 24px;font-size:11px;color:#4848A8;text-align:center;word-break:break-all;">${link}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              Se você não solicitou a redefinição de senha, ignore este e-mail.<br>
              Sua senha permanece a mesma.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f7;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#bbb;">© ${new Date().getFullYear()} Igreja Batista Transformação</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"IBTM — Workspace" <${from}>`,
    to: para,
    subject: 'Redefinição de senha — Workspace IBTM',
    html,
  })
}
