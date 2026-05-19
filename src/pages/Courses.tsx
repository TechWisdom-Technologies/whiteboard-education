import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
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
  Building2
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
  // removed lead variables
  
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedLevel, selectedArea, selectedUniId]);

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
  }, [courses, search, selectedLevel, selectedArea, selectedUniId]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f7f8fa" }}>
      <MegaMenu />

      {/* Page Header */}
      <div className="container mx-auto px-4 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}>
          Courses
        </h1>
        <div className="text-[15px] font-bold" style={{ color: "#515768", fontFamily: "Poppins, sans-serif" }}>
          Total courses: <span style={{ color: "#ffa300" }}>{filtered.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading courses" sublabel="Finding top programs" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ─── SIDEBAR ─── */}
            <aside className="lg:w-[350px] shrink-0">
              <div
                className="overflow-hidden lg:sticky lg:top-[152px] border"
                style={{
                  borderColor: "#e8e8e8",
                  borderRadius: "5px",
                }}
              >
                {/* Sidebar Header */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#fef1da" }}>
                  <h3
                    className="font-bold"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "20px",
                      lineHeight: "24px",
                      color: "#181d29",
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
                    className="text-[#999999] hover:text-[#181d29] transition-colors"
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
                          borderRadius: "5px",
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
                          borderRadius: "5px",
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
                          borderRadius: "5px",
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
                          borderRadius: "5px",
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
              </div>
            </aside>

            {/* ─── CONTENT AREA ─── */}
            <div className="flex-1 min-w-0">
              {paged.length === 0 ? (
                <div
                  className="text-center py-20"
                  style={{ color: "#999999", fontFamily: "Poppins, sans-serif" }}
                >
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-semibold text-lg mb-1" style={{ color: "#515768" }}>
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
                        key={`${c.id || idx}-${selectedLevel}-${selectedArea}`}
                        className="bg-white py-10 md:py-12 px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center gap-6 border"
                        style={{
                          borderColor: "#e8e8e8",
                          borderRadius: "5px",
                        }}
                      >
                        {/* Logo */}
                        <Link
                          to={`/courses/${c.id}`}
                          className="shrink-0 w-[180px] h-[110px] flex items-center justify-center overflow-hidden"
                        >
                          {uni && (uni.logo_url || UNIVERSITY_LOGOS[uni.name]) ? (
                            <img
                              src={uni.logo_url || UNIVERSITY_LOGOS[uni.name]}
                              alt={uni.name}
                              className="max-w-full max-h-full object-contain p-2"
                            />
                          ) : (
                            <GraduationCap className="h-10 w-10" style={{ color: "#cacdd4" }} />
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/courses/${c.id}`}>
                            <h3
                              className="font-bold hover:underline mb-2"
                              style={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "20px",
                                lineHeight: "28px",
                                color: "#181d29",
                              }}
                            >
                              {c.title}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2 mb-3">
                            <Building2 className="h-4 w-4 text-[#ffa300]" />
                            <span className="text-sm font-medium text-gray-500">{uni?.name || "Malaysian University"} [{uni?.city || "Malaysia"}]</span>
                          </div>

                          {/* Metadata Row - your-uni style */}
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[13px] text-gray-600 mb-4 bg-gray-50/50 p-2.5 rounded-sm border border-gray-100/50">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-[#ffa300]" />
                              <span className="font-semibold text-[#181d29]">MYR {Number(c.tuition_fee).toLocaleString()} / Year</span>
                            </div>
                            
                            <div className="hidden sm:block text-gray-300">•</div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-sm ${uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "bg-red-400" : "bg-green-400"}`} />
                              <span>{uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "Offer Letter Fees Applies" : "Free Offer Letter"}</span>
                            </div>

                            <div className="hidden sm:block text-gray-300">•</div>

                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span>{c.duration || "N/A"}</span>
                            </div>

                            <div className="hidden sm:block text-gray-300">•</div>

                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                              <span>Intake: {Array.isArray(c.intake_months) ? c.intake_months.join(", ") : "Various"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-sm text-[11px] font-bold uppercase tracking-wider">
                              <GraduationCap className="h-3 w-3" />
                              {(() => {
                                const titleLower = c.title?.toLowerCase() || "";
                                if (titleLower.includes("advanced diploma")) return "Advanced Diploma";
                                if (titleLower.includes("diploma")) return "Diploma";
                                if (titleLower.includes("certificate")) return "Certificate";
                                if (titleLower.includes("foundation")) return "Foundation";
                                return c.degree_level;
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2.5 shrink-0 w-full md:w-auto">
                          <Button
                            className="h-9 px-6 font-bold text-sm"
                            style={{
                              backgroundColor: "#ffa300",
                              color: "#181d29",
                              borderRadius: "5px",
                              fontFamily: "Poppins, sans-serif",
                              border: "1px solid #ffa300",
                            }}
                            onClick={() => navigate(`/apply?courseId=${c.id}`)}
                          >
                            Apply Now
                          </Button>
                          <Link to={`/courses/${c.id}`} className="block">
                            <Button
                              variant="outline"
                              className="h-9 px-6 font-bold text-sm w-full"
                              style={{
                                borderColor: "#9273b6",
                                color: "#9273b6",
                                borderRadius: "5px",
                                fontFamily: "Poppins, sans-serif",
                                backgroundColor: "transparent",
                              }}
                            >
                              Ask Us
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-1.5 mt-10 mb-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                    className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "4px",
                      color: "#515768",
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
                          backgroundColor: currentPage === page ? "#ffa300" : "#ffffff",
                          color: currentPage === page ? "#181d29" : "#515768",
                          borderColor: currentPage === page ? "#ffa300" : "#cacdd4",
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
                      color: "#515768",
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
