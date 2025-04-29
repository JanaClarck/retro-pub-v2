import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We don't need middleware anymore since auth is handled client-side
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Keep the matcher for future use if needed
export const config = {
  matcher: '/admin/:path*',
}; 