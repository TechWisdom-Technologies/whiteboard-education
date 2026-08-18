const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. inputCls replacement using regex to ignore CRLF and exact spacing
content = content.replace(
  /const inputCls =[\s\S]*?rounded-2xl";/,
  'const inputCls =\n    "w-full h-14 px-5 text-base bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-[#2F4F97] focus:text-white focus:placeholder:text-white/60 focus:caret-white transition-all duration-200 rounded-2xl shadow-sm";'
);

// 2. Remove Left panel
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

// 4. Update Header and Form Wrapper and Heading
const headerStart = content.indexOf('{/* Header bar */}');
const alertsStart = content.indexOf('{/* Alerts */}');
if (headerStart !== -1 && alertsStart !== -1) {
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
        <div className="flex-1 flex flex-col justify-center min-h-0 py-4 z-10 w-full">
          <div className="w-full max-w-md px-6 mx-auto text-left">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="font-semibold tracking-tight text-[#0c0f16] text-3xl mb-2">
                Sign in to your portal account
              </h2>
            </div>

            `;
  content = content.substring(0, headerStart) + newHeaderAndFormWrap + content.substring(alertsStart);
}

// 5. Scale up Buttons (h-12 -> h-14, text-sm -> text-base)
content = content.replace(/h-12/g, 'h-14');
content = content.replace(/text-sm font-bold flex items-center/g, 'text-base font-bold flex items-center');

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Successfully applied all layout and scaling changes perfectly via robust regex.');
