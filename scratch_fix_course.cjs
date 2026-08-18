const fs = require('fs');
const file = 'src/pages/admin/AdminCourseForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace { ...form, with prev => ({ ...prev,
content = content.replace(/setForm\(\{\s*\.\.\.form,\s*([a-zA-Z0-9_]+):/g, 'setForm(prev => ({ ...prev, $1:');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced all setForm occurrences.');
