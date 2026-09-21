import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { store } from '@/lib/data/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    let supabaseUser: any = null;

    // 1. Query Supabase Auth for existing user
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      supabaseUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
    } catch (authErr: any) {
      console.warn('Supabase auth search warning:', authErr.message);
    }

    // 2. Also check if profile exists in Supabase DB table
    let dbProfile: any = null;
    if (supabaseUser) {
      try {
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('*, charity:charities(*)')
          .eq('id', supabaseUser.id)
          .single();
        dbProfile = data;
      } catch (dbErr: any) {
        // Table may not have been migrated yet
      }
    }

    // 3. Fallback/Sync with store
    const localUser = store.login(email);
    if (supabaseUser) {
      localUser.id = supabaseUser.id;
      if (supabaseUser.user_metadata?.full_name) {
        localUser.full_name = supabaseUser.user_metadata.full_name;
      }
      if (supabaseUser.user_metadata?.role) {
        localUser.role = supabaseUser.user_metadata.role;
      }
      if (dbProfile) {
        localUser.subscription_status = dbProfile.subscription_status || localUser.subscription_status;
        localUser.charity_id = dbProfile.charity_id || localUser.charity_id;
      }
      store.setCurrentUser(localUser.id);
    }

    const destination = localUser.role === 'admin'
      ? '/admin'
      : localUser.subscription_status === 'active'
      ? '/dashboard'
      : '/subscribe';

    const res = NextResponse.json({
      success: true,
      user: localUser,
      supabaseConnected: !!supabaseUser,
      destination,
    });

    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax' as const,
    };

    res.cookies.set('dh_user_id', localUser.id, cookieOptions);
    res.cookies.set('dh_user_role', localUser.role || 'subscriber', cookieOptions);
    res.cookies.set('dh_sub_status', localUser.subscription_status || 'inactive', cookieOptions);
    res.cookies.set('dh_user_email', localUser.email, cookieOptions);

    return res;

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
