import { useState, useRef } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Handshake, DollarSign, Users, Globe, CheckCircle, ArrowRight, Upload, X, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const benefits = [
  { icon: DollarSign, title: "Competitive Commission", desc: "Earn up to 15% commission on every successful enrollment through your agency." },
  { icon: Users, title: "Dedicated Support", desc: "Get a dedicated account manager to help you and your students every step of the way." },
  { icon: Globe, title: "Global Network", desc: "Access 50+ universities across Malaysia, UK, Australia, and Canada." },
  { icon: CheckCircle, title: "Fast Processing", desc: "Average application processing time of just 5 business days." },
];

const commissionTiers = [
  { tier: "Bronze", students: "1-10", rate: "8%", color: "bg-warning/10 text-warning" },
  { tier: "Silver", students: "11-50", rate: "10%", color: "bg-muted text-muted-foreground" },
  { tier: "Gold", students: "51-100", rate: "12%", color: "bg-[#ffa300]/10 text-[#ffa300]" },
  { tier: "Platinum", students: "100+", rate: "15%", color: "bg-primary/10 text-primary" },
];

const registrationSteps = [
  {
    step: "01",
    title: "Submit Agency Registration",
    desc: "Provide agency profile, contact information, and required documents such as NID and trade license.",
  },
  {
    step: "02",
    title: "Compliance & Quality Review",
    desc: "Our admin team reviews your documents, background, and student handling capacity.",
  },
  {
    step: "03",
    title: "Account Activation",
    desc: "Once approved, your partner account is activated with access to student tools and tracking features.",
  },
  {
    step: "04",
    title: "Start Submitting Students",
    desc: "Create student profiles, upload documents, and monitor each stage from review to visa and enrollment.",
  },
];

const platformFeatures = [
  {
    title: "Student Application Management",
    desc: "Add and manage unlimited student profiles, including intake preferences and target universities.",
  },
  {
    title: "Document Upload & Tracking",
    desc: "Upload passports, transcripts, IELTS, and statements securely with status visibility for each case.",
  },
  {
    title: "Realtime Status Updates",
    desc: "Receive timely updates for document review, offers, visa progress, approvals, and enrollment milestones.",
  },
  {
    title: "Commission Visibility",
    desc: "Track successful cases and commission tiers transparently so your team can forecast growth.",
  },
  {
    title: "Marketing & Sales Support",
    desc: "Use ready-to-share assets and program resources to acquire more students faster.",
  },
  {
    title: "Dedicated Partner Assistance",
    desc: "Get operational help from our team for escalations, documentation checks, and process optimization.",
  },
];

const faqs = [
  {
    q: "How long does approval take?",
    a: "Most registrations are reviewed within 2-5 business days, depending on document completeness.",
  },
  {
    q: "Can multiple staff members manage one agency account?",
    a: "Yes. You can operate through one main agency account and coordinate internal submissions as a team.",
  },
  {
    q: "When do commissions get finalized?",
    a: "Commissions are calculated on successful enrollments and follow your active tier rate.",
  },
  {
    q: "Which destinations and institutions are supported?",
    a: "You get access to a curated global network including Malaysia and other strategic study destinations.",
  },
];

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
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <div
        className="mt-1 border-2 border-dashed rounded-sm p-4 text-center cursor-pointer hover:border-[#ffa300]/50 transition-colors"
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-[#ffa300]" />
              <span className="truncate max-w-[200px]">{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onFileChange(null); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            <Upload className="h-6 w-6 mx-auto mb-1" />
            Click to upload {label.toLowerCase()}
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

export default function B2BLanding() {
  const [regOpen, setRegOpen] = useState(false);
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

  const resetForm = () => {
    setAgencyName(""); setContactPerson(""); setEmail(""); setPhone("");
    setCountry(""); setAnnualStudents(""); setPassword("");
    setNidFile(null); setTradeLicenseFile(null); setCertificateFiles([]);
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

      setRegOpen(false);
      resetForm();
      toast.success("Registration submitted! Your application is pending admin approval. We'll notify you via email once approved.");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu disableSticky />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative pt-24 pb-20 md:pt-32 md:pb-36 overflow-hidden bg-[#181d29] text-white">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80"
            alt="Business Partnership"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="container relative z-20 mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-sm">
              <Handshake className="h-4 w-4 text-[#ffa300]" />
              <span className="text-xs font-bold tracking-widest text-white uppercase">Whiteboard B2B Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 font-['Poppins'] leading-tight tracking-tight">
              Empower Your Agency.<br />
              <span className="text-[#ffa300]">Multiply Your Growth.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Join our elite global network of education partners. Leverage our streamlined platform to place students seamlessly and earn highly lucrative commissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Dialog open={regOpen} onOpenChange={setRegOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] h-14 px-8 font-bold text-base rounded-sm shadow-lg hover:shadow-xl transition-all">
                    Register as Agency <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Register Your Agency</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">Fill in your details and upload required documents. Your registration will be reviewed by our team.</p>
                  <div className="space-y-4 pt-2">
                    <div><Label>Agency Name <span className="text-destructive">*</span></Label><Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Your company name" /></div>
                    <div><Label>Contact Person <span className="text-destructive">*</span></Label><Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full name" /></div>
                    <div><Label>Email <span className="text-destructive">*</span></Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@agency.com" /></div>
                    <div><Label>Password <span className="text-destructive">*</span></Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" /></div>
                    <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" /></div>
                    <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country of operation" /></div>
                    <div><Label>Number of Students (Annual)</Label><Input type="number" value={annualStudents} onChange={(e) => setAnnualStudents(e.target.value)} placeholder="e.g. 50" /></div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Required Documents</h3>
                      <FileUploadField label="National ID (NID)" file={nidFile} onFileChange={setNidFile} required />
                    </div>

                    <FileUploadField label="Trade License (if any)" file={tradeLicenseFile} onFileChange={setTradeLicenseFile} />

                    <div>
                      <Label>Other Certificates</Label>
                      {certificateFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1 text-sm bg-muted rounded px-3 py-2">
                          <FileText className="h-4 w-4 text-[#ffa300]" />
                          <span className="truncate flex-1">{f.name}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCertificate(i)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <FileUploadField
                        label="Add certificate"
                        file={null}
                        onFileChange={addCertificate}
                      />
                    </div>

                    <Button
                      className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Registration"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By registering, you agree to our terms. Your account will be activated after admin approval.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10 hover:text-white font-bold text-base w-full rounded-sm backdrop-blur-sm transition-all">
                  Existing Partner Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white py-24 relative">
          <div className="absolute top-0 right-0 -mt-20 w-64 h-64 bg-[#ffa300]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#181d29] font-['Poppins'] mb-4">Unmatched Partner Benefits</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">We provide the tools, support, and financial incentives to help your education agency scale globally.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b) => (
                <div key={b.title} className="p-8 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-[#ffa300]/30 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ffa300]/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  <div className="h-14 w-14 rounded-lg bg-[#fef1da] flex items-center justify-center mb-6 text-[#ffa300] group-hover:scale-110 transition-transform">
                    <b.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#181d29] mb-3 font-['Poppins']">{b.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commission Tiers Section */}
        <div className="bg-[#f7f8fa] py-24 relative overflow-hidden border-y border-gray-100">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ffa300]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#181d29] font-['Poppins'] mb-4">Lucrative Commission Tiers</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">Your growth is our success. Scale up your student placements to unlock premium rates.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {commissionTiers.map((t, idx) => (
                <div key={t.tier} className={`relative p-8 rounded-xl bg-white flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${idx === 3 ? 'border-2 border-[#ffa300] shadow-xl' : 'border border-gray-100 shadow-sm hover:shadow-md'}`}>
                  {idx === 3 && <div className="absolute -top-3 px-4 py-1 bg-[#ffa300] text-[#181d29] text-[11px] font-bold uppercase tracking-widest rounded-full shadow-sm">Top Tier</div>}
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${t.color}`}>{t.tier} Partner</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-[#181d29]">{t.rate}</span>
                  </div>
                  <p className="text-gray-500 font-medium mb-6 text-sm">{t.students} students/yr</p>
                  <div className="w-full h-px bg-gray-100 mb-6" />
                  <ul className="text-sm text-gray-600 space-y-3 w-full text-left">
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> Guaranteed payout</li>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {idx >= 2 ? "Priority processing" : "Standard processing"}</li>
                    {idx >= 2 && <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> Marketing support</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Process (Timeline) */}
        <div className="py-24 bg-white relative">
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#181d29] font-['Poppins'] mb-4">Simple Onboarding Process</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">Start placing students globally in four easy steps.</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 bg-gray-100 -z-10" />
              <div className="grid md:grid-cols-4 gap-10 md:gap-6">
                {registrationSteps.map((s) => (
                  <div key={s.step} className="relative z-10 flex flex-col items-center text-center group">
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-[#fef1da] shadow-sm flex items-center justify-center mb-6 group-hover:border-[#ffa300] transition-colors duration-300">
                      <span className="text-[#ffa300] font-extrabold text-2xl font-['Poppins']">{s.step}</span>
                    </div>
                    <h3 className="font-bold text-[#181d29] mb-3 text-lg font-['Poppins']">{s.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-light">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Capabilities */}
        <div className="bg-[#181d29] py-24 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffa300 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold font-['Poppins'] mb-4">Powerful B2B Platform</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">Manage your entire agency workflow from a single, intuitive, and secure dashboard.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors duration-300">
                  <div className="h-12 w-12 rounded-lg bg-[#ffa300]/20 flex items-center justify-center mb-6 text-[#ffa300]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 font-['Poppins']">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-24 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#181d29] font-['Poppins'] mb-4">Agency FAQs</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">Common questions about partnering with Whiteboard Education.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <Card key={i} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 md:p-8">
                    <p className="text-lg font-bold text-[#181d29] mb-3 font-['Poppins']">{item.q}</p>
                    <p className="text-[15px] text-gray-600 leading-relaxed font-light">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
