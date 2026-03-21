import { type NextRequest, NextResponse } from 'next/server'

// Simplified middleware — just pass through, let pages handle auth
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
