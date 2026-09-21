// scripts/test-stripe-event.mjs
// Usage: node scripts/test-stripe-event.mjs [payment_success | payment_failed | subscription_canceled]

const BASE = 'http://localhost:3000';
const action = process.argv[2] || 'payment_success';
const userId = '159844c4-1b32-4bba-ba3d-d7028b04c405'; // aggisanjay1234@gmail.com

console.log(`\n--- STRIPE WEBHOOK EVENT SIMULATOR (${action}) ---`);

async function sendWebhook(eventPayload) {
  try {
    const res = await fetch(`${BASE}/api/stripe/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });
    const data = await res.json();
    console.log('Webhook Response Status:', res.status);
    console.log('Result:', data);
  } catch (err) {
    console.error('Failed to dispatch webhook:', err.message);
  }
}

if (action === 'payment_success') {
  console.log('Simulating: checkout.session.completed (User subscription activated)...');
  sendWebhook({
    id: 'evt_test_checkout_' + Date.now(),
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        customer: 'cus_test_sanjay',
        subscription: 'sub_test_' + Date.now(),
        customer_details: { email: 'aggisanjay1234@gmail.com', name: 'Aggi Sanjay' },
        metadata: {
          userId,
          planType: 'monthly',
          charityContributionPct: '10',
        },
      },
    },
  });
} else if (action === 'payment_failed') {
  console.log('Simulating: invoice.payment_failed (User subscription marked past_due)...');
  sendWebhook({
    id: 'evt_test_failed_' + Date.now(),
    type: 'invoice.payment_failed',
    data: {
      object: {
        id: 'in_test_' + Date.now(),
        customer: 'cus_test_sanjay',
        subscription: 'sub_test_active',
        customer_email: 'aggisanjay1234@gmail.com',
      },
    },
  });
} else if (action === 'subscription_canceled') {
  console.log('Simulating: customer.subscription.deleted (User subscription canceled)...');
  sendWebhook({
    id: 'evt_test_canceled_' + Date.now(),
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_test_active',
        customer: 'cus_test_sanjay',
        status: 'canceled',
      },
    },
  });
}
