import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, ShieldCheck, ArrowRight, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const STUDENT_RANGES = [
  "1 - 10",
  "11 - 50",
  "51 - 100",
  "101 - 250",
  "251 - 500",
  "501 - 1000",
  "1000+"
];

export default function PartnerRegistration() {
  const navigate = useNavigate();
  const { refreshPartnerStatus } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [agencyName, setAgencyName] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [annualStudents, setAnnualStudents] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get("email");
      const urlStep = params.get("step");
      if (urlEmail) {
        setEmail(urlEmail);
      }
      if (urlStep === "4" && urlEmail) {
        setStep(4);
      }
    }
  }, []);

  const handleNext = async () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!agencyName) newErrors.agencyName = "Agency Name is required";
      if (!country) newErrors.country = "Country is required";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!contactFirstName) newErrors.contactFirstName = "First Name is required";
      if (!contactLastName) newErrors.contactLastName = "Last Name is required";
      if (!phone) newErrors.phone = "Phone Number is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // 1. Check if email or phone is already registered
      const { data, error: rpcError } = await (supabase.rpc as any)('check_registration_exists', {
        check_email: email,
        check_phone: phone
      });

      if (!rpcError && data) {
        const resData = data as { email_exists?: boolean; phone_exists?: boolean };
        if (resData.email_exists) newErrors.email = "This email is already registered and active. Please sign in.";
        if (resData.phone_exists) newErrors.phone = "This phone number is already registered.";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSubmitting(false);
        if (newErrors.phone && !newErrors.email) {
          setStep(2);
        }
        return;
      }

      // 2. Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: contactFirstName,
            last_name: contactLastName,
            display_name: `${contactFirstName} ${contactLastName}`,
          },
          emailRedirectTo: `${window.location.origin}/partner-dashboard`,
        },
      });

      if (authError) {
        // If an unconfirmed account already exists from an earlier incomplete attempt,
        // resend a fresh verification code and smoothly advance to Step 4.
        const errMsg = authError.message.toLowerCase();
        if (errMsg.includes("already registered") || errMsg.includes("already exists") || authError.status === 400 || authError.status === 422) {
          const { error: resendErr } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
              emailRedirectTo: `${window.location.origin}/partner-dashboard`,
            }
          });

          if (!resendErr) {
            setStep(4);
            setResendCooldown(60);
            toast.info("A pending registration was found. A fresh verification code has been sent to your inbox!");
            return;
          }
        }
        throw authError;
      }

      // Move to Step 4: OTP Verification Screen
      setStep(4);
      setResendCooldown(60);
      toast.success("Verification code sent! Please check your email inbox.");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError("Please enter the verification code.");
      return;
    }
    setOtpError("");
    setVerifying(true);

    try {
      let authSession = null;
      let authUser = null;

      // 1. Attempt OTP verification
      const { data: vData, error: vErr } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'signup'
      });

      if (!vErr && vData?.user) {
        authSession = vData.session;
        authUser = vData.user;
      } else {
        // Fallback retry with type: 'email'
        const retry = await supabase.auth.verifyOtp({
          email,
          token: otp.trim(),
          type: 'email'
        });
        if (!retry.error && retry.data?.user) {
          authSession = retry.data.session;
          authUser = retry.data.user;
        } else {
          // If already verified or immediate session available, attempt sign-in
          const sRes = await supabase.auth.signInWithPassword({ email, password });
          if (sRes.data?.user) {
            authSession = sRes.data.session;
            authUser = sRes.data.user;
          } else {
            throw new Error(retry.error?.message || vErr?.message || "Invalid verification code. Please check and try again.");
          }
        }
      }

      if (password) {
        await supabase.auth.updateUser({ password }).catch(() => {});
      }

      // 2. Ensure registration record exists in partner_registrations
      let parsedAnnualStudents = 0;
      if (annualStudents) {
        const match = annualStudents.match(/\d+/);
        parsedAnnualStudents = match ? parseInt(match[0], 10) : 0;
      }

      const contactPerson = `${contactFirstName || ""} ${contactLastName || ""}`.trim() || agencyName || "Partner Representative";

      // 2a. Try RPC register_partner_agency first (runs with SECURITY DEFINER and bypasses client RLS)
      const { error: rpcErr } = await (supabase.rpc as any)('register_partner_agency', {
        p_agency_name: agencyName || "Partner Agency",
        p_contact_first_name: contactFirstName || "",
        p_contact_last_name: contactLastName || "",
        p_email: email,
        p_phone: phone || "",
        p_country: country || "",
        p_website_url: website || "",
        p_annual_students: annualStudents || ""
      });

      if (rpcErr && authUser?.id) {
        console.warn("Notice during RPC partner registration, attempting direct insert fallback:", rpcErr.message);
        // 2b. Fallback to direct client insert with both contact_person and contact_first/last_name
        const { data: existingReg } = await supabase
          .from("partner_registrations")
          .select("id")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (!existingReg) {
          const { error: insErr } = await supabase.from("partner_registrations").insert({
            user_id: authUser.id,
            agency_name: agencyName || "Partner Agency",
            contact_person: contactPerson,
            contact_first_name: contactFirstName || "",
            contact_last_name: contactLastName || "",
            email,
            phone: phone || "",
            country: country || "",
            website_url: website || "",
            annual_students: parsedAnnualStudents,
            status: "pending",
          });

          if (insErr) {
            console.warn("Direct insert with full fields returned:", insErr.message);
            // Fallback without website_url in case that column is not in older schemas
            try {
              await supabase.from("partner_registrations").insert({
                user_id: authUser.id,
                agency_name: agencyName || "Partner Agency",
                contact_person: contactPerson,
                email,
                phone: phone || "",
                country: country || "",
                annual_students: parsedAnnualStudents,
                status: "pending",
              } as any);
            } catch (e) {
              console.warn("Fallback minimal insert:", e);
            }
          }
        }
      }

      // Pre-seed local cache so dashboard immediately recognizes pending status
      if (authUser?.id) {
        localStorage.setItem(`auth_partner_status_${authUser.id}`, "pending");
        const existingRoles = JSON.parse(localStorage.getItem(`auth_roles_${authUser.id}`) || "[]");
        if (!existingRoles.includes("partner")) {
          existingRoles.push("partner");
          localStorage.setItem(`auth_roles_${authUser.id}`, JSON.stringify(existingRoles));
        }
      }

      await refreshPartnerStatus(authUser?.id, authSession?.access_token);
      toast.success("Email verified! Welcome to your partner dashboard.");
      navigate("/partner-dashboard");
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      toast.success("A new verification code has been sent to your email.");
      setResendCooldown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const inputCls =
    "w-full h-14 px-5 text-base bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-[#2F4F97] focus:text-white focus:placeholder:text-white/60 focus:caret-white transition-all duration-200 rounded-lg";

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-white via-[#2F4F97]/5 to-[#2F4F97]/10">
      <div className="w-full h-full flex flex-col bg-transparent overflow-hidden items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-50 pointer-events-none">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-colors duration-200 pointer-events-auto"
            aria-label="Close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex overflow-y-auto px-6 py-6 md:px-12 md:py-8 lg:px-16 w-full">
          <div className="w-full max-w-2xl m-auto bg-white rounded-xl border border-gray-100 px-8 py-10 shadow-sm">
            <h2 className="font-medium tracking-tight text-[#0c0f16] text-2xl mb-2">
              Agency Registration
            </h2>
            <p className="text-sm text-[#64748B] mb-8 font-medium">Please fill in your details to apply for partnership.</p>
            
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 flex flex-col gap-2">
                  <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${s <= step ? 'bg-[#2F4F97]' : 'bg-gray-200'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${s <= step ? 'text-[#2F4F97]' : 'text-gray-400'}`}>
                    {s === 1 ? 'Agency Info' : s === 2 ? 'Rep Info' : s === 3 ? 'Login Info' : 'Verify Email'}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#2F4F97] text-white w-5 h-5 rounded-xl flex items-center justify-center text-[10px] font-black">1</span>
                    Agency Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Agency Name <span className="text-red-500">*</span></Label>
                      <Input value={agencyName} onChange={(e) => { setAgencyName(e.target.value); setErrors((p) => ({ ...p, agencyName: "" })); }} placeholder="Global Ed Consultants" className={inputCls} />
                      {errors.agencyName && <p className="text-red-500 text-[10px] mt-0.5">{errors.agencyName}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Country <span className="text-red-500">*</span></Label>
                      <Select value={country} onValueChange={(val) => { setCountry(val); setErrors((p) => ({ ...p, country: "" })); }}>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-red-500 text-[10px] mt-0.5">{errors.country}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Website URL</Label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://agency.com" className={inputCls} />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Annual Students</Label>
                      <Select value={annualStudents} onValueChange={setAnnualStudents}>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                          {STUDENT_RANGES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#2F4F97] text-white w-5 h-5 rounded-xl flex items-center justify-center text-[10px] font-black">2</span>
                    Agency Representative Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={contactFirstName}
                        onChange={(e) => { setContactFirstName(e.target.value); setErrors((p) => ({ ...p, contactFirstName: "" })); }}
                        placeholder="John"
                        className={`${inputCls} ${errors.contactFirstName ? "border-red-500" : ""}`}
                      />
                      {errors.contactFirstName && <p className="text-xs text-red-500 mt-1">{errors.contactFirstName}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={contactLastName}
                        onChange={(e) => { setContactLastName(e.target.value); setErrors((p) => ({ ...p, contactLastName: "" })); }}
                        placeholder="Doe"
                        className={`${inputCls} ${errors.contactLastName ? "border-red-500" : ""}`}
                      />
                      {errors.contactLastName && <p className="text-xs text-red-500 mt-1">{errors.contactLastName}</p>}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></Label>
                      <Input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }} placeholder="+880 1XXXXXXXXX" className={inputCls} />
                      {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#2F4F97] text-white w-5 h-5 rounded-xl flex items-center justify-center text-[10px] font-black">3</span>
                    Login Credential Info
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email (Login ID) <span className="text-red-500">*</span></Label>
                      <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} placeholder="contact@agency.com" className={inputCls} />
                      {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password <span className="text-red-500">*</span></Label>
                      <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} placeholder="Min. 6 characters" className={inputCls} />
                      {errors.password && <p className="text-red-500 text-[10px] mt-0.5">{errors.password}</p>}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 text-left mt-4 animate-fade-in">
                    By submitting this form, you will receive a 6-digit confirmation code on your email to verify your account.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="animate-fade-in space-y-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2F4F97]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B]">
                      Verify Your Email
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      We have sent a verification code to <span className="font-semibold text-gray-800">{email}</span>. Please enter the code below to complete registration and enter your partner dashboard.
                    </p>
                    <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200/80 rounded-md py-1.5 px-3 max-w-md mx-auto font-medium">
                      💡 Tip: Please check your <strong>Spam / Junk</strong> folder if the email does not appear in your primary inbox.
                    </p>
                  </div>

                  <div className="space-y-2 max-w-sm mx-auto">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block text-center">
                      Verification Code
                    </Label>
                    <Input
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 8));
                        setOtpError("");
                      }}
                      placeholder="------"
                      className="w-full h-14 text-center font-mono font-bold text-2xl tracking-[0.3em] bg-white border-2 border-gray-300 rounded-lg outline-none focus:border-[#2F4F97]"
                      maxLength={8}
                      autoFocus
                    />
                    {otpError && (
                      <p className="text-red-500 text-xs text-center font-medium mt-1">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col gap-3 max-w-sm mx-auto">
                    <Button
                      className="w-full h-14 font-bold text-base rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] duration-200 disabled:opacity-60"
                      onClick={handleVerifyOtp}
                      disabled={verifying || otp.length < 6}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Verifying Code...
                        </>
                      ) : (
                        "Verify & Enter Dashboard →"
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(3);
                          setOtp("");
                          setOtpError("");
                        }}
                        className="text-gray-500 hover:text-gray-800 underline"
                      >
                        ← Edit credentials
                      </button>

                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || resending}
                        className="text-[#2F4F97] hover:underline font-semibold disabled:text-gray-400 disabled:no-underline"
                      >
                        {resending ? (
                          "Sending..."
                        ) : resendCooldown > 0 ? (
                          `Resend code in ${resendCooldown}s`
                        ) : (
                          "Resend Code"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step < 4 && (
                <div className="pt-6 flex gap-3">
                  {step > 1 && (
                    <Button 
                      className="h-14 text-base font-bold rounded-lg flex-1 max-w-[140px] flex items-center justify-center border-2 border-[#2F4F97] text-[#2F4F97] bg-white hover:bg-[#2F4F97] hover:text-white transition-colors duration-200"
                      onClick={handleBack}
                      disabled={submitting}
                    >
                      ← Back
                    </Button>
                  )}

                  {step < 3 ? (
                    <Button 
                      className="flex-1 h-14 font-bold text-base rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] duration-200"
                      onClick={handleNext}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next →"}
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 h-14 font-bold text-base rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] duration-200"
                      onClick={handleSubmit} 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending Verification Code...</>
                      ) : (
                        "Submit & Receive Code →"
                      )}
                    </Button>
                  )}
                </div>
              )}

              <div className="pt-8 border-t border-gray-100 flex flex-col items-start gap-4 mt-8">
                <p className="text-sm font-medium text-gray-500">Already a registered partner?</p>
                <Link 
                  to="/login"
                  className="w-full h-14 font-bold text-base rounded-lg flex items-center justify-center border-2 border-[#2F4F97] text-[#2F4F97] bg-white hover:bg-[#2F4F97] hover:text-white transition-colors duration-200"
                >
                  Go to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
