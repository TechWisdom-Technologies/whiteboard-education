const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

const oldHeader = 'className="relative z-10 flex items-center justify-between px-8 py-6 flex-shrink-0 bg-transparent lg:bg-white border-b lg:border-none border-[#2F4F97]/10"';
const newHeader = 'className="relative z-50 flex items-center justify-between px-8 py-6 flex-shrink-0 bg-transparent lg:bg-white border-b lg:border-none border-[#2F4F97]/10"';

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  fs.writeFileSync('src/pages/PartnerRegistration.tsx', content);
  console.log('Fixed z-index in PartnerRegistration.tsx');
} else {
  console.log('Could not find header in PartnerRegistration.tsx');
}
