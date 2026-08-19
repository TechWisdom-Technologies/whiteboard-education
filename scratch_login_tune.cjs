const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Update the background gradient
content = content.replace(
  'bg-gradient-to-br from-[#2F4F97] via-[#1c2f5a] to-[#0c0f16]',
  'bg-gradient-to-br from-[#2F4F97] to-[#2E7FBC]'
);

// 2. Update the card roundness and remove shadow
content = content.replace(
  'bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] mx-auto',
  'bg-white rounded-xl mx-auto border border-gray-100'
);

// 3. Update inputCls to remove shadow and decrease roundness (rounded-2xl -> rounded-lg)
content = content.replace(
  /const inputCls =\n[\s\S]*?shadow-sm";/,
  'const inputCls =\n    "w-full h-14 px-5 text-base bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-[#2F4F97] focus:text-white focus:placeholder:text-white/60 focus:caret-white transition-all duration-200 rounded-lg";'
);

// 4. Update all rounded-2xl to rounded-lg for buttons
content = content.replace(/rounded-2xl/g, 'rounded-lg');

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Successfully adjusted colors, roundness, and shadows.');
