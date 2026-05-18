import { useState, useMemo } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { universities, courses, countries, universityComparisons, costOfLivingData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, DollarSign, MapPin, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

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
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <MegaMenu />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center max-w-3xl">
          <div className="h-16 w-16 bg-[#ffa300]/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-8 w-8 text-[#ffa300]" />
          </div>
          <h1 className="text-3xl md:text-[40px] font-extrabold mb-4" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29", lineHeight: 1.2 }}>
            Compare <span className="text-[#ffa300]">Universities</span>
          </h1>
          <p className="text-[#515768] text-base md:text-lg">
            Select up to 3 universities to compare them side-by-side across rankings, affordability, and campus life.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <Select value={selected[i]?.toString() ?? "none"} onValueChange={(v) => setUni(i, v)}>
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue placeholder={`Select University ${i + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">- Select -</SelectItem>
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()} disabled={selected.includes(u.id)}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selected[i] && (
                  <Button variant="ghost" size="icon" className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => clearSlot(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!hasAny && (
            <Card className="text-center py-16 animate-fade-in shadow-sm border-gray-200/60 rounded-md">
              <CardContent>
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-[#181d29]" style={{ fontFamily: "Poppins, sans-serif" }}>No Universities Selected</p>
                <p className="text-[#515768] mt-1">Select universities from the dropdowns above to start comparing.</p>
              </CardContent>
            </Card>
          )}

          {hasAny && (
            <div className="space-y-8 animate-fade-in">
              {/* Sticky university headers */}
              <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b py-4 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-sm md:border md:shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {activeUnis.map((a, i) => (
                    <div key={i} className="text-center">
                      {a ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={a.uni.logo_url} alt={a.uni.name} className="w-12 h-12 rounded-sm object-cover" />
                          <div>
                            <p className="font-bold text-sm leading-tight">{a.uni.name}</p>
                            <p className="text-xs text-muted-foreground">{a.uni.city}, {countries.find((c) => c.id === a.uni.country_id)?.name}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground/50 text-sm py-4">Empty slot</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart */}
              <Card className="shadow-sm border-gray-200/60 rounded-md">
                <CardHeader><CardTitle className="text-xl" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}>Performance Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      {activeUnis.map((a, i) =>
                        a ? (
                          <Radar key={a.uni.id} name={a.uni.name} dataKey={a.uni.name} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                        ) : null
                      )}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Comparison Grid */}
              {[
                { label: "Global Ranking", render: (a: NonNullable<typeof activeUnis[0]>) => `#${a.uni.ranking}`, icon: Trophy },
                { label: "Global Score", render: (a: NonNullable<typeof activeUnis[0]>) => `${a.uni.global_score}/100`, icon: Trophy, progress: true },
                { label: "Avg. Yearly Tuition", render: (a: NonNullable<typeof activeUnis[0]>) => {
                  const uniCourses = courses.filter((c) => c.university_id === a.uni.id);
                  const avg = uniCourses.length ? Math.round(uniCourses.reduce((s, c) => s + c.tuition_fee, 0) / uniCourses.length) : 0;
                  return `$${avg.toLocaleString()}`;
                }, icon: DollarSign },
                { label: "Est. Monthly Living Cost", render: (a: NonNullable<typeof activeUnis[0]>) => `$${a.comp.avg_living_cost.toLocaleString()}`, icon: MapPin },
                { label: "Min. IELTS", render: (a: NonNullable<typeof activeUnis[0]>) => a.comp.min_ielts.toString(), icon: GraduationCap },
                { label: "Min. TOEFL", render: (a: NonNullable<typeof activeUnis[0]>) => a.comp.min_toefl.toString(), icon: GraduationCap },
              ].map((row) => (
                <Card key={row.label} className="shadow-sm border-gray-200/60 rounded-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <row.icon className="h-4 w-4 text-[#ffa300]" />
                      <h3 className="font-semibold text-sm">{row.label}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {activeUnis.map((a, i) => (
                        <div key={i} className="text-center">
                          {a ? (
                            <div>
                              <p className="text-2xl font-extrabold">{row.render(a)}</p>
                              {row.progress && (
                                <Progress value={a.uni.global_score} className="mt-2 h-2" />
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground/40">-</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Top Courses */}
              <Card className="shadow-sm border-gray-200/60 rounded-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-4 w-4 text-[#ffa300]" />
                    <h3 className="font-semibold text-sm">Top Courses</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activeUnis.map((a, i) => (
                      <div key={i}>
                        {a ? (
                          <div className="space-y-2">
                            {courses.filter((c) => c.university_id === a.uni.id).slice(0, 3).map((c) => (
                              <div key={c.id} className="bg-muted/50 rounded-sm p-2.5">
                                <p className="text-xs font-medium leading-tight">{c.title}</p>
                                <p className="text-xs text-muted-foreground">{c.degree_level} • ${c.tuition_fee.toLocaleString()}/yr</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground/40 text-center py-6">-</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Score Bars */}
              <Card className="shadow-sm border-gray-200/60 rounded-md">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-4">Detailed Scores</h3>
                  {["academic_difficulty", "affordability", "campus_life"].map((key) => (
                    <div key={key} className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2 capitalize">{key.replace("_", " ")}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {activeUnis.map((a, i) => (
                          <div key={i}>
                            {a ? (
                              <div className="flex items-center gap-2">
                                <Progress value={a.comp[key as keyof typeof a.comp] as number} className="h-3 flex-1" />
                                <span className="text-xs font-bold w-8">{a.comp[key as keyof typeof a.comp] as number}</span>
                              </div>
                            ) : (
                              <div className="h-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
