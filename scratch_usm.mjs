import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.from('universities').select('name, about_text').ilike('name', '%Sains%').limit(1)
  if (error) {
    console.error(error)
    return
  }
  console.log(data[0]?.about_text)
}

check()
