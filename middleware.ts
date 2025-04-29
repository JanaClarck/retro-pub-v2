import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Check if it's an admin route
  if (path.startsWith('/admin') && path !== '/admin/login') {
    // Get the token from the cookie
    const session = request.cookies.get('session')?.value;

    // If no session exists, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the paths that should be checked by the middleware
export const config = {
  matcher: '/admin/:path*',
}; 