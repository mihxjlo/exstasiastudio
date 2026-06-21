import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // We can't read localStorage from middleware (server-side),
    // so we check for a cookie-based token or redirect to login.
    // The actual JWT check happens client-side; middleware just ensures
    // the login page is accessible and other admin pages redirect if no cookie.
    const token = request.cookies.get('exstasia_jwt')?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
