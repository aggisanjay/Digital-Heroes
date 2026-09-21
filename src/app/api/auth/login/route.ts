import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
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

    // Real Supabase Auth verification
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Fetch authoritative user profile from database
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('*, charity:charities(*)')
      .eq('id', authData.user.id)
      .maybeSingle();

    const role = profile?.role || authData.user.user_metadata?.role || 'subscriber';
    const subscriptionStatus = profile?.subscription_status || 'inactive';

    const destination = role === 'admin'
      ? '/admin'
      : subscriptionStatus === 'active'
      ? '/dashboard'
      : '/subscribe';

    // Clear legacy unverified cookies if they exist
    cookieStore.delete('dh_user_id');
    cookieStore.delete('dh_user_role');
    cookieStore.delete('dh_sub_status');
    cookieStore.delete('dh_user_email');

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile?.full_name || authData.user.user_metadata?.full_name || '',
        role,
        subscription_status: subscriptionStatus,
        charity_id: profile?.charity_id || null,
        charity: profile?.charity || null,
      },
      destination,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed.' }, { status: 500 });
  }
}
