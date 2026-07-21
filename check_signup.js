import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://vvfxsavdmlpgwwumnpqb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU');

async function main() {
  const email = 'testuser123456@example.com';
  const res1 = await supabase.auth.signUp({ email, password: 'password123' });
  console.log('SignUp 1 (new email):', res1.data?.user?.identities);
  
  const res2 = await supabase.auth.signUp({ email, password: 'password123' });
  console.log('SignUp 2 (dup email):', res2.data?.user?.identities);
}
main();
