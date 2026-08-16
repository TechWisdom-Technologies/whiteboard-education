import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Loader2, GraduationCap, Languages, User, Mail, Phone, Calendar, CreditCard, CheckCircle2, AlertCircle, Save, Camera, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ─── Nationalities ─────────────────────────────────────────
const nationalities = [
  "Bangladeshi","Afghan","Albanian","Algerian","American","Andorran","Angolan","Argentine","Armenian","Australian",
  "Austrian","Azerbaijani","Bahamian","Bahraini","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese",
  "Bolivian","Bosnian","Brazilian","British","Bruneian","Bulgarian","Burkinabe","Burmese","Burundian","Cambodian",
  "Cameroonian","Canadian","Cape Verdean","Central African","Chadian","Chilean","Chinese","Colombian","Comorian","Congolese",
  "Costa Rican","Croatian","Cuban","Cypriot","Czech","Danish","Djiboutian","Dominican","Dutch","Ecuadorian",
  "Egyptian","Emirati","Equatorial Guinean","Eritrean","Estonian","Ethiopian","Fijian","Filipino","Finnish","French",
  "Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean","Guyanese",
  "Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli",
  "Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakh","Kenyan","Kiribati","Korean","Kuwaiti",
  "Kyrgyz","Lao","Latvian","Lebanese","Liberian","Libyan","Lithuanian","Luxembourgish","Macedonian","Malagasy",
  "Malawian","Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Moldovan","Mongolian",
  "Montenegrin","Moroccan","Mozambican","Namibian","Nepalese","New Zealander","Nicaraguan","Nigerian","Nigerien","Norwegian",
  "Omani","Pakistani","Palestinian","Panamanian","Papua New Guinean","Paraguayan","Peruvian","Polish","Portuguese","Qatari",
  "Romanian","Russian","Rwandan","Saint Lucian","Salvadoran","Samoan","Saudi","Senegalese","Serbian","Sierra Leonean",
  "Singaporean","Slovak","Slovenian","Somali","South African","South Sudanese","Spanish","Sri Lankan","Sudanese","Surinamese",
  "Swedish","Swiss","Syrian","Taiwanese","Tajik","Tanzanian","Thai","Togolese","Tongan","Trinidadian",
  "Tunisian","Turkish","Turkmen","Ugandan","Ukrainian","Uruguayan","Uzbek","Venezuelan","Vietnamese","Yemeni",
  "Zambian","Zimbabwean"
];

// ─── Education Levels ──────────────────────────────────────
const educationLevels = [
  { value: "SSC", label: "SSC" },
  { value: "HSC", label: "HSC" },
  { value: "Diploma", label: "Diploma" },
  { value: "Bachelors", label: "Bachelors" },
  { value: "Masters", label: "Masters" },
  { value: "PHD", label: "PHD" },
];

const streams = ["Science", "Commerce", "Humanities"];

// ─── Language Tests & Scores ───────────────────────────────
const languageTests = [
  { id: "IELTS", label: "IELTS" },
  { id: "TOEFL", label: "TOEFL iBT" },
  { id: "PTE", label: "PTE Academic" },
  { id: "Duolingo", label: "Duolingo" },
  { id: "Cambridge", label: "Cambridge English" },
  { id: "Linguaskill", label: "Linguaskill" },
  { id: "OET", label: "OET" },
  { id: "MUET", label: "MUET" },
  { id: "MOI", label: "MOI (Medium of Instruction)" },
];

const getTestScores = (test: string): string[] => {
  switch (test) {
    case "IELTS": return ["4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];
    case "TOEFL": return ["40-59", "60-70", "71-80", "81-90", "91-100", "101-110", "111-120"];
    case "PTE": return ["30-39", "40-50", "51-60", "61-70", "71-80", "81-90"];
    case "Duolingo": return ["60-75", "80-90", "95-105", "110-120", "125-135", "140-160"];
    case "Cambridge": return ["140-159 (B1)", "160-169 (B2)", "170-179 (B2)", "180-199 (C1)", "200-230 (C2)"];
    case "Linguaskill": return ["140-159 (B1)", "160-179 (B2)", "180+ (C1 or above)"];
    case "OET": return ["C (200-290)", "C+ (300-340)", "B (350-440)", "A (450-500)"];
    case "MUET": return ["Band 1.0", "Band 2.0", "Band 2.5", "Band 3.0", "Band 3.5", "Band 4.0", "Band 4.5", "Band 5.0", "Band 5+"];
    default: return [];
  }
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ─── Initial Form State ────────────────────────────────────
const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  nationality: "Bangladeshi",
  passport_number: "",
  passport_expiry_date: "",
  passport_photo_url: "",
  date_of_birth: "",
  education_level: "",
  stream: "",
  program: "",
  major: "",
  previous_institution: "",
  gpa: "",
  language_test_name: "",
  ielts_score: "",
};

export default function PartnerAddStudent() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { studentId: paramStudentId } = useParams();
  const [searchParams] = useSearchParams();
  const editId = paramStudentId || searchParams.get("edit") || searchParams.get("editId");
  const isEditMode = Boolean(editId);

  const [form, setForm] = useState(emptyForm);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(isEditMode);
  const [existingStudent, setExistingStudent] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // ─── Photo Upload Handlers ─────────────────────────────
  const handleUploadPhoto = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size should be less than 5MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const studentFolder = existingStudent?.id || "temp";
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${user?.id || "partner"}/${studentFolder}/passport_photo_${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-documents")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("student-documents")
        .getPublicUrl(path);

      setForm((f) => ({ ...f, passport_photo_url: publicUrl }));

      if (isEditMode && existingStudent) {
        await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${existingStudent.id}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ passport_photo_url: publicUrl }),
        });
      }

      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    setForm((f) => ({ ...f, passport_photo_url: "" }));
    if (isEditMode && existingStudent) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${existingStudent.id}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ passport_photo_url: null }),
        });
        toast.success("Profile photo removed");
      } catch (err: any) {
        toast.error("Failed to remove photo");
      }
    }
  };

  // ─── Load Student for Edit Mode ────────────────────────
  useEffect(() => {
    if (!editId || !session) {
      setLoadingStudent(false);
      return;
    }

    const fetchStudentData = async () => {
      setLoadingStudent(true);
      try {
        const isWb = editId.startsWith("WB-");
        const filter = isWb
          ? `wb_student_id=eq.${editId.replace("WB-", "")}`
          : `id=eq.${editId}`;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?${filter}&select=*`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load student data");
        const data = await res.json();
        if (!data || data.length === 0) throw new Error("Student not found");
        const s = data[0];
        setExistingStudent(s);

        const nameParts = (s.full_name || "").trim().split(/\s+/);
        const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        let eduLevel = s.previous_degree || "";
        if (eduLevel === "Bachelor") eduLevel = "Bachelors";
        if (eduLevel === "Master") eduLevel = "Masters";
        if (eduLevel === "PhD") eduLevel = "PHD";

        const testName = s.language_test_name || s.english_test_type || "";
        const testOptions = getTestScores(testName);
        let scoreStr = "";
        if (testName === "MOI" || s.english_test_score === "MOI" || s.language_test_name === "MOI" || s.english_test_type === "MOI") {
          scoreStr = "MOI";
        } else if (s.english_test_score && testOptions.includes(s.english_test_score)) {
          scoreStr = s.english_test_score;
        } else if (s.ielts_score !== undefined && s.ielts_score !== null && testOptions.includes(Number(s.ielts_score).toFixed(1))) {
          scoreStr = Number(s.ielts_score).toFixed(1);
        } else if (s.ielts_score !== undefined && s.ielts_score !== null && testOptions.includes(s.ielts_score.toString())) {
          scoreStr = s.ielts_score.toString();
        } else if (s.english_test_score) {
          const matched = testOptions.find(
            (opt) => opt.toLowerCase() === (s.english_test_score || "").toLowerCase() || opt.startsWith(s.english_test_score)
          );
          scoreStr = matched || s.english_test_score;
        } else if (s.ielts_score && s.ielts_score > 0) {
          scoreStr = testName === "IELTS" ? Number(s.ielts_score).toFixed(1) : s.ielts_score.toString();
        }

        const isSSCHSC = eduLevel === "SSC" || eduLevel === "HSC";
        const streamVal = s.stream || (isSSCHSC && ["Science", "Commerce", "Humanities"].includes(s.major) ? s.major : "");

        setForm({
          first_name: firstName,
          last_name: lastName,
          email: s.email || "",
          phone: s.phone || "",
          gender: s.gender || "",
          nationality: s.nationality || "Bangladeshi",
          passport_number: s.passport_number || "",
          passport_expiry_date: s.passport_expiry_date ? s.passport_expiry_date.split("T")[0] : "",
          passport_photo_url: s.passport_photo_url || "",
          date_of_birth: s.date_of_birth ? s.date_of_birth.split("T")[0] : "",
          education_level: eduLevel,
          stream: streamVal,
          program: s.program || (["Diploma", "Bachelors", "Masters"].includes(eduLevel) ? s.previous_degree || "" : ""),
          major: s.major || "",
          previous_institution: s.previous_institution || "",
          gpa: s.gpa !== undefined && s.gpa !== null && s.gpa > 0 ? s.gpa.toString() : "",
          language_test_name: testName,
          ielts_score: scoreStr,
        });
      } catch (err: any) {
        toast.error(err.message || "Error loading student");
      } finally {
        setLoadingStudent(false);
      }
    };
    fetchStudentData();
  }, [editId, session]);

  // ─── Derived State ─────────────────────────────────────
  const isSSCOrHSC = form.education_level === "SSC" || form.education_level === "HSC";
  const isDiplomaOrAbove = ["Diploma", "Bachelors", "Masters"].includes(form.education_level);
  const streamEnabled = isSSCOrHSC;
  const programEnabled = isDiplomaOrAbove;
  const majorEnabled = programEnabled;
  const isMOI = form.language_test_name === "MOI";
  const gpaLabel = isSSCOrHSC ? "GPA" : "CGPA";
  const gpaMax = isSSCOrHSC ? 5.0 : 4.0;
  const availableScores = getTestScores(form.language_test_name);

  // Email format check
  const emailInvalid = touchedEmail && form.email.length > 0 && !isValidEmail(form.email);

  // Count filled fields for completeness
  const filledFields = [
    form.first_name, form.last_name, form.email && isValidEmail(form.email), form.phone,
    form.gender, form.nationality, form.passport_number, form.passport_expiry_date, form.date_of_birth,
    form.education_level, form.previous_institution, form.gpa,
    form.language_test_name,
  ].filter(Boolean).length;
  const totalFields = 13;

  const handleBack = () => {
    if (isEditMode && existingStudent) {
      const targetId = existingStudent.wb_student_id ? `WB-${existingStudent.wb_student_id}` : existingStudent.id;
      const isFromAdmin = window.location.pathname.startsWith("/admin");
      navigate(isFromAdmin ? `/admin/students/${targetId}` : `/partner-dashboard/students/${targetId}`);
    } else {
      const isFromAdmin = window.location.pathname.startsWith("/admin");
      navigate(isFromAdmin ? "/admin/students" : "/partner-dashboard/students");
    }
  };

  const handleSubmit = async () => {
    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const email = form.email.trim();
    const passportNumber = form.passport_number.trim();

    if (!firstName) {
      toast.error("First Name is required");
      return;
    }
    if (!lastName) {
      toast.error("Last Name is required");
      return;
    }
    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }
    if (!passportNumber) {
      toast.error("Passport Number is required");
      return;
    }

    // Validate GPA if entered
    if (form.gpa) {
      const gpaNum = parseFloat(form.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > gpaMax) {
        toast.error(`Please enter a valid ${gpaLabel} between 0.00 and ${gpaMax.toFixed(2)}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const previousDegree = form.education_level || "";
      
      let numericScore = 0;
      if (form.ielts_score && !isMOI) {
        const parsed = parseFloat(form.ielts_score);
        numericScore = isNaN(parsed) ? 0 : parsed;
      }

      const majorValue = (isSSCOrHSC ? form.stream : form.major).trim();

      if (isEditMode && existingStudent) {
        const updatePayload: Record<string, any> = {
          full_name: fullName,
          email: email,
          phone: form.phone.trim(),
          gender: form.gender,
          nationality: form.nationality,
          passport_number: passportNumber,
          passport_expiry_date: form.passport_expiry_date || null,
          passport_photo_url: form.passport_photo_url || null,
          date_of_birth: form.date_of_birth || null,
          previous_degree: previousDegree,
          previous_institution: form.previous_institution.trim(),
          major: majorValue,
          gpa: form.gpa ? parseFloat(form.gpa) : 0,
          language_test_name: form.language_test_name,
          english_test_type: form.language_test_name,
          ielts_score: numericScore,
          english_test_score: isMOI ? "MOI" : form.ielts_score || "",
          degree_level: form.education_level === "Bachelors" ? "Bachelor" : form.education_level === "Masters" ? "Master" : form.education_level,
        };

        const res = await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${existingStudent.id}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(updatePayload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to update student");
        const updated = (data && data[0]) ? data[0] : existingStudent;
        toast.success("Student profile updated successfully!");

        const targetId = updated.wb_student_id ? `WB-${updated.wb_student_id}` : updated.id;
        const isFromAdmin = window.location.pathname.startsWith("/admin");
        if (isFromAdmin) {
          navigate(`/admin/students/${targetId}`);
        } else {
          navigate(`/partner-dashboard/students/${targetId}`);
        }
      } else {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            phone: form.phone.trim(),
            gender: form.gender,
            nationality: form.nationality,
            passport_number: passportNumber,
            passport_expiry_date: form.passport_expiry_date || null,
            passport_photo_url: form.passport_photo_url || null,
            date_of_birth: form.date_of_birth || null,
            previous_degree: previousDegree,
            previous_institution: form.previous_institution.trim(),
            major: majorValue,
            gpa: form.gpa ? parseFloat(form.gpa) : 0,
            language_test_name: form.language_test_name,
            english_test_type: form.language_test_name,
            ielts_score: numericScore,
            english_test_score: isMOI ? "MOI" : form.ielts_score || "",
            degree_level: form.education_level === "Bachelors" ? "Bachelor" : form.education_level === "Masters" ? "Master" : form.education_level,
            partner_id: user?.id,
            status: "new",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to save student");
        const newStudent = data[0];
        toast.success("Student registered successfully!");
        const targetId = newStudent.wb_student_id ? `WB-${newStudent.wb_student_id}` : newStudent.id;
        const isFromAdmin = window.location.pathname.startsWith("/admin");
        if (isFromAdmin) {
          navigate(`/admin/students/${targetId}`);
        } else {
          navigate(`/partner-dashboard/students/${targetId}`);
        }
      }
    } catch (e: any) {
      toast.error(e.message || (isEditMode ? "Failed to update student" : "Failed to add student"));
    } finally { setSubmitting(false); }
  };

  if (loadingStudent) {
    return <LoadingScreen fullScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8 rounded-full bg-[#2F4F97]/10 hover:bg-[#2F4F97]/20 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold text-[#1E293B]">
          {isEditMode ? "Edit Student Profile" : "Register New Student"}
        </h2>
      </div>

      {/* Main Layout: Form (2/3) + Live Preview (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ═══════════════ LEFT: FORM ═══════════════ */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-8">

              {/* ── Personal Information ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-[#2F4F97]" />
                  <h3 className="font-semibold text-sm text-gray-900">Personal Information</h3>
                </div>

                {/* Profile / Passport Photo Upload Box */}
                <div className="mb-6 p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-24 rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
                      {form.passport_photo_url ? (
                        <img
                          src={form.passport_photo_url}
                          alt="Passport Photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                          <ImageIcon className="w-6 h-6 mb-1 text-gray-300" />
                          <span className="text-[10px] leading-tight">No Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <Label className="text-xs font-semibold text-gray-900">Passport / Profile Photo</Label>
                      <Badge variant="outline" className="text-[10px] font-normal bg-purple-50 text-purple-700 border-purple-200">Recommended</Badge>
                      {form.passport_photo_url && (
                        <Badge variant="outline" className="text-[10px] font-normal bg-green-50 text-green-700 border-green-200">Uploaded</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Standard passport size photo with white background (JPEG, PNG, max 5MB).
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                      <input
                        type="file"
                        ref={photoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadPhoto(file);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className="h-8 px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white border-gray-200 shadow-sm"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {form.passport_photo_url ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {form.passport_photo_url && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={uploadingPhoto}
                          onClick={handleDeletePhoto}
                          className="h-8 px-3 text-xs font-semibold bg-red-600 hover:bg-white text-white hover:text-red-600 border border-red-600 hover:border-red-600 shadow-sm transition-all duration-200 group"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 text-white group-hover:text-red-600 transition-colors" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.first_name}
                      onChange={e => setForm(f => ({ ...f, first_name: e.target.value.replace(/[^a-zA-Z\s.'-]/g, "") }))}
                      placeholder="First name"
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.last_name}
                      onChange={e => setForm(f => ({ ...f, last_name: e.target.value.replace(/[^a-zA-Z\s.'-]/g, "") }))}
                      placeholder="Last name"
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value.trim() }))}
                      onBlur={() => setTouchedEmail(true)}
                      placeholder="email@example.com"
                      className={`h-9 mt-1 ${emailInvalid ? "border-red-500 focus:bg-red-500" : ""}`}
                    />
                    {emailInvalid && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Please enter a valid email format
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") }))}
                      placeholder="+8801700000000"
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Gender</Label>
                    <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                      <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Nationality</Label>
                    <Select value={form.nationality} onValueChange={v => setForm(f => ({ ...f, nationality: v }))}>
                      <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select nationality" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {nationalities.map(n => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Passport Number <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.passport_number}
                      onChange={e => setForm(f => ({ ...f, passport_number: e.target.value.toUpperCase().replace(/[^A-Z0-9< -]/g, "") }))}
                      placeholder="e.g. A01234567"
                      className="h-9 mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Passport Expiry Date</Label>
                    <Input
                      type="date"
                      value={form.passport_expiry_date}
                      onChange={e => setForm(f => ({ ...f, passport_expiry_date: e.target.value }))}
                      className="h-9 mt-1"
                    />
                    {form.passport_expiry_date && (
                      (() => {
                        const today = new Date();
                        const expiry = new Date(form.passport_expiry_date);
                        const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
                        if (monthsDiff < 18) {
                          return (
                            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Validity &lt; 18 months
                            </p>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Date of Birth</Label>
                    <Input
                      type="date"
                      value={form.date_of_birth}
                      onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                      className="h-9 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Academic Background ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4 text-[#2F4F97]" />
                  <h3 className="font-semibold text-sm text-gray-900">Academic Background</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Level of Education</Label>
                    <Select value={form.education_level} onValueChange={v => setForm(f => ({ ...f, education_level: v, stream: "", program: "", major: "", gpa: "" }))}>
                      <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {educationLevels.map(l => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={`text-xs ${!streamEnabled ? "text-gray-400" : ""}`}>Stream</Label>
                    <Select value={form.stream} onValueChange={v => setForm(f => ({ ...f, stream: v }))} disabled={!streamEnabled}>
                      <SelectTrigger className={`h-9 mt-1 ${!streamEnabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}>
                        <SelectValue placeholder={streamEnabled ? "Select stream" : "N/A (Only for SSC/HSC)"} />
                      </SelectTrigger>
                      <SelectContent>
                        {streams.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={`text-xs ${!programEnabled ? "text-gray-400" : ""}`}>Program</Label>
                    <Input
                      value={form.program}
                      onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                      placeholder={programEnabled ? "e.g. Bachelor of Science" : "N/A (Only for Diploma/Bachelors/Masters)"}
                      className={`h-9 mt-1 ${!programEnabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                      disabled={!programEnabled}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${!majorEnabled ? "text-gray-400" : ""}`}>Major</Label>
                    <Input
                      value={form.major}
                      onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                      placeholder={majorEnabled ? "e.g. Computer Science" : "N/A"}
                      className={`h-9 mt-1 ${!majorEnabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                      disabled={!majorEnabled}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Institution</Label>
                    <Input
                      value={form.previous_institution}
                      onChange={e => setForm(f => ({ ...f, previous_institution: e.target.value }))}
                      placeholder="Institution / College name"
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      {gpaLabel} {form.education_level && <span className="text-gray-400 font-normal">(0.00 – {gpaMax.toFixed(2)})</span>}
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={form.gpa}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = raw.split(".");
                        const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : raw;
                        const decimalBounded = formatted.includes(".") 
                          ? `${formatted.split(".")[0]}.${formatted.split(".")[1].slice(0, 2)}`
                          : formatted;
                        
                        if (decimalBounded === "" || parseFloat(decimalBounded) <= gpaMax) {
                          setForm(f => ({ ...f, gpa: decimalBounded }));
                        }
                      }}
                      placeholder={`0.00 – ${gpaMax.toFixed(2)}`}
                      className="h-9 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Language Proficiency ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-4 h-4 text-[#2F4F97]" />
                  <h3 className="font-semibold text-sm text-gray-900">Language Proficiency</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Test</Label>
                    <Select
                      value={form.language_test_name}
                      onValueChange={v => setForm(f => ({
                        ...f,
                        language_test_name: v,
                        ielts_score: v === "MOI" ? "MOI" : ""
                      }))}
                    >
                      <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select test" /></SelectTrigger>
                      <SelectContent>
                        {languageTests.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={`text-xs ${isMOI || !form.language_test_name ? "text-gray-400" : ""}`}>
                      Score {form.language_test_name && !isMOI && <span className="text-gray-400 font-normal">(Select Score)</span>}
                    </Label>
                    {isMOI ? (
                      <Input
                        value="MOI (No Score Required)"
                        disabled
                        className="h-9 mt-1 opacity-50 cursor-not-allowed bg-gray-50 text-xs italic"
                      />
                    ) : availableScores.length > 0 ? (
                      <Select
                        value={form.ielts_score}
                        onValueChange={v => setForm(f => ({ ...f, ielts_score: v }))}
                        disabled={!form.language_test_name}
                      >
                        <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select score" /></SelectTrigger>
                        <SelectContent className="max-h-56">
                          {availableScores.map(score => (
                            <SelectItem key={score} value={score}>{score}</SelectItem>
                          ))}
                          {form.ielts_score && !availableScores.includes(form.ielts_score) && form.ielts_score !== "MOI" && (
                            <SelectItem key={form.ielts_score} value={form.ielts_score}>{form.ielts_score}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value=""
                        placeholder={form.language_test_name ? "N/A" : "Select a test first"}
                        disabled
                        className="h-9 mt-1 opacity-50 cursor-not-allowed bg-gray-50 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Action Buttons ── */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleBack} className="h-10 px-6">
                  Cancel
                </Button>
                <Button
                  className="h-10 px-6 bg-[#2F4F97] text-white border border-[#2F4F97] hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-all duration-200 shadow-sm group"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-white group-hover:text-[#2F4F97]" />
                  ) : isEditMode ? (
                    <Save className="h-4 w-4 mr-2 text-white group-hover:text-[#2F4F97]" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2 text-white group-hover:text-[#2F4F97]" />
                  )}
                  {isEditMode ? "Update Student" : "Save Student"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* ═══════════════ RIGHT: LIVE PREVIEW ═══════════════ */}
        <div className="lg:col-span-1 lg:sticky lg:top-[80px] lg:self-start space-y-4">

            {/* Live Profile Card */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              {/* Header gradient */}
              <div className="h-20 bg-gradient-to-br from-[#2F4F97] to-[#1E3A6F] relative">
                <div className="absolute -bottom-8 left-5">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center">
                    {form.passport_photo_url ? (
                      <img
                        src={form.passport_photo_url}
                        alt={form.first_name || "Student"}
                        className="w-full h-full object-cover"
                      />
                    ) : form.first_name ? (
                      <span className="text-2xl font-bold text-[#2F4F97]">
                        {form.first_name.charAt(0).toUpperCase()}{form.last_name ? form.last_name.charAt(0).toUpperCase() : ""}
                      </span>
                    ) : (
                      <User className="w-7 h-7 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="pt-12 pb-5 px-5 space-y-4">
                {/* Name */}
                <div>
                  <h3 className="text-base font-bold text-[#1E293B] leading-tight">
                    {form.first_name || form.last_name
                      ? `${form.first_name} ${form.last_name}`.trim()
                      : "Student Name"
                    }
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {form.nationality || "Nationality"} • {form.gender || "Gender"}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{form.email || "email@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{form.phone || "+880..."}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{form.passport_number || "Passport #"}</span>
                  </div>
                  {form.passport_expiry_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>
                        Exp: {new Date(form.passport_expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {(() => {
                        const today = new Date();
                        const expiry = new Date(form.passport_expiry_date);
                        const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
                        if (monthsDiff < 18) {
                          return (
                            <Badge variant="outline" className="text-[9px] bg-red-50 text-red-600 border-red-200 px-1 py-0 h-4 uppercase">
                              &lt; 18m
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  {form.date_of_birth && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>DOB: {new Date(form.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Academic */}
                {form.education_level && (
                  <>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Academic</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px] bg-[#2F4F97]/5 text-[#2F4F97] border-[#2F4F97]/20">
                          {form.education_level}
                        </Badge>
                        {isSSCOrHSC && form.stream && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {form.stream}
                          </Badge>
                        )}
                        {programEnabled && form.program && (
                          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                            {form.program}
                          </Badge>
                        )}
                        {form.gpa && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            {gpaLabel}: {form.gpa}
                          </Badge>
                        )}
                      </div>
                      {form.previous_institution && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                          <GraduationCap className="w-3 h-3 text-gray-400" />
                          {form.previous_institution}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Language */}
                {form.language_test_name && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Language</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                        {form.language_test_name}
                      </Badge>
                      {!isMOI && form.ielts_score && (
                        <span className="text-xs font-semibold text-gray-700">Score: {form.ielts_score}</span>
                      )}
                      {isMOI && (
                        <span className="text-xs italic text-gray-400">MOI (No score)</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completeness Indicator */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Profile Completeness</span>
                  <span className="text-xs font-bold text-[#2F4F97]">{filledFields}/{totalFields}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2F4F97] to-[#4A6FC7] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(filledFields / totalFields) * 100}%` }}
                  />
                </div>
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "Personal Info", done: !!(form.first_name && form.last_name && form.email && isValidEmail(form.email)) },
                    { label: "Passport", done: !!form.passport_number },
                    { label: "Education", done: !!form.education_level },
                    { label: "Language Test", done: !!form.language_test_name },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${item.done ? "text-emerald-500" : "text-gray-200"}`} />
                      <span className={`text-[11px] ${item.done ? "text-gray-700" : "text-gray-400"}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

        </div>

      </div>
    </div>
  );
}
