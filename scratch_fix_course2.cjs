const fs = require('fs');
const file = 'src/pages/admin/AdminCourseForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// The faulty regex replaced `setForm({ ...form, key:` with `setForm(prev => ({ ...prev, key:`.
// So strings like `setForm({ ...form, title: e.target.value })`
// became `setForm(prev => ({ ...prev, title: e.target.value })`.
// Notice the missing `)` before `}`? Wait, it became `...value })`.
// `setForm(prev => ({` opens `setForm`, then `prev =>`, then `(`, then `{`.
// The end was `})`. So it closes the object `}`, and then it closes the `setForm` call `)`.
// But it forgot to close the `(` that wraps the object!
// So I need to replace `})` with `}))` ONLY for those `setForm(prev => ({...` lines.

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setForm(prev => ({ ...prev')) {
    // If the line ends with `})}` (like `...value })}`) or `});`
    // We should be careful. Let's just find `})` and replace with `}))` 
    // Wait, let's use a regex on the whole line: replace `\s*}\)$` ?
    // The safest is to replace `})` with `}))` if it matches the pattern and doesn't already have `}))`.
    if (!lines[i].includes('}))') && lines[i].includes('})')) {
       lines[i] = lines[i].replace(/}\)/, '}))');
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed syntax error.');
