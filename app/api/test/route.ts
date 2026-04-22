import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ error: 'DATABASE_URL não configurado' }, { status: 500 })

  try {
    const sql = neon(url)
    await sql`SELECT 1 AS ok`
    return NextResponse.json({ ok: true, url_preview: url.substring(0, 40) + '...' })
  } catch (e) {
    return NextResponse.json({ error: String(e), url_preview: url.substring(0, 40) + '...' }, { status: 500 })
  }
}
