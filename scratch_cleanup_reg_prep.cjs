const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

// 1. Remove FileUpload components
content = content.replace(/interface FileUploadProps[\s\S]*?function FileUploadField[\s\S]*?\}\n/g, '');

// 2. Remove states
content = content.replace(/const \[regNumber, setRegNumber\] = useState\(""\);\n/g, '');
content = content.replace(/\/\/ File state\n\s*const \[nidFile, setNidFile\] = useState<File \| null>\(null\);\n\s*const \[tradeLicenseFile, setTradeLicenseFile\] = useState<File \| null>\(null\);\n\s*const \[certificateFiles, setCertificateFiles\] = useState<File\[\]>\(\[\]\);\n\n\s*const addCertificate = \(f: File \| null\) => \{\n\s*if \(f\) setCertificateFiles\(\(prev\) => \[\.\.\.prev, f\]\);\n\s*\};\n\s*const removeCertificate = \(idx: number\) => \{\n\s*setCertificateFiles\(\(prev\) => prev\.filter\(\(_, i\) => i !== idx\)\);\n\s*\};\n/g, '');

// 3. Remove regNumber from UI (Step 1)
content = content.replace(/<div className="space-y-1">\n\s*<Label[^>]+>Company Reg\. No<\/Label>\n\s*<Input value=\{regNumber\}[^>]+ \/>\n\s*<\/div>\n/g, '');

// 4. Remove step 3 block entirely
content = content.replace(/\{step === 3 && \([\s\S]*?\{step === 3 && \(\n\s*<p/g, '{step === 2 && (\n                  <p');

// 5. Update step logic
content = content.replace(/setStep\(3\);/g, 'setStep(2);'); // Actually in handleNext, it would do setStep(step + 1)
// Let's check handleNext:
// if (step === 1) { ... } else if (step === 2) { ... }
content = content.replace(/\} else if \(step === 2\) \{[\s\S]*?setStep\(3\);\n\s*\}/g, '}'); // Remove step 2 validation from handleNext since Step 2 is submit now!

// 6. Move step 2 validation into handleSubmit
// Wait, handleSubmit is currently for step 3. If step 2 is the final step, handleSubmit must validate step 2 fields!
// Let's just do it manually with regexes or completely replace handleSubmit & handleNext.

fs.writeFileSync('src/pages/PartnerRegistration.tsx.cleanup.js', '// placeholder');
