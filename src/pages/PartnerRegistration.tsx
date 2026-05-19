import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        className={`mt-1.5 border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors ${file ? 'border-[#ffa300] bg-[#ffa300]/5' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-[#ffa300]'}`}
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#181d29]">
              <FileText className="h-4 w-4 text-[#ffa300]" />
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

export default function PartnerRegistration() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [agencyName, setAgencyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
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
          annual_students: parseInt(annualStudents) || 0,
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

  const inputCls = "h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#ffa300] focus:ring-1 focus:ring-[#ffa300] text-[13px] rounded-sm transition-colors shadow-none";

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <main className="flex-1 py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link to="/partner" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-[#181d29] transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Partnership Page
          </Link>
          
          <div className="bg-white rounded-sm shadow-xl overflow-hidden flex flex-col lg:flex-row border border-[#e8e8e8]">
            
            {/* Left Panel - Dark */}
            <div className="w-full lg:w-5/12 bg-[#181d29] text-white p-8 md:p-12 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffa300] to-[#ffa300]/20" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ffa300] rounded-full opacity-10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#ffa300] rounded-full opacity-10 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                  <img src="/LOGO-ON-DARK-BG.png" alt="Whiteboard Education" className="h-9 w-auto object-contain" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-white/5 border border-white/10 rounded-sm w-fit backdrop-blur-sm">
                  <Handshake className="h-3.5 w-3.5 text-[#ffa300]" />
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">Partner Network</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-5 leading-[1.15] tracking-tight text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Join Our Global <br />
                  <span className="text-[#ffa300]">Partner Agency Network</span>
                </h1>
                
                <p className="text-gray-400 text-[13.5px] leading-relaxed font-light mb-10">
                  Gain access to Malaysia's top universities, streamlined application processing, and dedicated support to help your students succeed.
                </p>

                <div className="space-y-6 mt-auto border-t border-white/10 pt-8">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Why Partner With Us?</h3>
                  
                  {[
                    "Direct access to 50+ Malaysian Universities",
                    "Dedicated account manager for fast support",
                    "Full visa & compliance assistance",
                    "Transparent commission & high approval rates"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-[#ffa300] mt-0.5 shrink-0" />
                      <span className="text-[13px] text-gray-300 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-7/12 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-[#181d29] mb-2 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                Agency Registration
              </h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">Please fill in your company details to apply for partnership.</p>
              
              <div className="space-y-8">
                {/* Section 1 */}
                <div>
                  <h3 className="text-sm font-semibold text-[#181d29] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#ffa300] text-[#181d29] w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-black">1</span>
                    Company Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Agency Name <span className="text-red-500">*</span></Label>
                      <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="E.g. Global Ed Consultants" required className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Country <span className="text-red-500">*</span></Label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="E.g. Bangladesh" required className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Annual Students</Label>
                      <Input type="number" value={annualStudents} onChange={(e) => setAnnualStudents(e.target.value)} placeholder="E.g. 50" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-sm font-semibold text-[#181d29] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#ffa300] text-[#181d29] w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-black">2</span>
                    Account Representative
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contact Person <span className="text-red-500">*</span></Label>
                      <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full name" required className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" required className={inputCls} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email (Login ID) <span className="text-red-500">*</span></Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@agency.com" required className={inputCls} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password <span className="text-red-500">*</span></Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-sm font-semibold text-[#181d29] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="bg-[#ffa300] text-[#181d29] w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-black">3</span>
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
                          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 text-[#181d29]">
                            <FileText className="h-4 w-4 text-[#ffa300]" />
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

                <div className="pt-6 border-t border-gray-100">
                  <Button 
                    className="w-full h-12 bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-bold text-[14px] rounded-sm transition-all"
                    onClick={handleSubmit} 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting Application...</>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <p className="text-[11px] text-gray-400 text-center mt-4 max-w-sm mx-auto">
                    By submitting this form, you agree to our Partnership Terms. Your account will be activated after admin verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
