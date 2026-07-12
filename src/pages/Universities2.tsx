import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { generateSlug } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  GraduationCap,
  RotateCcw,
  Filter,
  ChevronDown
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: universities = [], isLoading } = useTableData("universities", { orderBy: "name" });
  const { data: courses = [], isLoading: loadingCourses } = useTableData("courses");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("All Levels");
  const [selectedField, setSelectedField] = useState<string>("All Fields");
  const [selectedOfferLetter, setSelectedOfferLetter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

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


  const [appliedFilters, setAppliedFilters] = useState({
    search: searchParams.get("search") || "",
    selectedCity: "all",
    selectedOfferLetter: "all",
    selectedLevel: "All Levels",
    selectedField: "All Fields",
  });

  const applyFilters = () => {
    setAppliedFilters({
      search,
      selectedCity,
      selectedOfferLetter,
      selectedLevel,
      selectedField
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCity("all");
    setSelectedOfferLetter("all");
    setSelectedLevel("All Levels");
    setSelectedField("All Fields");
    setAppliedFilters({
      search: "",
      selectedCity: "all",
      selectedOfferLetter: "all",
      selectedLevel: "All Levels",
      selectedField: "All Fields"
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const filtered = useMemo(() => {
    const { search, selectedCity, selectedOfferLetter, selectedLevel, selectedField } = appliedFilters;
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
          const hasLevel = uniCourses.some((c: any) => {
            const titleLower = c.title?.toLowerCase() || "";
            let effLevel = c.degree_level || "";
            if (titleLower.includes("advanced diploma")) effLevel = "Advanced Diploma";
            else if (titleLower.includes("diploma")) effLevel = "Diploma";
            else if (titleLower.includes("certificate")) effLevel = "Certificate";
            else if (titleLower.includes("foundation")) effLevel = "Foundation";
            return effLevel.includes(mappedLevel);
          });
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
  }, [universities, courses, appliedFilters]);

  const [sortBy, setSortBy] = useState("best_match");

  const sorted = useMemo(() => {
    let result = [...filtered];
    if (sortBy === "name_a_z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_z_a") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };



  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 3) {
        end = 5;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
      }
      
      if (start > 2) pages.push("ellipsis");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("ellipsis");
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu />
      {/* Main Content */}
      <div className="w-full max-w-[1640px] mx-auto px-4 lg:px-8 pt-10 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading universities" sublabel="Finding top institutions" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ─── SIDEBAR ─── */}
            <aside className="lg:w-[320px] xl:w-[360px] shrink-0">
              <div className="overflow-hidden border bg-white" style={{ borderColor: "#e8e8e8", borderRadius: "12px" }}>
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between p-4 lg:hidden text-[#1E293B] font-semibold border-b" style={{ borderColor: "#e8e8e8" }}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Universities
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Sidebar Header */}
                  <div className="px-5 py-[22px] flex items-center justify-between bg-[#2F4F97] hidden lg:flex">
                    <h3 className="font-semibold text-[20px] text-white">Search by Filter</h3>
                  </div>

                  {/* Sidebar Body */}
                  <div className="px-5 py-5 space-y-4">
                    <div className="w-full">
                      <label className="block text-[16px] font-medium text-[#1E293B] mb-1.5">Search by University Name</label>
                      <div className="relative w-full">
                        <Input
                          placeholder="Enter University Name"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pr-10 h-11 text-[12px] md:text-[14px]"
                          style={{ borderColor: "#cacdd4", borderRadius: "12px", fontFamily: "Poppins, sans-serif", color: "#444444" }}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#999999" }} />
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="block text-[16px] font-medium text-[#1E293B] mb-1.5">Level of Interest</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel} modal={false}>
                        <SelectTrigger className="h-11 text-[12px] md:text-[14px]" style={{ borderColor: "#cacdd4", borderRadius: "12px", fontFamily: "Poppins, sans-serif", color: selectedLevel === "All Levels" ? "#999999" : "#444444" }}>
                          <SelectValue placeholder="Enter Level of Interest" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEGREE_LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    

                    <div className="w-full">
                      <label className="block text-[16px] font-medium text-[#1E293B] mb-1.5">Locations</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity} modal={false}>
                        <SelectTrigger className="h-11 text-[12px] md:text-[14px]" style={{ borderColor: "#cacdd4", borderRadius: "12px", fontFamily: "Poppins, sans-serif", color: selectedCity === "all" ? "#999999" : "#444444" }}>
                          <SelectValue placeholder="Select A State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          {cities.map((city: string) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <label className="block text-[16px] font-medium text-[#1E293B] mb-1.5">Offer Letter Fee</label>
                      <Select value={selectedOfferLetter} onValueChange={setSelectedOfferLetter} modal={false}>
                        <SelectTrigger className="h-11 text-[12px] md:text-[14px]" style={{ borderColor: "#cacdd4", borderRadius: "12px", fontFamily: "Poppins, sans-serif", color: selectedOfferLetter === "all" ? "#999999" : "#444444" }}>
                          <SelectValue placeholder="Select offer letter fee type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Offer Letters</SelectItem>
                          <SelectItem value="free">Free Offer Letter</SelectItem>
                          <SelectItem value="paid">Offer Letter Fees Applies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Apply/Reset Buttons */}
                  <div className="flex items-center gap-3 px-5 pb-5">
                    <Button 
                      className="flex-1 font-bold h-11 text-sm bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97]"
                      onClick={applyFilters}
                    >
                      Apply Filter
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 font-bold h-11 text-sm border-gray-200 text-[#1E293B] hover:bg-[#2F4F97] hover:text-white transition-colors"
                      onClick={resetFilters}
                    >
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            {/* ─── CONTENT AREA ─── */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-400 pb-4 mb-0 gap-4">
                <h1 className="text-[20px] md:text-[22px] font-semibold shrink-0" style={{ fontFamily: "Poppins, sans-serif", color: "#1E293B" }}>
                  Universities
                </h1>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4 text-[12px] md:text-[14px]">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-[#1E293B] whitespace-nowrap">Sort By:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px] h-[34px] border border-gray-300 rounded-xl px-3 text-gray-600 bg-white focus:ring-0 focus:ring-offset-0 focus:border-[#2F4F97]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="best_match">Best Match (Default)</SelectItem>
                        <SelectItem value="name_a_z">Name (A to Z)</SelectItem>
                        <SelectItem value="name_z_a">Name (Z to A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  
                  
                  <div className="font-medium text-gray-600 whitespace-nowrap shrink-0">
                    Total Universities: {filtered.length}
                  </div>
                </div>
              </div>
              {paged.length === 0 ? (
                <div
                  className="text-center py-20"
                  style={{ color: "#999999", fontFamily: "Poppins, sans-serif" }}
                >
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-semibold text-lg mb-1" style={{ color: "#64748B" }}>
                    No universities found
                  </p>
                  <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-400">
                  {paged.map((u: any) => {
                    const courseCount = courseCountMap[u.id] || 0;
                    return (
                      <div
                        key={u.id}
                        className="bg-white py-8 lg:py-11 group"
                      >
                        <div className="flex flex-row gap-4 md:gap-6 lg:gap-8 items-start md:items-center">
                          {/* Left: Logo */}
                          <Link
                            to={`/universities/${generateSlug(u.name)}`}
                            className="w-[100px] md:w-[170px] lg:w-[200px] shrink-0 h-[100px] md:h-[110px] flex items-center justify-center overflow-hidden"
                          >
                            {u.logo_url || UNIVERSITY_LOGOS[u.name] ? (
                              <img
                                src={u.logo_url || UNIVERSITY_LOGOS[u.name]}
                                alt={u.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.insertAdjacentHTML('afterend', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cacdd4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.018a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.832l8.57 3.064a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>');
                                }}
                              />
                            ) : (
                              <GraduationCap className="h-10 w-10 text-gray-300" />
                            )}
                          </Link>

                          <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                          {/* Middle: Info */}
                          <div className="min-w-0 flex flex-col justify-center space-y-4">
                            <Link to={`/universities/${generateSlug(u.name)}`}>
                              <h3 className="font-medium hover:underline text-[17px] md:text-[18px] text-[#1E293B] leading-tight mb-1">
                                {u.name}
                              </h3>
                            </Link>
                            
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3 text-[12px] md:text-[14px] text-[#475569]">
                                <MapPin className="h-4 w-4 shrink-0 text-[#475569]" />
                                <span>{u.city || "Malaysia"}, Malaysia</span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-[12px] md:text-[14px] text-[#475569]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail shrink-0 text-[#475569]"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                <span>{PAID_OFFER_LETTER_UNIS.includes(u.name) ? "Offer Letter Fees Applies" : "Free Offer Letter"}</span>
                              </div>

                              <div className="text-[12px] md:text-[14px] text-[#475569] mt-1">
                                {courseCount} courses
                              </div>
                            </div>
                          </div>

                          {/* Right: Buttons */}
                          <div className="flex flex-row lg:flex-col gap-2 md:gap-3 mt-1 lg:mt-0 shrink-0 lg:w-[140px]">
                            <Button
                              className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-xl border-2 border-[#1E293B] h-10 px-3 text-[13px] font-medium w-[110px] lg:w-full"
                              onClick={() => navigate(`/apply?universityId=${u.id}`)}
                            >
                              Apply Now
                            </Button>
                            <Link to={`/universities/${generateSlug(u.name)}`} className="block">
                              <Button
                                variant="outline"
                                className="bg-white text-[#2F4F97] hover:text-[#2F4F97] border-2 border-[#1E293B] rounded-xl h-10 px-3 text-[13px] font-medium w-[110px] lg:w-full hover:bg-gray-50"
                              >
                                Ask Us
                              </Button>
                            </Link>
                          </div>
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
                  {/* Previous */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                    className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "8px",
                      color: "#64748B",
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
                        style={{ color: "#64748B" }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => changePage(page)}
                        className="h-9 w-9 flex items-center justify-center border text-sm font-light transition-colors"
                        style={{
                          borderRadius: "8px",
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: currentPage === page ? "#2F4F97" : "#ffffff",
                          color: currentPage === page ? "#ffffff" : "#64748B",
                          borderColor: currentPage === page ? "#2F4F97" : "#cacdd4",
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
                      borderRadius: "8px",
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
