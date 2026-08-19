const fs = require('fs');
let c = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

c = c.replace(/\\\\`/g, '`');
c = c.replace(/\\\\\\\$/g, '$');
c = c.replace(/\\\\\$/g, '$');
c = c.replace(/\\\$/g, '$');
c = c.replace(/\\\`/g, '`');

fs.writeFileSync('src/pages/PartnerRegistration.tsx', c);
console.log('Fixed');
