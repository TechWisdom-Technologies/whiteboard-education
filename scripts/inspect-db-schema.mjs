import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log("Fetching one university...");
  const { data: unis, error: uniError } = await supabase.from('universities').select('*').limit(1);
  if (uniError) console.error("Uni error:", uniError);
  else console.log("University record keys:", Object.keys(unis[0] || {}));

  console.log("\nFetching one course...");
  const { data: courses, error: courseError } = await supabase.from('courses').select('*').limit(1);
  if (courseError) console.error("Course error:", courseError);
  else console.log("Course record keys:", Object.keys(courses[0] || {}));
}

inspect().catch(console.error);
