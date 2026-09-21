// scratch/verify-critical-fixes.mjs
async function runTests() {
  const BASE = 'http://localhost:3000';
  console.log('--- RUNNING DIGITAL HEROES VERIFICATION SUITE ---');

  // Test 1: Confirm endpoint is gone
  console.log('\n[TEST 1] Verify /api/subscription/confirm is 404...');
  try {
    const res = await fetch(`${BASE}/api/subscription/confirm`, { method: 'POST' });
    console.log(`Status: ${res.status} (Expected 404) -> ${res.status === 404 ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log('Error testing confirm route:', e.message);
  }

  // Test 2: Invalid password login rejects with 401
  console.log('\n[TEST 2] Verify /api/auth/login with wrong credentials...');
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aggisanjay1234@gmail.com', password: 'WrongPassword999!' }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected 401), error: "${data.error}" -> ${res.status === 401 ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log('Error testing login:', e.message);
  }

  // Test 3: Real subscriber login with valid credentials
  console.log('\n[TEST 3] Verify subscriber login with valid credentials...');
  let subCookies = '';
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aggisanjay1234@gmail.com', password: 'Sanjay123@' }),
    });
    const data = await res.json();
    subCookies = res.headers.get('set-cookie') || '';
    console.log(`Status: ${res.status}, role: "${data.user?.role}", sub_status: "${data.user?.subscription_status}" -> ${res.ok && data.user?.role === 'subscriber' ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log('Error testing subscriber login:', e.message);
  }

  // Test 4: Real admin login with valid credentials
  console.log('\n[TEST 4] Verify admin login with valid credentials...');
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@digitalheroes.com', password: 'Admin1234!' }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, role: "${data.user?.role}" -> ${res.ok && data.user?.role === 'admin' ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log('Error testing admin login:', e.message);
  }

  // Test 5: Check /api/stripe/checkout rejects unauthenticated requests
  console.log('\n[TEST 5] Verify /api/stripe/checkout unauthenticated...');
  try {
    const res = await fetch(`${BASE}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: 'monthly' }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected 401) -> ${res.status === 401 ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log('Error testing stripe checkout:', e.message);
  }

  // Test 6: Verify draw simulation calculates live mathematical tiers
  console.log('\n[TEST 6] Verify draw simulation with real Supabase data...');
  try {
    const res = await fetch(`${BASE}/api/draws`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', mode: 'algorithmic', targetNumbers: [12, 24, 31, 38, 42] }),
    });
    const data = await res.json();
    const sim = data.simulation;
    console.log(`Status: ${res.status}, activeSubscribers: ${sim?.activeSubscriberCount}, totalCyclePool: $${sim?.totalCyclePool}, tier5Pool: $${sim?.tiers?.tier5?.totalPool} -> ${res.ok && sim?.totalCyclePool > 0 ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log('Error testing draw simulation:', e.message);
  }

  console.log('\n--- VERIFICATION SUITE COMPLETE ---');
}

runTests();
