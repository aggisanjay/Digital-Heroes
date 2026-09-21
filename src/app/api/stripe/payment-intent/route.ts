import { NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe/server';
import { store } from '@/lib/data/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planType, charityId, charityContributionPct, userId, email } = body;

    const plan = planType === 'yearly' ? STRIPE_PLANS.yearly : STRIPE_PLANS.monthly;
    const amount = plan.price; // $19.00 or $190.00 in cents

    // If real Stripe Secret key is configured
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        description: `Digital Heroes ${plan.name}`,
        receipt_email: email,
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: userId || '',
          charityId: charityId || '',
          charityContributionPct: String(charityContributionPct || 10),
          planType: planType || 'yearly',
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        amount,
        currency: 'usd',
      });
    }

    if (userId) {
      store.createOrUpdateSubscription(userId, planType || 'yearly', 'active');
      store.updateProfile(userId, {
        subscription_status: 'active',
        charity_id: charityId,
        charity_contribution_pct: Number(charityContributionPct) || 10,
      });
    }

    // Interactive Test Simulator Mode (enables instant end-to-end card verification with zero network hurdles)
    return NextResponse.json({
      clientSecret: 'pi_test_' + Math.random().toString(36).substring(2, 12) + '_secret_' + Math.random().toString(36).substring(2, 10),
      amount,
      currency: 'usd',
      simulated: true,
    });
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json({ error: error.message || 'Payment intent failed' }, { status: 500 });
  }
}
