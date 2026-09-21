import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
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
    // Direct JSON test or runner
    try {
      event = JSON.parse(body);
    } catch (e: any) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  const supabaseAdmin = createAdminClient();

  try {
    switch (event.type) {
      // 1. New Subscription or Donation Completed
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

          const { error: donErr } = await supabaseAdmin.from('donations').insert({
            charity_id: charityId,
            amount: donationAmount,
            donor_name: donorName,
            donor_email: donorEmail,
            user_id: userId || null,
            status: 'succeeded',
            stripe_payment_id: session.payment_intent || session.id,
          });

          if (donErr) {
            console.error('Failed to insert donation:', donErr);
            throw new Error(`Donation DB insert failed: ${donErr.message}`);
          }
        } else if (userId) {
          const planType = session.metadata?.planType || 'monthly';
          const customerId = session.customer ? String(session.customer) : null;
          const subscriptionId = session.subscription ? String(session.subscription) : null;

          // Update profile in PostgreSQL
          const { error: profErr } = await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            charity_id: charityId || null,
            charity_contribution_pct: charityContributionPct ? Number(charityContributionPct) : 10.0,
            updated_at: new Date().toISOString(),
          }).eq('id', userId);

          if (profErr) {
            console.error('Failed to activate profile:', profErr);
            throw new Error(`Profile activation failed: ${profErr.message}`);
          }

          // Upsert subscription in PostgreSQL
          const { error: subErr } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_type: planType,
            status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          if (subErr) {
            console.error('Failed to upsert subscription:', subErr);
            throw new Error(`Subscription upsert failed: ${subErr.message}`);
          }

          console.log(`Successfully activated subscription for user ${userId}`);
        }
        break;
      }

      // 2. Subscription Status Updated in Stripe
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        let userId = subscription.metadata?.userId;
        const stripeCustomerId = String(subscription.customer);
        const stripeStatus = subscription.status; // active, past_due, canceled, unpaid

        // If userId not in metadata, lookup by customer ID
        if (!userId && stripeCustomerId) {
          const { data: subRecord } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', stripeCustomerId)
            .maybeSingle();

          if (subRecord?.user_id) {
            userId = subRecord.user_id;
          }
        }

        if (userId) {
          let mappedStatus: string = 'inactive';
          if (stripeStatus === 'active') mappedStatus = 'active';
          else if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') mappedStatus = 'past_due';
          else if (stripeStatus === 'canceled') mappedStatus = 'canceled';
          else if (stripeStatus === 'trialing') mappedStatus = 'trialing';

          const { error: profErr } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: mappedStatus, updated_at: new Date().toISOString() })
            .eq('id', userId);

          if (profErr) console.error('Subscription update profile error:', profErr);

          const { error: subErr } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: mappedStatus,
              stripe_subscription_id: subscription.id,
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (subErr) console.error('Subscription table update error:', subErr);

          console.log(`Updated subscription status for user ${userId} to ${mappedStatus}`);
        }
        break;
      }

      // 3. Subscription Canceled / Deleted
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        let userId = subscription.metadata?.userId;
        const stripeCustomerId = String(subscription.customer);

        if (!userId && stripeCustomerId) {
          const { data: subRecord } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', stripeCustomerId)
            .maybeSingle();

          if (subRecord?.user_id) userId = subRecord.user_id;
        }

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'canceled', updated_at: new Date().toISOString() })
            .eq('id', userId);

          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled', updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          console.log(`Canceled subscription for user ${userId}`);
        }
        break;
      }

      // 4. Payment Failure (CRITICAL: set past_due)
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer ? String(invoice.customer) : null;
        const stripeSubId = invoice.subscription ? String(invoice.subscription) : null;
        const failureReason = invoice.last_payment_error?.message || 'Invoice payment failed or declined';

        console.error(`CRITICAL: Payment failed for customer ${stripeCustomerId}, invoice ${invoice.id}: ${failureReason}`);

        if (stripeCustomerId || stripeSubId) {
          let query = supabaseAdmin.from('subscriptions').select('user_id');
          if (stripeCustomerId) {
            query = query.eq('stripe_customer_id', stripeCustomerId);
          } else if (stripeSubId) {
            query = query.eq('stripe_subscription_id', stripeSubId);
          }

          const { data: subRecord } = await query.maybeSingle();

          if (subRecord?.user_id) {
            const userId = subRecord.user_id;

            const { error: profErr } = await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);

            if (profErr) {
              console.error('Failed to mark profile past_due:', profErr);
              throw new Error(`Profile past_due update failed: ${profErr.message}`);
            }

            const { error: subErr } = await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);

            if (subErr) {
              console.error('Failed to mark subscription past_due:', subErr);
              throw new Error(`Subscription past_due update failed: ${subErr.message}`);
            }

            console.log(`User ${userId} successfully marked past_due in database due to invoice payment failure.`);
          } else {
            console.warn(`No user found for failed customer ${stripeCustomerId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook processing exception:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
