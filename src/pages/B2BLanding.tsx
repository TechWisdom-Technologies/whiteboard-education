import { useState, useRef } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Handshake, Users, Globe, CheckCircle2, ArrowRight, Upload, X, FileText, Loader2, ShieldCheck, Zap, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const stepImages = ["/images/partner-step1.png", "/images/partner-step2.png", "/images/partner-step3.png", "/images/partner-step4.png"];

const benefits = [
  { icon: Globe, title: "Malaysia Market Access", desc: "Tap into Malaysia's booming international education sector through our established university partnerships across the country." },
  { icon: Users, title: "Dedicated Account Manager", desc: "Every partner agency is assigned a dedicated relationship manager to assist with student cases and documentation." },
  { icon: ShieldCheck, title: "Trusted & Compliant", desc: "We handle all Malaysian regulatory requirements, visa processing, and institutional compliance on behalf of your students." },
  { icon: Zap, title: "Fast Application Processing", desc: "Our streamlined processes ensure average turnaround of 5 business days from submission to university acknowledgement." },
];

const registrationSteps = [
  { step: "01", title: "Submit Your Application", desc: "Provide your agency profile, representative details, and upload required verification documents." },
  { step: "02", title: "Verification & Review", desc: "Our compliance team reviews your credentials, operational history, and student handling capacity." },
  { step: "03", title: "Account Activation", desc: "Once approved, you receive partner dashboard access with full student management and tracking tools." },
  { step: "04", title: "Start Referring Students", desc: "Submit student applications, upload documents, and track every stage from offer letter to enrollment." },
];

const platformFeatures = [
  { title: "Student Application Management", desc: "Create and manage unlimited student profiles with intake preferences and target Malaysian universities." },
  { title: "Document Upload & Tracking", desc: "Upload passports, transcripts, IELTS scores, and financial statements with real-time status visibility." },
  { title: "Live Status Updates", desc: "Receive timely notifications for document review, offer letters, visa progress, and enrollment milestones." },
  { title: "Marketing & Sales Support", desc: "Access ready-to-share brochures, program guides, and promotional materials to attract Malaysia-bound students." },
  { title: "Dedicated Partner Assistance", desc: "Get operational support for escalations, documentation checks, and process optimization from our team." },
  { title: "Transparent Reporting", desc: "Track all referred students, successful placements, and partnership performance from a single dashboard." },
];

const faqs = [
  { q: "Who can become a Whiteboard Education partner?", a: "Any registered education consultancy or agency operating outside Malaysia that has students interested in studying in Malaysia can apply for partnership." },
  { q: "How long does the approval process take?", a: "Most applications are reviewed within 2–5 business days. Complete documentation speeds up the process." },
  { q: "What universities do you work with?", a: "We have direct partnerships with 50+ Malaysian universities, including top-ranked public and private institutions." },
  { q: "How does the referral process work?", a: "Once approved, you submit student profiles through your partner dashboard. We handle admissions, visa, accommodation, and airport pickup on your behalf." },
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
    <div className="min-h-screen bg-white">
      <MegaMenu />
      <main>
        {/* Hero */}
        <section className="relative bg-[#f8f9fb] pt-0 pb-10 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] flex flex-col gap-24 transform -rotate-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-32 whitespace-nowrap text-8xl font-black tracking-widest uppercase">
                  {[...Array(4)].map((_, j) => (
                    <span key={j} className={j % 2 === 0 ? "text-[#181d29]/[0.04]" : "text-[#ffa300]/[0.08]"}>PARTNER WITH US</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-1 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10" />
          <div className="container relative z-20 mx-auto px-4 pt-10 lg:pt-14">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-white shadow-sm border border-gray-100 rounded-sm">
                <Handshake className="h-3.5 w-3.5 text-[#ffa300]" />
                <span className="text-[11px] font-bold text-[#181d29] tracking-tight">Malaysia's Leading Education Partnership Network</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-[1.2] text-[#181d29] tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                <span className="block mb-1">Your Students Want</span>
                <span className="inline-block bg-[#ffa300] text-[#181d29] px-3 py-0.5 rounded-sm mb-1 shadow-sm">To Study in Malaysia?</span>
                <span className="block">We Make It Happen.</span>
              </h1>
              <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
                We partner with international agencies worldwide to place their students into top Malaysian universities - handling admissions, visa, accommodation, and everything in between.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Dialog open={regOpen} onOpenChange={setRegOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#e08e00] font-semibold text-sm rounded-md h-11 px-6 group shadow-lg shadow-[#ffa300]/20 transition-all hover:shadow-[#ffa300]/40 hover:-translate-y-0.5">
                      Register Your Agency <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
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
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCertificate(i)}><X className="h-3 w-3" /></Button>
                          </div>
                        ))}
                        <FileUploadField label="Add certificate" file={null} onFileChange={addCertificate} />
                      </div>
                      <Button className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Registration"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">By registering, you agree to our terms. Your account will be activated after admin approval.</p>
                    </div>
                  </DialogContent>
                </Dialog>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-[#181d29] text-[#181d29] font-semibold text-sm rounded-md h-11 px-6 transition-all hover:-translate-y-0.5">
                    Existing Partner Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner - creative 2-column layout */}
        <section className="py-16 bg-white relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffa300]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2">Why Partner With Whiteboard?</h2>
              <p className="text-[#515768] max-w-2xl mx-auto text-sm">We are Malaysia's on-the-ground education experts. You handle your market - we handle Malaysia.</p>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1 w-full max-w-md lg:max-w-none">
                <img src="/images/partner-benefits.png" alt="Partnership benefits" className="w-full h-auto" />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {benefits.map((b, i) => (
                  <div key={b.title} className="relative group p-6 rounded-sm border border-[#e5e7eb] bg-white hover:border-[#ffa300]/40 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ffa300] rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-10 w-10 rounded-sm bg-[#ffa300]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <b.icon className="h-5 w-5 text-[#ffa300]" />
                    </div>
                    <h3 className="font-semibold text-[15px] mb-2 text-[#181d29]" style={{ fontFamily: "Poppins, sans-serif" }}>{b.title}</h3>
                    <p className="text-[13px] leading-relaxed text-[#515768]">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How The Partnership Works - cards with vector images */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">How The Partnership Works</h2>
              <p className="text-sm text-[#515768] max-w-2xl mx-auto">A simple, transparent process from registration to successful student placement.</p>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-0.5 bg-[#ffa300]/15 z-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {registrationSteps.map((s, i) => (
                  <div key={s.step} className="relative z-10 group">
                    <div className="bg-white rounded-sm border border-[#e5e7eb] overflow-hidden hover:shadow-lg hover:border-[#ffa300]/30 transition-all duration-300">
                      <div className="relative h-44 bg-[#f8f9fb] flex items-center justify-center overflow-hidden">
                        <img src={stepImages[i]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3">
                          <div className="relative inline-block">
                            <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-[#ffa300] rounded-sm" />
                            <div className="relative w-7 h-7 bg-[#181d29] text-white flex items-center justify-center font-bold text-xs rounded-sm z-10">{s.step}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-[15px] text-[#181d29] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{s.title}</h3>
                        <p className="text-[13px] text-[#515768] leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features - dark CTA section like PreFooterCTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80" alt="Team collaboration" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 z-0 bg-[#181d29]/90 mix-blend-multiply" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#181d29]/95 via-[#181d29]/80 to-transparent" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#ffa300]/20 to-transparent mix-blend-overlay z-0 pointer-events-none" />
          <div className="container relative z-10 mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-[#ffa300]/20 border border-[#ffa300]/30 text-[#ffa300] mb-6 backdrop-blur-sm">
                <HeadphonesIcon className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">Partner Dashboard</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">What You Get Access To</h2>
              <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">Manage your entire student referral pipeline from one powerful, intuitive dashboard.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-[#ffa300] flex-shrink-0" />
                    <h3 className="font-semibold text-white text-[15px]" style={{ fontFamily: "Poppins, sans-serif" }}>{f.title}</h3>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-relaxed pl-8">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ - Accordion */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2">Frequently Asked Questions</h2>
              <p className="text-sm text-[#515768] max-w-2xl mx-auto">Everything you need to know about partnering with Whiteboard Education.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-[#e5e7eb] rounded-sm mb-3 px-5 data-[state=open]:border-[#ffa300]/40 transition-colors">
                  <AccordionTrigger className="text-[15px] font-semibold text-[#181d29] hover:no-underline py-5" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-[#515768] leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA - matches PreFooterCTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=80" alt="Business handshake" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 z-0 bg-[#181d29]/90 mix-blend-multiply" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-[#ffa300]/20 border border-[#ffa300]/30 text-[#ffa300] mb-6 backdrop-blur-sm">
                <Handshake className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">Become a Partner Today</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2 leading-tight">
                Ready to Expand Your <br /><span className="text-[#ffa300]">Malaysia Education Portfolio?</span>
              </h2>
              <p className="text-sm text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">Join our growing network of international agencies and start placing students into Malaysia's top universities.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="w-full sm:w-auto bg-[#ffa300] text-[#181d29] hover:bg-[#e08e00] font-semibold text-sm rounded-md h-11 px-6 group shadow-lg shadow-[#ffa300]/20 transition-all hover:shadow-[#ffa300]/40 hover:-translate-y-0.5" onClick={() => setRegOpen(true)}>
                  Register Your Agency <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </Button>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white hover:text-[#181d29] font-semibold text-sm rounded-md h-11 px-6 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                    Contact Us First
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

