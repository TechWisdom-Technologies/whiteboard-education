const fs = require('fs');

let content = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');

// partner_registrations: Row
const rowPattern = /partner_registrations: \{\s*Row: \{([\s\S]*?)\}/;
let rowMatch = content.match(rowPattern);
if (rowMatch) {
  let rowProps = rowMatch[1];
  if (!rowProps.includes('website_url')) {
    rowProps += `            website_url: string | null\n            registration_number: string | null\n            agency_email: string | null\n            agency_phone: string | null\n            rep_email: string | null\n            rep_phone: string | null\n            facebook_url: string | null\n            linkedin_url: string | null\n            instagram_url: string | null\n            youtube_url: string | null\n`;
    content = content.replace(rowMatch[1], rowProps);
  }
}

// partner_registrations: Insert
const insertPattern = /partner_registrations: \{\s*Row: \{[\s\S]*?\}\s*Insert: \{([\s\S]*?)\}/;
let insertMatch = content.match(insertPattern);
if (insertMatch) {
  let insertProps = insertMatch[1];
  if (!insertProps.includes('website_url')) {
    insertProps += `            website_url?: string | null\n            registration_number?: string | null\n            agency_email?: string | null\n            agency_phone?: string | null\n            rep_email?: string | null\n            rep_phone?: string | null\n            facebook_url?: string | null\n            linkedin_url?: string | null\n            instagram_url?: string | null\n            youtube_url?: string | null\n`;
    content = content.replace(insertMatch[1], insertProps);
  }
}

// partner_registrations: Update
const updatePattern = /partner_registrations: \{\s*Row: \{[\s\S]*?\}\s*Insert: \{[\s\S]*?\}\s*Update: \{([\s\S]*?)\}/;
let updateMatch = content.match(updatePattern);
if (updateMatch) {
  let updateProps = updateMatch[1];
  if (!updateProps.includes('website_url')) {
    updateProps += `            website_url?: string | null\n            registration_number?: string | null\n            agency_email?: string | null\n            agency_phone?: string | null\n            rep_email?: string | null\n            rep_phone?: string | null\n            facebook_url?: string | null\n            linkedin_url?: string | null\n            instagram_url?: string | null\n            youtube_url?: string | null\n`;
    content = content.replace(updateMatch[1], updateProps);
  }
}

fs.writeFileSync('src/integrations/supabase/types.ts', content);
console.log('types.ts updated');
