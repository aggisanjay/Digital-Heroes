import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { store } from '@/lib/data/mock-db';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && profiles && profiles.length > 0) {
      return NextResponse.json({ users: profiles, source: 'supabase' });
    }

    return NextResponse.json({ users: store.getAllUsers(), source: 'store' });
  } catch (err: any) {
    return NextResponse.json({ users: store.getAllUsers(), source: 'fallback', error: err.message });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, subscription_status, charity_contribution_pct } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: any = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (subscription_status) updates.subscription_status = subscription_status;
    if (charity_contribution_pct !== undefined) updates.charity_contribution_pct = charity_contribution_pct;
    if (body.charity_id !== undefined) updates.charity_id = body.charity_id;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase profile update warning:', error.message);
    }

    // Also update local store
    store.updateProfile(userId, updates);

    return NextResponse.json({
      user: data || store.getProfile(userId),
      message: 'User profile updated successfully in database.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}
