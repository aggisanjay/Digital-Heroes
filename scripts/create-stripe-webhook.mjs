import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

// Usage: node scripts/create-stripe-webhook.mjs <PUBLIC_APP_URL>
// Example: node scripts/create-stripe-webhook.mjs https://digital-heroes.vercel.app

const appUrl = process.argv[2];

if (!appUrl) {
  console.log('\n❌ Please provide your deployed public URL or tunnel URL:');
  console.log('   node scripts/create-stripe-webhook.mjs https://your-domain.vercel.app\n');
  process.exit(1);
}

const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/stripe/webhook`;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51R6VNMRfmiUZaVDuoLDBPqLcujWQq59v0zHMSV5kTXC5xOdcQkC8Qqt7pnqINDfTZQ4ME2aA0shqExSxpUa9v3p600VBDVtApJ';

const stripe = new Stripe(stripeSecretKey);

async function main() {
  console.log(`\nRegistering Stripe Webhook Endpoint for: ${webhookUrl}`);

  const requiredEvents = [
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed',
  ];

  try {
    const endpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: requiredEvents,
      description: 'Digital Heroes Production/Staging Webhook',
    });

    console.log('\n✅ Webhook endpoint successfully created in Stripe!');
    console.log('   Endpoint ID:    ', endpoint.id);
    console.log('   URL:            ', endpoint.url);
    console.log('   Signing Secret: ', endpoint.secret);

    // Automatically update .env.local if present
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
        envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=.*/g, `STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
      } else {
        envContent += `\nSTRIPE_WEBHOOK_SECRET=${endpoint.secret}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('✅ Updated .env.local with the new STRIPE_WEBHOOK_SECRET!');
    }
  } catch (err) {
    console.error('\n❌ Failed to create webhook endpoint:', err.message);
  }
}

main();
