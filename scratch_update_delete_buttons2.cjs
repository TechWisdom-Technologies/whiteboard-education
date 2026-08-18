const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCourseForm.tsx', 'utf8');

// Replace height, width, and border radius
content = content.replace(/h-7 w-7 rounded-lg/g, 'h-11 w-11 rounded-xl');

// Increase icon size inside those buttons since button is bigger
content = content.replace(/<Trash2 className=\"h-3.5 w-3.5\" \/>/g, '<Trash2 className=\"h-4 w-4\" />');

fs.writeFileSync('src/pages/admin/AdminCourseForm.tsx', content);
console.log("Done");
