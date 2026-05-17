import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
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

export default function Courses2() {
  const navigate = useNavigate();
  const { data: courses = [], isLoading: loadingCourses } = useTableData("courses");
  const { data: universities = [], isLoading: loadingUnis } = useTableData("universities");
  
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedArea, setSelectedArea] = useState<string>("All Areas");
  const [selectedUniId, setSelectedUniId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadCourse, setLeadCourse] = useState("");
  
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
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedLevel !== "All Levels" && !c.degree_level?.includes(selectedLevel)) return false;
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

  const handleApply = (courseTitle: string) => {
    setLeadCourse(courseTitle);
    setLeadOpen(true);
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    
    const startPage = Math.floor((currentPage - 1) / 9) * 9 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 2) {
      pages.push("ellipsis");
      pages.push(totalPages - 1);
      pages.push(totalPages);
    } else if (endPage < totalPages) {
      for (let i = endPage + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const isLoading = loadingCourses || loadingUnis;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f7f8fa" }}>
      <MegaMenu />

      <div className="container mx-auto px-4 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}>
          Courses
        </h1>
        <div className="text-[15px] font-bold" style={{ color: "#515768", fontFamily: "Poppins, sans-serif" }}>
          Total courses: <span style={{ color: "#ffa300" }}>{filtered.length}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading courses" sublabel="Finding top programs" className="py-12" />
        ) : (
          <div className="flex flex-col">
            <div className="sticky top-[112px] z-30 pb-4 -mt-1" style={{ backgroundColor: "#f7f8fa", paddingTop: "16px", marginTop: "-1px", boxShadow: "0 -20px 0 0 #f7f8fa" }}>
              <div className="bg-white p-4 border flex flex-col lg:flex-row items-center gap-4 shadow-sm" style={{ borderColor: "#e8e8e8", borderRadius: "5px" }}>
                <div className="relative flex-1 w-full">
                  <Input
                    placeholder="Search by Course Title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10 h-11 text-[12.5px]"
                    style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: "#444444" }}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#999999" }} />
                </div>

                <div className="w-full lg:w-[200px]">
                  <Select value={selectedLevel} onValueChange={setSelectedLevel} modal={false}>
                    <SelectTrigger className="h-11 text-[12.5px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedLevel === "All Levels" ? "#999999" : "#444444" }}>
                      <SelectValue placeholder="Degree Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-[200px]">
                  <Select value={selectedArea} onValueChange={setSelectedArea} modal={false}>
                    <SelectTrigger className="h-11 text-[12.5px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedArea === "All Areas" ? "#999999" : "#444444" }}>
                      <SelectValue placeholder="Study Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_AREAS.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-[220px]">
                  <Select value={selectedUniId} onValueChange={setSelectedUniId} modal={false}>
                    <SelectTrigger className="h-11 text-[12.5px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedUniId === "all" ? "#999999" : "#444444" }}>
                      <SelectValue placeholder="Select University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {universities.map((u: any) => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedLevel("All Levels");
                    setSelectedArea("All Areas");
                    setSelectedUniId("all");
                  }}
                  className="p-2 text-[#999999] hover:text-[#181d29] transition-colors shrink-0"
                  title="Reset Filters"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {paged.length === 0 ? (
              <div className="text-center py-20" style={{ color: "#999999", fontFamily: "Poppins, sans-serif" }}>
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-semibold text-lg mb-1" style={{ color: "#515768" }}>No courses found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {paged.map((c: any) => {
                  const uni = universities.find((u: any) => u.id === c.university_id);
                  return (
                    <div key={c.id} className="bg-white py-10 md:py-12 px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center gap-6 border" style={{ borderColor: "#e8e8e8", borderRadius: "5px" }}>
                      <Link to={`/courses/${c.id}`} className="shrink-0 w-[200px] h-[120px] flex items-center justify-center overflow-hidden">
                        {uni && (uni.logo_url || UNIVERSITY_LOGOS[uni.name]) ? (
                          <img src={uni.logo_url || UNIVERSITY_LOGOS[uni.name]} alt={uni.name} className="max-w-full max-h-full object-contain p-2" />
                        ) : (
                          <GraduationCap className="h-10 w-10" style={{ color: "#cacdd4" }} />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/courses/${c.id}`}>
                          <h3 className="font-semibold hover:underline" style={{ fontFamily: "Poppins, sans-serif", fontSize: "20px", color: "#181d29" }}>{c.title}</h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-6 mb-6">
                          <Building2 className="h-4 w-4 text-[#ffa300]" />
                          <span className="text-[15px] font-medium text-gray-600">{uni?.name || "Malaysian University"} [{uni?.city || "Malaysia"}]</span>
                        </div>
                        
                        {/* Metadata Row - minimal style */}
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[13px] text-gray-500 mb-4">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-[#ffa300]" />
                            <span className="font-semibold text-[#181d29]">MYR {Number(c.tuition_fee).toLocaleString()} / Year</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-sm ${uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "bg-red-400" : "bg-green-400"}`} />
                            <span>{uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "Offer Letter Fees Applies" : "Free Offer Letter"}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{c.duration || "N/A"}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span>Intake: {Array.isArray(c.intake_months) ? c.intake_months.join(", ") : "Various"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-sm text-[11px] font-bold uppercase tracking-wider">
                            <GraduationCap className="h-3 w-3" />
                            {c.degree_level}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0 w-full md:w-[180px]">
                        <Button
                          className="h-11 px-8 font-bold text-base"
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
                        <Button
                          variant="outline"
                          className="h-11 px-8 font-bold text-base w-full"
                          style={{
                            borderColor: "#9273b6",
                            color: "#9273b6",
                            borderRadius: "5px",
                            fontFamily: "Poppins, sans-serif",
                            backgroundColor: "transparent",
                          }}
                          onClick={() => navigate("/contact")}
                        >
                          Ask Us
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
                <button disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)} className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30" style={{ borderColor: "#cacdd4", borderRadius: "2px", color: "#515768", backgroundColor: "#ffffff" }}><ChevronLeft className="h-4 w-4" /></button>
                {getPageNumbers().map((page, i) => page === "ellipsis" ? (
                  <span key={`ellipsis-${i}`} className="h-9 w-9 flex items-center justify-center text-sm font-medium tracking-[0.2em]" style={{ color: "#515768" }}>...</span>
                ) : (
                  <button key={page} onClick={() => changePage(page)} className="h-9 w-9 flex items-center justify-center border text-sm font-medium transition-colors" style={{ borderRadius: "2px", fontFamily: "Poppins, sans-serif", backgroundColor: currentPage === page ? "#ffa300" : "#ffffff", color: currentPage === page ? "#181d29" : "#515768", borderColor: currentPage === page ? "#ffa300" : "#cacdd4" }}>{page}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)} className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30" style={{ borderColor: "#cacdd4", borderRadius: "2px", color: "#515768", backgroundColor: "#ffffff" }}><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      <PublicFooter />
      <LeadCaptureModal open={leadOpen} onOpenChange={setLeadOpen} defaultCourse={leadCourse} source="course_listing" />
    </div>
  );
}
