const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

let changed = false;

// 1. Replace the heading
const newHeading = `<div className="mb-8 text-center">
              <h2 className="font-semibold tracking-tight text-[#0c0f16] text-3xl mb-2">
                Sign In
              </h2>
              <p className="text-[#64748B] text-sm font-medium">Access your dashboard with valid credentials</p>
            </div>`;
if (content.includes('Sign in to your portal account')) {
  // Use regex for multi-line replacement just in case of formatting
  content = content.replace(
    /<div className="mb-8 text-center">[\s\S]*?Sign in to your portal account[\s\S]*?<\/div>/,
    newHeading
  );
  changed = true;
} else if (content.includes('Sign in to your portal account')) {
    // If it didn't have the text-center yet
    content = content.replace(
      /<div className="mb-8">[\s\S]*?Sign in to your portal account[\s\S]*?<\/div>/,
      newHeading
    );
    changed = true;
}


// 2. Replace the buttons and bottom section
const buttonsRegex = /<button\s*type="submit"[\s\S]*?Register as a partner\s*<\/Link>/;

const newButtons = `<div className="flex items-center gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => { setFpStep("enter_email"); setFpEmail(email); }}
                        className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center border-2 border-[#2F4F97] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-200"
                      >
                        Forgot password
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                            </svg>
                            Wait...
                          </>
                        ) : (
                          <><LogIn className="h-4 w-4" /> Sign In</>
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-8 text-center">
                      <p className="text-sm font-medium text-gray-500 mb-4">
                        Don't have an account? Become a verified partner today
                      </p>
                      <Link
                        to="/partner/register"
                        className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white text-[#1E293B] hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        Register as a partner
                      </Link>
                    </div>`;

if (buttonsRegex.test(content)) {
  content = content.replace(buttonsRegex, newButtons);
  changed = true;
}

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Login.tsx updated correctly with the missing div! Changes applied: ' + changed);
