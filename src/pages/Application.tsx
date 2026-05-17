import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, Upload, FileText, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";

const LOGOS: Record<string, string> = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
  "UCSI University Malaysia": "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
  "Taylor's University Malaysia": "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
  "APU University Malaysia": "https://en.your-uni.com/assets/images/university/apu-university.webp",
  "UNITEN University Malaysia": "https://en.your-uni.com/assets/images/university/uniten-university.webp",
  "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
  "MAHSA University Malaysia": "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
  "SEGi University Malaysia": "https://en.your-uni.com/assets/images/university/segi-university.webp",
  "INTI International University Malaysia": "https://en.your-uni.com/assets/images/university/inti-university.webp",
  "Sunway University": "https://en.your-uni.com/assets/images/university/sunway-university.webp",
  "HELP University Malaysia": "https://en.your-uni.com/assets/images/university/help-university.png",
  "MONASH University Malaysia": "https://en.your-uni.com/assets/images/university/monash-university.webp",
  "Nottingham University Malaysia": "https://en.your-uni.com/assets/images/university/nottingham-university.webp",
  "Universiti Putra Malaysia (UPM)": "https://en.your-uni.com/assets/images/university/upm-university.jpg",
  "UTM University Malaysia": "https://en.your-uni.com/assets/images/university/utm-university.webp",
  "Universiti Malaya (UM)": "https://en.your-uni.com/assets/images/university/universiti-malaya-um.png",
  "Swinburne University of Technology Sarawak": "https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://www.tarc.edu.my/images/tarumt-logo1.png?v=beyongEducation2",
};

const NATIONALITIES = ["Bangladeshi", "Indian", "Pakistani", "Nigerian", "Indonesian", "Sri Lankan", "Nepalese", "Vietnamese", "Chinese", "Other"];
const COUNTRIES = ["Bangladesh", "India", "Pakistan", "Nigeria", "Indonesia", "Sri Lanka", "Nepal", "Vietnam", "China", "Malaysia", "Other"];

export default function Application() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, user, hasRole } = useAuth();
  
  const universityId = searchParams.get("universityId");
  const courseId = searchParams.get("courseId");

  const [uni, setUni] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Form State
  const [form, setForm] = useState({
    full_name: "",
    nationality: "",
    email: "",
    country_of_residence: "",
    city: "",
    phone: "",
    target_course: "",
    // Guardian
    guardian_name: "",
    guardian_email: "",
    guardian_income: "",
    guardian_phone: "",
    // Files
    hs_certificate_file: null as File | null,
    photo_file: null as File | null,
    passport_file: null as File | null,
    additional_file: null as File | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let uId = universityId;
        
        // If we only have courseId, fetch course to get universityId
        if (courseId && !uId) {
          const { data: cData } = await supabase.from("courses").select("*").eq("id", courseId).single();
          if (cData) {
            uId = cData.university_id;
            setForm(f => ({ ...f, target_course: cData.title }));
          }
        }

        if (uId) {
          const { data: uData } = await supabase.from("universities").select("*").eq("id", uId).single();
          setUni(uData);

          const { data: cList } = await supabase.from("courses").select("title").eq("university_id", uId);
          if (cList) {
            setCourses(Array.from(new Set(cList.map(c => c.title))));
          }
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, [universityId, courseId]);

  const handleFileChange = (field: string, file: File | null) => {
    setForm(f => ({ ...f, [field]: file }));
  };

  const validateStep1 = () => {
    if (!form.full_name || !form.email || !form.nationality || !form.phone || !form.target_course) {
      toast.error("Please fill all required fields in step 1.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.guardian_name || !form.guardian_phone) {
      toast.error("Please fill all required fields in step 2.");
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File, pathPrefix: string) => {
    const fileName = `${user?.id}/${Date.now()}_${pathPrefix}_${file.name}`;
    const { error } = await supabase.storage.from("student-documents").upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("student-documents").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.hs_certificate_file || !form.passport_file || !form.photo_file) {
      toast.error("Please upload all required documents.");
      return;
    }
    if (!agreed) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      const hsUrl = await uploadFile(form.hs_certificate_file, "hs_cert");
      const photoUrl = await uploadFile(form.photo_file, "photo");
      const passportUrl = await uploadFile(form.passport_file, "passport");
      let additionalUrl = "";
      if (form.additional_file) {
        additionalUrl = await uploadFile(form.additional_file, "additional");
      }
      setUploading(false);

      // Save to students table
      // We map the requested fields to the student table where possible.
      // E.g. City/Country -> mapped to admin_notes or nationality for now if columns don't exist.
      const extraInfo = `Guardian: ${form.guardian_name}, Email: ${form.guardian_email}, Phone: ${form.guardian_phone}, Income: ${form.guardian_income} | Residence: ${form.country_of_residence}, City: ${form.city}`;

      const { error } = await supabase.from("students").insert({
        partner_id: user?.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        nationality: form.nationality,
        target_university: uni?.name || "Any",
        target_course: form.target_course,
        status: "document_review",
        academic_transcript_url: hsUrl,
        passport_url: passportUrl,
        personal_statement_url: photoUrl, // Using this for photo for now
        recommendation_letter_url: additionalUrl, // Using this for additional docs
        admin_notes: extraInfo,
      });

      if (error) throw error;

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application.");
      setUploading(false);
      setSubmitting(false);
    }
  };

  const logo = uni ? (LOGOS[uni.name] || uni.logo_url) : null;

  if (loadingInitial) {
    return <div className="min-h-screen flex flex-col bg-background"><MegaMenu /><LoadingScreen label="Loading application..." className="flex-1" /><PublicFooter /></div>;
  }

  const isAuthorized = hasRole("admin") || hasRole("partner");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MegaMenu disableSticky />

      {uni && (
        <section className="bg-[#fdf0d5] py-16">
          <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center gap-6">
            <img src={logo || "https://placehold.co/150"} alt={uni.name} className="h-28 w-28 md:h-36 md:w-36 object-contain rounded-sm bg-white p-3 shadow" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-semibold text-[#181d29] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{uni.name}</h1>
              {uni.city && <p className="text-gray-600 flex items-center gap-1 justify-center md:justify-start"><MapPin className="h-4 w-4 text-[#ffa300]" />{uni.city}, Malaysia</p>}
            </div>
            {/* Note: No Apply Now or Ask Us buttons here as per user request */}
          </div>
        </section>
      )}

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-10">
          
          {!isAuthorized ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-6">Please login as an admin or partner agent to continue application procedure.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate("/login")}>Go to Login</Button>
                <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
              </div>
            </div>
          ) : success ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">After submitting your application, your files will be reviewed and an educational counselor will communicate with you to start your admission procedures and provide you with more information.</p>
              <Button onClick={() => navigate("/partner-dashboard")}>Go to Dashboard</Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#181d29] mb-2">Student Application</h1>
                <p className="text-muted-foreground text-sm">Step {step} of 3</p>
                
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? "bg-[#ffa300]" : "bg-gray-100"}`} />
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-lg font-semibold border-b pb-2">1. Personal & Course Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="john@example.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Nationality *</Label>
                      <Select value={form.nationality} onValueChange={v => setForm(f => ({...f, nationality: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                        <SelectContent>
                          {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Country of Residence *</Label>
                      <Select value={form.country_of_residence} onValueChange={v => setForm(f => ({...f, country_of_residence: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="City name" />
                    </div>

                    <div className="space-y-2">
                      <Label>Contact Number *</Label>
                      <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+123..." />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label>Preferred Program *</Label>
                    <Select value={form.target_course} onValueChange={v => setForm(f => ({...f, target_course: v}))}>
                      <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                      <SelectContent>
                        {courses.length > 0 ? courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>) : (
                          <SelectItem value="Any">Any Course / Not Sure Yet</SelectItem>
                        )}
                        {courses.length > 0 && <SelectItem value="Other">Other / Not Listed</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button onClick={() => validateStep1() && setStep(2)} className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200]">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-lg font-semibold border-b pb-2">2. Guardian Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Parent/Guardian Name *</Label>
                      <Input value={form.guardian_name} onChange={e => setForm(f => ({...f, guardian_name: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent/Guardian Email</Label>
                      <Input type="email" value={form.guardian_email} onChange={e => setForm(f => ({...f, guardian_email: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent/Guardian Contact Number *</Label>
                      <Input value={form.guardian_phone} onChange={e => setForm(f => ({...f, guardian_phone: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Yearly Income (Estimated)</Label>
                      <Input value={form.guardian_income} onChange={e => setForm(f => ({...f, guardian_income: e.target.value}))} placeholder="$" />
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={() => validateStep2() && setStep(3)} className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200]">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-lg font-semibold border-b pb-2">3. Upload Documents</h2>
                  
                  <div className="space-y-4">
                    {[
                      { id: "hs_certificate_file", label: "High School Certificate or equivalent *", required: true },
                      { id: "photo_file", label: "White Background Photo *", required: true },
                      { id: "passport_file", label: "Passport Info Page *", required: true },
                      { id: "additional_file", label: "Additional Documents", required: false },
                    ].map(field => (
                      <div key={field.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (Max 5MB)</p>
                        </div>
                        <div>
                          <input 
                            type="file" 
                            id={field.id} 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => handleFileChange(field.id, e.target.files ? e.target.files[0] : null)}
                          />
                          <Label htmlFor={field.id} className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                            {(form as any)[field.id] ? "Change File" : "Choose File"}
                          </Label>
                        </div>
                        {(form as any)[field.id] && (
                          <div className="text-sm text-green-600 flex items-center shrink-0">
                            <CheckCircle className="h-4 w-4 mr-1" /> Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-4 border-t mt-8">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          By submitting this form, I agree to the terms & conditions
                        </label>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md text-blue-800">
                      After submitting your application, your files will be reviewed and an educational counselor will communicate with you to start your admission procedures and provide you with more information.
                    </p>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button onClick={handleSubmit} disabled={submitting} className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-8">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {uploading ? "Uploading Docs..." : submitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
