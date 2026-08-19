const fs = require('fs');

const fixCrossButton = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Match the button tag for the close button
  const buttonRegex = /<button[\s\S]*?onClick=\{\(\) => navigate\("\/"\)\}[\s\S]*?aria-label="Close"[\s\S]*?>[\s\S]*?<X className="h-5 w-5 stroke-\[2\.5\]" \/>[\s\S]*?<\/button>/;

  const newLink = `<Link
            to="/"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-colors duration-200"
            aria-label="Close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </Link>`;

  if (buttonRegex.test(content)) {
    content = content.replace(buttonRegex, newLink);
    fs.writeFileSync(filePath, content);
    console.log('Successfully fixed cross button in ' + filePath);
  } else {
    console.log('Could not find cross button in ' + filePath);
  }
};

fixCrossButton('src/pages/Login.tsx');
fixCrossButton('src/pages/PartnerRegistration.tsx');
