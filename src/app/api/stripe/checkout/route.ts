import { NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe/server';
import { store } from '@/lib/data/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, donationAmount, donorName, planType, charityId, charityContributionPct, userId, email, returnUrl } = body;
    const origin = process.env.NEXT_PUBLIC_APP_URL || returnUrl || 'http://localhost:3000';

    // Handle Direct One-Off Charity Donation Checkout via Stripe
    if (mode === 'donation' || (donationAmount && Number(donationAmount) > 0)) {
      const amountCents = Math.round(Number(donationAmount) * 100);
      const charity = store.getCharities().find(c => c.id === charityId);
      const charityName = charity?.name || 'Partner Charity';

      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
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
          success_url: `${origin}/charities/${charity?.slug || ''}?donation=success&amt=${donationAmount}`,
          cancel_url: `${origin}/charities/${charity?.slug || ''}?donation=canceled`,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
      }

      store.addDonation(charityId, Number(donationAmount), donorName, email, userId);
      return NextResponse.json({
        url: `${origin}/charities/${charity?.slug || ''}?donation=success&amt=${donationAmount}`,
        sessionId: 'cs_test_don_' + Math.random().toString(36).substring(2, 9),
        simulated: true,
      });
    }

    const plan = planType === 'yearly' ? STRIPE_PLANS.yearly : STRIPE_PLANS.monthly;

    // If Stripe secret key is configured with real key, create real Stripe Checkout session
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: plan.name,
                description: `Includes rolling 5-score golf tracking, monthly jackpot draw entry, and ${charityContributionPct || 10}% auto-donation to charity.`,
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
          userId: userId || '',
          charityId: charityId || '',
          charityContributionPct: String(charityContributionPct || 10),
          planType,
        },
        success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscribe?payment=canceled`,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Interactive Test Simulator Mode (handles instant verification without external network dependency)
    // Updates user profile in store to active subscription
    if (userId) {
      store.createOrUpdateSubscription(userId, planType || 'monthly', 'active');
      store.updateProfile(userId, {
        subscription_status: 'active',
        charity_id: charityId,
        charity_contribution_pct: Number(charityContributionPct) || 10,
      });
    }

    const testSuccessUrl = `${origin}/dashboard?payment=success&plan=${planType}`;
    return NextResponse.json({
      url: testSuccessUrl,
      sessionId: 'cs_test_' + Math.random().toString(36).substring(2, 10),
      simulated: true,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message || 'Unable to create checkout session' }, { status: 500 });
  }
}
