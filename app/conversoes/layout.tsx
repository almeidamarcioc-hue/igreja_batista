import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conversões — IBTM',
  description: 'Módulo de acompanhamento de conversões',
}

export default function ConversoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ backgroundColor: '#002347', color: '#1f2937', margin: 0, padding: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
