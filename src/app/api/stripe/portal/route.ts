import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { store } from '@/lib/data/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, customerId, returnUrl } = body;
    const origin = process.env.NEXT_PUBLIC_APP_URL || returnUrl || 'http://localhost:3000';

    let stripeCustomerId = customerId;
    if (!stripeCustomerId && userId) {
      const sub = store.getUserSubscription(userId);
      stripeCustomerId = sub?.stripe_customer_id;
    }

    // If real Stripe secret key and customer ID
    if (
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes('placeholder') &&
      stripeCustomerId &&
      stripeCustomerId.startsWith('cus_') &&
      !stripeCustomerId.includes('demo')
    ) {
      try {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${origin}/dashboard`,
        });
        return NextResponse.json({ url: portalSession.url });
      } catch (stripeErr: any) {
        console.warn('Stripe billing portal fallback:', stripeErr.message);
      }
    }

    return NextResponse.json({
      url: `${origin}/dashboard?portal=manage`,
      simulated: true,
      message: 'Interactive portal simulator active.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Billing portal session failed' }, { status: 500 });
  }
}
