import { useState, useMemo } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { universities, courses, countries, universityComparisons, costOfLivingData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, DollarSign, MapPin, GraduationCap, X, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";

const RADAR_COLORS = ["hsl(38, 92%, 50%)", "hsl(220, 60%, 40%)", "hsl(142, 76%, 36%)"];

export default function Compare() {
  const [selected, setSelected] = useState<(number | null)[]>([null, null, null]);

  const setUni = (index: number, value: string) => {
    const next = [...selected];
    next[index] = value === "none" ? null : Number(value);
    setSelected(next);
  };

  const clearSlot = (index: number) => {
    const next = [...selected];
    next[index] = null;
    setSelected(next);
  };

  const activeUnis = selected
    .map((id) => (id ? universities.find((u) => u.id === id) : null))
    .map((u, i) => (u ? { uni: u, comp: universityComparisons.find((c) => c.university_id === u.id)! } : null));

  const hasAny = activeUnis.some(Boolean);

  const radarData = useMemo(() => {
    if (!hasAny) return [];
    const metrics = ["Academic Difficulty", "Affordability", "Campus Life"];
    return metrics.map((metric) => {
      const entry: Record<string, string | number> = { metric };
      activeUnis.forEach((a, i) => {
        if (a) {
          const key = metric === "Academic Difficulty" ? "academic_difficulty" : metric === "Affordability" ? "affordability" : "campus_life";
          entry[a.uni.name] = a.comp[key as keyof typeof a.comp] as number;
        }
      });
      return entry;
    });
  }, [activeUnis, hasAny]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu hideBreadcrumbs />
      
      {/* Page Header */}
      <div className="relative overflow-hidden bg-[#1E293B]">
        {/* Background Image & Overlay */}
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
              Side-by-side analysis of tuition fees, campus life, rankings, and global reputation to help you choose the best fit.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="w-full max-w-[1200px] mx-auto px-4 py-12 md:py-16">
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative animate-fade-in group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2F4F97]/20 to-[#2F4F97]/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Select value={selected[i]?.toString() ?? "none"} onValueChange={(v) => setUni(i, v)}>
                  <SelectTrigger className="relative h-16 text-base font-semibold rounded-2xl border-gray-200 bg-white hover:border-[#2F4F97]/40 focus:ring-[#2F4F97]/20 transition-all shadow-sm">
                    <SelectValue placeholder={`Select University ${i + 1}`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none" className="text-gray-500">- Select University -</SelectItem>
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()} disabled={selected.includes(u.id)} className="font-medium">
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selected[i] && (
                  <Button variant="ghost" size="icon" className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full z-10 transition-colors" onClick={() => clearSlot(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!hasAny && (
            <div className="text-center py-24 animate-fade-in bg-[#F8FAFC] border border-gray-100 rounded-[32px] shadow-inner">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <GitCompare className="h-10 w-10 text-[#2F4F97]/40" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Ready to Compare?</h2>
              <p className="text-[#64748B] max-w-md mx-auto text-sm md:text-base">
                Select up to 3 universities from the dropdowns above to see a detailed side-by-side analysis of their programs, costs, and campus life.
              </p>
            </div>
          )}

          {hasAny && (
            <div className="space-y-8 animate-fade-in">
              {/* Sticky university headers */}
              <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 py-4 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-2xl md:border md:shadow-lg md:mb-12 shadow-sm transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {activeUnis.map((a, i) => (
                    <div key={i} className="text-center relative">
                      {a ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-[#2F4F97]/10 rounded-2xl transform scale-110 blur-sm"></div>
                            <img src={a.uni.logo_url} alt={a.uni.name} className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1E293B] text-sm md:text-base leading-tight mb-1">{a.uni.name}</h3>
                            <p className="text-xs font-medium text-gray-500 flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" /> {a.uni.city}, {countries.find((c) => c.id === a.uni.country_id)?.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 pt-2">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 mb-3 flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-xl">+</span>
                          </div>
                          <p className="text-gray-400 font-medium text-sm">Empty Slot</p>
                        </div>
                      )}
                      {/* Divider line between columns on desktop */}
                      {i < 2 && <div className="hidden sm:block absolute right-[-12px] top-4 bottom-4 w-px bg-gray-100"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] border-b border-gray-100 px-6 md:px-8 py-5">
                  <h2 className="text-lg md:text-xl font-bold text-[#1E293B] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#2F4F97]" /> Key Metrics
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "Global Ranking", render: (a: NonNullable<typeof activeUnis[0]>) => <span className="text-[#2F4F97]">#{a.uni.ranking}</span>, icon: Trophy },
                    { label: "Global Score", render: (a: NonNullable<typeof activeUnis[0]>) => (
                        <div className="w-full max-w-[120px] mx-auto">
                          <div className="flex justify-between items-end mb-1.5"><span className="font-extrabold text-[#1E293B]">{a.uni.global_score}</span><span className="text-[10px] font-bold text-gray-400">/100</span></div>
                          <Progress value={a.uni.global_score} className="h-1.5 bg-gray-100" />
                        </div>
                      ), icon: Trophy, progress: true },
                    { label: "Avg. Yearly Tuition", render: (a: NonNullable<typeof activeUnis[0]>) => {
                      const uniCourses = courses.filter((c) => c.university_id === a.uni.id);
                      const avg = uniCourses.length ? Math.round(uniCourses.reduce((s, c) => s + c.tuition_fee, 0) / uniCourses.length) : 0;
                      return `$${avg.toLocaleString()}`;
                    }, icon: DollarSign },
                    { label: "Est. Monthly Living Cost", render: (a: NonNullable<typeof activeUnis[0]>) => `$${a.comp.avg_living_cost.toLocaleString()}`, icon: MapPin },
                    { label: "Min. IELTS", render: (a: NonNullable<typeof activeUnis[0]>) => <Badge variant="outline" className="bg-[#2F4F97]/5 text-[#2F4F97] border-[#2F4F97]/20 font-bold px-3 py-1">{a.comp.min_ielts.toString()}</Badge>, icon: GraduationCap },
                    { label: "Min. TOEFL", render: (a: NonNullable<typeof activeUnis[0]>) => <Badge variant="outline" className="bg-[#2F4F97]/5 text-[#2F4F97] border-[#2F4F97]/20 font-bold px-3 py-1">{a.comp.min_toefl.toString()}</Badge>, icon: GraduationCap },
                  ].map((row, rIdx) => (
                    <div key={row.label} className={`flex flex-col sm:flex-row transition-colors hover:bg-gray-50/50 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <div className="sm:w-1/4 p-4 md:p-6 flex items-center gap-3 sm:border-r border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#2F4F97]/10 flex items-center justify-center shrink-0">
                          <row.icon className="h-4 w-4 text-[#2F4F97]" />
                        </div>
                        <h3 className="font-semibold text-sm text-[#1E293B] leading-tight">{row.label}</h3>
                      </div>
                      <div className="sm:w-3/4 p-4 md:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {activeUnis.map((a, i) => (
                            <div key={i} className="text-center flex flex-col justify-center relative">
                              {a ? (
                                <div className="text-lg md:text-xl font-extrabold text-[#1E293B]">
                                  {row.render(a)}
                                </div>
                              ) : (
                                <p className="text-gray-300 font-medium">-</p>
                              )}
                              {/* Desktop inner dividers */}
                              {i < 2 && <div className="hidden sm:block absolute right-[-12px] top-0 bottom-0 w-px bg-gray-100"></div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Courses */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] border-b border-gray-100 px-6 md:px-8 py-5">
                  <h2 className="text-lg md:text-xl font-bold text-[#1E293B] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#2F4F97]" /> Top Programs
                  </h2>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                    {activeUnis.map((a, i) => (
                      <div key={i} className="relative">
                        {a ? (
                          <div className="space-y-3">
                            {courses.filter((c) => c.university_id === a.uni.id).slice(0, 3).map((c) => (
                              <div key={c.id} className="bg-white border border-gray-100 hover:border-[#2F4F97]/30 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md group">
                                <p className="text-sm font-bold text-[#1E293B] group-hover:text-[#2F4F97] transition-colors leading-tight mb-2 line-clamp-2">{c.title}</p>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{c.degree_level}</span>
                                  <span>•</span>
                                  <span className="text-[#2F4F97] font-bold">${c.tuition_fee.toLocaleString()}/yr</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center py-10">
                            <p className="text-gray-300 font-medium">No Data</p>
                          </div>
                        )}
                        {/* Divider */}
                        {i < 2 && <div className="hidden sm:block absolute right-[-16px] md:right-[-20px] top-0 bottom-0 w-px bg-gray-100"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart and Detailed Scores Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-[#F8FAFC] border-b border-gray-100 px-6 md:px-8 py-5">
                    <h2 className="text-lg md:text-xl font-bold text-[#1E293B] flex items-center gap-2">
                      <GitCompare className="w-5 h-5 text-[#2F4F97]" /> Performance Comparison
                    </h2>
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={radarData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="metric" className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider" tick={{ fill: "#64748B" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                        {activeUnis.map((a, i) =>
                          a ? (
                            <Bar key={a.uni.id} name={a.uni.name} dataKey={a.uni.name} fill={RADAR_COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                          ) : null
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-[#F8FAFC] border-b border-gray-100 px-6 md:px-8 py-5">
                    <h2 className="text-lg md:text-xl font-bold text-[#1E293B] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#2F4F97]" /> Detailed Breakdown
                    </h2>
                  </div>
                  <div className="p-6 md:p-8 space-y-8 flex-1">
                    {["academic_difficulty", "affordability", "campus_life"].map((key) => (
                      <div key={key}>
                        <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-wider">{key.replace("_", " ")}</p>
                        <div className="space-y-4">
                          {activeUnis.map((a, i) => {
                            if (!a) return null;
                            const val = a.comp[key as keyof typeof a.comp] as number;
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-8 shrink-0">
                                  <img src={a.uni.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-100 bg-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#1E293B] line-clamp-1">{a.uni.name}</span>
                                    <span className="text-xs font-extrabold text-[#1E293B]">{val}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${val}%`, backgroundColor: RADAR_COLORS[i] }}></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
