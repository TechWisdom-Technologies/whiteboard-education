const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/)[1].trim();
const VITE_SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?([^"\n]+)"?/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
(async () => {
  const { data, error } = await supabase.from('language_centers').select('id, name, more_info, tuition_fees, faqs').limit(5);
  console.log(JSON.stringify(data, null, 2));
})();
