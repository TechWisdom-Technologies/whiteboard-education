const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminCourseForm.tsx', 'utf8');

// The pattern to match the specific + Add buttons
const pattern = /variant="ghost" size="sm"([\s\S]*?)className="text-xs h-7 px-2 text-primary hover:bg-primary\/10"/g;

content = content.replace(pattern, 'size="sm"$1className="h-7 px-3 text-xs"');

fs.writeFileSync('src/pages/admin/AdminCourseForm.tsx', content);
