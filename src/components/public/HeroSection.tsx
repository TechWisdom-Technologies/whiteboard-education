import { useState, useEffect } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTableData } from "@/hooks/useSupabaseData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tabs = ["University", "Course", "Country"];

const trustPoints = [
  "50+ Partner Universities",
  "98% Visa Success Rate",
  "24/7 Student Support",
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("University");
  const [query, setQuery] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const { data: universities = [] } = useTableData("universities", { orderBy: "name" });
  const { data: courses = [] } = useTableData("courses", { orderBy: "title" });

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    if (activeTab === "University") {
      const uni = universities.find((u: any) => u.name.toLowerCase().includes(q));
      navigate(uni ? `/universities/${uni.id}` : "/universities");
    } else if (activeTab === "Course") {
      const course = courses.find((c: any) => c.title.toLowerCase().includes(q));
      navigate(course ? `/courses/${course.id}` : "/courses");
    } else {
      navigate("/destinations/malaysia");
    }
  };

  return (
    <section className="relative bg-[#f8f9fb] pt-0 pb-24 lg:pb-32 overflow-hidden">
      {/* Background Watermark Text */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] flex flex-col gap-24 transform -rotate-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-32 whitespace-nowrap text-8xl font-black tracking-widest uppercase">
              {[...Array(4)].map((_, j) => (
                <span key={j} className={j % 2 === 0 ? "text-[#181d29]/[0.04]" : "text-[#ffa300]/[0.08]"}>
                  WHITEBOARD EDUCATION
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Smooth transition to next section */}
      <div className="absolute -bottom-1 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10" />
      
      <div className="container relative z-20 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Side: Content */}
          <div className="flex-1 text-left max-w-2xl lg:-mt-40">
            <div className={`inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white shadow-sm border border-gray-100 rounded-sm transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <img 
                src="https://flagcdn.com/w40/my.png" 
                alt="Malaysia Flag" 
                className="w-5 h-auto shadow-sm rounded-[1px]"
              />
              <span className="text-xs md:text-sm font-bold text-[#181d29] tracking-tight">The Most Trusted Platform for Study in Malaysia</span>
            </div>

            <h1 className={`mb-4 transition-all duration-700 delay-150 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ fontFamily: "Poppins, sans-serif" }}>
              <span className="block mb-2">Expert Guidance</span>
              <span className="inline-block bg-[#ffa300] text-[#181d29] px-4 py-1 rounded-sm mb-2 shadow-sm">For International</span>
              <span className="block">students In Malaysia</span>
            </h1>

            <p className={`subheadline mb-8 max-w-xl transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              We made searching for and applying to Malaysian universities easier.
            </p>

            {/* Integrated Search Bar - Pulled UP */}
            <div className={`max-w-3xl -mt-4 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="bg-white rounded-none border border-[#ffa300] flex flex-col md:flex-row items-stretch p-0.5 gap-0">
                {/* Category Dropdown - 25% */}
                <div className="w-full md:w-1/4 shrink-0">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="h-12 border-none bg-transparent focus:ring-0 focus:ring-offset-0 font-bold text-[#181d29] shadow-none rounded-none">
                      <SelectValue placeholder="University" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#ffa300] shadow-xl">
                      <SelectItem value="University">University</SelectItem>
                      <SelectItem value="Course">Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-[#ffa300]/30 my-2" />

                {/* Search Input - 50% */}
                <div className="flex-1 relative min-w-0 md:w-1/2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="w-full h-12 pl-11 border-none bg-transparent focus-visible:ring-0 text-base placeholder:text-gray-400 shadow-none rounded-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-[#ffa300]/30 my-2" />

                {/* Search Button - 25% */}
                <Button
                  className="h-12 w-full md:w-1/4 bg-[#181d29] text-white hover:bg-[#181d29]/90 font-bold text-sm rounded-none transition-all active:scale-95 shrink-0 px-4"
                  onClick={handleSearch}
                >
                  Find Now
                </Button>
              </div>
            </div>
          </div>

          <div className={`flex-1 relative hidden lg:block transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
            <div className="relative z-20 w-full max-w-[600px] ml-auto -mt-20">
              <div className="relative">
                <img 
                  src="/hero-student.png" 
                  alt="Student Success in Malaysia" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-20"
                />
              </div>
            </div>

            {/* Organic Rotating Blobs behind student */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[120%] h-[120%] z-0 pointer-events-none flex items-center justify-center">
              {/* Glow */}
              <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#ffa300]/30 to-transparent rounded-full blur-3xl" />
              
              {/* Blob 1 */}
              <div className="absolute w-[550px] h-[550px] text-[#ffa300]/20" style={{ animation: 'spin 25s linear infinite' }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
                  <path d="M47.7,-57.2C59.4,-45.5,65.8,-28.9,67.3,-12.3C68.7,4.3,65.3,21,56.7,35.2C48.1,49.4,34.4,61.1,18.5,66.8C2.6,72.4,-15.5,72.1,-31.6,65.8C-47.7,59.4,-61.8,47.1,-70.7,31.4C-79.6,15.7,-83.4,-3.3,-78.3,-20.3C-73.3,-37.2,-59.5,-52.1,-43.8,-63.4C-28.1,-74.6,-10.5,-82.1,3.4,-86.2C17.3,-90.2,36,-68.8,47.7,-57.2Z" transform="translate(100 100)" />
                </svg>
              </div>

              {/* Blob 2 */}
              <div className="absolute w-[600px] h-[600px] text-[#181d29]/5" style={{ animation: 'spin 35s linear infinite reverse' }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
                  <path d="M41.7,-55.8C55.6,-46.8,69.5,-37.2,76.5,-23.5C83.5,-9.8,83.7,8.2,77.3,24.3C70.9,40.4,58,54.7,42.5,63.1C27,71.5,8.9,74.1,-8.5,72.2C-25.9,70.3,-42.6,63.9,-54.9,52.3C-67.2,40.7,-75.1,23.9,-77.4,6.4C-79.7,-11.1,-76.3,-29.4,-65.8,-42.9C-55.3,-56.4,-37.8,-65.2,-21.8,-67.2C-5.8,-69.2,8.6,-64.5,22.2,-61.1C35.8,-57.7,48.6,-55.4,41.7,-55.8Z" transform="translate(100 100)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organic Bottom Curve - Covers image cutoff */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-30 pointer-events-none hidden md:block">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-40">
          <path 
            d="M0,60C200,110,400,110,600,60s400-50,600,0v60H0Z" 
            className="fill-white"
          />
        </svg>
      </div>

      <LeadCaptureModal open={leadOpen} onOpenChange={setLeadOpen} source="homepage_hero" />
    </section>
  );
}

