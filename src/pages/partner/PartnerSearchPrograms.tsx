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
  Zap,
  CheckCircle2,
  Calendar
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
  "Swinburne University of Technology Sarawak Campus"
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
  const [country, setCountry] = useState("Malaysia");
  const [studyArea, setStudyArea] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [duration, setDuration] = useState("");
  const [requirement, setRequirement] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: univsData } = await supabase
          .from("universities")
          .select("id, name, city, logo_url");
        
        const univsMap = (univsData || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, University>);
        setUniversities(univsMap);

        const { data: coursesData } = await supabase
          .from("courses")
          .select("*");
          
        setCourses(coursesData || []);
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
        if (!titleLower.includes(areaLower) && 
            !(areaLower === 'medicine & health' && (titleLower.includes('medicine') || titleLower.includes('health') || titleLower.includes('nursing'))) &&
            !(areaLower === 'computer science & it' && (titleLower.includes('computer') || titleLower.includes('software') || titleLower.includes('it') || titleLower.includes('information')))) {
          return false;
        }
      }

      if (duration) {
        if (!course.duration || !course.duration.toLowerCase().includes(duration.toLowerCase())) return false;
      }

      if (requirement !== "all") {
        if (!course.entry_requirements) return false;
        const reqStr = JSON.stringify(course.entry_requirements).toLowerCase();
        if (!reqStr.includes(requirement.toLowerCase())) return false;
      }

      return true;
    });

    if (sortBy === "tuition_low_high") {
      result.sort((a, b) => (a.tuition_fee || 0) - (b.tuition_fee || 0));
    } else if (sortBy === "tuition_high_low") {
      result.sort((a, b) => (b.tuition_fee || 0) - (a.tuition_fee || 0));
    }

    return result;
  }, [courses, universities, searchQuery, intake, level, studyArea, duration, requirement, sortBy]);

  const handleReset = () => {
    setSearchQuery("");
    setIntake("all");
    setYear("all");
    setLevel("all");
    setCountry("Malaysia");
    setStudyArea("all");
    setStateFilter("all");
    setDuration("");
    setRequirement("all");
    setSortBy("best_match");
    setCurrentPage(1);
  };

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="text-center py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">Explore over 10,000+ Programs</h1>
        <p className="text-[#64748B]">Use our platform to search</p>
      </div>

      {/* Horizontal Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mx-auto max-w-6xl mb-6 relative z-10 transition-all">
        <div className="flex flex-col md:flex-row items-center md:divide-x divide-gray-200">
          
          {/* Search Programs */}
          <div className="flex-1 p-2 w-full border-b md:border-b-0 border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-1">Search Programs</div>
            <div className="flex items-center px-2">
              <Building2 className="w-4 h-4 text-[#2F4F97] mr-2 shrink-0" />
              <Input 
                placeholder="Search Program / University" 
                value={searchQuery} 
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                className="border-0 shadow-none h-8 px-0 text-sm focus-visible:ring-0 bg-transparent rounded-none"
              />
            </div>
          </div>
          
          {/* Intake */}
          <div className="flex-1 p-2 w-full border-b md:border-b-0 border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-1">Intake</div>
            <div className="flex items-center px-2">
              <Select value={intake} onValueChange={(v) => { setIntake(v); setCurrentPage(1); }}>
                <SelectTrigger className="border-0 shadow-none h-8 px-0 text-sm focus:ring-0 w-full bg-transparent rounded-none [&>span]:flex [&>span]:items-center">
                  <Calendar className="w-4 h-4 text-[#2F4F97] mr-2 shrink-0" />
                  <SelectValue placeholder="All, Jan, Feb..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intakes</SelectItem>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Year */}
          <div className="flex-1 md:w-32 md:flex-none p-2 w-full border-b md:border-b-0 border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-1">Year</div>
            <div className="flex items-center px-2">
              <Select value={year} onValueChange={(v) => { setYear(v); setCurrentPage(1); }}>
                <SelectTrigger className="border-0 shadow-none h-8 px-0 text-sm focus:ring-0 w-full bg-transparent rounded-none [&>span]:flex [&>span]:items-center">
                  <Calendar className="w-4 h-4 text-[#2F4F97] mr-2 shrink-0" />
                  <SelectValue placeholder="2026" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student's Nationality */}
          <div className="flex-1 p-2 w-full border-b md:border-b-0 border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-1">Student's Nationality</div>
            <div className="flex items-center px-2">
              <Select value={country} onValueChange={(v) => { setCountry(v); setCurrentPage(1); }}>
                <SelectTrigger className="border-0 shadow-none h-8 px-0 text-sm focus:ring-0 w-full bg-transparent rounded-none">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student's State */}
          <div className="flex-1 p-2 w-full border-b md:border-b-0 border-gray-200">
            <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-1">Student's State</div>
            <div className="flex items-center px-2">
              <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="border-0 shadow-none h-8 px-0 text-sm focus:ring-0 w-full bg-transparent rounded-none">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Business & Management">Dhaka</SelectItem>
                  <SelectItem value="Engineering">Chittagong</SelectItem>
                  <SelectItem value="Computer Science & IT">Sylhet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="p-3 w-full md:w-auto flex justify-center">
             <Button className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white w-full md:w-auto px-6 h-10">
               Search <Search className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>
        
        {/* Advanced Search Dropdown Button */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <Button variant="outline" className="bg-white text-xs h-8 px-4 rounded-md shadow-sm border-gray-200 text-[#2F4F97] hover:text-[#2F4F97] hover:bg-gray-50">
            Advanced Search +
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="max-w-6xl mx-auto pt-6 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#2F4F97]" />
          <span className="text-sm font-semibold text-[#2F4F97]">Quick Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Faster Offer TAT", "Scholarship Available", "High Offer Acceptance Rate",
            "English Proficiency Exam Waiver", "Affordable University", "Co-op & Built-in Internships",
            "High Job Demand", "No Tuition Deposit (US)", "Major City", "Eligible Non Collateral Loan",
            "MBA Programs", "Russel Group Universities (UK)"
          ].map(tag => (
            <Badge key={tag} variant="outline" className="bg-white cursor-pointer hover:bg-gray-50 text-gray-600 font-normal py-1.5 px-3">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="bg-white cursor-pointer hover:bg-gray-50 text-gray-600 font-normal py-1.5 px-3" onClick={handleReset}>
             <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
             Reset All Filters
          </Badge>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
        {/* Results Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
          <div className="font-semibold text-sm text-[#1E293B] flex items-center gap-2">
            Total Programs: <span className="text-[#2F4F97] font-bold">{filteredCourses.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 shrink-0">Sort By:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-8 text-xs border border-gray-300 rounded-lg bg-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best_match">Best Match (Default)</SelectItem>
                <SelectItem value="tuition_low_high">Tuition Cost (Low to High)</SelectItem>
                <SelectItem value="tuition_high_low">Tuition Cost (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results List */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 px-4">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-sm text-gray-700 mb-1">No programs found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginatedCourses.map((c) => {
              const uni = universities[c.university_id];
              const logoSrc = uni?.logo_url || (uni?.name ? UNIVERSITY_LOGOS[uni.name] : null);

              return (
                <div key={c.id} className="p-5 sm:p-6 hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                    
                    {/* Left: Logo */}
                    <div className="w-24 md:w-36 h-20 shrink-0 flex items-center justify-center bg-gray-50 border rounded-xl overflow-hidden p-2">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={uni?.name || "University Logo"}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <GraduationCap className="h-8 w-8 text-gray-300" />
                      )}
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base text-[#1E293B] hover:text-[#2F4F97] transition-colors leading-tight">
                          {c.title}
                        </h3>
                        {c.degree_level && (
                          <Badge variant="secondary" className="bg-[#2F4F97]/10 text-[#2F4F97] border-transparent text-[11px]">
                            {c.degree_level}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#475569]">
                        <Building2 className="h-4 w-4 text-[#475569] shrink-0" />
                        <span className="font-medium truncate">{uni?.name || "Malaysian University"}</span>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-[#475569] leading-normal flex-wrap">
                        <Info className="h-4 w-4 text-[#475569] shrink-0 mt-0.5" />
                        <span>
                          <span className="font-semibold text-gray-900">
                            {c.tuition_fee != null ? `MYR ${c.tuition_fee.toLocaleString()}/Year` : "Tuition N/A"}
                          </span>
                          {" "}•{" "}
                          <span>{uni && PAID_OFFER_LETTER_UNIS.includes(uni.name) ? "Offer Letter Fees Applies" : "Free Offer Letter"}</span>
                          {" "}•{" "}
                          <span>{c.duration || "Duration N/A"}</span>
                          {c.intake_months && c.intake_months.length > 0 && (
                            <>
                              {" "}•{" "}
                              <span>Intakes: </span>
                              {c.intake_months.map((intakeName: string, idx: number) => {
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

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      <Button 
                        className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white flex-1 md:flex-initial h-9 px-5 text-xs font-semibold rounded-lg"
                        onClick={() => navigate('/partner-dashboard/students')}
                      >
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 md:flex-initial h-9 px-5 text-xs font-semibold rounded-lg border-gray-200 hover:bg-gray-50"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {currentPage} of {totalPages} ({filteredCourses.length} total programs)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
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
  );
}
