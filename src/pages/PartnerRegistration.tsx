import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      // Attempt immediate check via RPC
      const { data, error } = await (supabase.rpc as any)('check_registration_exists', {
        check_email: email,
        check_phone: phone
      });

      if (!error && data) {
        const resData = data as { email_exists?: boolean; phone_exists?: boolean };
        if (resData.email_exists) newErrors.email = "This email is already registered.";
        if (resData.phone_exists) newErrors.phone = "This phone number is already registered.";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSubmitting(false);
        // If phone is duplicate, send them back to step 2
        if (newErrors.phone && !newErrors.email) {
            setStep(2);
        }
        return;
      }

      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: contactFirstName, last_name: contactLastName, display_name: `${contactFirstName} ${contactLastName}` },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Insert registration record using REST API
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const token = authData.session?.access_token || SUPABASE_KEY;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`,
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
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex flex-col gap-2">
                  <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${s <= step ? 'bg-[#2F4F97]' : 'bg-gray-200'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${s <= step ? 'text-[#2F4F97]' : 'text-gray-400'}`}>
                    {s === 1 ? 'Agency Info' : s === 2 ? 'Rep Info' : 'Login Info'}
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
                </div>
              )}

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
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting Application...</>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
              
              {step === 3 && (
                <p className="text-[11px] text-gray-400 text-left mt-4 animate-fade-in">
                  By submitting this form, you agree to our Partnership Terms. Your account will be activated after admin verification.
                </p>
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
