const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Remove Left Panel
const leftStart = content.indexOf('{/* ══════════════════════════════ LEFT PANEL ══════════════════════════════ */}');
const rightStart = content.indexOf('{/* ══════════════════════════════ RIGHT PANEL ══════════════════════════════ */}');
if (leftStart !== -1 && rightStart !== -1) {
  content = content.substring(0, leftStart) + content.substring(rightStart);
}

// 2. Adjust right panel
content = content.replace(
  'className=\"w-full lg:w-1/2 h-full flex flex-col bg-white overflow-hidden\"',
  'className=\"w-full h-full flex flex-col bg-white overflow-hidden items-center justify-center relative\"'
);

// 3. Fix header bar to be floating top-right
content = content.replace(
  /<div className=\"flex items-center justify-between px-8 py-6 flex-shrink-0 bg-white\">[\s\S]*?<\/button>\s*<\/div>/,
  `<div className=\"absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-10\">
          <button
            onClick={() => navigate(-1)}
            className=\"inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm\"
            aria-label=\"Close\"
          >
            <X className=\"h-5 w-5 stroke-[2.5]\" />
          </button>
        </div>`
);

// 4. Center form and add logo above heading
content = content.replace(
  /<div className=\"flex-1 flex flex-col justify-center min-h-0 px-10 py-4\">\s*<div className=\"w-full max-w-sm mx-auto\">\s*\{\/\* Heading \*\/\}\s*<div className=\"mb-8\">\s*<h2 className=\"font-medium tracking-tight text-\[#0c0f16\] text-2xl\">\s*Sign in to your portal account\s*<\/h2>\s*<\/div>/,
  `<div className=\"w-full max-w-sm px-6 py-4 z-10 mt-10\">
          <div className=\"w-full flex flex-col items-center text-center\">
            <Link to=\"/\">
              <img src=\"/logo.png\" alt=\"Whiteboard Education\" className=\"h-14 w-auto object-contain mb-8 hover:opacity-80 transition-opacity\" />
            </Link>
            {/* Heading */}
            <div className=\"mb-8\">
              <h2 className=\"font-medium tracking-tight text-[#0c0f16] text-2xl\">
                Sign in to your portal account
              </h2>
            </div>`
);

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Done');
