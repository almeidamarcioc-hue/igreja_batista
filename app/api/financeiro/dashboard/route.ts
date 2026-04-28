import { NextResponse } from 'next/server'
import {
  getSaldoPorConta,
  getCobertura30Dias,
  getSaudeMinisterios,
} from '@/lib/financeiro'

// GET /api/financeiro/dashboard - Dados do dashboard
export async function GET() {
  try {
    const [saldoPorConta, cobertura, saudeMinisterios] = await Promise.all([
      getSaldoPorConta(),
      getCobertura30Dias(),
      getSaudeMinisterios(),
    ])

    // Calcula totais
    const saldoTotal = saldoPorConta.reduce((acc, c) => acc + c.saldo_atual, 0)
    const recebidoEsteMes = saldoPorConta.reduce((acc, c) => acc + c.recebido_este_mes, 0)
    const pagoEsteMes = saldoPorConta.reduce((acc, c) => acc + c.pago_este_mes, 0)

    return NextResponse.json({
      resumo: {
        saldo_total: saldoTotal,
        recebido_este_mes: recebidoEsteMes,
        pago_este_mes: pagoEsteMes,
      },
      saldo_por_conta: saldoPorConta,
      cobertura_30dias: cobertura,
      saude_ministerios: saudeMinisterios,
    })
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error)
    return NextResponse.json({ error: 'Erro ao buscar dashboard' }, { status: 500 })
  }
}
