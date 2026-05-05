import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Search, Clock, DollarSign, MapPin, ChevronLeft, ChevronRight, Languages, GraduationCap } from "lucide-react";

const ITEMS_PER_PAGE = 6;
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function LanguageCentersPage() {
  const { data: languageCenters = [], isLoading } = useTableData("language_centers");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [city, setCity] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => ["All", ...new Set(languageCenters.map((lc: any) => lc.city).filter(Boolean))], [languageCenters]);

  useEffect(() => { setCurrentPage(1); }, [search, level, city]);

  const filtered = useMemo(() => {
    return languageCenters.filter((lc: any) => {
      if (search && !lc.name.toLowerCase().includes(search.toLowerCase()) && !(lc.institute || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (level !== "All" && lc.level !== level) return false;
      if (city !== "All" && lc.city !== city) return false;
      return true;
    });
  }, [languageCenters, search, level, city]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const levelColor = (l: string) => {
    switch (l) {
      case "Beginner": return "bg-primary/10 text-primary";
      case "Intermediate": return "bg-[#ffa300]/20 text-[#181d29]";
      case "Advanced": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />
      <div className="intro-surface py-14">
        <div className="container mx-auto px-4 text-center">
          <Languages className="h-10 w-10 mx-auto mb-3 text-[#ffa300]" />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Malay Language Centers</h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">Learn Bahasa Melayu at accredited language centres across Malaysia.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <LoadingScreen label="Loading language programs" sublabel="Gathering available classes" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8" ref={listRef}>
            <aside className="lg:w-1/4 shrink-0 space-y-6">
              <Card>
                <CardContent className="p-5 space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g. Conversational Malay…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Level</label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">City</label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{cities.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setSearch(""); setLevel("All"); setCity("All"); }}>Clear Filters</Button>
                </CardContent>
              </Card>
            </aside>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} {filtered.length === 1 ? "program" : "programs"} found</p>
              {paged.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No language programs found. Add some from the admin panel!</div>
              ) : (
                <div className="space-y-4">
                  {paged.map((lc: any) => (
                    <Card key={lc.id} className="hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="h-12 w-12 rounded-sm bg-[#ffa300]/10 flex items-center justify-center shrink-0">
                          <Languages className="h-6 w-6 text-[#ffa300]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground leading-tight">{lc.name}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{lc.institute}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="secondary" className={levelColor(lc.level)}>
                              <GraduationCap className="h-3 w-3 mr-1" /> {lc.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {lc.duration}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {lc.city}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> MYR {Number(lc.tuition_fee).toLocaleString()}</span>
                          </div>
                        </div>
                        <Link to={`/language-centers/${lc.id}`}>
                          <Button size="sm" className="shrink-0 bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90">View Details</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => { setCurrentPage(currentPage - 1); }}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => { setCurrentPage(currentPage + 1); }}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
