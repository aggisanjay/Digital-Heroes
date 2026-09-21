import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { store } from '@/lib/data/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, charityId, plan = 'monthly' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabaseAdmin = createAdminClient();

    // 1. Check if user already exists in Supabase DB 'profiles'
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*, charity:charities(*)')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      // Check if they have an active subscription record
      const { data: activeSub } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', existingProfile.id)
        .eq('status', 'active')
        .maybeSingle();

      const isActive = existingProfile.subscription_status === 'active' || !!activeSub;

      // Sync local reactive store with real status
      const updatedProfile = {
        ...existingProfile,
        subscription_status: isActive ? 'active' : 'inactive',
      };
      store.setProfile(updatedProfile);

      const res = NextResponse.json({
        success: true,
        alreadyExists: true,
        isSubscribed: isActive,
        user: updatedProfile,
        supabaseUserId: existingProfile.id,
        destination: existingProfile.role === 'admin' 
          ? '/admin' 
          : isActive 
          ? '/dashboard' 
          : `/subscribe?charityId=${encodeURIComponent(existingProfile.charity_id || charityId || '')}&plan=${plan}`,
        message: isActive
          ? 'Account already registered with an active membership! Welcome back.'
          : 'Account already registered. Please proceed to complete your subscription.',
      });

      const cookieOptions = {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax' as const,
      };

      res.cookies.set('dh_user_id', existingProfile.id, cookieOptions);
      res.cookies.set('dh_user_role', existingProfile.role || 'subscriber', cookieOptions);
      res.cookies.set('dh_sub_status', isActive ? 'active' : 'inactive', cookieOptions);
      res.cookies.set('dh_user_email', existingProfile.email, cookieOptions);

      return res;
    }

    // 2. Check if user exists in Supabase Auth but missing profile
    let supabaseUserId: string | null = null;
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
      if (authUser) {
        supabaseUserId = authUser.id;
      }
    } catch (e: any) {
      console.warn('Auth listUsers check:', e.message);
    }

    // 3. If not in auth, create user in Supabase Auth
    if (!supabaseUserId) {
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          user_metadata: {
            full_name: fullName || cleanEmail.split('@')[0],
            role: cleanEmail.includes('admin') ? 'admin' : 'subscriber',
          },
          email_confirm: true,
        });

        if (authData?.user) {
          supabaseUserId = authData.user.id;
        } else if (authError) {
          console.warn('Supabase auth.admin.createUser note:', authError.message);
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth error:', authErr.message);
      }
    }

    // 4. Insert new profile into Supabase 'profiles' table
    let newProfileData: any = null;
    if (supabaseUserId) {
      try {
        const { data: newProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: supabaseUserId,
            email: cleanEmail,
            full_name: fullName || cleanEmail.split('@')[0],
            role: cleanEmail.includes('admin') ? 'admin' : 'subscriber',
            subscription_status: 'inactive',
            charity_id: charityId || null,
            charity_contribution_pct: 10.0,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!profileError) {
          newProfileData = newProfile;
        }
      } catch (tableErr: any) {
        console.warn('Profiles table insert error:', tableErr.message);
      }
    }

    // 5. Mirror to local store for UI reactivity
    const localUser = store.register(cleanEmail, fullName || cleanEmail.split('@')[0], charityId, plan);
    localUser.subscription_status = 'inactive';
    if (supabaseUserId) {
      localUser.id = supabaseUserId;
      store.setCurrentUser(supabaseUserId);
    }

    const res = NextResponse.json({
      success: true,
      alreadyExists: false,
      isSubscribed: false,
      user: newProfileData || localUser,
      supabaseUserId,
      destination: `/subscribe?charityId=${encodeURIComponent(charityId || '')}&plan=${plan}`,
      message: 'Account successfully created! Please select your payment method.',
    });

    const activeId = supabaseUserId || localUser.id;
    if (activeId) {
      const cookieOptions = {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax' as const,
      };
      res.cookies.set('dh_user_id', activeId, cookieOptions);
      res.cookies.set('dh_user_role', localUser.role || 'subscriber', cookieOptions);
      res.cookies.set('dh_sub_status', 'inactive', cookieOptions);
      res.cookies.set('dh_user_email', cleanEmail, cookieOptions);
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
