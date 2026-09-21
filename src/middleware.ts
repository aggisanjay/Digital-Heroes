import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeqopglggsjgukezraii.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcW9wZ2xnZ3NqZ3VrZXpyYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzAwNjcsImV4cCI6MjEwNTU0NjA2N30.a0bqUm5kfkWoMmg_msc5YDlC_tkqm2C0cyGzz5DmuM4';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1. Verify real cryptographic session via Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();

  let userRole: string = 'subscriber';
  let subStatus: string = 'inactive';

  // 2. If authenticated, query authoritative role and subscription status from database
  if (user) {
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from('profiles')
        .select('role, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userRole = profile.role || 'subscriber';
        subStatus = profile.subscription_status || 'inactive';
      }
    } catch {
      // Fallback to subscriber inactive on DB error
    }
  }

  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(user);
  const isAdmin = userRole === 'admin';
  const isSubscribed = subStatus === 'active';

  // 3. Protected Route: /admin/* (Only verified administrators)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // 4. Protected Route: /dashboard/* (Only authenticated users)
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 5. Guest Routes: /login and /register
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
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

  // 6. Payment Page: /subscribe (Do not ask active subscribers to pay again)
  if (pathname === '/subscribe') {
    if (isAuthenticated && isSubscribed) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
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
