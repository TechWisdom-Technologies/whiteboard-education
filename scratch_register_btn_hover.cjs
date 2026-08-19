const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const oldButtonClass = 'className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white text-[#1E293B] hover:bg-gray-50 hover:border-gray-300 transition-colors"';
const newButtonClass = 'className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 rounded-lg border-2 border-[#2F4F97] bg-white text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-200"';

if (content.includes(oldButtonClass)) {
  content = content.replace(oldButtonClass, newButtonClass);
  fs.writeFileSync('src/pages/Login.tsx', content);
  console.log('Successfully updated Register button styles.');
} else {
  console.log('Could not find the target string!');
}
