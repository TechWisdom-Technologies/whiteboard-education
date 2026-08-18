const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Update inputCls to have a border
content = content.replace(
  'const inputCls =\n    "w-full h-12 px-4 text-sm bg-gray-50 border border-transparent',
  'const inputCls =\n    "w-full h-12 px-4 text-sm bg-gray-50 border border-gray-200'
);

// 2. Extract out the Left panel
const leftStart = content.indexOf('{/* ══════════════════════════════ LEFT PANEL ══════════════════════════════ */}');
const rightStart = content.indexOf('{/* ══════════════════════════════ RIGHT PANEL ══════════════════════════════ */}');
if (leftStart !== -1 && rightStart !== -1) {
  content = content.substring(0, leftStart) + content.substring(rightStart);
}

// 3. Make right panel full width
content = content.replace(
  'className="w-full lg:w-1/2 h-full flex flex-col bg-white overflow-hidden"',
  'className="w-full h-full flex flex-col bg-white overflow-hidden items-center justify-center relative"'
);

// 4. Update Header and Form Wrapper
// We want to replace everything from "        {/* Header bar */}" up to "{/* Heading */}"
const headerStart = content.indexOf('{/* Header bar */}');
const headingStart = content.indexOf('{/* Heading */}');
if (headerStart !== -1 && headingStart !== -1) {
  const newHeaderAndFormWrap = `{/* Header bar */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form section */}
        <div className="w-full max-w-sm px-6 py-4 z-10 text-left">
          `;
  
  content = content.substring(0, headerStart) + newHeaderAndFormWrap + content.substring(headingStart);
}

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Successfully refactored Login page layout.');
