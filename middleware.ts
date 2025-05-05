import { NextRequest, NextResponse } from 'next/server';

// We don't need middleware anymore since auth is handled client-side
export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const token = request.cookies.get('your_auth_cookie');

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

// Keep the matcher for future use if needed
export const config = {
  matcher: ['/admin/:path*'],
}; 