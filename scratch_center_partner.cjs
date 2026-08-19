const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

// The scrollable container currently is:
// <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 md:px-12 md:py-8 lg:px-16">
// Wait, I might have changed it slightly in my previous scripts but let's match regex:
const scrollContainerRegex = /<div className="relative z-10 flex-1 overflow-y-auto[\s\S]*?">/;

const oldCard = 'className="max-w-2xl mx-auto pb-12 bg-white rounded-xl border border-gray-100 px-8 py-10 mt-4 shadow-sm"';
const newCard = 'className="w-full max-w-2xl m-auto bg-white rounded-xl border border-gray-100 px-8 py-10 shadow-sm"';

if (content.includes(oldCard)) {
  content = content.replace(oldCard, newCard);
  content = content.replace(scrollContainerRegex, '<div className="relative z-10 flex-1 flex overflow-y-auto px-6 py-6 md:px-12 md:py-8 lg:px-16 w-full">');
  fs.writeFileSync('src/pages/PartnerRegistration.tsx', content);
  console.log('Fixed vertical centering safely using flex and m-auto!');
} else {
  console.log('Could not find the card to center in PartnerRegistration.tsx');
}
