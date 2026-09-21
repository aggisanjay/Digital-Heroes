const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeqopglggsjgukezraii.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcW9wZ2xnZ3NqZ3VrZXpyYWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTk3MDA2NywiZXhwIjoyMTA1NTQ2MDY3fQ.ymBWZaaUa1OvSUk5-gS08A07eJTxzGKYriigcl_d4js';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const SEED_USERS = [
  {
    email: 'admin@digitalheroes.org',
    password: 'AdminPassword2026!',
    fullName: 'Marcus Vance',
    role: 'admin',
  },
  {
    email: 'alex.morgan@example.com',
    password: 'PlayerPassword2026!',
    fullName: 'Alex Morgan',
    role: 'subscriber',
  },
  {
    email: 'sarah.jenkins@example.com',
    password: 'PlayerPassword2026!',
    fullName: 'Sarah Jenkins',
    role: 'subscriber',
  },
  {
    email: 'elena.rostova@example.com',
    password: 'PlayerPassword2026!',
    fullName: 'Elena Rostova',
    role: 'subscriber',
  }
];

async function seed() {
  console.log('--- Seeding Real Supabase Auth Users ---');
  for (const u of SEED_USERS) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        user_metadata: {
          full_name: u.fullName,
          role: u.role,
        },
        email_confirm: true,
      });

      if (error) {
        if (error.message.includes('already exists') || error.status === 422) {
          console.log(`[EXISTS] User ${u.email} already present in Supabase Auth.`);
        } else {
          console.warn(`[WARN] Could not create ${u.email}:`, error.message);
        }
      } else {
        console.log(`[SUCCESS] Created real Supabase user: ${u.email} (ID: ${data.user.id})`);
      }
    } catch (e) {
      console.error(`[ERROR] ${u.email}:`, e.message);
    }
  }

  const { data: list } = await supabase.auth.admin.listUsers();
  console.log(`\nTotal users in real Supabase database: ${list?.users?.length || 0}`);
}

seed();
