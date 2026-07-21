import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://vvfxsavdmlpgwwumnpqb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU');

async function main() {
  const { data: p, error: pe } = await supabase.from('profiles').select('email').limit(1);
  console.log('Profiles anon read:', p, pe);
  
  const { data: pr, error: pre } = await supabase.from('partner_registrations').select('email').limit(1);
  console.log('Partner anon read:', pr, pre);
}
main();
