import { useState } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, GraduationCap, Trophy, CheckCircle, MapPin, BookOpen, FileText, Globe2, Building2, Check, Search, RotateCcw, Briefcase, Cog, Monitor, HeartPulse, Palette, Microscope, Scale, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { generateSlug } from "@/lib/utils";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";
import { UNIVERSITY_LOGOS, FIELD_KEYWORDS } from "./Universities";

const fieldOptions = [
  { id: "Business & Management", label: "Business & Management", icon: Briefcase, desc: "Finance, Marketing, MBA" },
  { id: "Engineering & Technology", label: "Engineering & Technology", icon: Cog, desc: "Mechanical, Civil, Tech" },
  { id: "Computer Science & IT", label: "Computer Science & IT", icon: Monitor, desc: "Software, Data, AI" },
  { id: "Medicine & Health Sciences", label: "Medicine & Health Sciences", icon: HeartPulse, desc: "Clinical, Nursing, Pharma" },
  { id: "Arts, Design & Media", label: "Arts, Design & Media", icon: Palette, desc: "Design, Media, Music" },
  { id: "Science & Mathematics", label: "Science & Mathematics", icon: Microscope, desc: "Physics, Biology, Math" },
  { id: "Law & Humanities", label: "Law & Humanities", icon: Scale, desc: "Law, Psychology, Arts" }
];
const programLevels = [
  { id: "Diploma", label: "Diploma / Foundation", icon: FileText, desc: "Start your academic journey" },
  { id: "Bachelor", label: "Bachelor's Degree", icon: GraduationCap, desc: "Undergraduate programs" },
  { id: "Master", label: "Master's Degree", icon: BookOpen, desc: "Postgraduate studies" },
  { id: "PhD", label: "PhD / Doctorate", icon: Trophy, desc: "Highest academic level" }
];

const englishTests = [
  { id: "IELTS", label: "IELTS", badge: "IELTS", color: "bg-[#E31837]" },
  { id: "TOEFL", label: "TOEFL iBT", badge: "TOEFL", color: "bg-[#002B5C]" },
  { id: "PTE", label: "PTE Academic", badge: "PTE", color: "bg-[#00A3A1]" },
  { id: "Duolingo", label: "Duolingo", badge: "DET", color: "bg-[#58CC02]" },
  { id: "Cambridge", label: "Cambridge English", badge: "CAM", color: "bg-[#F15A22]" },
  { id: "Linguaskill", label: "Linguaskill", badge: "LIN", color: "bg-[#800080]" },
  { id: "OET", label: "OET", badge: "OET", color: "bg-[#00529F]" },
  { id: "MUET", label: "MUET", badge: "MUET", color: "bg-[#2F4F97]" },
  { id: "None", label: "No Test / Plan to take", icon: FileText },
];

const getTestScores = (test: string) => {
  switch (test) {
    case "IELTS": return ["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];
    case "TOEFL": return ["60-70", "71-80", "81-90", "91-100", "101-110", "111-120"];
    case "PTE": return ["40-50", "51-60", "61-70", "71-80", "81-90"];
    case "Duolingo": return ["80-90", "95-105", "110-120", "125-135", "140-160"];
    case "Cambridge": return ["160-169 (B2)", "170-179 (B2)", "180-199 (C1)", "200-230 (C2)"];
    case "Linguaskill": return ["140-159 (B1)", "160-179 (B2)", "180+ (C1 or above)"];
    case "OET": return ["C (200-290)", "C+ (300-340)", "B (350-440)", "A (450-500)"];
    case "MUET": return ["Band 3.0", "Band 3.5", "Band 4.0", "Band 4.5", "Band 5.0", "Band 5.5+"];
    default: return [];
  }
};

const getBudgetRanges = (currency: string) => {
  if (currency === "USD") {
    return [
      { id: "tier1", label: "Economy", min: 0, max: 5000 },
      { id: "tier2", label: "Standard - Level 1", min: 5001, max: 10000 },
      { id: "tier3", label: "Standard - Level 2", min: 10001, max: 15000 },
      { id: "tier4", label: "Comfortable - Level 1", min: 15001, max: 20000 },
      { id: "tier5", label: "Comfortable - Level 2", min: 20001, max: 30000 },
      { id: "tier6", label: "Premium - Level 1", min: 30001, max: 50000 },
      { id: "tier7", label: "Premium - Level 2", min: 50001, max: 80000 },
      { id: "tier8", label: "No Limit", min: 80001, max: 999999 },
    ];
  }
  if (currency === "BDT") {
    return [
      { id: "tier1", label: "Economy", min: 0, max: 400000 },
      { id: "tier2", label: "Standard - Level 1", min: 400001, max: 600000 },
      { id: "tier3", label: "Standard - Level 2", min: 600001, max: 800000 },
      { id: "tier4", label: "Comfortable - Level 1", min: 800001, max: 1200000 },
      { id: "tier5", label: "Comfortable - Level 2", min: 1200001, max: 1500000 },
      { id: "tier6", label: "Premium - Level 1", min: 1500001, max: 2000000 },
      { id: "tier7", label: "Premium - Level 2", min: 2000001, max: 3000000 },
      { id: "tier8", label: "No Limit", min: 3000001, max: 99999999 },
    ];
  }
  // Default MYR
  return [
    { id: "tier1", label: "Economy", min: 0, max: 15000 },
    { id: "tier2", label: "Standard - Level 1", min: 15001, max: 20000 },
    { id: "tier3", label: "Standard - Level 2", min: 20001, max: 25000 },
    { id: "tier4", label: "Comfortable - Level 1", min: 25001, max: 35000 },
    { id: "tier5", label: "Comfortable - Level 2", min: 35001, max: 50000 },
    { id: "tier6", label: "Premium - Level 1", min: 50001, max: 80000 },
    { id: "tier7", label: "Premium - Level 2", min: 80001, max: 120000 },
    { id: "tier8", label: "No Limit", min: 120001, max: 999999 },
  ];
};

interface WizardData {
  intendedLevel: string;
  fieldOfInterest: string;
  gpaType: "CGPA" | "Percentage";
  gpa: string;
  englishTest: string;
  englishScore: string;
  budgetTier: string;
}

function getChance(gpa: number, score: number, uniRanking: number): "High" | "Medium" | "Low" {
  // Mock logic
  const combined = gpa * 10 + score * 5 - uniRanking * 0.05;
  if (combined > 90) return "High";
  if (combined > 60) return "Medium";
  return "Low";
}

const chanceColors = {
  High: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-red-100 text-red-700 border-red-200",
};

export default function EligibilityWizard() {
  const { data: universities = [] } = useTableData("universities");
  const { data: courses = [] } = useTableData("courses");
  const [step, setStep] = useState(1);
  const [expandedUniId, setExpandedUniId] = useState<string | null>(null);
  const { formatCurrency, currency, rates } = useCurrency();
  const [data, setData] = useState<WizardData>({
    intendedLevel: "",
    fieldOfInterest: "",
    gpaType: "CGPA",
    gpa: "",
    englishTest: "",
    englishScore: "",
    budgetTier: "",
  });
  
  const totalSteps = 5;

  const canNext = () => {
    if (step === 1) return !!data.intendedLevel;
    if (step === 2) return !!data.fieldOfInterest;
    if (step === 3) return !!data.gpa && Number(data.gpa) > 0;
    if (step === 4) {
      if (!data.englishTest) return false;
      if (data.englishTest !== "None" && !data.englishScore) return false;
      return true;
    }
    if (step === 5) return !!data.budgetTier;
    return true;
  };

  const handleNext = () => {
    if (canNext() && step <= totalSteps) {
      if (step === totalSteps) {
        const res = filteredResults();
        if (res.length > 0 && !expandedUniId) {
          setExpandedUniId(res[0].uni.id);
        }
      }
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredResults = () => {
    const currentRanges = getBudgetRanges(currency);
    const selectedTier = currentRanges.find(b => b.id === data.budgetTier) || currentRanges[2];
    let normalizedGpa = parseFloat(data.gpa) || 0;
    if (data.gpaType === "Percentage") {
      normalizedGpa = (normalizedGpa / 100) * 4.0; // Rough conversion
    }
    
    // Convert english score to mock numerical value
    let score = 0;
    if (data.englishTest === "IELTS") score = parseFloat(data.englishScore) || 0;
    else if (data.englishTest === "None") score = 5.0; // Assume minimum acceptable
    else score = 6.0; // Rough median

    const matchedCourses = courses.filter((c: any) => {
      if (!c.degree_level.includes(data.intendedLevel)) return false;
      
      const feeInMYR = typeof c.tuition_fee === 'string' 
        ? parseFloat(c.tuition_fee.replace(/[^0-9.]/g, "")) 
        : (Number(c.tuition_fee) || 0);

      if (feeInMYR <= 0) return false; // Filter out zero/null fees
      
      const rate = rates[currency] || 1;
      const feeInSelectedCurrency = feeInMYR * rate;

      if (feeInSelectedCurrency > selectedTier.max) return false;

      if (data.fieldOfInterest) {
        const keywords = FIELD_KEYWORDS[data.fieldOfInterest];
        if (keywords) {
          const title = c.title?.toLowerCase() || "";
          if (!keywords.some(kw => title.includes(kw))) return false;
        }
      }
      return true;
    });

    const uniIds = [...new Set(matchedCourses.map((c) => c.university_id))];
    return uniIds
      .map((uid) => {
        const uni = universities.find((u: any) => u.id === uid);
        if (!uni) return null;
        const uniCourses = matchedCourses.filter((c: any) => c.university_id === uid);
        const chance = getChance(normalizedGpa, score, uni.ranking || 0);
        return { uni, courses: uniCourses, chance };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        return order[a.chance] - order[b.chance];
      });
  };

  const showResults = step === 6;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <MegaMenu hideBreadcrumbs />
      
      {/* Page Header */}
      {/* Page Header */}
      <div className="relative overflow-hidden bg-[#1E293B]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80" 
            alt="AI-Powered Engine" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#1E293B]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="relative z-20">
          <GlobalBreadcrumbs theme="transparent" />
        </div>
        
        <div className="relative z-10 w-full mx-auto px-4 py-12 md:py-24 max-w-5xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-4 md:mb-5 backdrop-blur-md">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              AI-Powered Engine
            </div>
            <h1 className="text-2xl md:text-[42px] font-extrabold text-white tracking-tight mb-3 md:mb-4 leading-[1.2] md:leading-[1.1]">
              Find Your Perfect University Match
            </h1>
            <p className="text-gray-200/90 text-xs md:text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
              Answer 4 simple questions and let our algorithm instantly curate the best universities and programs for your specific profile and budget.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="w-full mx-auto px-4 py-12 max-w-5xl">
          {/* Progress Indicator */}
          {!showResults && (
            <div className="mb-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200 z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#2F4F97] z-0 transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
                
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                    s === step ? "bg-[#2F4F97] text-white ring-4 ring-[#2F4F97]/20" : 
                    s < step ? "bg-[#2F4F97] text-white" : 
                    "bg-white border-2 border-gray-200 text-gray-400"
                  }`}>
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-[#64748B] uppercase tracking-wider">Step {step} of {totalSteps}</p>
            </div>
          )}

          <div className={showResults ? "hidden" : "bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-10 transition-all duration-300"}>
            {/* STEP 1: Intended Program */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-2">Intended Program Level</h2>
                <p className="text-[12px] md:text-base text-[#64748B] mb-6 md:mb-8">What level of study are you applying for?</p>
                
                <div className="grid sm:grid-cols-2 gap-2.5 md:gap-4">
                  {programLevels.map((level) => (
                    <div 
                      key={level.id}
                      onClick={() => { setData({ ...data, intendedLevel: level.id }); setTimeout(handleNext, 300); }}
                      className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 p-3.5 md:p-5 transition-all duration-200 ${
                        data.intendedLevel === level.id ? "border-[#2F4F97] bg-[#F8FAFC]" : "border-gray-100 hover:border-[#2F4F97]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${data.intendedLevel === level.id ? "bg-[#2F4F97] text-white" : "bg-[#2F4F97]/10 text-[#2F4F97]"}`}>
                          <level.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="pt-0.5 md:pt-1.5">
                          <h3 className={`font-semibold text-[14px] md:text-[20px] mb-0.5 md:mb-1 ${data.intendedLevel === level.id ? "text-[#1E293B]" : "text-[#1E293B]"}`}>{level.label}</h3>
                          <p className="text-[10px] md:text-xs text-gray-500 leading-snug">{level.desc}</p>
                        </div>
                      </div>
                      {data.intendedLevel === level.id && (
                        <div className="absolute top-3 md:top-4 right-3 md:right-4 text-[#2F4F97]">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 fill-current text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Field of Interest */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-2">Field of Interest</h2>
                <p className="text-[12px] md:text-base text-[#64748B] mb-6 md:mb-8">Which field or area are you willing to apply to?</p>
                
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
                  {fieldOptions.map((field) => (
                    <div 
                      key={field.id}
                      onClick={() => { setData({ ...data, fieldOfInterest: field.id }); setTimeout(handleNext, 300); }}
                      className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 p-3.5 md:p-5 transition-all duration-200 ${
                        data.fieldOfInterest === field.id ? "border-[#2F4F97] bg-[#F8FAFC]" : "border-gray-100 hover:border-[#2F4F97]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${data.fieldOfInterest === field.id ? "bg-[#2F4F97] text-white" : "bg-[#2F4F97]/10 text-[#2F4F97]"}`}>
                          <field.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="pt-0.5 md:pt-1.5">
                          <h3 className={`font-semibold text-[14px] md:text-[18px] mb-0.5 md:mb-1 ${data.fieldOfInterest === field.id ? "text-[#1E293B]" : "text-[#1E293B]"}`}>{field.label}</h3>
                          <p className="text-[10px] md:text-xs text-gray-500 leading-snug">{field.desc}</p>
                        </div>
                      </div>
                      {data.fieldOfInterest === field.id && (
                        <div className="absolute top-3 md:top-4 right-3 md:right-4 text-[#2F4F97]">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 fill-current text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Academic Performance */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-2">Academic Performance</h2>
                <p className="text-[12px] md:text-base text-[#64748B] mb-6 md:mb-8">Enter your latest CGPA or Percentage to help us gauge your admission chances.</p>
                
                <div className="space-y-6 max-w-md mx-auto">
                  <div>
                    <Label className="text-[12px] md:text-sm font-semibold text-gray-700 mb-2 block">Grading System</Label>
                    <Select value={data.gpaType} onValueChange={(v: "CGPA" | "Percentage") => setData({ ...data, gpaType: v, gpa: "" })}>
                      <SelectTrigger className="h-10 md:h-12 rounded-xl text-sm md:text-base">
                        <SelectValue placeholder="Select grading system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CGPA">CGPA (e.g. out of 4.0 or 5.0)</SelectItem>
                        <SelectItem value="Percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[12px] md:text-sm font-semibold text-gray-700 mb-2 block">
                      {data.gpaType === "CGPA" ? "Enter your CGPA" : "Enter your Percentage"}
                    </Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max={data.gpaType === "Percentage" ? "100" : "10"} 
                        placeholder={data.gpaType === "CGPA" ? "e.g. 3.5" : "e.g. 85"} 
                        value={data.gpa} 
                        onChange={(e) => setData({ ...data, gpa: e.target.value })} 
                        className="h-12 md:h-14 rounded-xl text-base md:text-lg pl-4 pr-12 focus-visible:ring-[#2F4F97]" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        {data.gpaType === "Percentage" && "%"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: English Proficiency */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-2">English Proficiency</h2>
                <p className="text-[12px] md:text-base text-[#64748B] mb-6 md:mb-8">Have you taken an English language test?</p>
                
                <div className="space-y-6 max-w-md mx-auto">
                  <div>
                    <Label className="text-[12px] md:text-sm font-semibold text-gray-700 mb-2 block">Test Type</Label>
                    <Select value={data.englishTest} onValueChange={(v) => setData({ ...data, englishTest: v, englishScore: "" })}>
                      <SelectTrigger className="h-12 md:h-14 rounded-xl text-sm md:text-base">
                        <SelectValue placeholder="Select an English test" />
                      </SelectTrigger>
                      <SelectContent>
                        {englishTests.map((test) => (
                          <SelectItem key={test.id} value={test.id}>
                            <div className="flex items-center">
                              {test.logo ? (
                                <img src={test.logo} alt={test.id} className="w-8 h-4 object-contain mr-2.5 bg-white rounded-[2px]" />
                              ) : test.badge ? (
                                <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-[2px] mr-2.5 ${test.color}`}>{test.badge}</span>
                              ) : test.icon ? (
                                <test.icon className="w-4 h-4 mr-2.5 text-gray-400" />
                              ) : null}
                              {test.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {data.englishTest && data.englishTest !== "None" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-[12px] md:text-sm font-semibold text-gray-700 mb-2 block">
                        Select your {data.englishTest} Score
                      </Label>
                      <Select value={data.englishScore} onValueChange={(v) => setData({ ...data, englishScore: v })}>
                        <SelectTrigger className="h-12 md:h-14 rounded-xl text-sm md:text-base font-semibold text-[#1E293B]">
                          <SelectValue placeholder="Select score range" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {getTestScores(data.englishTest).map(score => (
                            <SelectItem key={score} value={score}>{score}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Budget */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-2">Tuition Fee Budget</h2>
                <p className="text-[12px] md:text-base text-[#64748B] mb-6 md:mb-8">Select your estimated yearly budget for tuition fees.</p>
                
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <Label className="text-[12px] md:text-sm font-semibold text-gray-700 mb-2 block">Yearly Budget Range</Label>
                    <Select value={data.budgetTier} onValueChange={(v) => setData({ ...data, budgetTier: v })}>
                      <SelectTrigger className="h-12 md:h-14 rounded-xl text-sm md:text-base font-semibold">
                        <SelectValue placeholder="Select your budget tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 shadow-xl rounded-2xl max-h-[300px]">
                        {getBudgetRanges(currency).map((tier) => {
                          const formatRangeVal = (val: number) => {
                            const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
                            const formatted = formatter.format(val);
                            if (currency === "USD") return `$ ${formatted}`;
                            if (currency === "BDT") return `BDT ${formatted}`;
                            return `MYR ${formatted}`;
                          };

                          return (
                            <SelectItem key={tier.id} value={tier.id} className="py-3 cursor-pointer group">
                              <span className="font-bold text-[#1E293B] group-data-[highlighted]:text-white transition-colors">
                                {tier.max >= 999999 ? 
                                  `Above ${formatRangeVal(tier.min)}` : 
                                  `${formatRangeVal(tier.min)} - ${formatRangeVal(tier.max)}`} / Year
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                    <p>Your budget is intelligently converted into local currency behind the scenes to accurately match you with university fees.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {!showResults && (
              <div className="flex justify-between mt-8 md:mt-12 pt-6 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  className={`h-10 md:h-12 px-4 md:px-6 text-sm md:text-base border-gray-200 text-[#64748B] hover:text-[#1E293B] rounded-xl bg-white transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
                  onClick={() => setStep(step - 1)} 
                  disabled={step === 1}
                >
                  <ArrowLeft className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Back</span>
                </Button>
                
                <Button 
                  onClick={handleNext} 
                  disabled={!canNext()} 
                  className="rounded-xl font-bold h-10 md:h-12 px-5 md:px-8 text-sm md:text-base transition-all shadow-sm hover:shadow-md"
                >
                  {step === totalSteps ? "Generate Matches" : "Next Step"} 
                  {step === totalSteps ? <Globe2 className="h-4 w-4 ml-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            )}
          </div>

          {/* RESULTS PAGE */}
          {showResults && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-[32px] font-semibold mb-4 text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif", lineHeight: 1.2 }}>Your Best Matches</h2>
                <p className="text-sm md:text-lg text-[#64748B]">We analyzed your profile and found the universities that fit you best.</p>
              </div>
              
              {filteredResults().length === 0 ? (
                <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No exact matches found</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Try adjusting your budget or academic criteria to see more options.</p>
                  <Button variant="outline" className="h-12 px-8 rounded-xl border-gray-300" onClick={() => { setStep(1); setData({ intendedLevel: "", gpaType: "CGPA", gpa: "", englishTest: "", englishScore: "", budgetTier: "" }); }}>
                    Adjust Criteria
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* User Input Summary */}
                  <div className="flex flex-wrap gap-2 md:gap-3 items-stretch mb-6 mt-2">
                    <div className="flex-1 min-w-[130px] flex flex-col justify-center px-3.5 py-2.5 rounded-xl border border-[#2F4F97]/10 bg-gradient-to-br from-[#2F4F97]/5 to-[#2F4F97]/[0.02] shadow-sm">
                      <span className="text-[10px] md:text-[11px] font-bold text-[#2F4F97] mb-0.5">Intended Degree Level</span>
                      <span className="font-semibold text-[#1E293B] text-[13px] leading-tight line-clamp-1">{programLevels.find(p => p.id === data.intendedLevel)?.label || data.intendedLevel}</span>
                    </div>

                    <div className="flex-1 min-w-[130px] flex flex-col justify-center px-3.5 py-2.5 rounded-xl border border-[#2F4F97]/10 bg-gradient-to-br from-[#2F4F97]/5 to-[#2F4F97]/[0.02] shadow-sm">
                      <span className="text-[10px] md:text-[11px] font-bold text-[#2F4F97] mb-0.5">Field of Interest</span>
                      <span className="font-semibold text-[#1E293B] text-[13px] leading-tight line-clamp-1">{fieldOptions.find(f => f.id === data.fieldOfInterest)?.label || data.fieldOfInterest}</span>
                    </div>

                    <div className="flex-1 min-w-[130px] flex flex-col justify-center px-3.5 py-2.5 rounded-xl border border-[#2F4F97]/10 bg-gradient-to-br from-[#2F4F97]/5 to-[#2F4F97]/[0.02] shadow-sm">
                      <span className="text-[10px] md:text-[11px] font-bold text-[#2F4F97] mb-0.5">
                        {data.gpaType === 'Percentage' ? 'Percent' : 'CGPA'}
                      </span>
                      <span className="font-semibold text-[#1E293B] text-[13px] leading-tight">{data.gpa}{data.gpaType === 'Percentage' ? '%' : ''}</span>
                    </div>

                    {data.englishTest && (
                      <div className="flex-1 min-w-[130px] flex flex-col justify-center px-3.5 py-2.5 rounded-xl border border-[#2F4F97]/10 bg-gradient-to-br from-[#2F4F97]/5 to-[#2F4F97]/[0.02] shadow-sm">
                        <span className="text-[10px] md:text-[11px] font-bold text-[#2F4F97] mb-0.5">Language Qualification</span>
                        <span className="font-semibold text-[#1E293B] text-[13px] leading-tight">
                          {data.englishTest === "None" ? "No Test" : `${data.englishTest} (${data.englishScore})`}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-[140px] flex flex-col justify-center px-3.5 py-2.5 rounded-xl border border-[#2F4F97]/10 bg-gradient-to-br from-[#2F4F97]/5 to-[#2F4F97]/[0.02] shadow-sm">
                      <span className="text-[10px] md:text-[11px] font-bold text-[#2F4F97] mb-0.5">Budget/Yr</span>
                      <span className="font-semibold text-[#1E293B] text-[13px] leading-tight whitespace-nowrap">
                        {(() => {
                          const currentRanges = getBudgetRanges(currency);
                          const b = currentRanges.find(b => b.id === data.budgetTier);
                          if (!b) return "";
                          
                          const formatRangeVal = (val: number) => {
                            const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
                            const formatted = formatter.format(val);
                            if (currency === "USD") return `$ ${formatted}`;
                            if (currency === "BDT") return `BDT ${formatted}`;
                            return `MYR ${formatted}`;
                          };
                          
                          return b.max >= 999999 ? `> ${formatRangeVal(b.min)}` : `${formatRangeVal(b.min)} - ${formatRangeVal(b.max)}`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[13px] md:text-sm font-medium text-gray-500 pb-3 border-b border-gray-200 leading-relaxed">
                    Found <span className="text-[#2F4F97] font-bold mx-1">{filteredResults().length}</span> Universities and <span className="text-[#2F4F97] font-bold mx-1">{filteredResults().reduce((acc, curr) => acc + curr.courses.length, 0)}</span> Courses matching your profile
                  </div>
                  {filteredResults().map(({ uni, courses: matchedCourses, chance }) => {
                    const isExpanded = expandedUniId === uni.id;
                    return (
                      <div key={uni.id} className="bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-300 overflow-hidden">
                        {/* ACCORDION HEADER */}
                        <div 
                          className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none bg-white hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedUniId(isExpanded ? null : uni.id)}
                        >
                          <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 rounded-xl p-2 bg-[#F8FAFC]">
                              {uni.logo_url || UNIVERSITY_LOGOS[uni.name] ? (
                                <img
                                  src={uni.logo_url || UNIVERSITY_LOGOS[uni.name]}
                                  alt={uni.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <Building2 className="h-6 w-6 text-gray-300" />
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-[15px] md:text-lg text-[#1E293B] leading-tight mb-1 line-clamp-1">
                                {uni.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-[12px] md:text-sm text-gray-600">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#2F4F97]" />
                                <span className="font-medium line-clamp-1">{uni.city}, Malaysia</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        
                        {/* ACCORDION CONTENT */}
                        {isExpanded && (
                          <div className="p-4 md:p-5 border-t border-gray-100 bg-[#F8FAFC]/50 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[12px] md:text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Matching Programs ({matchedCourses.length})
                              </h4>
                            </div>
                            
                            <div className="space-y-2.5 mb-5">
                              {matchedCourses.map((c: any) => (
                                <Link 
                                  key={c.id} 
                                  to={`/courses/${generateSlug(c.title)}`}
                                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-white border border-gray-200 hover:border-[#2F4F97]/30 hover:shadow-sm transition-all block"
                                >
                                  <div className="flex-1 pr-4">
                                    <h5 className="font-semibold text-[#1E293B] text-[13px] md:text-sm group-hover:text-[#2F4F97] transition-colors line-clamp-1">{c.title}</h5>
                                    <p className="text-[11px] md:text-xs text-gray-500 mt-1">{c.degree_level}</p>
                                  </div>
                                  <div className="text-left sm:text-right shrink-0">
                                    <div className="font-bold text-[#2F4F97] text-[13px] md:text-sm">{formatCurrency(c.tuition_fee)}</div>
                                    <div className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-wide">PER YEAR</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="text-center pt-8">
                    <Button variant="ghost" className="text-[#64748B] hover:text-[#1E293B] font-medium" onClick={() => { setStep(1); setData({ intendedLevel: "", gpaType: "GPA", gpa: "", englishTest: "", englishScore: "", budgetTier: "" }); }}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Start New Assessment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
