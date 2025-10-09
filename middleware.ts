import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('chat_session')
  const isAuthPage = request.nextUrl.pathname.startsWith('/dashboard/login')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  // If trying to access dashboard without session, redirect to login
  if (isDashboard && !isAuthPage && !sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url))
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}