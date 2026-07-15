import { useState } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { universities, courses } from "@/data/mockData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, GraduationCap, Trophy, CheckCircle, MapPin, BookOpen, FileText, Globe2, Building2, Check, Search, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { generateSlug } from "@/lib/utils";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";

// Constants
const programLevels = [
  { id: "Diploma", label: "Diploma / Foundation", icon: FileText, desc: "Start your academic journey" },
  { id: "Bachelor", label: "Bachelor's Degree", icon: GraduationCap, desc: "Undergraduate programs" },
  { id: "Master", label: "Master's Degree", icon: BookOpen, desc: "Postgraduate studies" },
  { id: "PhD", label: "PhD / Doctorate", icon: Trophy, desc: "Highest academic level" }
];

const englishTests = [
  { id: "IELTS", label: "IELTS" },
  { id: "TOEFL", label: "TOEFL iBT" },
  { id: "PTE", label: "PTE Academic" },
  { id: "Duolingo", label: "Duolingo" },
  { id: "Cambridge", label: "Cambridge English (C1/C2)" },
  { id: "OET", label: "OET" },
  { id: "MUET", label: "MUET" },
  { id: "None", label: "No Test / Plan to take" },
];

const getTestScores = (test: string) => {
  switch (test) {
    case "IELTS": return ["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];
    case "TOEFL": return ["60-70", "71-80", "81-90", "91-100", "101-110", "111-120"];
    case "PTE": return ["40-50", "51-60", "61-70", "71-80", "81-90"];
    case "Duolingo": return ["80-90", "95-105", "110-120", "125-135", "140-160"];
    case "Cambridge": return ["160-169 (B2)", "170-179 (B2)", "180-199 (C1)", "200-230 (C2)"];
    case "OET": return ["C (200-290)", "C+ (300-340)", "B (350-440)", "A (450-500)"];
    case "MUET": return ["Band 3.0", "Band 3.5", "Band 4.0", "Band 4.5", "Band 5.0", "Band 5.5+"];
    default: return [];
  }
};

const budgetRanges = [
  { id: "tier1", label: "Economy", min: 0, max: 15000 },
  { id: "tier2", label: "Standard - Level 1", min: 15001, max: 20000 },
  { id: "tier3", label: "Standard - Level 2", min: 20001, max: 25000 },
  { id: "tier4", label: "Comfortable - Level 1", min: 25001, max: 35000 },
  { id: "tier5", label: "Comfortable - Level 2", min: 35001, max: 50000 },
  { id: "tier6", label: "Premium - Level 1", min: 50001, max: 80000 },
  { id: "tier7", label: "Premium - Level 2", min: 80001, max: 120000 },
  { id: "tier8", label: "No Limit", min: 120001, max: 999999 },
];

interface WizardData {
  intendedLevel: string;
  gpaType: "GPA" | "Percentage";
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
  const [step, setStep] = useState(1);
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<WizardData>({
    intendedLevel: "",
    gpaType: "GPA",
    gpa: "",
    englishTest: "",
    englishScore: "",
    budgetTier: "",
  });
  
  const totalSteps = 4;

  const canNext = () => {
    if (step === 1) return !!data.intendedLevel;
    if (step === 2) return !!data.gpa && Number(data.gpa) > 0;
    if (step === 3) {
      if (!data.englishTest) return false;
      if (data.englishTest !== "None" && !data.englishScore) return false;
      return true;
    }
    if (step === 4) return !!data.budgetTier;
    return true;
  };

  const handleNext = () => {
    if (canNext() && step <= totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredResults = () => {
    const selectedTier = budgetRanges.find(b => b.id === data.budgetTier) || budgetRanges[2];
    let normalizedGpa = parseFloat(data.gpa) || 0;
    if (data.gpaType === "Percentage") {
      normalizedGpa = (normalizedGpa / 100) * 4.0; // Rough conversion
    }
    
    // Convert english score to mock numerical value
    let score = 0;
    if (data.englishTest === "IELTS") score = parseFloat(data.englishScore) || 0;
    else if (data.englishTest === "None") score = 5.0; // Assume minimum acceptable
    else score = 6.0; // Rough median

    const matchedCourses = courses.filter((c) => 
      c.degree_level.includes(data.intendedLevel) && 
      c.tuition_fee >= selectedTier.min && 
      c.tuition_fee <= selectedTier.max
    );

    const uniIds = [...new Set(matchedCourses.map((c) => c.university_id))];
    return uniIds
      .map((uid) => {
        const uni = universities.find((u) => u.id === uid)!;
        const uniCourses = matchedCourses.filter((c) => c.university_id === uid);
        const chance = getChance(normalizedGpa, score, uni.ranking);
        return { uni, courses: uniCourses, chance };
      })
      .sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.chance] - order[b.chance];
      });
  };

  const showResults = step === 5;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <MegaMenu hideBreadcrumbs />
      
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#243B71] to-[#2F4F97] border-b border-[#2F4F97]/20 shadow-sm">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none"></div>
        
        <div className="relative z-20">
          <GlobalBreadcrumbs theme="transparent" />
        </div>
        
        <div className="relative z-10 w-full mx-auto px-4 py-12 md:py-16 max-w-4xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              AI-Powered Engine
            </div>
            <h1 className="text-2xl md:text-[32px] font-extrabold text-white tracking-tight mb-2 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Find Your Perfect University Match
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base max-w-lg mx-auto md:mx-0">
              Answer 4 simple questions and let our algorithm instantly curate the best universities and programs for your specific profile and budget.
            </p>
          </div>
          
          <div className="hidden md:flex shrink-0 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 items-center justify-center rotate-3 hover:rotate-6 transition-transform shadow-xl">
            <GraduationCap className="w-10 h-10 text-blue-100 drop-shadow-lg" />
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="w-full mx-auto px-4 py-12 max-w-4xl">
          {/* Progress Indicator */}
          {!showResults && (
            <div className="mb-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200 z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#2F4F97] z-0 transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
                
                {[1, 2, 3, 4].map((s) => (
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

          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-10 transition-all duration-300">
            {/* STEP 1: Intended Program */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Intended Program Level</h2>
                <p className="text-[#64748B] mb-8">What level of study are you applying for?</p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {programLevels.map((level) => (
                    <div 
                      key={level.id}
                      onClick={() => { setData({ ...data, intendedLevel: level.id }); setTimeout(handleNext, 300); }}
                      className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-200 ${
                        data.intendedLevel === level.id ? "border-[#2F4F97] bg-[#F8FAFC]" : "border-gray-100 hover:border-[#2F4F97]/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${data.intendedLevel === level.id ? "bg-[#2F4F97] text-white" : "bg-gray-100 text-gray-500 group-hover:text-[#2F4F97]"}`}>
                          <level.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-[20px] mb-1 ${data.intendedLevel === level.id ? "text-[#1E293B]" : "text-gray-700"}`}>{level.label}</h3>
                          <p className="text-xs text-gray-500">{level.desc}</p>
                        </div>
                      </div>
                      {data.intendedLevel === level.id && (
                        <div className="absolute top-4 right-4 text-[#2F4F97]">
                          <CheckCircle className="w-5 h-5 fill-current text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Academic Performance */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Academic Performance</h2>
                <p className="text-[#64748B] mb-8">Enter your latest GPA or Percentage to help us gauge your admission chances.</p>
                
                <div className="space-y-6 max-w-md mx-auto">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Grading System</Label>
                    <Select value={data.gpaType} onValueChange={(v: "GPA" | "Percentage") => setData({ ...data, gpaType: v, gpa: "" })}>
                      <SelectTrigger className="h-12 rounded-xl text-base">
                        <SelectValue placeholder="Select grading system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GPA">GPA (e.g. out of 4.0 or 5.0)</SelectItem>
                        <SelectItem value="Percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      {data.gpaType === "GPA" ? "Enter your GPA" : "Enter your Percentage"}
                    </Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max={data.gpaType === "Percentage" ? "100" : "10"} 
                        placeholder={data.gpaType === "GPA" ? "e.g. 3.5" : "e.g. 85"} 
                        value={data.gpa} 
                        onChange={(e) => setData({ ...data, gpa: e.target.value })} 
                        className="h-14 rounded-xl text-lg pl-4 pr-12 focus-visible:ring-[#2F4F97]" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        {data.gpaType === "Percentage" && "%"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: English Proficiency */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>English Proficiency</h2>
                <p className="text-[#64748B] mb-8">Have you taken an English language test?</p>
                
                <div className="space-y-6 max-w-md mx-auto">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Test Type</Label>
                    <Select value={data.englishTest} onValueChange={(v) => setData({ ...data, englishTest: v, englishScore: "" })}>
                      <SelectTrigger className="h-14 rounded-xl text-base">
                        <SelectValue placeholder="Select an English test" />
                      </SelectTrigger>
                      <SelectContent>
                        {englishTests.map((test) => (
                          <SelectItem key={test.id} value={test.id}>{test.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {data.englishTest && data.englishTest !== "None" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Select your {data.englishTest} Score
                      </Label>
                      <Select value={data.englishScore} onValueChange={(v) => setData({ ...data, englishScore: v })}>
                        <SelectTrigger className="h-14 rounded-xl text-base font-semibold text-[#1E293B]">
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

            {/* STEP 4: Budget */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Tuition Fee Budget</h2>
                <p className="text-[#64748B] mb-8">Select your estimated yearly budget for tuition fees.</p>
                
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Yearly Budget Range</Label>
                    <Select value={data.budgetTier} onValueChange={(v) => setData({ ...data, budgetTier: v })}>
                      <SelectTrigger className="h-14 rounded-xl text-base font-semibold">
                        <SelectValue placeholder="Select your budget tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id} className="py-3 cursor-pointer group">
                            <span className="font-bold text-[#1E293B] group-data-[highlighted]:text-white transition-colors">
                              {tier.max === 999999 ? 
                                `Above ${formatCurrency(tier.min)}` : 
                                `${formatCurrency(tier.min)} - ${formatCurrency(tier.max)}`} / Year
                            </span>
                          </SelectItem>
                        ))}
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
              <div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  className={`h-12 px-6 border-gray-200 text-[#64748B] hover:text-[#1E293B] rounded-xl bg-white transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
                  onClick={() => setStep(step - 1)} 
                  disabled={step === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                
                <Button 
                  onClick={handleNext} 
                  disabled={!canNext()} 
                  className="bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 rounded-xl font-bold h-12 px-8 transition-all shadow-sm hover:shadow-md"
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
                <h2 className="text-3xl md:text-[40px] font-extrabold mb-4 text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif", lineHeight: 1.2 }}>Your Best Matches</h2>
                <p className="text-[#64748B] text-lg">We analyzed your profile and found the universities that fit you best.</p>
              </div>
              
              {filteredResults().length === 0 ? (
                <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No exact matches found</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Try adjusting your budget or academic criteria to see more options.</p>
                  <Button variant="outline" className="h-12 px-8 rounded-xl border-gray-300" onClick={() => { setStep(1); setData({ intendedLevel: "", gpaType: "GPA", gpa: "", englishTest: "", englishScore: "", budgetTier: "" }); }}>
                    Adjust Criteria
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredResults().map(({ uni, courses: matchedCourses, chance }) => {
                    return (
                      <Card key={uni.id} className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-gray-100 rounded-[24px]">
                        <CardContent className="p-0 sm:flex">
                          {/* Uni Info Side */}
                          <div className="sm:w-1/3 bg-[#F8FAFC] border-r border-gray-100 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden p-2">
                                  <Building2 className="w-8 h-8 text-gray-300" />
                                </div>
                                <Badge variant="outline" className={`px-3 py-1 font-bold ${chanceColors[chance]}`}>
                                  {chance} Match
                                </Badge>
                              </div>
                              <Link to={`/universities/${generateSlug(uni.name)}`} className="block group">
                                <h3 className="font-bold text-xl text-[#1E293B] group-hover:text-[#2F4F97] transition-colors mb-2 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                                  {uni.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
                                <MapPin className="h-4 w-4" /> {uni.city}, Malaysia
                              </div>
                            </div>
                            <Button asChild className="w-full bg-white hover:bg-gray-50 text-[#2F4F97] border border-[#2F4F97]/20 shadow-sm rounded-xl">
                              <Link to={`/universities/${generateSlug(uni.name)}`}>View University</Link>
                            </Button>
                          </div>
                          
                          {/* Courses List Side */}
                          <div className="sm:w-2/3 p-6 flex flex-col">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Matching Programs ({matchedCourses.length})</h4>
                            <div className="space-y-3 flex-1">
                              {matchedCourses.slice(0, 3).map((c) => (
                                <div key={c.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-gray-100">
                                  <div className="flex-1 pr-4">
                                    <h5 className="font-semibold text-[#1E293B] text-sm group-hover:text-[#2F4F97] transition-colors line-clamp-1">{c.title}</h5>
                                    <p className="text-xs text-gray-500 mt-1">{c.degree_level}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-bold text-[#2F4F97] text-sm">{formatCurrency(c.tuition_fee)}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">PER YEAR</div>
                                  </div>
                                </div>
                              ))}
                              {matchedCourses.length > 3 && (
                                <div className="text-center pt-2">
                                  <span className="text-xs font-semibold text-gray-400">+ {matchedCourses.length - 3} more programs</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
