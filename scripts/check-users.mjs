import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeqopglggsjgukezraii.supabase.co';
const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcW9wZ2xnZ3NqZ3VrZXpyYWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTk3MDA2NywiZXhwIjoyMTA1NTQ2MDY3fQ.ymBWZaaUa1OvSUk5-gS08A07eJTxzGKYriigcl_d4js';

const supabase = createClient(supabaseUrl, adminKey);

async function main() {
  const { data: usersData, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('listUsers error:', error);
    return;
  }
  console.log('Found users in Auth:', usersData.users.map(u => ({ id: u.id, email: u.email })));

  // Ensure aggisanjay1234@gmail.com exists with password 'Sanjay123@'
  let target = usersData.users.find(u => u.email === 'aggisanjay1234@gmail.com');
  if (target) {
    await supabase.auth.admin.updateUserById(target.id, {
      password: 'Sanjay123@',
      email_confirm: true,
    });
    console.log('Updated aggisanjay1234@gmail.com password to Sanjay123@');
  } else {
    const { data: newUser } = await supabase.auth.admin.createUser({
      email: 'aggisanjay1234@gmail.com',
      password: 'Sanjay123@',
      email_confirm: true,
      user_metadata: { role: 'subscriber', full_name: 'Aggi Sanjay' }
    });
    console.log('Created aggisanjay1234@gmail.com');
  }

  // Ensure admin user exists: admin@digitalheroes.com with password 'Admin1234!'
  let adminUser = usersData.users.find(u => u.email === 'admin@digitalheroes.com');
  if (adminUser) {
    await supabase.auth.admin.updateUserById(adminUser.id, {
      password: 'Admin1234!',
      email_confirm: true,
    });
    console.log('Updated admin@digitalheroes.com password to Admin1234!');
  } else {
    const { data: newAdmin } = await supabase.auth.admin.createUser({
      email: 'admin@digitalheroes.com',
      password: 'Admin1234!',
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'Platform Administrator' }
    });
    console.log('Created admin@digitalheroes.com with password Admin1234!');
    if (newAdmin?.user) {
      await supabase.from('profiles').upsert({
        id: newAdmin.user.id,
        email: 'admin@digitalheroes.com',
        full_name: 'Platform Administrator',
        role: 'admin',
        subscription_status: 'active'
      });
    }
  }

  // Ensure admin profile in profiles table has role='admin'
  const { data: adminAuth } = await supabase.auth.admin.listUsers();
  const adminRec = adminAuth.users.find(u => u.email === 'admin@digitalheroes.com');
  if (adminRec) {
    await supabase.from('profiles').upsert({
      id: adminRec.id,
      email: 'admin@digitalheroes.com',
      full_name: 'Platform Administrator',
      role: 'admin',
      subscription_status: 'active',
      charity_contribution_pct: 10
    });
    console.log('Verified admin profile in DB');
  }
}

main();
