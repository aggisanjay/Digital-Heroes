import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const userId = req.cookies.get('dh_user_id')?.value;
  const userRole = req.cookies.get('dh_user_role')?.value;
  const subStatus = req.cookies.get('dh_sub_status')?.value;

  const isAuthenticated = Boolean(userId);
  const isAdmin = userRole === 'admin';
  const isSubscribed = subStatus === 'active';

  // 1. Protected Route: /admin (Only authenticated administrators)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', '/admin');
      return NextResponse.redirect(url);
    }

    if (!isAdmin) {
      // If regular subscriber tries to access admin panel, redirect to dashboard
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // 2. Protected Route: /dashboard (Authenticated members)
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', '/dashboard');
      return NextResponse.redirect(url);
    }
  }

  // 3. Guest Only Routes: /login and /register
  // If user is already authenticated, route them to their appropriate workspace
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      const url = req.nextUrl.clone();
      if (isAdmin) {
        url.pathname = '/admin';
      } else if (isSubscribed) {
        url.pathname = '/dashboard';
      } else {
        url.pathname = '/subscribe';
      }
      return NextResponse.redirect(url);
    }
  }

  // 4. Payment Page Protection: /subscribe
  // If already an active paid subscriber, never ask them to pay again; send to dashboard
  if (pathname === '/subscribe') {
    if (isAuthenticated && isSubscribed) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/subscribe',
  ],
};
