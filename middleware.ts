import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We don't need middleware anymore since auth is handled client-side
export function middleware(request: NextRequest) {
  // Skip middleware for login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for Firebase session cookie
  const session = request.cookies.get('__session')?.value;

  if (!session) {
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