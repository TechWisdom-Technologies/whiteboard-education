import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Loader2, GraduationCap, Globe, BookOpen, Languages, User, Mail, Phone, Calendar, CreditCard, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

// ─── Language Tests (from EligibilityWizard) ───────────────
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

const getScoreRange = (test: string): { min: number; max: number; step: number } => {
  switch (test) {
    case "IELTS": return { min: 0, max: 9, step: 0.5 };
    case "TOEFL": return { min: 0, max: 120, step: 1 };
    case "PTE": return { min: 10, max: 90, step: 1 };
    case "Duolingo": return { min: 10, max: 160, step: 5 };
    case "Cambridge": return { min: 100, max: 230, step: 1 };
    case "Linguaskill": return { min: 82, max: 180, step: 1 };
    case "OET": return { min: 0, max: 500, step: 10 };
    case "MUET": return { min: 0, max: 800, step: 1 };
    default: return { min: 0, max: 9, step: 0.5 };
  }
};

// ─── Initial Form State ────────────────────────────────────
const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "",
  nationality: "Bangladeshi",
  passport_number: "",
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
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // ─── Derived State ─────────────────────────────────────
  const isSSCOrHSC = form.education_level === "SSC" || form.education_level === "HSC";
  const isDiplomaOrAbove = ["Diploma", "Bachelors", "Masters"].includes(form.education_level);
  const streamEnabled = isSSCOrHSC;
  const programEnabled = isDiplomaOrAbove;
  const majorEnabled = programEnabled;
  const isMOI = form.language_test_name === "MOI";
  const gpaLabel = isSSCOrHSC ? "GPA" : "CGPA";
  const gpaMax = isSSCOrHSC ? 5.0 : 4.0;

  // Count filled fields for completeness
  const filledFields = [
    form.first_name, form.last_name, form.email, form.phone,
    form.gender, form.nationality, form.passport_number, form.date_of_birth,
    form.education_level, form.previous_institution, form.gpa,
    form.language_test_name,
  ].filter(Boolean).length;
  const totalFields = 12;

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.passport_number) {
      toast.error("First Name, Last Name, Email and Passport Number are required");
      return;
    }
    setSubmitting(true);
    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();
      const previousDegree = form.education_level || "";
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
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          nationality: form.nationality,
          passport_number: form.passport_number,
          date_of_birth: form.date_of_birth || null,
          previous_degree: previousDegree,
          previous_institution: form.previous_institution,
          major: form.major,
          gpa: form.gpa ? parseFloat(form.gpa) : 0,
          language_test_name: form.language_test_name,
          ielts_score: form.ielts_score ? parseFloat(form.ielts_score) : 0,
          degree_level: form.education_level === "Bachelors" ? "Bachelor" : form.education_level === "Masters" ? "Master" : form.education_level,
          partner_id: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save");
      const newStudent = data[0];
      toast.success("Student registered successfully!");
      navigate(`/partner-dashboard/students/${newStudent.wb_student_id ? `WB-${newStudent.wb_student_id}` : newStudent.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add student");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/partner-dashboard/students")}
          className="h-8 w-8 rounded-full bg-[#2F4F97]/10 hover:bg-[#2F4F97]/20 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold text-[#1E293B]">
          Register New Student
        </h2>
      </div>

      {/* Main Layout: Form (2/3) + Live Preview (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">First Name <span className="text-red-500">*</span></Label>
                    <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Last Name <span className="text-red-500">*</span></Label>
                    <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Email <span className="text-red-500">*</span></Label>
                    <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+880..." className="h-9 mt-1" />
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
                    <Input value={form.passport_number} onChange={e => setForm(f => ({ ...f, passport_number: e.target.value }))} placeholder="Passport number" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Date of Birth</Label>
                    <Input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} className="h-9 mt-1" />
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
                    <Label className={`text-xs ${!streamEnabled ? "text-gray-300" : ""}`}>Stream</Label>
                    <Select value={form.stream} onValueChange={v => setForm(f => ({ ...f, stream: v }))} disabled={!streamEnabled}>
                      <SelectTrigger className={`h-9 mt-1 ${!streamEnabled ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder={streamEnabled ? "Select stream" : "N/A"} /></SelectTrigger>
                      <SelectContent>
                        {streams.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={`text-xs ${!programEnabled ? "text-gray-300" : ""}`}>Program</Label>
                    <Input
                      value={form.program}
                      onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                      placeholder={programEnabled ? "e.g. Computer Science" : "N/A"}
                      className={`h-9 mt-1 ${!programEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!programEnabled}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs ${!majorEnabled ? "text-gray-300" : ""}`}>Major</Label>
                    <Input
                      value={form.major}
                      onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                      placeholder={majorEnabled ? "e.g. Software Engineering" : "N/A"}
                      className={`h-9 mt-1 ${!majorEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!majorEnabled}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Institution</Label>
                    <Input value={form.previous_institution} onChange={e => setForm(f => ({ ...f, previous_institution: e.target.value }))} placeholder="Institution name" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">{gpaLabel} {form.education_level && <span className="text-gray-400 font-normal">(0.00 – {gpaMax.toFixed(2)})</span>}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={gpaMax}
                      value={form.gpa}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= gpaMax)) {
                          setForm(f => ({ ...f, gpa: val }));
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
                    <Select value={form.language_test_name} onValueChange={v => setForm(f => ({ ...f, language_test_name: v, ielts_score: v === "MOI" ? "" : f.ielts_score }))}>
                      <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select test" /></SelectTrigger>
                      <SelectContent>
                        {languageTests.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={`text-xs ${isMOI || !form.language_test_name ? "text-gray-300" : ""}`}>
                      Score {form.language_test_name && !isMOI && (() => {
                        const range = getScoreRange(form.language_test_name);
                        return <span className="text-gray-400 font-normal">({range.min} – {range.max})</span>;
                      })()}
                    </Label>
                    <Input
                      type="number"
                      step={form.language_test_name ? getScoreRange(form.language_test_name).step : 0.5}
                      min={form.language_test_name ? getScoreRange(form.language_test_name).min : 0}
                      max={form.language_test_name ? getScoreRange(form.language_test_name).max : 9}
                      value={form.ielts_score}
                      onChange={e => setForm(f => ({ ...f, ielts_score: e.target.value }))}
                      placeholder={isMOI ? "N/A" : "Score"}
                      className={`h-9 mt-1 ${isMOI || !form.language_test_name ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isMOI || !form.language_test_name}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Action Buttons ── */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => navigate("/partner-dashboard/students")} className="h-10 px-6">
                  Cancel
                </Button>
                <Button className="h-10 px-6" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Save Student
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* ═══════════════ RIGHT: LIVE PREVIEW ═══════════════ */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">

            {/* Live Profile Card */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              {/* Header gradient */}
              <div className="h-20 bg-gradient-to-br from-[#2F4F97] to-[#1E3A6F] relative">
                <div className="absolute -bottom-8 left-5">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-lg border-2 border-white flex items-center justify-center">
                    {form.first_name ? (
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
                  {form.date_of_birth && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{new Date(form.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
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
                        <span className="text-xs italic text-gray-400">No score required</span>
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
                    { label: "Personal Info", done: !!(form.first_name && form.last_name && form.email) },
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
    </div>
  );
}
