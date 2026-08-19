const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const brokenRegex = /Register as a partner\s*<\/Link>\s*\{\/\* ─── Forgot Password Flow ─── \*\/\}/;

if (brokenRegex.test(content)) {
  content = content.replace(brokenRegex, `Register as a partner
                      </Link>
                    </div>
                  </form>
                </>
              )}

              {/* ─── Forgot Password Flow ─── */}`);
  fs.writeFileSync('src/pages/Login.tsx', content);
  console.log('Restored the deleted tags successfully!');
} else {
  console.log('Broken regex not found!');
}
