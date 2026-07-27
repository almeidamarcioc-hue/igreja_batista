import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)

  // Headers para evitar cache
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')

  return res
}
