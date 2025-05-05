import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple middleware that checks for session cookie presence
 * No Firebase Admin SDK usage to ensure Edge compatibility
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for session cookie presence
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Allow request to continue - actual session verification happens in API routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
