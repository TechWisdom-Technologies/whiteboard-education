const fs = require('fs');

// Fix Login.tsx
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');
content = content.replace(
  'onClick={() => navigate(-1)}',
  'onClick={() => navigate("/")}'
);
fs.writeFileSync('src/pages/Login.tsx', content);

// Fix PartnerRegistration.tsx
let content2 = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');
content2 = content2.replace(
  'onClick={() => navigate(-1)}',
  'onClick={() => navigate("/")}'
);
fs.writeFileSync('src/pages/PartnerRegistration.tsx', content2);

console.log('Successfully updated navigation to go to the homepage.');
