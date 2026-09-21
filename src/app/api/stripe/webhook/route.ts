import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { store } from '@/lib/data/mock-db';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  if (webhookSecret && signature && !webhookSecret.includes('placeholder')) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  } else {
    // If testing webhook directly via JSON payload or test runner
    try {
      event = JSON.parse(body);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  try {
    const supabaseAdmin = createAdminClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const charityId = session.metadata?.charityId;
        const charityContributionPct = session.metadata?.charityContributionPct;
        const type = session.metadata?.type;

        if (type === 'donation' && charityId) {
          const donationAmount = (session.amount_total || 0) / 100;
          const donorName = session.metadata?.donorName || session.customer_details?.name || 'Generous Hero';
          const donorEmail = session.customer_details?.email;
          store.addDonation(charityId, donationAmount, donorName, donorEmail, userId);

          // Sync donation to Supabase
          try {
            await supabaseAdmin.from('donations').insert({
              charity_id: charityId,
              amount: donationAmount,
              donor_name: donorName,
              donor_email: donorEmail,
              user_id: userId || null,
            });
          } catch (e) {}
        } else if (userId) {
          const planType = session.metadata?.planType || 'monthly';
          store.createOrUpdateSubscription(userId, planType, 'active', session.subscription);
          store.updateProfile(userId, {
            subscription_status: 'active',
            charity_id: charityId || undefined,
            charity_contribution_pct: charityContributionPct ? Number(charityContributionPct) : undefined,
          });

          // Sync subscription to Supabase
          try {
            await supabaseAdmin.from('profiles').update({
              subscription_status: 'active',
              charity_id: charityId || null,
              charity_contribution_pct: charityContributionPct ? Number(charityContributionPct) : 10.0,
            }).eq('id', userId);

            await supabaseAdmin.from('subscriptions').upsert({
              user_id: userId,
              stripe_customer_id: session.customer || 'cus_' + userId,
              stripe_subscription_id: session.subscription || null,
              plan_type: planType,
              status: 'active',
              updated_at: new Date().toISOString(),
            });
          } catch (e) {}
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const planType = subscription.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        if (userId) {
          store.createOrUpdateSubscription(userId, planType, 'active', subscription.id);
          store.updateProfile(userId, { subscription_status: 'active' });

          try {
            await supabaseAdmin.from('profiles').update({ subscription_status: 'active' }).eq('id', userId);
            await supabaseAdmin.from('subscriptions').upsert({
              user_id: userId,
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              plan_type: planType,
              status: 'active',
              updated_at: new Date().toISOString(),
            });
          } catch (e) {}
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const status = subscription.status; // active, past_due, canceled, trialing

        if (userId) {
          const newStatus = status === 'active' ? 'active' : status === 'past_due' ? 'past_due' : 'lapsed';
          store.updateProfile(userId, { subscription_status: newStatus });
          try {
            await supabaseAdmin.from('profiles').update({ subscription_status: newStatus }).eq('id', userId);
            await supabaseAdmin.from('subscriptions').update({ status: newStatus }).eq('user_id', userId);
          } catch (e) {}
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          store.updateProfile(userId, { subscription_status: 'canceled' });
          try {
            await supabaseAdmin.from('profiles').update({ subscription_status: 'canceled' }).eq('id', userId);
            await supabaseAdmin.from('subscriptions').update({ status: 'canceled' }).eq('user_id', userId);
          } catch (e) {}
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        // In real setup, find user by stripe_customer_id
        console.warn(`Payment failed for invoice ${invoice.id}, customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
