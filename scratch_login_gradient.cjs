const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Update the outermost layout to use a gradient background and make the form a white card
const layoutRegex = /<div className="fixed inset-0 flex bg-\[#F8FAFC\]">[\s\S]*?<div className="w-full h-full flex flex-col bg-white overflow-hidden items-center justify-center relative">/;

const newLayout = `<div className="fixed inset-0 flex bg-gradient-to-br from-[#2F4F97] via-[#1c2f5a] to-[#0c0f16]">

      <div className="w-full h-full flex flex-col overflow-hidden items-center justify-center relative p-4 lg:p-8">`;

content = content.replace(layoutRegex, newLayout);

// 2. Update the Header bar close button to look good on dark background
content = content.replace(
  'className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm"',
  'className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 backdrop-blur-md shadow-sm"'
);


// 3. Make the form wrapper a white card with shadow
content = content.replace(
  '<div className="w-full max-w-md px-6 mx-auto text-left">',
  '<div className="w-full max-w-md px-8 py-10 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] mx-auto text-left relative">'
);

// 4. Update the heading margin for the new card padding
content = content.replace(
  '<div className="mb-8">',
  '<div className="mb-8 text-center">'
);

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Successfully updated Login page to use a gradient background and a white card for the form.');
