const fs = require('fs');

const fixZIndex = () => {
  let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');
  
  // Replace z-10 with z-50 for the Header bar container
  const headerClass = 'className="absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-10"';
  const newHeaderClass = 'className="absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-50"';
  
  if (content.includes(headerClass)) {
    content = content.replace(headerClass, newHeaderClass);
    fs.writeFileSync('src/pages/Login.tsx', content);
    console.log('Fixed z-index in Login.tsx');
  } else {
    console.log('Could not find header bar in Login.tsx');
  }
};

fixZIndex();
