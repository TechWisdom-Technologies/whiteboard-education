const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/)[1].trim();
const VITE_SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?([^"\n]+)"?/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
(async () => {
  const { data, error } = await supabase.from('courses').select('other_fees').not('other_fees', 'is', null);
  let badFees = new Set();
  let goodFees = new Set();
  data.forEach(c => {
    if(c.other_fees) {
      c.other_fees.forEach(of => {
        if(String(of.fee).toUpperCase().includes('MYR')) goodFees.add(of.fee);
        else badFees.add(of.fee + ' | ' + of.description);
      })
    }
  });
  console.log('Bad:', Array.from(badFees).slice(0, 50));
})();
