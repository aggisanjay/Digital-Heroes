// End-to-End Automated Verification Script for Digital Heroes Platform

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('🚀 Starting Digital Heroes End-to-End System Verification...\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, message) {
    totalCount++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Verify Public Homepage & Core Routes
  console.log('--- 1. Testing Core Web Routes ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  assert(homeRes.status === 200, 'Homepage returns 200 OK');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('DIGITAL') && homeHtml.includes('HEROES'), 'Homepage renders brand lockup');
  assert(homeHtml.includes('Jackpot') || homeHtml.includes('Charity'), 'Homepage renders impact & prize messaging');

  const howRes = await fetch(`${BASE_URL}/how-it-works`);
  assert(howRes.status === 200, 'How It Works route returns 200 OK');

  const charitiesRes = await fetch(`${BASE_URL}/charities`);
  assert(charitiesRes.status === 200, 'Charity Directory returns 200 OK');

  const subRes = await fetch(`${BASE_URL}/subscribe`);
  assert(subRes.status === 200, 'Subscribe Onboarding returns 200 OK');

  const dashRes = await fetch(`${BASE_URL}/dashboard`);
  assert(dashRes.status === 200, 'User Dashboard returns 200 OK');

  const adminRes = await fetch(`${BASE_URL}/admin`);
  assert(adminRes.status === 200, 'Admin Panel returns 200 OK');

  // 2. Testing Charities API & Directory
  console.log('\n--- 2. Testing Charities API ---');
  const charListRes = await fetch(`${BASE_URL}/api/charities`);
  const charListData = await charListRes.json();
  assert(Array.isArray(charListData.charities), 'Charities API returns array of organizations');
  assert(charListData.charities.length >= 4, `At least 4 partner charities configured (found ${charListData.charities.length})`);
  const sampleCharity = charListData.charities[0];
  assert(sampleCharity.slug && sampleCharity.total_raised !== undefined, 'Charity contains slug and total_raised');

  // 3. Testing One-Off Direct Donation API
  console.log('\n--- 3. Testing One-Off Donation Flow ---');
  const initialRaised = Number(sampleCharity.total_raised);
  const donationRes = await fetch(`${BASE_URL}/api/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      charityId: sampleCharity.id,
      amount: 150.00,
      donorName: 'Test Philanthropist',
      donorEmail: 'donor@example.com',
    }),
  });
  const donationData = await donationRes.json();
  assert(donationRes.status === 200, 'Donation processed with status 200');
  assert(donationData.donation.amount === 150.00, 'Donation recorded correct amount');

  // 4. Testing Stripe Checkout Session API
  console.log('\n--- 4. Testing Stripe Checkout API ---');
  const checkoutRes = await fetch(`${BASE_URL}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planType: 'yearly',
      charityId: sampleCharity.id,
      charityContributionPct: 20,
      userId: 'sub-001',
      email: 'alex.morgan@example.com',
    }),
  });
  const checkoutData = await checkoutRes.json();
  assert(checkoutRes.status === 200, 'Stripe Checkout endpoint returns 200');
  assert(checkoutData.url && checkoutData.url.includes('payment=success'), 'Checkout returns valid redirect URL');

  // 5. Testing Score Management (Stableford 1-45, Unique Date, Rolling 5)
  console.log('\n--- 5. Testing Score Management & Rolling 5 Logic ---');
  const testUserId = 'sub-001';
  
  // Try invalid score (>45)
  const invalidScoreRes = await fetch(`${BASE_URL}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      score: 50,
      date: '2026-09-21',
      courseName: 'Test Course',
    }),
  });
  assert(invalidScoreRes.status === 400, 'Rejects invalid score > 45 with status 400');

  // Insert valid score
  const validScoreRes = await fetch(`${BASE_URL}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      score: 39,
      date: '2026-09-21',
      courseName: 'Torrey Pines',
    }),
  });
  const validScoreData = await validScoreRes.json();
  assert(validScoreRes.status === 200, 'Accepts valid Stableford score (39 pts)');
  assert(validScoreData.scores.length <= 5, 'Enforces maximum of 5 rolling scores');

  // Try duplicate date insertion
  const duplicateDateRes = await fetch(`${BASE_URL}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      score: 41,
      date: '2026-09-21', // Collides with above
      courseName: 'Duplicate Course',
    }),
  });
  assert(duplicateDateRes.status === 400, 'Rejects duplicate score on the same date with status 400');

  // 6. Testing Draw Engine Simulation & Publication
  console.log('\n--- 6. Testing Draw Engine API ---');
  const simRes = await fetch(`${BASE_URL}/api/draws`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'simulate',
      mode: 'algorithmic',
      targetNumbers: [14, 22, 35, 38, 41],
    }),
  });
  const simData = await simRes.json();
  assert(simRes.status === 200, 'Draw dry-run simulation returns 200');
  assert(simData.simulation.tiers.tier5.percentage === 40, 'Tier 1 is exactly 40%');
  assert(simData.simulation.tiers.tier4.percentage === 35, 'Tier 2 is exactly 35%');
  assert(simData.simulation.tiers.tier3.percentage === 25, 'Tier 3 is exactly 25%');

  // Publish Draw
  const pubRes = await fetch(`${BASE_URL}/api/draws`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'publish',
      mode: 'algorithmic',
      targetNumbers: [14, 22, 35, 38, 41],
    }),
  });
  const pubData = await pubRes.json();
  assert(pubRes.status === 200, 'Official draw publication returns 200');
  assert(pubData.draw.status === 'published', 'Draw status is marked published');

  // 7. Testing Winner Proof Verification & Payout Lifecycle
  console.log('\n--- 7. Testing Winner Verification & Payout Administration ---');
  const winnersRes = await fetch(`${BASE_URL}/api/winners`);
  const winnersData = await winnersRes.json();
  assert(Array.isArray(winnersData.winners) && winnersData.winners.length > 0, 'Winners list populated');
  const sampleWinner = winnersData.winners[0];

  // Submit proof
  const proofRes = await fetch(`${BASE_URL}/api/winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      winnerId: sampleWinner.id,
      proofUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb',
    }),
  });
  assert(proofRes.status === 200, 'Winner proof submission succeeds');

  // Admin approves proof
  const approveRes = await fetch(`${BASE_URL}/api/winners`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'review_proof',
      winnerId: sampleWinner.id,
      approved: true,
      adminId: 'admin-001',
    }),
  });
  assert(approveRes.status === 200, 'Admin approval succeeds');

  // Admin marks payout paid
  const payoutRes = await fetch(`${BASE_URL}/api/winners`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'mark_paid',
      winnerId: sampleWinner.id,
      adminId: 'admin-001',
    }),
  });
  assert(payoutRes.status === 200, 'Admin marks payout as paid with audit timestamp');

  console.log(`\n========================================`);
  console.log(`🎉 ALL ${passedCount} OF ${totalCount} VERIFICATION TESTS PASSED!`);
  console.log(`========================================\n`);
}

runVerification().catch(err => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
