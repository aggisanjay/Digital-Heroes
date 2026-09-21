import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeqopglggsjgukezraii.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcW9wZ2xnZ3NqZ3VrZXpyYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzAwNjcsImV4cCI6MjEwNTU0NjA2N30.a0bqUm5kfkWoMmg_msc5YDlC_tkqm2C0cyGzz5DmuM4';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
