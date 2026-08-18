const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Update inputCls to make it bigger and have stronger borders
content = content.replace(
  'const inputCls =\n    "w-full h-12 px-4 text-sm bg-gray-50 border border-gray-200',
  'const inputCls =\n    "w-full h-14 px-5 text-base bg-white border-2 border-gray-300 shadow-sm'
);

// 2. Increase width of the form wrapper
content = content.replace(
  '<div className="w-full max-w-sm px-6 mx-auto text-left">',
  '<div className="w-full max-w-md px-6 mx-auto text-left">'
);

// 3. Increase heading size
content = content.replace(
  '<h2 className="font-medium tracking-tight text-[#0c0f16] text-2xl">',
  '<h2 className="font-semibold tracking-tight text-[#0c0f16] text-3xl mb-2">'
);

// 4. Increase Submit Button size
content = content.replace(
  'className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2 rounded-2xl',
  'className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 rounded-2xl'
);

// 5. Update other specific inputs/buttons that use h-12
// "Back to Sign In" and "Send Code" buttons
content = content.replace(/h-12/g, 'h-14');
// Wait, I should also increase text-sm to text-base for those buttons
content = content.replace(/text-sm font-bold flex items-center/g, 'text-base font-bold flex items-center');

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Successfully updated form sizes and borders.');
