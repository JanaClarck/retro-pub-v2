import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/auth/verifySession';

// We don't need middleware anymore since auth is handled client-side
export async function middleware(request: NextRequest) {
  // Skip middleware for login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for Firebase session cookie
  const session = request.cookies.get('__session')?.value;
  const isValidSession = await verifySessionCookie(session);

  if (!isValidSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

// Keep the matcher for future use if needed
export const config = {
  matcher: [
    '/admin/:path*',
    '!/admin/login'  // Exclude login page from middleware
  ]
}; 