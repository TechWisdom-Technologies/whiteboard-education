import fs from 'fs';
import path from 'path';

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const originalContent = content;

      content = content.replace(/borderRadius:\s*["']10px["']/g, 'borderRadius: "5px"');
      content = content.replace(/borderRadius:\s*["']8px["']/g, 'borderRadius: "5px"');
      content = content.replace(/rounded-2xl/g, 'rounded-md');
      content = content.replace(/rounded-xl/g, 'rounded-md');
      content = content.replace(/rounded-lg/g, 'rounded-md');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src'));
console.log("Global border-radius update complete.");
