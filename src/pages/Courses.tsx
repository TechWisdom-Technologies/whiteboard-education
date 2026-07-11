import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { useCourseCompare } from "@/contexts/CourseCompareContext";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { getActiveIntake } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Clock,
  DollarSign,
  Building2,
  Layers,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 10;

const DEGREE_LEVELS = [
  "All Levels",
  "Bachelor",
  "Foundation",
  "Diploma",
  "Advanced Diploma",
  "Certificate",
  "Master",
  "PhD"
];

const STUDY_AREAS = [
  "All Areas",
  "Business & Management",
  "Engineering",
  "Computer Science & IT",
  "Medicine & Health",
  "Arts & Design",
  "Natural Sciences",
  "Law",
  "Social Sciences"
];

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
  "Swinburne University of Technology Sarawak Campus"
];

export default function Courses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addCourse, removeCourse, isComparing, compareList } = useCourseCompare();
  const { data: courses = [], isLoading: loadingCourses } = useTableData("courses");
  const { data: universities = [], isLoading: loadingUnis } = useTableData("universities");
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedArea, setSelectedArea] = useState<string>("All Areas");
  const [selectedUniId, setSelectedUniId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const gridRef = useRef<HTMLDivElement>(null);

  const [appliedFilters, setAppliedFilters] = useState({
    search: searchParams.get("search") || "",
    selectedLevel: "All Levels",
    selectedArea: "All Areas",
    selectedUniId: "all"
  });

  const applyFilters = () => {
    setAppliedFilters({
      search,
      selectedLevel,
      selectedArea,
      selectedUniId
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedLevel("All Levels");
    setSelectedArea("All Areas");
    setSelectedUniId("all");
    setAppliedFilters({
      search: "",
      selectedLevel: "All Levels",
      selectedArea: "All Areas",
      selectedUniId: "all"
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const AREA_KEYWORDS: Record<string, string[]> = {
    "Business & Management": ["business", "management", "commerce", "accounting", "finance", "marketing", "mba", "administration", "economics", "entrepreneurship"],
    "Engineering": ["engineering", "mechanical", "civil", "electrical", "mechatronics", "manufacturing", "chemical", "petroleum", "aerospace"],
    "Computer Science & IT": ["computer", "computing", "software", "information technology", "cyber", "data", "ai", "intelligence", "it", "network", "programming", "cloud"],
    "Medicine & Health": ["medicine", "nursing", "pharmacy", "dental", "health", "biomedical", "mbbs", "clinical", "surgery", "physiotherapy", "nutrition"],
    "Arts & Design": ["art", "design", "media", "creative", "communication", "animation", "music", "film", "architecture", "interior", "fashion"],
    "Natural Sciences": ["science", "mathematics", "physics", "chemistry", "biology", "actuarial", "statistics", "environmental", "biotechnology"],
    "Law": ["law", "llb", "legal", "jurisprudence"],
    "Social Sciences": ["social", "psychology", "education", "arts", "language", "english", "politics", "international relations", "sociology"]
  };

  const filtered = useMemo(() => {
    const { search, selectedLevel, selectedArea, selectedUniId } = appliedFilters;
    return courses.filter((c: any) => {
      const titleLower = c.title?.toLowerCase() || "";
      let effLevel = c.degree_level || "";
      if (titleLower.includes("advanced diploma")) effLevel = "Advanced Diploma";
      else if (titleLower.includes("diploma")) effLevel = "Diploma";
      else if (titleLower.includes("certificate")) effLevel = "Certificate";
      else if (titleLower.includes("foundation")) effLevel = "Foundation";

      if (search && !titleLower.includes(search.toLowerCase())) return false;
      if (selectedLevel !== "All Levels" && !effLevel.toLowerCase().includes(selectedLevel.toLowerCase())) return false;
      if (selectedUniId !== "all" && String(c.university_id) !== selectedUniId) return false;
      
      if (selectedArea !== "All Areas") {
        const keywords = AREA_KEYWORDS[selectedArea];
        if (keywords) {
          const title = c.title?.toLowerCase() || "";
          const category = c.category?.toLowerCase() || "";
          const matches = keywords.some(kw => title.includes(kw) || category.includes(kw));
          if (!matches) return false;
        }
      }
      
      return true;
    });
  }, [courses, appliedFilters]);

  const [sortBy, setSortBy] = useState("best_match");

  const sorted = useMemo(() => {
    let result = [...filtered];
    if (sortBy === "tuition_low_high") {
      result.sort((a, b) => Number(a.tuition_fee) - Number(b.tuition_fee));
    } else if (sortBy === "tuition_high_low") {
      result.sort((a, b) => Number(b.tuition_fee) - Number(a.tuition_fee));
    }
    return result;
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // removed handleApply

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const isLoading = loadingCourses || loadingUnis;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-10 pb-16 flex-1 w-full" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading courses" sublabel="Finding top programs" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ─── SIDEBAR ─── */}
            <aside className="lg:w-[320px] xl:w-[340px] shrink-0">
              <div
                className="overflow-hidden lg:sticky lg:top-[152px] border"
                style={{
                  borderColor: "#e8e8e8",
                  borderRadius: "12px",
                }}
              >
                {/* Sidebar Header */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#F8FAFC" }}>
                  <h3
                    className="font-bold"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "20px",
                      lineHeight: "24px",
                      color: "#1E293B",
                    }}
                  >
                    Search by Filter
                  </h3>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedLevel("All Levels");
                      setSelectedArea("All Areas");
                      setSelectedUniId("all");
                    }}
                    className="text-[#999999] hover:text-[#1E293B] transition-colors"
                    title="Reset Filters"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>

                {/* Sidebar Body */}
                <div className="bg-white px-5 py-5 space-y-4">
                  {/* Search Input */}
                  <div>
                    <div className="relative">
                      <Input
                        placeholder="Search by Course Title"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 h-11"
                        style={{
                          borderColor: "#cacdd4",
                          borderRadius: "12px",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          color: "#444444",
                        }}
                      />
                      <Search
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: "#999999" }}
                      />
                    </div>
                  </div>

                  {/* Degree Level */}
                  <div>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel} modal={false}>
                      <SelectTrigger
                        className="h-11"
                        style={{
                          borderColor: "#cacdd4",
                          borderRadius: "12px",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          color: selectedLevel === "All Levels" ? "#999999" : "#444444",
                        }}
                      >
                        <SelectValue placeholder="Degree Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREE_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Study Area */}
                  <div>
                    <Select value={selectedArea} onValueChange={setSelectedArea} modal={false}>
                      <SelectTrigger
                        className="h-11"
                        style={{
                          borderColor: "#cacdd4",
                          borderRadius: "12px",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          color: selectedArea === "All Areas" ? "#999999" : "#444444",
                        }}
                      >
                        <SelectValue placeholder="Study Area" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_AREAS.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* University Filter */}
                  <div>
                    <Select value={selectedUniId} onValueChange={setSelectedUniId} modal={false}>
                      <SelectTrigger
                        className="h-11"
                        style={{
                          borderColor: "#cacdd4",
                          borderRadius: "12px",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          color: selectedUniId === "all" ? "#999999" : "#444444",
                        }}
                      >
                        <SelectValue placeholder="Select University" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Universities</SelectItem>
                        {universities.map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Apply/Reset Buttons */}
                <div className="flex items-center gap-3 px-5 pb-5 bg-white">
                  <Button 
                    className="flex-1 font-bold h-11 text-sm bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97]"
                    onClick={applyFilters}
                  >
                    Apply Filter
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 font-bold h-11 text-sm border-gray-200 text-[#1E293B] hover:bg-gray-50"
                    onClick={resetFilters}
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </aside>

            {/* ─── CONTENT AREA ─── */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
                <h1 className="text-[20px] md:text-[22px] font-bold shrink-0" style={{ fontFamily: "Poppins, sans-serif", color: "#1E293B" }}>
                  Courses
                </h1>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4 text-[14px]">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-[#1E293B] whitespace-nowrap">Sort By:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px] h-[34px] border border-gray-300 rounded-xl px-3 text-gray-600 bg-white focus:ring-0 focus:ring-offset-0 focus:border-[#2F4F97]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="best_match">Best Match (Default)</SelectItem>
                        <SelectItem value="tuition_low_high">Tuition cost (Low to high)</SelectItem>
                        <SelectItem value="tuition_high_low">Tuition cost (High to Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  
                  
                  <div className="font-medium text-gray-600 whitespace-nowrap shrink-0">
                    Total Courses: {filtered.length}
                  </div>
                </div>
              </div>
              {paged.length === 0 ? (
                <div
                  className="text-center py-20"
                  style={{ color: "#999999", fontFamily: "Poppins, sans-serif" }}
                >
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-semibold text-lg mb-1" style={{ color: "#64748B" }}>
                    No courses found
                  </p>
                  <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {paged.map((c: any, idx: number) => {
                    const uni = universities.find((u: any) => u.id === c.university_id);
                    return (
                      <div
                        key={c.id}
                        className="bg-white p-5 md:p-6 lg:p-8 border border-gray-200 rounded-3xl"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] lg:grid-cols-[180px_1fr_140px] gap-6 lg:gap-8 items-center lg:items-start">
                          {/* Left: Logo */}
                          <Link
                            to={`/courses/${generateSlug(c.title)}`}
                            className="w-full h-[100px] flex items-center justify-center overflow-hidden"
                          >
                            {uni && (uni.logo_url || UNIVERSITY_LOGOS[uni.name]) ? (
                              <img
                                src={uni.logo_url || UNIVERSITY_LOGOS[uni.name]}
                                alt={uni.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <GraduationCap className="h-10 w-10 text-gray-300" />
                            )}
                          </Link>

                          {/* Middle: Info */}
                          <div className="min-w-0 flex flex-col justify-center space-y-3">
                            <Link to={`/courses/${generateSlug(c.title)}`}>
                              <h3 className="font-medium hover:underline text-[18px] md:text-[20px] text-[#1E293B] leading-tight mb-1">
                                {c.title}
                              </h3>
                            </Link>

                            <div className="flex flex-col gap-3 mt-1">
                              <div className="flex items-center gap-2.5 text-[14px] text-[#64748B]">
                                <Building2 className="h-[18px] w-[18px] shrink-0 text-[#64748B]" />
                                <span className="truncate">{uni?.name || "Malaysian University"}</span>
                              </div>

                              <div className="flex items-start gap-2.5 text-[13px] md:text-[14px] text-[#64748B] leading-loose">
                                <Info className="h-[18px] w-[18px] shrink-0 text-[#64748B] mt-1 md:mt-[5px]" />
                                <span>
                                  MYR {Number(c.tuition_fee).toLocaleString()}/Year &bull; {uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "Offer Letter Fees Applies" : "Free Offer Letter"} &bull; {c.duration || "N/A"} &bull;{" "}
                                  {Array.isArray(c.intake_months) && c.intake_months.length > 0 ? (
                                    <>
                                      {c.intake_months.map((intake: string, idx: number) => {
                                        const isActive = intake === getActiveIntake(c.intake_months);
                                        return (
                                          <span key={idx}>
                                            <span className={isActive ? "bg-[#EEF4FF] text-[#2F4F97] px-1.5 py-0.5 rounded font-medium" : ""}>
                                              {intake.substring(0, 3)}
                                            </span>
                                            {idx < c.intake_months.length - 1 ? " & " : ""}
                                          </span>
                                        );
                                      })}
                                      {" Intake"}
                                    </>
                                  ) : "Various Intake"}
                                </span>
                              </div>
                            </div>

                            {/* Compare Button */}
                            <div className="pt-2">
                              <Button
                                size="sm"
                                className={`rounded-2xl font-medium text-[13px] h-9 px-4 transition-colors border bg-white ${
                                  isComparing(c.id) 
                                    ? "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]" 
                                    : "text-gray-500 border-gray-200 hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97]"
                                }`}
                                onClick={() => {
                                  if (isComparing(c.id)) {
                                    removeCourse(c.id);
                                  } else {
                                    if (compareList.length >= 3) {
                                      toast.error("You can only compare up to 3 courses at once.");
                                      return;
                                    }
                                    addCourse(c.id);
                                    toast.success("Added to comparison.");
                                  }
                                }}
                              >
                                <Layers className="h-4 w-4 mr-2" />
                                {isComparing(c.id) ? "Comparing" : "Compare"}
                              </Button>
                            </div>
                          </div>

                          {/* Right: Buttons */}
                          <div className="w-full md:col-span-2 lg:col-span-1 flex flex-col gap-3 mt-4 lg:mt-2">
                            <Button
                              className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-transparent h-9 px-3 font-bold"
                              onClick={() => navigate(`/apply?courseId=${c.id}`)}
                            >
                              Apply Now
                            </Button>
                            <Link to={`/courses/${generateSlug(c.title)}`} className="block w-full">
                              <Button
                                variant="outline"
                                className="bg-[#EEF4FF] text-[#2F4F97] border-[#2F4F97]/20 h-9 px-3 font-bold w-full hover:bg-[#EEF4FF]/80"
                              >
                                Ask Us
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                    className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "4px",
                      color: "#64748B",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {getPageNumbers().map((page, i) =>
                    page === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="h-9 w-9 flex items-center justify-center text-sm" style={{ color: "#999999" }}>…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => changePage(page)}
                        className="h-9 w-9 flex items-center justify-center border text-sm font-bold transition-colors"
                        style={{
                          borderRadius: "4px",
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: currentPage === page ? "#2F4F97" : "#ffffff",
                          color: currentPage === page ? "#1E293B" : "#64748B",
                          borderColor: currentPage === page ? "#2F4F97" : "#cacdd4",
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => changePage(currentPage + 1)}
                    className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "4px",
                      color: "#64748B",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
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
