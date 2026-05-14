import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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
  FileText,
  GraduationCap,
  RotateCcw,
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
  "Bachelor's Degree",
  "Foundation / A-level",
  "Diploma",
  "Certificate",
  "Advanced Diploma",
  "Master's Degree",
  "Doctoral Degree (PhD)"
];

const LEVEL_MAP: Record<string, string> = {
  "Bachelor's Degree": "Bachelor",
  "Foundation / A-level": "Foundation",
  "Diploma": "Diploma",
  "Certificate": "Certificate",
  "Advanced Diploma": "Advanced Diploma",
  "Master's Degree": "Master",
  "Doctoral Degree (PhD)": "PhD"
};

const FIELDS_OF_STUDY = [
  "All Fields",
  "Business & Management",
  "Engineering & Technology",
  "Computer Science & IT",
  "Medicine & Health Sciences",
  "Arts, Design & Media",
  "Science & Mathematics",
  "Law & Humanities"
];

const FIELD_KEYWORDS: Record<string, string[]> = {
  "Business & Management": ["business", "management", "commerce", "accounting", "finance", "marketing", "mba", "administration"],
  "Engineering & Technology": ["engineering", "technology", "mechanical", "civil", "electrical", "mechatronics", "manufacturing"],
  "Computer Science & IT": ["computer", "computing", "software", "information technology", "cyber", "data", "ai", "intelligence", "it"],
  "Medicine & Health Sciences": ["medicine", "nursing", "pharmacy", "dental", "health", "biomedical", "mbbs", "clinical", "surgery"],
  "Arts, Design & Media": ["art", "design", "media", "creative", "communication", "animation", "music", "film"],
  "Science & Mathematics": ["science", "mathematics", "physics", "chemistry", "biology", "actuarial", "statistics"],
  "Law & Humanities": ["law", "humanities", "social", "psychology", "education", "arts", "language", "english"]
};

const PAID_OFFER_LETTER_UNIS = [
  "Universiti Putra Malaysia (UPM)",
  "UTM University Malaysia",
  "UTeM University Malaysia",
  "UTM SPACE University Malaysia",
  "Swinburne University of Technology Sarawak Campus"
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

export default function Universities() {
  const { data: universities = [], isLoading } = useTableData("universities", { orderBy: "ranking" });
  const { data: courses = [], isLoading: loadingCourses } = useTableData("courses");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedField, setSelectedField] = useState<string>("All Fields");
  const [selectedOfferLetter, setSelectedOfferLetter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadUni, setLeadUni] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  // Count courses per university
  const courseCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((c: any) => {
      map[c.university_id] = (map[c.university_id] || 0) + 1;
    });
    return map;
  }, [courses]);

  const cities = useMemo(
    () => [...new Set(universities.map((u: any) => u.city).filter(Boolean))].sort(),
    [universities]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCity, selectedLevel, selectedField, selectedOfferLetter]);

  const filtered = useMemo(() => {
    return universities.filter((u: any) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCity !== "all" && u.city !== selectedCity) return false;

      const isPaid = PAID_OFFER_LETTER_UNIS.includes(u.name);
      if (selectedOfferLetter === "free" && isPaid) return false;
      if (selectedOfferLetter === "paid" && !isPaid) return false;

      const uniCourses = courses.filter((c: any) => c.university_id === u.id);

      if (selectedLevel !== "All Levels") {
        const mappedLevel = LEVEL_MAP[selectedLevel];
        if (mappedLevel) {
          const hasLevel = uniCourses.some((c: any) => c.degree_level?.includes(mappedLevel));
          if (!hasLevel) return false;
        }
      }

      if (selectedField !== "All Fields") {
        const keywords = FIELD_KEYWORDS[selectedField];
        if (keywords) {
          const hasField = uniCourses.some((c: any) => {
            const title = c.title?.toLowerCase() || "";
            return keywords.some(kw => title.includes(kw));
          });
          if (!hasField) return false;
        }
      }

      return true;
    });
  }, [universities, courses, search, selectedCity, selectedOfferLetter, selectedLevel, selectedField]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApply = (uniName: string) => {
    setLeadUni(uniName);
    setLeadOpen(true);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    
    // Dynamic sliding window of 10 pages (e.g., 1-10, 10-19, 19-28)
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f7f8fa" }}>
      <MegaMenu />

      {/* Page Header */}
      <div className="container mx-auto px-4 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}>
          Universities
        </h1>
        <div className="text-[15px] font-bold" style={{ color: "#515768", fontFamily: "Poppins, sans-serif" }}>
          Total universities: <span style={{ color: "#ffa300" }}>{filtered.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading universities" sublabel="Finding top institutions" className="py-12" />
        ) : (
          <div className="flex flex-col">
            {/* Top Filters Row Wrapper - Sticky */}
            <div className="sticky top-[112px] z-30 pb-4 -mt-1" style={{ backgroundColor: "#f7f8fa", paddingTop: "16px", marginTop: "-1px", boxShadow: "0 -20px 0 0 #f7f8fa" }}>
              <div className="bg-white p-4 border flex flex-col lg:flex-row items-center gap-4 shadow-sm" style={{ borderColor: "#e8e8e8", borderRadius: "5px" }}>
              <div className="relative flex-1 w-full">
                <Input
                  placeholder="Search by University Name"
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
                    <SelectValue placeholder="Level of Interest" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-[200px]">
                <Select value={selectedField} onValueChange={setSelectedField} modal={false}>
                  <SelectTrigger className="h-11 text-[12.5px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedField === "All Fields" ? "#999999" : "#444444" }}>
                    <SelectValue placeholder="Field of Study" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS_OF_STUDY.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-[180px]">
                <Select value={selectedCity} onValueChange={setSelectedCity} modal={false}>
                  <SelectTrigger className="h-11 text-[12.5px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedCity === "all" ? "#999999" : "#444444" }}>
                    <SelectValue placeholder="Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {cities.map((city: string) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-[220px]">
                <Select value={selectedOfferLetter} onValueChange={setSelectedOfferLetter} modal={false}>
                  <SelectTrigger className="h-11 text-[12.5px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedOfferLetter === "all" ? "#999999" : "#444444" }}>
                    <SelectValue placeholder="Offer Letter Fee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offer Letters</SelectItem>
                    <SelectItem value="free">Free Offer Letter</SelectItem>
                    <SelectItem value="paid">Offer Letter Fees Applies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCity("all");
                  setSelectedLevel("All Levels");
                  setSelectedField("All Fields");
                  setSelectedOfferLetter("all");
                }}
                className="p-2 text-[#999999] hover:text-[#181d29] transition-colors shrink-0"
                title="Reset Filters"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            </div>
              {paged.length === 0 ? (
                <div
                  className="text-center py-20"
                  style={{ color: "#999999", fontFamily: "Poppins, sans-serif" }}
                >
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-semibold text-lg mb-1" style={{ color: "#515768" }}>
                    No universities found
                  </p>
                  <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {paged.map((u: any) => {
                    const courseCount = courseCountMap[u.id] || 0;
                    return (
                      <div
                        key={u.id}
                        className="bg-white py-10 md:py-12 px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center gap-6 border"
                        style={{
                          borderColor: "#e8e8e8",
                          borderRadius: "5px",
                        }}
                      >
                        {/* Logo */}
                        <Link
                          to={`/universities/${u.id}`}
                          className="shrink-0 w-[240px] h-[150px] flex items-center justify-center overflow-hidden"
                        >
                          {u.logo_url || UNIVERSITY_LOGOS[u.name] ? (
                            <img
                              src={u.logo_url || UNIVERSITY_LOGOS[u.name]}
                              alt={u.name}
                              className="max-w-full max-h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                                // Fallback handled by parent visually being empty, or we could insert an SVG
                                e.currentTarget.insertAdjacentHTML('afterend', '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cacdd4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.018a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.832l8.57 3.064a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>');
                              }}
                            />
                          ) : (
                            <GraduationCap className="h-10 w-10" style={{ color: "#cacdd4" }} />
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/universities/${u.id}`}>
                            <h3
                              className="font-semibold hover:underline mb-3"
                              style={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "22px",
                                lineHeight: "30px",
                                color: "#181d29",
                              }}
                            >
                              {u.name}
                            </h3>
                          </Link>

                          <div className="flex flex-col gap-2">
                            {/* Location */}
                            <div className="flex items-center gap-2">
                              <MapPin className="shrink-0" style={{ width: "15px", height: "15px", color: "#ffa300" }} />
                              <span
                                style={{
                                  fontFamily: "Poppins, sans-serif",
                                  fontSize: "15px",
                                  color: "#444444",
                                }}
                              >
                                {u.city || "Malaysia"}, Malaysia
                              </span>
                            </div>

                            {/* Offer Letter */}
                            <div className="flex items-center gap-2">
                              <FileText className="shrink-0" style={{ width: "15px", height: "15px", color: "#515768" }} />
                              <span
                                style={{
                                  fontFamily: "Poppins, sans-serif",
                                  fontSize: "15px",
                                  color: "#444444",
                                }}
                              >
                                {PAID_OFFER_LETTER_UNIS.includes(u.name) ? "Offer Letter Fees Applies" : "Free Offer Letter"}
                              </span>
                            </div>

                            {/* Course count */}
                            <div className="flex items-center gap-2">
                              <BookOpen className="shrink-0" style={{ width: "15px", height: "15px", color: "#515768" }} />
                              <span
                                className="font-semibold"
                                style={{
                                  fontFamily: "Poppins, sans-serif",
                                  fontSize: "15px",
                                  color: "#444444",
                                }}
                              >
                                {courseCount} courses
                              </span>
                            </div>
                            </div>
                          </div>
                        {/* Action Buttons */}
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
                            onClick={() => handleApply(u.name)}
                          >
                            Apply Now
                          </Button>
                          <Link to={`/universities/${u.id}`} className="block">
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
                <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
                  {/* Previous */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                    className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "2px",
                      color: "#515768",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, i) =>
                    page === "ellipsis" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="h-9 w-9 flex items-center justify-center text-sm font-medium tracking-[0.2em]"
                        style={{ color: "#515768" }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => changePage(page)}
                        className="h-9 w-9 flex items-center justify-center border text-sm font-medium transition-colors"
                        style={{
                          borderRadius: "2px",
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

                  {/* Next */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => changePage(currentPage + 1)}
                    className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "2px",
                      color: "#515768",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
        )}
      </div>

      <PublicFooter />
      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultUniversity={leadUni}
        source="university_listing"
      />
    </div>
  );
}
