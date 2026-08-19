const fs = require('fs');

let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

let changed = false;

// 1. Update background to whitish gradient and remove blobs
if (content.includes('bg-[#F8FAFC]')) {
  // Replace outer bg
  content = content.replace(
    '<div className="fixed inset-0 flex bg-[#F8FAFC]">',
    '<div className="fixed inset-0 flex bg-gradient-to-br from-white via-[#2F4F97]/5 to-[#2F4F97]/10">'
  );
  
  // Make inner panel bg-transparent instead of bg-white
  content = content.replace(
    'className="w-full h-full flex flex-col bg-white overflow-hidden items-center justify-center relative"',
    'className="w-full h-full flex flex-col bg-transparent overflow-hidden items-center justify-center relative"'
  );
  
  // Remove mobile decorative blobs
  content = content.replace(
    /<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">[\s\S]*?blur-\[120px\]" \/>\s*<\/div>/,
    ''
  );
  
  changed = true;
}

// 2. Wrap the form in a white card
if (content.includes('className="max-w-2xl mx-auto pb-12"')) {
  content = content.replace(
    'className="max-w-2xl mx-auto pb-12"',
    'className="max-w-2xl mx-auto pb-12 bg-white rounded-xl border border-gray-100 px-8 py-10 mt-4 shadow-sm"'
  );
  changed = true;
}

// 3. Update input classes (rounded-2xl shadow-sm -> rounded-lg)
if (content.includes('rounded-2xl shadow-sm')) {
  content = content.replace(
    'transition-all duration-200 rounded-2xl shadow-sm',
    'transition-all duration-200 rounded-lg'
  );
  changed = true;
}

// 4. Update file upload field border radius (rounded-xl -> rounded-lg)
if (content.includes('rounded-xl p-4')) {
  content = content.replace('rounded-xl p-4', 'rounded-lg p-4');
  changed = true;
}

// 5. Update Navigation Buttons
// Back button
content = content.replace(
  'className="h-14 text-gray-700 font-bold text-base rounded-2xl flex-1 max-w-[140px]"',
  'className="h-14 text-gray-700 font-bold text-base rounded-lg flex-1 max-w-[140px] hover:bg-gray-50"'
);

// Next button
content = content.replace(
  'className="flex-1 h-14 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"',
  'className="flex-1 h-14 font-bold text-base rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] duration-200"'
);

// Submit button
content = content.replace(
  'className="flex-1 h-14 font-bold text-base rounded-2xl transition-all"',
  'className="flex-1 h-14 font-bold text-base rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] duration-200"'
);

fs.writeFileSync('src/pages/PartnerRegistration.tsx', content);
console.log('PartnerRegistration.tsx updated successfully. Changes applied: ' + changed);
