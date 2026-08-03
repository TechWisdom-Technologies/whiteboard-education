import { useState } from "react";
import { Link } from "react-router-dom";
import { generateSlug } from "@/lib/utils";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, GraduationCap, X, GitCompare, BookOpen, Calendar, DollarSign, Building2, Globe, Wallet, Languages, Info, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";
import { UNIVERSITY_LOGOS } from "./Universities";
import { UNIVERSITY_STATS } from "@/data/universityStats";

export default function Compare() {
  const { data: liveUniversities = [] } = useTableData("universities", { orderBy: "name" });
  const { data: liveCourses = [] } = useTableData("courses");
  const { currency, rates } = useCurrency();

  const [selected, setSelected] = useState<(string | null)[]>([null, null, null]);

  const setUni = (index: number, value: string) => {
    const next = [...selected];
    next[index] = value === "none" ? null : value;
    setSelected(next);
  };

  const clearSlot = (index: number) => {
    const next = [...selected];
    next[index] = null;
    setSelected(next);
  };

  const activeUnis = selected
    .map((id) => (id ? liveUniversities.find((u) => u.id === id) : null));

  const hasAny = activeUnis.some(Boolean);

  const getAverageTuition = (uniId: string) => {
    const uniCourses = liveCourses.filter(c => c.university_id === uniId);
    if (!uniCourses.length) return 0;
    const avg = uniCourses.reduce((sum, c) => sum + (c.tuition_fee || 0), 0) / uniCourses.length;
    return Math.round(avg * (rates[currency] || 1));
  };

  const getUniqueIntakes = (uniId: string) => {
    const uniCourses = liveCourses.filter(c => c.university_id === uniId);
    const intakes = new Set<string>();
    uniCourses.forEach(c => {
      if (Array.isArray(c.intake_months)) {
        c.intake_months.forEach((m: string) => intakes.add(m));
      }
    });
    return Array.from(intakes).slice(0, 4);
  };

  const getUniqueLevels = (uniId: string) => {
    const uniCourses = liveCourses.filter(c => c.university_id === uniId);
    const levels = new Set<string>();
    uniCourses.forEach(c => {
      if (c.degree_level) levels.add(c.degree_level);
    });
    return Array.from(levels);
  };

  const getUniqueStudyModes = (uniId: string) => {
    const uniCourses = liveCourses.filter(c => c.university_id === uniId);
    const modes = new Set<string>();
    uniCourses.forEach(c => {
      if (c.class_type) modes.add(c.class_type);
    });
    return Array.from(modes);
  };

  const getAverageDuration = (uniId: string) => {
    const uniCourses = liveCourses.filter(c => c.university_id === uniId);
    if (!uniCourses.length) return null;
    let totalYears = 0;
    let validCount = 0;
    uniCourses.forEach(c => {
      if (c.duration) {
        // e.g. "3 Years", "4 Years"
        const num = parseFloat(c.duration);
        if (!isNaN(num)) {
          totalYears += num;
          validCount++;
        }
      }
    });
    if (validCount === 0) return null;
    const avg = totalYears / validCount;
    return `${avg.toFixed(1)} Years Avg`;
  };



  const getAverageIelts = (uniId: string) => {
    const uniCourses = liveCourses.filter(c => c.university_id === uniId);
    let totalScore = 0;
    let validCount = 0;
    
    uniCourses.forEach(c => {
      const text = (c.entry_requirements_text || "") + " " + JSON.stringify(c.entry_requirements || "");
      const match = text.match(/IELTS.*?(\d[\.\d]*)/i);
      if (match && match[1]) {
        const score = parseFloat(match[1]);
        if (!isNaN(score) && score >= 4.0 && score <= 9.0) {
          totalScore += score;
          validCount++;
        }
      }
    });
    
    if (validCount === 0) return null;
    return (totalScore / validCount).toFixed(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu hideBreadcrumbs />
      
      <div className="relative overflow-hidden bg-[#1E293B]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=80" 
            alt="University Comparison" 
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
              <GitCompare className="w-3 md:w-3.5 h-3 md:h-3.5" />
              University Comparison
            </div>
            <h1 className="text-2xl md:text-[42px] font-extrabold text-white tracking-tight mb-3 md:mb-4 leading-[1.2] md:leading-[1.1]">
              Compare Top Universities
            </h1>
            <p className="text-gray-200/90 text-xs md:text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
              Side-by-side analysis of tuition fees, courses, intakes, and locations to help you choose the best fit.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="w-full max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="animate-fade-in">
            <div className="mb-4 md:mb-6 text-left flex items-center justify-start gap-2 text-gray-500">
              <Info className="w-4 h-4 text-[#2F4F97]/60" />
              <p className="text-xs md:text-sm font-medium">You can select up to 3 universities from the column headers below to begin your side-by-side comparison.</p>
            </div>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[768px] md:min-w-[800px]">
                  <div className="grid grid-cols-4 bg-[#2F4F97]/5 border-b border-gray-100 items-center">
                    <div className="py-2 px-3 md:p-4 text-left">
                      <h2 className="text-[11px] md:text-[13px] font-bold text-[#1E293B] flex items-center gap-1.5 md:gap-2 uppercase tracking-wide">
                        <GitCompare className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#2F4F97]" /> Comparison Metrics
                      </h2>
                    </div>
                    {activeUnis.map((uni: any, i) => (
                      <div key={i} className="py-2 px-3 md:p-4 text-center relative block">
                      {uni ? (
                        <div className="flex flex-row items-center justify-center gap-1.5 md:gap-3 text-left w-full relative group">
                          <div className="flex items-center justify-center shrink-0 h-8 w-8 md:h-12 md:w-12">
                            <img src={UNIVERSITY_LOGOS[uni.name] || uni.logo_url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop"} alt={uni.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <h3 className="font-bold text-[#1E293B] text-[9px] md:text-xs leading-tight line-clamp-3 pr-3">{uni.name}</h3>
                          <button onClick={() => setUni(i, "none")} className="absolute -top-1 -right-1 md:top-0 md:right-0 p-0.5 md:p-1 text-gray-300 hover:text-red-500 bg-white border border-gray-100 hover:border-red-100 hover:bg-red-50 rounded-full transition-all shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center w-full px-0.5 md:px-1">
                          <Select value={selected[i] ?? "none"} onValueChange={(v) => setUni(i, v)}>
                            <SelectTrigger className="w-full h-8 md:h-12 text-[9px] md:text-xs font-semibold rounded-lg md:rounded-xl border-dashed border-2 border-gray-200 bg-gray-50 hover:bg-white hover:border-[#2F4F97]/40 transition-all text-gray-500 px-1 md:px-3">
                              <SelectValue placeholder="Select a university" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="none" className="text-gray-500">Select a university</SelectItem>
                              {liveUniversities.map((u: any) => (
                                <SelectItem key={u.id} value={u.id} disabled={selected.includes(u.id)} className="font-medium text-xs">
                                  {u.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {i < 2 && <div className="absolute right-0 top-4 bottom-4 w-px bg-gray-100"></div>}
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-gray-100">
                  {[
                    { label: "Global Ranking", icon: Globe, render: (uni: any) => {
                      const statsKey = Object.keys(UNIVERSITY_STATS).find(k => k.trim().toLowerCase() === uni.name.trim().toLowerCase());
                      const stats = statsKey ? UNIVERSITY_STATS[statsKey] : null;
                      return stats ? <Badge variant="outline" className="bg-[#2F4F97]/5 text-[#2F4F97] border-[#2F4F97]/20 font-bold text-[9px] md:text-xs">{stats.ranking}</Badge> : <span className="text-gray-400 font-medium text-[9px] md:text-xs">Unranked</span>;
                    }},
                    { label: "City & Location", icon: MapPin, render: (uni: any) => uni.city || "-" },
                    { label: "Total Courses", icon: BookOpen, render: (uni: any) => {
                      const count = liveCourses.filter(c => c.university_id === uni.id).length;
                      return count > 0 ? `${count} Programs` : "-";
                    }},
                    { label: "Avg. Yearly Tuition", icon: DollarSign, render: (uni: any) => {
                      const avg = getAverageTuition(uni.id);
                      return avg > 0 ? `${currency} ${avg.toLocaleString()}` : "-";
                    }},
                    { label: "Common Intakes", icon: Calendar, render: (uni: any) => {
                      const intakes = getUniqueIntakes(uni.id);
                      return intakes.length > 0 ? (
                        <div className="flex flex-wrap justify-start gap-1.5">
                          {intakes.map(m => (
                            <Badge key={m} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] py-0">{m}</Badge>
                          ))}
                        </div>
                      ) : "-";
                    }},
                    { label: "Degree Levels", icon: GraduationCap, render: (uni: any) => {
                      const levels = getUniqueLevels(uni.id);
                      return levels.length > 0 ? (
                        <div className="flex flex-wrap justify-start gap-1.5">
                          {levels.map(l => (
                            <Badge key={l} variant="secondary" className="bg-[#2F4F97]/5 text-[#2F4F97] hover:bg-[#2F4F97]/10 text-[10px] py-0">{l}</Badge>
                          ))}
                        </div>
                      ) : "-";
                    }},
                    { label: "Study Modes", icon: Building2, render: (uni: any) => {
                      const modes = getUniqueStudyModes(uni.id);
                      return modes.length > 0 ? (
                        <div className="flex flex-wrap justify-start gap-1.5">
                          {modes.map(m => (
                            <span key={m} className="text-[10px] md:text-xs font-medium text-gray-600">{m}</span>
                          ))}
                        </div>
                      ) : "Full-time";
                    }},
                    { label: "Avg. Duration", icon: BookOpen, render: (uni: any) => {
                      const dur = getAverageDuration(uni.id);
                      return dur ? dur : "-";
                    }},
                    { label: "Language Requirements", icon: Languages, render: (uni: any) => {
                      const ielts = getAverageIelts(uni.id);
                      return ielts ? `IELTS ${ielts} Avg` : "-";
                    }},

                    { label: "Est. Living Cost", icon: Wallet, render: (uni: any) => {
                      const statsKey = Object.keys(UNIVERSITY_STATS).find(k => k.trim().toLowerCase() === uni.name.trim().toLowerCase());
                      const stats = statsKey ? UNIVERSITY_STATS[statsKey] : null;
                      const livingCost = stats ? stats.livingCostUSD : [300, 500]; // Default for Malaysia
                      const min = Math.round(livingCost[0] * (rates[currency] || 1));
                      const max = Math.round(livingCost[1] * (rates[currency] || 1));
                      return `${currency} ${min.toLocaleString()} - ${currency} ${max.toLocaleString()} /mo`;
                    }},
                    { label: "Top Programs", icon: GraduationCap, render: (uni: any) => {
                      const uniCourses = liveCourses.filter(c => c.university_id === uni.id).slice(0, 3);
                      return uniCourses.length > 0 ? (
                        <div className="flex flex-col gap-2 text-left">
                          {uniCourses.map((c: any) => (
                            <div key={c.id} className="pb-1">
                              <p className="text-[9px] md:text-[13px] font-medium text-[#1E293B] leading-tight mb-0.5">{c.title}</p>
                              <p className="text-gray-500 font-medium text-[8px] md:text-[9px] flex items-center gap-1">
                                <span>{c.degree_level}</span>
                                <span className="opacity-40">•</span>
                                <span className="text-[#2F4F97] font-bold">{currency} {Math.round((c.tuition_fee || 0) * (rates[currency] || 1)).toLocaleString()}/yr</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : "-";
                    }},
                    { label: "Action", icon: ExternalLink, render: (uni: any) => (
                      <Button asChild size="sm" className="w-full h-auto min-h-[32px] py-1.5 px-1 md:px-3 text-[9px] md:text-[11px] hover:bg-[#2F4F97] shadow-sm transition-all rounded-lg group">
                        <Link to={`/universities/${generateSlug(uni.name)}`} className="flex items-center justify-center gap-1">
                          <span className="whitespace-normal text-center leading-tight">Go to university detail</span>
                          <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    )},
                  ].map((row, rIdx) => (
                    <div key={row.label} className={`grid grid-cols-4 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <div className="py-2 px-3 md:p-4 flex items-center gap-2 md:gap-3 border-r border-gray-100 bg-transparent">
                        <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#2F4F97]/10 flex items-center justify-center shrink-0">
                          <row.icon className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#2F4F97]" />
                        </div>
                        <h3 className="font-semibold text-[11px] md:text-[13px] text-[#1E293B] leading-tight">{row.label}</h3>
                      </div>
                      
                      {activeUnis.map((uni: any, i) => (
                        <div key={i} className="py-2 px-3 md:p-4 text-left flex flex-col justify-center relative">
                          {uni ? (
                            <div className="text-[10px] md:text-[13px] font-medium text-[#1E293B]">
                              {row.render(uni)}
                            </div>
                          ) : (
                            <p className="text-gray-300 font-medium block">-</p>
                          )}
                          {i < 2 && <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-100"></div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-start gap-2.5 text-gray-500 bg-gray-50/50 p-4 md:p-5 rounded-2xl border border-gray-100">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
              <p className="text-[11px] md:text-xs leading-relaxed text-justify">
                <strong className="font-semibold text-gray-600">Disclaimer:</strong> The values presented in this table (such as global rankings, estimated living costs, and averages for tuition, duration, and language requirements) are approximate indicators calculated across multiple programs or sourced externally. They are provided for general guidance and comparative purposes only. Please verify exact figures and requirements directly on the specific program pages.
              </p>
            </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
