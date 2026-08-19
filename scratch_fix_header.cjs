const fs = require('fs');

let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

const oldHeaderRegex = /\{\/\* Header bar \*\/\}\s*<div className="relative z-50 flex items-center justify-between px-8 py-6 flex-shrink-0 bg-transparent[\s\S]*?<X className="h-5 w-5 stroke-\[2\.5\]" \/>\s*<\/Link>\s*<\/div>/;

const newHeader = `{/* Header bar */}
          <div className="absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-50 pointer-events-none">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-colors duration-200 pointer-events-auto"
              aria-label="Close"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </Link>
          </div>`;

if (oldHeaderRegex.test(content)) {
  content = content.replace(oldHeaderRegex, newHeader);
  fs.writeFileSync('src/pages/PartnerRegistration.tsx', content);
  console.log('Fixed Header bar styling and position in PartnerRegistration.tsx');
} else {
  console.log('Could not find Header bar in PartnerRegistration.tsx');
}

