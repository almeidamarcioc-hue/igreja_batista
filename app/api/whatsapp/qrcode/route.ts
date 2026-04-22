import { NextResponse } from 'next/server'
import { getQRCode, isConfigurado } from '@/lib/evolutionApi'

export async function GET() {
  if (!isConfigurado()) {
    return NextResponse.json({ error: 'Evolution API não configurada' }, { status: 503 })
  }
  const result = await getQRCode()
  return NextResponse.json(result)
}
