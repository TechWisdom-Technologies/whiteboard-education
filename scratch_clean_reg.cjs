const fs = require('fs');

let content = fs.readFileSync('src/pages/PartnerRegistration.tsx', 'utf8');

// 1. Remove FileUpload and uploadFile
content = content.replace(/interface FileUploadProps[\s\S]*?function FileUploadField[\s\S]*?\}\n\nasync function uploadFile[\s\S]*?\}\n\n/g, '');

// 2. Remove regNumber and File states
content = content.replace(/const \[regNumber, setRegNumber\] = useState\(""\);\n/g, '');
content = content.replace(/\/\/ File state\n\s*const \[nidFile, setNidFile\] = useState<File \| null>\(null\);\n\s*const \[tradeLicenseFile, setTradeLicenseFile\] = useState<File \| null>\(null\);\n\s*const \[certificateFiles, setCertificateFiles\] = useState<File\[\]>\(\[\]\);\n\n\s*const addCertificate = \(f: File \| null\) => \{\n\s*if \(f\) setCertificateFiles\(\(prev\) => \[\.\.\.prev, f\]\);\n\s*\};\n\s*const removeCertificate = \(idx: number\) => \{\n\s*setCertificateFiles\(\(prev\) => prev\.filter\(\(_, i\) => i !== idx\)\);\n\s*\};\n/g, '');

// 3. Update handleNext to only validate step 1
content = content.replace(/\} else if \(step === 2\) \{[\s\S]*?setStep\(3\);\n\s*\}/g, '}');

// 4. Update handleSubmit to validate step 2 and submit without files
const oldHandleSubmitRegex = /const handleSubmit = async \(\) => \{[\s\S]*?setSubmitting\(false\);\n\s*\};\n/;
const newHandleSubmit = `const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!contactFirstName) newErrors.contactFirstName = "First Name is required";
    if (!contactLastName) newErrors.contactLastName = "Last Name is required";
    if (!phone) newErrors.phone = "Phone Number is required";
    if (!email) newErrors.email = "Email is required";
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // Immediate check via RPC
      const { data, error: rpcError } = await (supabase.rpc as any)('check_registration_exists', {
        check_email: email,
        check_phone: phone
      });
      if (!rpcError && data) {
        const resData = data as { email_exists?: boolean; phone_exists?: boolean };
        if (resData.email_exists) newErrors.email = "This email is already registered.";
        if (resData.phone_exists) newErrors.phone = "This phone number is already registered.";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSubmitting(false);
        return;
      }

      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: contactFirstName, last_name: contactLastName, display_name: \`\${contactFirstName} \${contactLastName}\` },
          emailRedirectTo: \`\${window.location.origin}/login\`,
        },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Insert registration record
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const token = authData.session?.access_token || SUPABASE_KEY;

      const res = await fetch(\`\${SUPABASE_URL}/rest/v1/partner_registrations\`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": \`Bearer \${token}\`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          agency_name: agencyName,
          contact_first_name: contactFirstName,
          contact_last_name: contactLastName,
          email,
          phone,
          country,
          website_url: website,
          annual_students: annualStudents,
          status: "pending",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (errText.includes("partner_registrations_user_id_fkey") || errText.includes("Key is not present in table")) {
          setErrors({ email: "This email is already registered." });
          throw new Error("Validation_Error");
        }
        throw new Error(errText);
      }

      await supabase.auth.signOut();
      toast.success("Registration submitted! Your application is pending admin approval.");
      navigate("/partner");
    } catch (err: any) {
      if (err.message !== "Validation_Error") {
        toast.error(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
`;
content = content.replace(oldHandleSubmitRegex, newHandleSubmit);

// 5. Remove regNumber UI from step 1
content = content.replace(/<div className="space-y-1">\n\s*<Label className="text-\[10px\] font-bold text-gray-500 uppercase tracking-widest">Company Reg\. No<\/Label>\n\s*<Input value=\{regNumber\}[^>]+ \/>\n\s*<\/div>\n/g, '');
// Let's broaden the regex if it fails
content = content.replace(/<div className="space-y-1">\s*<Label className="text-\[10px\] font-bold text-gray-500 uppercase tracking-widest">Company Reg\. No<\/Label>\s*<Input value=\{regNumber\} onChange=\{\(e\) => setRegNumber\(e\.target\.value\)\} placeholder="E\.g\. CR-123456" className=\{inputCls\} \/>\s*<\/div>/, '');

// 6. Fix Stepper logic
// From `{[1, 2, 3].map((s) => (` to `{[1, 2].map((s) => (`
content = content.replace(/\{\[1, 2, 3\]\.map\(\(s\) => \(/, '{[1, 2].map((s) => (');
// From `{s === 1 ? 'Company' : s === 2 ? 'Rep' : 'Docs'}` to `{s === 1 ? 'Company' : 'Rep'}`
content = content.replace(/\{s === 1 \? 'Company' : s === 2 \? 'Rep' : 'Docs'\}/, "{s === 1 ? 'Company' : 'Rep'}");

// 7. Remove Step 3 block
const step3Regex = /\{\/\* Section 3 \*\/\}\s*\{step === 3 && \([\s\S]*?\{\/\* Section 3 \*\/\}\s*\{step === 3 && \([\s\S]*?\)\}/;
// Actually step 3 spans until the buttons. Let's just use string replace for exactly what we see.
content = content.replace(/\{\/\* Section 3 \*\/\}\s*\{step === 3 && \([\s\S]*?\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, '');

// 8. Fix buttons logic
content = content.replace(/\{step < 3 \? \(/, '{step < 2 ? (');
content = content.replace(/\{step === 3 && \(\s*<p className="text-\[11px\] text-gray-400 text-center mt-4 max-w-sm mx-auto animate-fade-in">\s*By submitting this form, you agree to our Partnership Terms\. Your account will be activated after admin verification\.\s*<\/p>\s*\)\}/, 
`{step === 2 && (
                <p className="text-[11px] text-gray-400 text-center mt-4 max-w-sm mx-auto animate-fade-in">
                  By submitting this form, you agree to our Partnership Terms. Your account will be activated after admin verification.
                </p>
              )}`);

fs.writeFileSync('src/pages/PartnerRegistration.tsx', content);
console.log('PartnerRegistration.tsx cleaned');
