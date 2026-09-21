import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeqopglggsjgukezraii.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcW9wZ2xnZ3NqZ3VrZXpyYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzAwNjcsImV4cCI6MjEwNTU0NjA2N30.a0bqUm5kfkWoMmg_msc5YDlC_tkqm2C0cyGzz5DmuM4';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('*, charity:charities(*)')
      .eq('id', user.id)
      .maybeSingle();

    const { data: subscription } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        role: profile?.role || user.user_metadata?.role || 'subscriber',
        subscription_status: profile?.subscription_status || 'inactive',
        charity_id: profile?.charity_id || null,
        charity: profile?.charity || null,
        charity_contribution_pct: profile?.charity_contribution_pct || 10,
      },
      subscription,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch session.' }, { status: 500 });
  }
}
