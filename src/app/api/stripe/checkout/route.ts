import { NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, donationAmount, donorName, planType, charityId, charityContributionPct, userId, email, returnUrl } = body;
    const origin = process.env.NEXT_PUBLIC_APP_URL || returnUrl || 'http://localhost:3000';

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Handle Direct One-Off Charity Donation Checkout via Stripe
    if (mode === 'donation' || (donationAmount && Number(donationAmount) > 0)) {
      const amountCents = Math.round(Number(donationAmount) * 100);
      
      let charityName = 'Partner Charity';
      if (charityId) {
        const { data: charity } = await supabaseAdmin
          .from('charities')
          .select('name, slug')
          .eq('id', charityId)
          .maybeSingle();
        if (charity?.name) charityName = charity.name;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Direct Donation to ${charityName}`,
                description: `100% direct charitable gift via Digital Heroes.`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'donation',
          charityId: charityId || '',
          charityName,
          donorName: donorName || '',
          userId: userId || '',
        },
        success_url: `${origin}/charities?donation=success&amt=${donationAmount}`,
        cancel_url: `${origin}/charities?donation=canceled`,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // 2. Handle Subscription Checkout via Stripe
    // Enforce authentication: do NOT create anonymous subscription sessions
    let effectiveUserId = userId;
    let effectiveEmail = email;

    if (!effectiveUserId) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          effectiveUserId = user.id;
          effectiveEmail = effectiveEmail || user.email;
        }
      } catch (e) {}
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in or register before subscribing.' },
        { status: 401 }
      );
    }

    const plan = planType === 'yearly' ? STRIPE_PLANS.yearly : STRIPE_PLANS.monthly;

    // Check if user already has an existing Stripe Customer ID in DB
    let existingCustomerId: string | undefined = undefined;
    const { data: subData } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', effectiveUserId)
      .maybeSingle();

    if (subData?.stripe_customer_id && subData.stripe_customer_id.startsWith('cus_')) {
      existingCustomerId = subData.stripe_customer_id;
    }

    const sessionParams: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: `Includes rolling 5-score golf tracking, monthly jackpot draw entry, and ${charityContributionPct || 10}% pledge to charity.`,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: effectiveUserId,
        charityId: charityId || '',
        charityContributionPct: String(charityContributionPct || 10),
        planType: planType || 'monthly',
      },
      success_url: `${origin}/dashboard/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?payment=canceled`,
    };

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    } else if (effectiveEmail) {
      sessionParams.customer_email = effectiveEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to create Stripe Checkout session.' },
      { status: 500 }
    );
  }
}
