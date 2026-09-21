import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, customerId, returnUrl } = body;
    const origin = process.env.NEXT_PUBLIC_APP_URL || returnUrl || 'http://localhost:3000';

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Resolve effective User ID
    let targetUserId = userId;
    if (!targetUserId) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) targetUserId = user.id;
      } catch (e) {}
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Fetch User Profile from DB
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 3. Check existing customerId in subscriptions table
    let candidateCustomerId = customerId;
    if (!candidateCustomerId) {
      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', targetUserId)
        .maybeSingle();

      candidateCustomerId = sub?.stripe_customer_id;
    }

    let validCustomer: any = null;

    // 4. Verify whether candidateCustomerId actually exists on Stripe
    if (candidateCustomerId && candidateCustomerId.startsWith('cus_')) {
      try {
        const retrieved = await stripe.customers.retrieve(candidateCustomerId);
        if (retrieved && !('deleted' in retrieved && retrieved.deleted)) {
          validCustomer = retrieved;
        }
      } catch (err: any) {
        // If resource_missing (like old synthetic 'cus_159844c4-1b3'), treat as non-existent
        console.warn(`Customer ID ${candidateCustomerId} invalid on Stripe: ${err.message}. Finding/creating valid customer...`);
      }
    }

    // 5. If not valid on Stripe, find by email or create new real customer
    if (!validCustomer) {
      const existingList = await stripe.customers.list({ email: profile.email, limit: 1 });
      if (existingList.data.length > 0) {
        validCustomer = existingList.data[0];
      } else {
        validCustomer = await stripe.customers.create({
          email: profile.email,
          name: profile.full_name || profile.email,
          metadata: { userId: profile.id },
        });
      }

      // Persist the real Stripe customer ID to DB
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: targetUserId,
        stripe_customer_id: validCustomer.id,
        status: 'active',
        plan_type: 'monthly',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    // 6. Create Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: validCustomer.id,
      return_url: `${origin}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('Billing portal error:', err);
    return NextResponse.json(
      { error: err.message || 'Billing portal session failed.' },
      { status: 500 }
    );
  }
}
