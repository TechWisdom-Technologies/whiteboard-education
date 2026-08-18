const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Find the start of the form section
const startIdx = content.indexOf('{/* Form section - centered, takes all remaining height */}');
if(startIdx !== -1) {
  // Find where the login form part starts
  const formIdx = content.indexOf('{/* Login form */}');
  if(formIdx !== -1) {
    const originalTopBlock = content.substring(startIdx, formIdx);
    
    const newTopBlock = `{/* Form section - centered, takes all remaining height */}
        <div className=\"w-full max-w-sm px-6 py-4 z-10 mx-auto mt-10\">
          
          <div className=\"w-full flex flex-col items-center text-center\">
            <Link to=\"/\">
              <img src=\"/logo.png\" alt=\"Whiteboard Education\" className=\"h-14 w-auto object-contain mb-8 hover:opacity-80 transition-opacity\" />
            </Link>
            {/* Heading */}
            <div className=\"mb-8\">
              <h2 className=\"font-medium tracking-tight text-[#0c0f16] text-2xl\">
                Sign in to your portal account
              </h2>
            </div>
          </div>

          <div className=\"w-full text-left\">
            {/* Alerts */}
            {regStatus?.status === "pending" && (
              <Alert className=\"border-amber-300 bg-amber-50 mb-4 py-2.5 px-3 rounded-2xl\">
                <Clock className=\"h-3.5 w-3.5 text-amber-600\" />
                <AlertTitle className=\"text-amber-700 text-xs font-semibold\">Registration Pending</AlertTitle>
                <AlertDescription className=\"text-[11px] text-amber-600\">
                  Your partner registration is under review. You'll be notified via email.
                </AlertDescription>
              </Alert>
            )}
            {regStatus?.status === "rejected" && (
              <Alert variant=\"destructive\" className=\"mb-4 py-2.5 px-3 rounded-2xl\">
                <XCircle className=\"h-3.5 w-3.5\" />
                <AlertTitle className=\"text-xs font-semibold\">Registration Rejected</AlertTitle>
                <AlertDescription className=\"text-[11px]\">
                  {regStatus.admin_notes && <span className=\"block\">Reason: {regStatus.admin_notes}</span>}
                  <Link to=\"/partner\" className=\"underline font-medium\">Re-apply →</Link>
                </AlertDescription>
              </Alert>
            )}

            `;
    
    content = content.replace(originalTopBlock, newTopBlock);
    fs.writeFileSync('src/pages/Login.tsx', content);
    console.log("Fixed Login top block");
  }
}
