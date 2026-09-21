import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { store } from '@/lib/data/mock-db';
import { eventBus } from '@/lib/events';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, planType = 'monthly', charityId, charityContributionPct = 10, stripePaymentId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to activate subscription.' }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (planType === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1);
    } else {
      periodEnd.setMonth(now.getMonth() + 1);
    }

    let supabasePersisted = false;

    // 1. Direct persistence in Supabase Online Database
    try {
      const supabaseAdmin = createAdminClient();

      // Update Profile table
      const { error: profileErr } = await supabaseAdmin.from('profiles').update({
        subscription_status: 'active',
        charity_id: charityId || null,
        charity_contribution_pct: Number(charityContributionPct) || 10,
        updated_at: now.toISOString(),
      }).eq('id', userId);

      if (!profileErr) {
        // Upsert into Subscriptions table
        const { error: subErr } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          stripe_customer_id: 'cus_' + userId.substring(0, 12),
          stripe_subscription_id: stripePaymentId || 'sub_' + Math.random().toString(36).substring(2, 10),
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          updated_at: now.toISOString(),
        }, { onConflict: 'user_id' });

        if (!subErr) {
          supabasePersisted = true;
        } else {
          console.warn('Supabase subErr:', subErr);
        }
      }
    } catch (dbErr: any) {
      console.warn('Supabase subscription persistence notice:', dbErr.message);
    }

    // 2. Synchronize to reactive state store
    store.createOrUpdateSubscription(userId, planType, 'active', stripePaymentId);
    store.updateProfile(userId, {
      subscription_status: 'active',
      charity_id: charityId,
      charity_contribution_pct: Number(charityContributionPct) || 10,
    });
    store.setCurrentUser(userId);

    // 3. Emit real-time event for immediate UI reaction
    eventBus.emit('subscription:changed', { userId, status: 'active' });

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully activated. Welcome to Digital Heroes!',
      supabasePersisted,
      planType,
      status: 'active',
      periodEnd: periodEnd.toISOString(),
    });
  } catch (err: any) {
    console.error('Subscription confirmation error:', err);
    return NextResponse.json({ error: err.message || 'Subscription confirmation failed.' }, { status: 500 });
  }
}
