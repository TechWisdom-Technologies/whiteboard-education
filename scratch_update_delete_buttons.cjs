const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCourseForm.tsx', 'utf8');

// Replace standard delete buttons for English Req, Yearly Fees, Other Fees
content = content.replace(/<Button variant=\"ghost\" size=\"icon\" className=\"[^\"]*text-red-500[^\"]*\"(.*?)>\s*<Trash2 className=\"[^\"]*\" \/>\s*<\/Button>/g, 
  '<Button variant=\"outline\" size=\"icon\" className=\"h-7 w-7 rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0\"$1>\n                      <Trash2 className=\"h-3.5 w-3.5\" />\n                    </Button>'
);

// Replace raw button for Curriculum Modules
content = content.replace(/<button onClick=\{([^}]*)\}\s*className=\"absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity\">\s*<Trash2 className=\"h-4 w-4\" \/>\s*<\/button>/g,
  '<Button variant=\"outline\" size=\"icon\" className=\"absolute top-4 right-4 h-7 w-7 rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0 opacity-0 group-hover:opacity-100\" onClick={$1}>\n                      <Trash2 className=\"h-3.5 w-3.5\" />\n                    </Button>'
);

fs.writeFileSync('src/pages/admin/AdminCourseForm.tsx', content);
console.log("Done");
