import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RotateCcw,
  GraduationCap,
  Building2,
  Info,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  UserPlus,
  SlidersHorizontal,
  X,
  ExternalLink,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toast } from "sonner";
import { getActiveIntake } from "@/lib/utils";

interface University {
  id: string;
  name: string;
  city: string | null;
  logo_url: string | null;
}

interface Course {
  id: string;
  title: string;
  university_id: string;
  degree_level: string | null;
  duration: string | null;
  tuition_fee: number | null;
  intake_months: string[] | null;
  entry_requirements: Record<string, any> | null;
}

const UNIVERSITY_LOGOS: Record<string, string> = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
  "UCSI University Malaysia": "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
  "Taylor's University Malaysia": "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
  "APU University Malaysia": "https://en.your-uni.com/assets/images/university/apu-university.webp",
  "UNITEN University Malaysia": "https://en.your-uni.com/assets/images/university/uniten-university.webp",
  "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
  "MAHSA University Malaysia": "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
  "UTP University Malaysia": "https://en.your-uni.com/assets/images/university/utp-university.webp",
  "SEGi University Malaysia": "https://en.your-uni.com/assets/images/university/segi-university.webp",
  "Limkokwing University Malaysia": "https://en.your-uni.com/assets/images/university/limkokwing-university.webp",
  "Infrastructure University Kuala Lumpur (IUKL)": "https://en.your-uni.com/assets/images/university/iukl-university.webp",
  "INTI International University Malaysia": "https://en.your-uni.com/assets/images/university/inti-university.webp",
  "UniKL University Malaysia": "https://en.your-uni.com/assets/images/university/unikl-university.webp",
  "Tunku Abdul Rahman University (UTAR)": "https://en.your-uni.com/assets/images/university/utar-university.webp",
  "Nottingham University Malaysia": "https://en.your-uni.com/assets/images/university/nottingham-university.webp",
  "MONASH University Malaysia": "https://en.your-uni.com/assets/images/university/monash-university.webp",
  "International University of Malaya-Wales (IUMW)": "https://en.your-uni.com/assets/images/university/iumw-university.webp",
  "UTM University Malaysia": "https://en.your-uni.com/assets/images/university/utm-university.webp",
  "UTeM University Malaysia": "https://en.your-uni.com/assets/images/university/utem-university.webp",
  "University Malaysia of Computer Science & Engineering (UNIMY)": "https://en.your-uni.com/assets/images/university/university-malaysia-of-computer-science-and-engineering-unimy.webp",
  "Sunway University": "https://en.your-uni.com/assets/images/university/sunway-university.webp",
  "Management and Science University (MSU)": "https://en.your-uni.com/assets/images/university/msu-university.webp",
  "UTM SPACE University Malaysia": "https://en.your-uni.com/assets/images/university/utm-space-university-malaysia.webp",
  "Heriot-Watt University Malaysia Campus": "https://en.your-uni.com/assets/images/university/heriot-watt-university-malaysia-campus.webp",
  "University of Southampton Malaysia": "https://en.your-uni.com/assets/images/university/university-of-southampton.webp",
  "Curtin University Malaysia": "https://en.your-uni.com/assets/images/university/curtin-university-malaysia.webp",
  "Xiamen University Malaysia Campus": "https://en.your-uni.com/assets/images/university/xiamen-university-malaysia-campus.webp",
  "International Medical University (IMU)": "https://en.your-uni.com/assets/images/university/international-medical-university.webp",
  "Universiti Geomatika Malaysia": "https://en.your-uni.com/assets/images/university/universiti-geomatika-malaysia.webp",
  "NILAI University": "https://en.your-uni.com/assets/images/university/nilai-university.webp",
  "Cyberjaya University Malaysia (UoC)": "https://en.your-uni.com/assets/images/university/cyberjaya-university.png",
  "HELP University Malaysia": "https://en.your-uni.com/assets/images/university/help-university.png",
  "University of Wollongong (UOW) Malaysia": "https://en.your-uni.com/assets/images/university/university-of-wollongong-uow.png",
  "Newcastle University Medicine Malaysia (NUMed)": "https://en.your-uni.com/assets/images/university/-newcastle-university-medicine-malaysia.png",
  "Universiti Malaya (UM)": "https://en.your-uni.com/assets/images/university/universiti-malaya-um.png",
  "Kings University College Malaysia": "https://en.your-uni.com/assets/images/university/kings-university-college.png",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://www.tarc.edu.my/images/tarumt-logo1.png?v=beyongEducation2",
  "Universiti Putra Malaysia (UPM)": "https://en.your-uni.com/assets/images/university/upm-university.jpg",
  "Swinburne University of Technology Sarawak": "https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp",
};

const PAID_OFFER_LETTER_UNIS = [
  "Universiti Putra Malaysia (UPM)",
  "UTM University Malaysia",
  "UTeM University Malaysia",
  "UTM SPACE University Malaysia",
  "Swinburne University of Technology Sarawak Campus",
];

export default function PartnerSearchPrograms() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<Record<string, University>>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [intake, setIntake] = useState("all");
  const [level, setLevel] = useState("all");
  const [studyArea, setStudyArea] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");

  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: "",
    universityFilter: "all",
    intake: "all",
    level: "all",
    studyArea: "all",
    sortBy: "best_match"
  });

  // Pagination (100 total, 50 per column)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch universities
        const { data: univsData } = await supabase
          .from("universities")
          .select("id, name, city, logo_url");

        const univsMap = (univsData || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, University>);
        setUniversities(univsMap);

        // 2. Fetch all courses (PostgREST server default caps single query at 1,000 rows)
        const pageSize = 1000;
        const { data: firstBatch, count } = await supabase
          .from("courses")
          .select("*", { count: "exact" })
          .range(0, pageSize - 1);

        let allCourses: Course[] = (firstBatch as any) || [];
        const totalCount = count || 4365;

        if (totalCount > pageSize) {
          const batchPromises = [];
          for (let start = pageSize; start < totalCount; start += pageSize) {
            batchPromises.push(
              supabase
                .from("courses")
                .select("*")
                .range(start, start + pageSize - 1)
            );
          }
          const results = await Promise.all(batchPromises);
          for (const res of results) {
            if (res.data && res.data.length > 0) {
              allCourses = allCourses.concat(res.data as any);
            }
          }
        }

        // 3. Always randomize program order
        const shuffled = [...allCourses].sort(() => Math.random() - 0.5);
        setCourses(shuffled);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => {
      const university = universities[course.university_id];

      if (appliedFilters.searchQuery) {
        const q = appliedFilters.searchQuery.toLowerCase();
        if (
          !course.title.toLowerCase().includes(q) &&
          (!university || !university.name.toLowerCase().includes(q))
        ) {
          return false;
        }
      }

      if (appliedFilters.universityFilter !== "all") {
        if (course.university_id !== appliedFilters.universityFilter) return false;
      }

      if (appliedFilters.intake !== "all") {
        if (!course.intake_months || !course.intake_months.includes(appliedFilters.intake)) return false;
      }

      if (appliedFilters.level !== "all") {
        let matchLevel = appliedFilters.level;
        if (appliedFilters.level === "Bachelor's Degree") matchLevel = "Bachelor";
        if (appliedFilters.level === "Master's Degree") matchLevel = "Master";
        if (appliedFilters.level === "Doctoral Degree (PhD)") matchLevel = "PhD";
        if (appliedFilters.level === "Foundation / A-level") matchLevel = "Foundation";
        if (!course.degree_level || !course.degree_level.includes(matchLevel)) return false;
      }

      if (appliedFilters.studyArea !== "all") {
        const titleLower = course.title.toLowerCase();
        const areaLower = appliedFilters.studyArea.toLowerCase();
        if (
          !titleLower.includes(areaLower) &&
          !(areaLower === "medicine & health" && (titleLower.includes("medicine") || titleLower.includes("health") || titleLower.includes("nursing"))) &&
          !(areaLower === "computer science & it" && (titleLower.includes("computer") || titleLower.includes("software") || titleLower.includes("it") || titleLower.includes("information")))
        ) {
          return false;
        }
      }

      return true;
    });

    if (appliedFilters.sortBy === "tuition_low_high") {
      result.sort((a, b) => (a.tuition_fee || 0) - (b.tuition_fee || 0));
    } else if (appliedFilters.sortBy === "tuition_high_low") {
      result.sort((a, b) => (b.tuition_fee || 0) - (a.tuition_fee || 0));
    }

    return result;
  }, [courses, universities, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters({ searchQuery, universityFilter, intake, level, studyArea, sortBy });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setUniversityFilter("all");
    setIntake("all");
    setLevel("all");
    setStudyArea("all");
    setSortBy("best_match");
    setAppliedFilters({
      searchQuery: "", universityFilter: "all", intake: "all", level: "all", studyArea: "all", sortBy: "best_match"
    });
    setCurrentPage(1);
  };

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const hasActiveFilters = appliedFilters.searchQuery || appliedFilters.universityFilter !== "all" || appliedFilters.intake !== "all" || appliedFilters.level !== "all" || appliedFilters.studyArea !== "all";

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Search Programs</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Browse available programs and apply your students</p>
      </div>

      {/* ─── Top Horizontal Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="space-y-1.5 flex-[2] min-w-[240px]">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search by Program or University"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="h-9 text-xs border-gray-200 pl-8"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* University */}
          <div className="space-y-1.5 flex-[1.5] min-w-[180px]">
            <label className="text-xs font-medium text-gray-500">University</label>
            <Select value={universityFilter} onValueChange={(v) => { setUniversityFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs border-gray-200">
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Universities ({Object.keys(universities).length})</SelectItem>
                {Object.values(universities)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Degree Level */}
          <div className="space-y-1.5 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-500">Degree Level</label>
            <Select value={level} onValueChange={(v) => { setLevel(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs border-gray-200">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Foundation / A-level">Foundation / A-Level</SelectItem>
                <SelectItem value="Diploma">Diploma</SelectItem>
                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="Doctoral Degree (PhD)">PhD / Doctorate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Study Area */}
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-500">Study Area</label>
            <Select value={studyArea} onValueChange={(v) => { setStudyArea(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs border-gray-200">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="Business & Management">Business & Management</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Computer Science & IT">Computer Science & IT</SelectItem>
                <SelectItem value="Medicine & Health">Medicine & Health</SelectItem>
                <SelectItem value="Architecture">Architecture</SelectItem>
                <SelectItem value="Law">Law</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Arts">Arts & Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Intake Month */}
          <div className="space-y-1.5 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-500">Intake Month</label>
            <Select value={intake} onValueChange={(v) => { setIntake(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-xs border-gray-200">
                <SelectValue placeholder="All Intakes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intakes</SelectItem>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-initial min-w-[170px]">
            <Button onClick={handleSearch} className="w-full gap-2 bg-[#2F4F97] hover:bg-white text-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97] transition-colors"><Search className="h-4 w-4" /> Search</Button>
            <Button variant="outline" onClick={handleReset} className="w-full gap-2 border-gray-300">Clear</Button>
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="space-y-4">

        {/* Results bar */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#1E293B]">{filteredCourses.length}</span> programs found
          </p>
        </div>

          {/* Course Cards Grid (2 Column Compact Layout) */}
          {filteredCourses.length === 0 ? (
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
              <div className="text-center py-16 px-4">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-sm text-gray-700 mb-1">No programs found</p>
                <p className="text-xs text-muted-foreground mb-4">Try adjusting your filters.</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
              {paginatedCourses.map((c) => {
                const uni = universities[c.university_id];
                const logoSrc = uni?.logo_url || (uni?.name ? UNIVERSITY_LOGOS[uni.name] : null);

                return (
                  <div
                    key={c.id}
                    className="p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Left: Logo + Program Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Logo */}
                      <div className="w-20 h-16 shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-1.5">
                        {logoSrc ? (
                          <img src={logoSrc} alt={uni?.name || "Logo"} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <GraduationCap className="h-7 w-7 text-gray-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sm text-[#1E293B] leading-snug line-clamp-2">
                            {c.title}
                          </h3>
                          {c.degree_level && (
                            <Badge variant="secondary" className="bg-[#2F4F97]/10 text-[#2F4F97] border-transparent text-[10px] px-2 py-0.5 font-medium">
                              {c.degree_level}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#475569] truncate">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="font-medium truncate">{uni?.name || "Malaysian University"}</span>
                          {uni?.city && <span className="text-gray-400">· {uni.city}</span>}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#475569] leading-relaxed flex-wrap">
                          <span className="font-semibold text-gray-800">
                            {c.tuition_fee != null ? `MYR ${c.tuition_fee.toLocaleString()}/yr` : "Tuition N/A"}
                          </span>
                          {" · "}
                          <span>{uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "Offer Letter Fee" : "Free Offer Letter"}</span>
                          {" · "}
                          <span>{c.duration || "N/A"}</span>
                          {c.intake_months && c.intake_months.length > 0 && (
                            <>
                              {" · "}
                              {(c.intake_months as string[]).map((intakeName, idx) => {
                                const isActive = intakeName === getActiveIntake(c.intake_months);
                                return (
                                  <span key={idx}>
                                    <span className={isActive ? "bg-[#EEF4FF] text-[#2F4F97] px-1.5 py-0.5 rounded font-semibold text-[11px]" : "text-[11px]"}>
                                      {intakeName.substring(0, 3)}
                                    </span>
                                    {idx < (c.intake_months?.length || 0) - 1 ? " & " : ""}
                                  </span>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="shrink-0 flex flex-col gap-2.5 w-full md:w-auto">
                      <Button
                        className="w-full md:w-auto h-9 px-4 text-xs font-normal rounded-lg gap-2 bg-[#2F4F97] hover:bg-white text-white hover:text-[#2F4F97] border border-[#2F4F97] shadow-sm whitespace-nowrap transition-colors"
                        onClick={() => navigate(`/partner-dashboard/apply?courseId=${c.id}`)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Select This Program
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full md:w-auto h-9 px-4 text-xs font-normal rounded-lg gap-2 text-[#2F4F97] border-[#2F4F97] bg-white hover:bg-[#2F4F97] hover:text-white shadow-sm whitespace-nowrap transition-colors"
                        onClick={() => window.open(`/courses/${c.id}`, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Course Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} · {filteredCourses.length} programs
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
