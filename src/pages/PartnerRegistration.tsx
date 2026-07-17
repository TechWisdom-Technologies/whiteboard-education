import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Upload, X, FileText, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  label: string;
  accept?: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  required?: boolean;
}

function FileUploadField({ label, accept = ".pdf,.jpg,.jpeg,.png", file, onFileChange, required }: FileUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="w-full">
      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label} {required && <span className="text-red-500">*</span>}</Label>
      <div
        className={`mt-1.5 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${file ? 'border-[#2F4F97] bg-[#2F4F97]/5' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-[#2F4F97]'}`}
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#1E293B]">
              <FileText className="h-4 w-4 text-[#2F4F97]" />
              <span className="truncate max-w-[180px] font-medium">{file.name}</span>
              <span className="text-gray-400 text-xs">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onFileChange(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-gray-400 text-[13px] font-medium flex flex-col items-center gap-1.5">
            <Upload className="h-5 w-5 text-gray-300" />
            Click to upload
          </div>
        )}
      </div>
    </div>
  );
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("partner-documents").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("partner-documents").getPublicUrl(path);
  return data.publicUrl;
}

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

  // Form state
  const [agencyName, setAgencyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [annualStudents, setAnnualStudents] = useState("");
  const [password, setPassword] = useState("");

  // File state
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);

  const addCertificate = (f: File | null) => {
    if (f) setCertificateFiles((prev) => [...prev, f]);
  };
  const removeCertificate = (idx: number) => {
    setCertificateFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!agencyName || !country) {
        toast.error("Please fill in the required company details.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!contactPerson || !phone || !email || !password) {
        toast.error("Please fill in the required contact details.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!agencyName || !contactPerson || !email || !password || !nidFile) {
      toast.error("Please fill all required fields and upload NID document.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: contactPerson },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Upload documents
      const nidUrl = await uploadFile(nidFile, "nid");
      const tradeLicenseUrl = tradeLicenseFile ? await uploadFile(tradeLicenseFile, "trade-license") : "";
      const certUrls: string[] = [];
      for (const cf of certificateFiles) {
        certUrls.push(await uploadFile(cf, "certificates"));
      }

      // 3. Insert registration record using REST API (anon key since user just signed up)
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
          contact_person: contactPerson,
          email,
          phone,
          country,
          website_url: website,
          registration_number: regNumber,
          annual_students: annualStudents,
          nid_document_url: nidUrl,
          trade_license_url: tradeLicenseUrl,
          certificate_urls: certUrls,
          status: "pending",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      // Sign out since they need approval
      await supabase.auth.signOut();

      toast.success("Registration submitted! Your application is pending admin approval.");
      navigate("/partner");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full h-11 px-3 text-[13px] bg-gray-50 border border-transparent text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#2F4F97]/30 focus:ring-4 focus:ring-[#2F4F97]/10 transition-all duration-300 rounded-xl";

  return (
    <div className="fixed inset-0 flex bg-[#F8FAFC]">
      {/* ══════════════════════════════ LEFT PANEL ══════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col w-5/12 h-full overflow-hidden bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFC] border-r border-[#2F4F97]/10">
        
        {/* Decorative organic background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#2F4F97]/5 blur-[100px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[#2F4F97]/10 blur-[120px]" />
        </div>

        {/* Content - flex column spread */}
        <div className="relative z-10 flex flex-col justify-between h-full px-8 py-6 lg:px-10 lg:py-8">
          
          <div className="flex flex-col">
            {/* Logo */}
            <Link to="/" className="inline-flex mb-6">
              <img src="/logo.png" alt="Whiteboard Education" className="h-7 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 bg-white border border-[#2F4F97]/10 rounded-xl w-fit shadow-sm">
              <Handshake className="h-3 w-3 text-[#2F4F97]" />
              <span className="text-[10px] font-bold text-[#2F4F97] tracking-widest uppercase">Partner Network</span>
            </div>

            <h1 className="font-black text-[#1E293B] text-2xl xl:text-3xl tracking-tight leading-[1.15] mb-2.5">
              Join Our Global <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F4F97] to-[#1c2f5a]">
                Agency Network.
              </span>
            </h1>

            <p className="text-[#64748B] text-[12px] leading-relaxed mb-5 max-w-sm">
              Gain access to Malaysia's top universities, streamlined application processing, and dedicated support to help your students succeed.
            </p>

            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Why Partner With Us?</h3>
              {[
                "Direct access to 50+ Malaysian Universities",
                "Dedicated account manager for fast support",
                "Full visa & compliance assistance",
                "Transparent commission & high approval rates"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/40 py-2 px-3 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm max-w-sm">
                  <div className="h-5 w-5 rounded-full bg-[#2F4F97]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-[#2F4F97]" />
                  </div>
                  <span className="text-[11px] text-[#1E293B] font-bold">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#2F4F97]/10">
            <p className="text-[#64748B] text-[11px] font-medium">© {new Date().getFullYear()} Whiteboard Education</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════ RIGHT PANEL ══════════════════════════════ */}
      <div className="relative w-full lg:w-7/12 h-full flex flex-col bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFC] lg:bg-none lg:bg-white overflow-hidden">
        
        {/* Mobile decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#2F4F97]/10 blur-[100px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[#2F4F97]/15 blur-[120px]" />
        </div>

        {/* Header bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6 flex-shrink-0 bg-transparent lg:bg-white border-b lg:border-none border-[#2F4F97]/10">
          <div className="flex items-center gap-2 lg:hidden">
            <img src="/logo.png" alt="Whiteboard Education" className="h-8 w-auto object-contain" />
          </div>
          <div className="hidden lg:block"></div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form section */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 md:px-12 md:py-8 lg:px-16">
          <div className="max-w-2xl mx-auto pb-12">
            <h2 className="font-medium tracking-tight text-[#0c0f16] text-2xl mb-2">
              Agency Registration
            </h2>
            <p className="text-sm text-[#64748B] mb-8 font-medium">Please fill in your company details to apply for partnership.</p>
            
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex flex-col gap-2">
                  <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${s <= step ? 'bg-[#2F4F97]' : 'bg-gray-200'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${s <= step ? 'text-[#2F4F97]' : 'text-gray-400'}`}>
                    {s === 1 ? 'Company' : s === 2 ? 'Rep' : 'Docs'}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              {/* Section 1 */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#2F4F97] text-white w-5 h-5 rounded-xl flex items-center justify-center text-[10px] font-black">1</span>
                    Company Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Agency Name <span className="text-red-500">*</span></Label>
                      <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Global Ed Consultants" required className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Country <span className="text-red-500">*</span></Label>
                      <Select value={country} onValueChange={setCountry} required>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Website URL</Label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://agency.com" className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Company Reg. No</Label>
                      <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="E.g. CR-123456" className={inputCls} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Annual Students</Label>
                      <Select value={annualStudents} onValueChange={setAnnualStudents} required>
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

              {/* Section 2 */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#2F4F97] text-white w-5 h-5 rounded-xl flex items-center justify-center text-[10px] font-black">2</span>
                    Account Representative
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Person <span className="text-red-500">*</span></Label>
                      <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full name" required className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" required className={inputCls} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email (Login ID) <span className="text-red-500">*</span></Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@agency.com" required className={inputCls} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password <span className="text-red-500">*</span></Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3 */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="text-sm font-semibold text-[#1E293B] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#2F4F97] text-white w-5 h-5 rounded-xl flex items-center justify-center text-[10px] font-black">3</span>
                    Verification Documents
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FileUploadField label="National ID (NID)" file={nidFile} onFileChange={setNidFile} required />
                      <FileUploadField label="Trade License" file={tradeLicenseFile} onFileChange={setTradeLicenseFile} />
                    </div>
                    <div className="pt-2">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Additional Certificates</Label>
                      <div className="space-y-2 mb-2">
                        {certificateFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[#1E293B]">
                            <FileText className="h-4 w-4 text-[#2F4F97]" />
                            <span className="truncate flex-1 font-medium text-[13px]">{f.name}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeCertificate(i)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="w-full sm:w-1/2">
                        <FileUploadField label="Upload Certificate" file={null} onFileChange={addCertificate} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex gap-3">
                {step > 1 && (
                  <Button 
                    variant="outline"
                    className="h-12 border-gray-200 text-gray-700 font-bold text-[14px] rounded-xl flex-1 max-w-[140px]"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    ← Back
                  </Button>
                )}

                {step < 3 ? (
                  <Button 
                    className="flex-1 h-12 bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 font-bold text-[14px] rounded-xl transition-all"
                    onClick={handleNext}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 h-12 bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 font-bold text-[14px] rounded-xl transition-all"
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
                <p className="text-[11px] text-gray-400 text-center mt-4 max-w-sm mx-auto animate-fade-in">
                  By submitting this form, you agree to our Partnership Terms. Your account will be activated after admin verification.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
