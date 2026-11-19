import { NextResponse, type NextRequest } from 'next/server'

// shortcut: one shared login from env vars; move to real accounts once admin pages can edit data.
export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER
  const password = process.env.ADMIN_PASSWORD
  const expected = user && password ? `Basic ${btoa(`${user}:${password}`)}` : null
  // Fails closed: with no login configured, admin stays locked.
  if (expected && request.headers.get('authorization') === expected) return NextResponse.next()
  // Background fetches (Next.js prefetch and client navigation) get a plain 401: a challenge there pops the browser
  // login on other pages. Next.js then falls back to a full page load, which asks for the login only on /admin.
  const dest = request.headers.get('sec-fetch-dest')
  if (dest && dest !== 'document') {
    return new NextResponse('Authentication required', { status: 401 })
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Art City Intelligence admin", charset="UTF-8"' },
  })
}

export const config = { matcher: '/admin/:path*' }
