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
  Sparkles,
  CheckCircle2,
  Calendar,
  UserPlus,
  SlidersHorizontal,
  X,
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
  const [intake, setIntake] = useState("all");
  const [year, setYear] = useState("all");
  const [level, setLevel] = useState("all");
  const [studyArea, setStudyArea] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: univsData }, { data: coursesData }] = await Promise.all([
          supabase.from("universities").select("id, name, city, logo_url"),
          supabase.from("courses").select("*"),
        ]);

        const univsMap = (univsData || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, University>);
        setUniversities(univsMap);
        setCourses((coursesData as any) || []);
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

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !course.title.toLowerCase().includes(q) &&
          (!university || !university.name.toLowerCase().includes(q))
        ) {
          return false;
        }
      }

      if (intake !== "all") {
        if (!course.intake_months || !course.intake_months.includes(intake)) return false;
      }

      if (level !== "all") {
        let matchLevel = level;
        if (level === "Bachelor's Degree") matchLevel = "Bachelor";
        if (level === "Master's Degree") matchLevel = "Master";
        if (level === "Doctoral Degree (PhD)") matchLevel = "PhD";
        if (level === "Foundation / A-level") matchLevel = "Foundation";
        if (!course.degree_level || !course.degree_level.includes(matchLevel)) return false;
      }

      if (studyArea !== "all") {
        const titleLower = course.title.toLowerCase();
        const areaLower = studyArea.toLowerCase();
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

    if (sortBy === "tuition_low_high") {
      result.sort((a, b) => (a.tuition_fee || 0) - (b.tuition_fee || 0));
    } else if (sortBy === "tuition_high_low") {
      result.sort((a, b) => (b.tuition_fee || 0) - (a.tuition_fee || 0));
    }

    return result;
  }, [courses, universities, searchQuery, intake, level, studyArea, sortBy]);

  const handleReset = () => {
    setSearchQuery("");
    setIntake("all");
    setYear("all");
    setLevel("all");
    setStudyArea("all");
    setSortBy("best_match");
    setCurrentPage(1);
  };

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const hasActiveFilters = searchQuery || intake !== "all" || year !== "all" || level !== "all" || studyArea !== "all";

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#2F4F97]" />
            <span className="text-sm font-semibold text-[#1E293B]">Filters</span>
          </div>
          {hasActiveFilters && (
            <button onClick={handleReset} className="text-xs text-[#2F4F97] hover:underline flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Program or university…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm border-gray-200 pl-8"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Degree Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Degree Level</label>
            <Select value={level} onValueChange={(v) => { setLevel(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-gray-200">
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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Study Area</label>
            <Select value={studyArea} onValueChange={(v) => { setStudyArea(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-gray-200">
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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Intake Month</label>
            <Select value={intake} onValueChange={(v) => { setIntake(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-gray-200">
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

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Year</label>
            <Select value={year} onValueChange={(v) => { setYear(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-9 text-sm border-gray-200">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick tags */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2F4F97] mr-2">
            <Sparkles className="h-3.5 w-3.5" />
            Quick Filters:
          </span>
          {[
            "Scholarship Available",
            "Affordable University",
            "English Waiver",
            "MBA Programs",
            "High Acceptance Rate",
          ].map(tag => (
            <button
              key={tag}
              className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 hover:text-[#2F4F97] py-1 px-2.5 rounded-full border border-gray-200 hover:border-[#2F4F97]/30 hover:bg-[#2F4F97]/5 transition-colors"
              onClick={() => toast.info(`Filter "${tag}" coming soon!`)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="space-y-4">

        {/* Results bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#1E293B]">{filteredCourses.length}</span> programs found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">Sort:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-8 text-xs border-gray-200">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best_match">Best Match</SelectItem>
                  <SelectItem value="tuition_low_high">Tuition: Low → High</SelectItem>
                  <SelectItem value="tuition_high_low">Tuition: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Cards */}
          <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16 px-4">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-sm text-gray-700 mb-1">No programs found</p>
                <p className="text-xs text-muted-foreground mb-4">Try adjusting your filters.</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {paginatedCourses.map((c) => {
                  const uni = universities[c.university_id];
                  const logoSrc = uni?.logo_url || (uni?.name ? UNIVERSITY_LOGOS[uni.name] : null);

                  return (
                    <div key={c.id} className="p-5 hover:bg-blue-50/30 transition-colors group">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

                        {/* Logo */}
                        <div className="w-20 h-16 shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-1.5">
                          {logoSrc ? (
                            <img src={logoSrc} alt={uni?.name || "Logo"} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <GraduationCap className="h-7 w-7 text-gray-300" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-sm text-[#1E293B] group-hover:text-[#2F4F97] transition-colors leading-tight">
                              {c.title}
                            </h3>
                            {c.degree_level && (
                              <Badge variant="secondary" className="bg-[#2F4F97]/10 text-[#2F4F97] border-transparent text-[10px]">
                                {c.degree_level}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-medium truncate">{uni?.name || "Malaysian University"}</span>
                            {uni?.city && <span className="text-gray-400">· {uni.city}</span>}
                          </div>

                          <div className="flex items-start gap-1.5 text-xs text-[#475569] leading-normal flex-wrap">
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>
                              <span className="font-semibold text-gray-800">
                                {c.tuition_fee != null ? `MYR ${c.tuition_fee.toLocaleString()}/yr` : "Tuition N/A"}
                              </span>
                              {" · "}
                              <span>{uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "Offer Letter Fee" : "Free Offer Letter"}</span>
                              {" · "}
                              <span>{c.duration || "Duration N/A"}</span>
                              {c.intake_months && c.intake_months.length > 0 && (
                                <>
                                  {" · Intakes: "}
                                  {(c.intake_months as string[]).map((intakeName, idx) => {
                                    const isActive = intakeName === getActiveIntake(c.intake_months);
                                    return (
                                      <span key={idx}>
                                        <span className={isActive ? "bg-[#EEF4FF] text-[#2F4F97] px-1.5 py-0.5 rounded font-semibold" : ""}>
                                          {intakeName.substring(0, 3)}
                                        </span>
                                        {idx < (c.intake_months?.length || 0) - 1 ? " & " : ""}
                                      </span>
                                    );
                                  })}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                          <Button
                            className="flex-1 md:flex-initial h-9 px-4 text-xs font-semibold rounded-lg gap-1.5"
                            onClick={() => navigate(`/partner-dashboard/apply?courseId=${c.id}`)}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Apply for Student
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 md:flex-initial h-9 px-4 text-xs font-semibold rounded-lg"
                            onClick={() => toast.info("Our support team will get back to you shortly!")}
                          >
                            Ask Us
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
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
          </Card>
        </div>
    </div>
  );
}
