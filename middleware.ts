import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // No authentication required - allow all dashboard access
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}