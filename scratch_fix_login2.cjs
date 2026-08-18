const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const target1 = `      // Login successful, but if they are supposed to be a partner and lack the role, check registration.
      if (result.redirectTo === "/") {
        const reg = await checkPartnerRegistration(email);
    setFpStep("sending");
    const result = await resetPassword(fpEmail);
    if (result.success) {`;

const fix1 = `      // Login successful, but if they are supposed to be a partner and lack the role, check registration.
      if (result.redirectTo === "/") {
        const reg = await checkPartnerRegistration(email);
        if (reg && (reg.status === "pending" || reg.status === "rejected")) {
          setRegStatus(reg);
          // Sign them back out since they shouldn't have access yet
          await signOut();
          return;
        }
      }
      
      navigate(result.redirectTo || "/");
    }
  };


  const inputCls =
    "w-full h-14 px-5 text-base bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-[#2F4F97] focus:text-white focus:placeholder:text-white/60 focus:caret-white transition-all duration-200 rounded-2xl shadow-sm";

  // ─── Forgot Password Handlers ───
  const handleFpSendCode = async () => {
    if (!fpEmail) { setFpError("Please enter your email."); return; }
    setFpError("");
    setFpStep("sending");
    const result = await resetPassword(fpEmail);
    if (result.success) {`;

if (content.includes(target1)) {
    content = content.replace(target1, fix1);
    fs.writeFileSync('src/pages/Login.tsx', content);
    console.log("Restored missing code and applied input styles");
} else {
    // Maybe it's missing just the inputCls? Let's check if we can find the truncated block
    const fallbackTarget = `    setFpStep("sending");
    const result = await resetPassword(fpEmail);
    if (result.success) {`;
    if(content.includes(fallbackTarget) && !content.includes('navigate(result.redirectTo || "/");')) {
        console.log("Found fallback target, applying patch");
        // This is tricky. Let's just do a checkout and re-apply our layout script and the scaling script correctly!
    } else {
        console.log("Target not found!");
    }
}
