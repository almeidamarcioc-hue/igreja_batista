import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'

// Paths that never require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/init',
  '/_next',
  '/favicon',
  '/ibtm-logo',
  '/logo',
  '/manifest',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '.'))
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

// /api/configuracoes/slides GET is public (used by login page)
function isPublicApiSlides(req: NextRequest): boolean {
  return req.nextUrl.pathname === '/api/configuracoes/slides' && req.method === 'GET'
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return NextResponse.next()
  if (isPublicApiSlides(req)) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  const userId = token ? await verifySessionToken(token) : null

  if (!userId) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.ico).*)',
  ],
}
