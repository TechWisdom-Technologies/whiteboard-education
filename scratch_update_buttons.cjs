const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCourseForm.tsx', 'utf8');

// The newly outlined buttons we made:
// variant="outline" size="sm" className="..."
content = content.replace(/variant="outline" size="sm"(.+?)className="[^"]+"/g, 'size="sm"$1className="h-7 px-3 text-xs"');

// The secondary buttons (Intake Months, Career Opportunities):
// variant="secondary" onClick=...
content = content.replace(/variant="secondary" onClick/g, 'onClick');

fs.writeFileSync('src/pages/admin/AdminCourseForm.tsx', content);
