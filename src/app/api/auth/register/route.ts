import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, password, fullName, charityId, plan = 'monthly' } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
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

    const admin = createAdminClient();

    // Check if user already exists
    const { data: listData } = await admin.auth.admin.listUsers();
    const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 400 }
      );
    }

    const role = cleanEmail.includes('admin') ? 'admin' : 'subscriber';

    // 1. Create real Supabase Auth user with confirmed email
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || cleanEmail.split('@')[0],
        role,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user account.' },
        { status: 400 }
      );
    }

    const newUserId = authData.user.id;

    // 2. Create authoritative profile in profiles table with inactive status
    await admin.from('profiles').upsert({
      id: newUserId,
      email: cleanEmail,
      full_name: fullName || cleanEmail.split('@')[0],
      role,
      subscription_status: 'inactive',
      charity_id: charityId || null,
      charity_contribution_pct: 10.0,
      updated_at: new Date().toISOString(),
    });

    // 3. Authenticate user to issue real signed session cookies
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    // Clear legacy cookies
    cookieStore.delete('dh_user_id');
    cookieStore.delete('dh_user_role');
    cookieStore.delete('dh_sub_status');
    cookieStore.delete('dh_user_email');

    const destination = role === 'admin'
      ? '/admin'
      : `/subscribe?charityId=${encodeURIComponent(charityId || '')}&plan=${plan}`;

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        email: cleanEmail,
        full_name: fullName || cleanEmail.split('@')[0],
        role,
        subscription_status: 'inactive',
      },
      destination,
      message: 'Account successfully created! Please complete your subscription.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
