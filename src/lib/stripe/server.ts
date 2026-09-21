import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as any,
  typescript: true,
});

export const STRIPE_PLANS = {
  monthly: {
    name: 'Digital Heroes Monthly Membership',
    price: 1900, // $19.00 in cents
    interval: 'month' as const,
    currency: 'usd',
    charityMinPct: 10,
    prizePoolContribution: 1000, // $10.00 to prize pool
  },
  yearly: {
    name: 'Digital Heroes Annual Membership',
    price: 19000, // $190.00 in cents ($15.83/mo - 17% savings / 2 months free)
    interval: 'year' as const,
    currency: 'usd',
    charityMinPct: 10,
    prizePoolContribution: 12000, // $120.00/yr to prize pool
    savingsPct: 17,
  }
};
