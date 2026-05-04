import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Search, Clock, GraduationCap, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 8;
const DEGREE_LEVELS = ["All", "Foundation", "Bachelor", "Master", "PhD"];

export default function Courses() {
  const { data: courses = [], isLoading: loadingCourses } = useTableData("courses");
  const { data: universities = [], isLoading: loadingUnis } = useTableData("universities");
  const [search, setSearch] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("All");
  const [universityId, setUniversityId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCurrentPage(1); }, [search, degreeLevel, universityId]);

  const filtered = useMemo(() => {
    return courses.filter((c: any) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (degreeLevel !== "All" && c.degree_level !== degreeLevel) return false;
      if (universityId !== "all" && c.university_id !== universityId) return false;
      return true;
    });
  }, [courses, search, degreeLevel, universityId]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const isLoading = loadingCourses || loadingUnis;

  const changePage = (page: number) => {
    setCurrentPage(page);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const levelColor = (level: string) => {
    switch (level) {
      case "Foundation": return "bg-muted text-muted-foreground";
      case "Bachelor": return "bg-primary/10 text-primary";
      case "Master": return "bg-[#ffa300]/20 text-[#181d29]";
      case "PhD": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />
      <div className="intro-surface py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Course Directory</h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">Search through {courses.length}+ programs across Malaysian universities.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <LoadingScreen label="Loading courses" sublabel="Fetching program listings" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8" ref={listRef}>
            <aside className="lg:w-1/4 shrink-0 space-y-6">
              <Card>
                <CardContent className="p-5 space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Search Course Title</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g. Computer Science…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Degree Level</label>
                    <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DEGREE_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">University</label>
                    <Select value={universityId} onValueChange={setUniversityId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Universities</SelectItem>
                        {universities.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setSearch(""); setDegreeLevel("All"); setUniversityId("all"); }}>Clear Filters</Button>
                </CardContent>
              </Card>
            </aside>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} {filtered.length === 1 ? "course" : "courses"} found</p>
              {paged.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No courses found. Add some from the admin panel!</div>
              ) : (
                <div className="space-y-4">
                  {paged.map((c: any) => {
                    const uni = universities.find((u: any) => u.id === c.university_id);
                    return (
                      <Card key={c.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0">
                            {uni?.logo_url && <img src={uni.logo_url} alt={uni.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground leading-tight">{c.title}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{uni?.name || "Unknown University"}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary" className={levelColor(c.degree_level)}>
                                <GraduationCap className="h-3 w-3 mr-1" /> {c.degree_level}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> USD {Number(c.tuition_fee).toLocaleString()}/yr</span>
                            </div>
                          </div>
                          <Button asChild size="sm" className="shrink-0 bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90">
                            <Link to={`/courses/${c.id}`}>View Details</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>
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
