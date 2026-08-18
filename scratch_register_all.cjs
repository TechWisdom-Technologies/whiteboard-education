const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

// 1. inputCls replacement using regex to ignore CRLF and exact spacing
content = content.replace(
  /const inputCls =[\s\S]*?rounded-xl";/,
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
  'className="relative w-full lg:w-7/12 h-full flex flex-col bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFC] lg:bg-none lg:bg-white overflow-hidden"',
  'className="w-full h-full flex flex-col bg-white overflow-hidden items-center justify-center relative"'
);

// 4. Update Header and Form Wrapper and Heading
const headerStart = content.indexOf('{/* Mobile decorative blobs */}');
const headingEnd = content.indexOf('Agency Registration\n            </h2>');

if (headerStart !== -1 && headingEnd !== -1) {
  // We need to replace everything from headerStart to right after '</h2>'
  // Actually, 'Agency Registration\n            </h2>' might have CRLF.
  // We can just use a regex replace.
  
  const headerRegex = /\{\/\* Mobile decorative blobs \*\/\}[\s\S]*?Agency Registration\s*<\/h2>/;
  
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

        {/* Scrollable Form section */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-4 z-10 w-full overflow-y-auto">
          <div className="w-full max-w-2xl px-6 mx-auto text-left pb-12 mt-16 lg:mt-0">
            <h2 className="font-semibold tracking-tight text-[#0c0f16] text-3xl mb-2">
              Agency Registration
            </h2>`;
            
  content = content.replace(headerRegex, newHeaderAndFormWrap);
}

// 5. Scale up Buttons (h-12 -> h-14, text-[14px] -> text-base, rounded-xl -> rounded-2xl)
content = content.replace(/h-12/g, 'h-14');
content = content.replace(/text-\[14px\]/g, 'text-base');
// For the step 3 verification documents: "px-3 py-2" could stay the same.
// For the Button rounded-xl, let's keep rounded-xl for consistency with the component or change to 2xl.
// Actually, I'll just change `rounded-xl` to `rounded-2xl` on the main buttons.
content = content.replace(/rounded-xl transition-all/g, 'rounded-2xl transition-all');
content = content.replace(/rounded-xl flex-1/g, 'rounded-2xl flex-1');

// 6. Fix any nested button borders if we want, but they're already handled.

fs.writeFileSync('src/pages/PartnerRegistration.tsx', content);
console.log('Successfully applied layout and scaling changes to Register page.');
