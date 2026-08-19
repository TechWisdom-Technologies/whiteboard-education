const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Update background to whitish theme-color gradient
content = content.replace(
  'bg-gradient-to-br from-[#2F4F97] to-[#2E7FBC]',
  'bg-gradient-to-br from-white via-[#2F4F97]/5 to-[#2F4F97]/10'
);

// 2. Restore the close button text color for the light background
content = content.replace(
  'bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 backdrop-blur-md shadow-sm',
  'bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm'
);

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Successfully updated background to whitish gradient.');
