import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/auth/verifySession';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip middleware for login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // ✅ Check for Firebase session cookie
  const session = request.cookies.get('__session')?.value;
  const isValidSession = await verifySessionCookie(session);

  if (!isValidSession) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ✅ Vercel-safe matcher
export const config = {
  matcher: ['/admin/:path*'],
};
