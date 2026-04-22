import { NextResponse } from 'next/server'
import { getStatus, isConfigurado } from '@/lib/evolutionApi'

export async function GET() {
  if (!isConfigurado()) {
    return NextResponse.json({ status: 'nao_configurado' })
  }
  const status = await getStatus()
  return NextResponse.json({ status })
}
