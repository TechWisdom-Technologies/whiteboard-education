const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

let changed = false;

// 1. Change the outermost container and the inner container
// Currently it is:
// <div className="fixed inset-0 flex bg-[#F8FAFC]">
// ...
// <div
//   className="w-full h-full flex flex-col bg-white overflow-hidden items-center justify-center relative"
//   style={{

// Let's replace the outer one:
if (content.includes('className="fixed inset-0 flex bg-[#F8FAFC]"')) {
  content = content.replace(
    'className="fixed inset-0 flex bg-[#F8FAFC]"',
    'className="fixed inset-0 flex bg-gradient-to-br from-[#2F4F97] to-[#2E7FBC]"'
  );
  changed = true;
}

// Let's replace the inner one to NOT be bg-white, but transparent so the background shows through
if (content.includes('bg-white overflow-hidden items-center justify-center relative"')) {
  content = content.replace(
    'bg-white overflow-hidden items-center justify-center relative"',
    'bg-transparent overflow-hidden items-center justify-center relative p-4 lg:p-8"'
  );
  changed = true;
}

// 2. Make the form wrapper a white card
// It is currently: <div className="w-full max-w-md px-6 mx-auto text-left">
if (content.includes('className="w-full max-w-md px-6 mx-auto text-left"')) {
  content = content.replace(
    'className="w-full max-w-md px-6 mx-auto text-left"',
    'className="w-full max-w-md px-8 py-10 bg-white rounded-xl mx-auto text-left relative"'
  );
  changed = true;
}

// 3. Update the close button to be white/translucent
if (content.includes('bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm"')) {
  content = content.replace(
    'bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm"',
    'bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 backdrop-blur-md shadow-sm"'
  );
  changed = true;
}

// 4. Update the heading margin for the new card padding
if (content.includes('<div className="mb-8">')) {
  content = content.replace(
    '<div className="mb-8">',
    '<div className="mb-8 text-center">'
  );
  changed = true;
}

// 5. Update input classes (remove shadow, use rounded-lg)
// First, restore rounded-lg if it got messed up
const inputRegex = /const inputCls =[\s\S]*?rounded-[a-z0-9]+.*";/;
content = content.replace(
  inputRegex,
  'const inputCls =\n    "w-full h-14 px-5 text-base bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-[#2F4F97] focus:text-white focus:placeholder:text-white/60 focus:caret-white transition-all duration-200 rounded-lg";'
);

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Login.tsx fixed successfully! Changes applied: ' + changed);
