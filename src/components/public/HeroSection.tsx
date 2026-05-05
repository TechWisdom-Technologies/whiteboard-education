import { useState, useEffect } from "react";
import { Search, ArrowRight, Sparkles, Star, ChevronRight, GraduationCap, Globe, CheckCircle2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTableData } from "@/hooks/useSupabaseData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";

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
    <section className="relative bg-[#f8f9fb] pt-20 pb-24 lg:pb-32 overflow-hidden">
      {/* Smooth transition to next section */}
      <div className="absolute -bottom-1 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10" />
      
      <div className="container relative z-20 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Side: Content */}
          <div className="flex-1 text-left max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white shadow-sm border border-gray-100 rounded-sm transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="text-lg">🇲🇾</span>
              <span className="text-xs md:text-sm font-bold text-[#181d29] tracking-tight">The Most Trusted Platform for Study in Malaysia</span>
            </div>

            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-[1.05] text-[#181d29] tracking-tighter transition-all duration-700 delay-150 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ fontFamily: "Poppins, sans-serif" }}>
              Study in Malaysia: Your Gateway to <span className="text-[#ffa300]">Global Success</span>
            </h1>

            <p className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-xl leading-relaxed font-light transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Expert guidance for international students. Find the perfect university, secure your visa, and settle into your new home with ease.
            </p>

            {/* Integrated Search Bar */}
            <div className={`max-w-xl mb-16 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="bg-white p-3 rounded-sm shadow-2xl border border-gray-50">
                <div className="flex gap-2 p-1 mb-3 bg-gray-50/50 rounded-sm">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm font-bold transition-all duration-200 rounded-sm ${activeTab === tab ? "bg-[#181d29] text-white shadow-md" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <Input
                      placeholder={`Search for ${activeTab.toLowerCase()}...`}
                      className="w-full h-14 pl-12 border-none bg-gray-50/30 focus-visible:ring-0 text-lg placeholder:text-gray-300 rounded-sm"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button
                    className="h-14 w-full sm:w-auto px-10 bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-extrabold text-lg rounded-sm shadow-lg shadow-[#ffa300]/20 transition-all active:scale-95"
                    onClick={handleSearch}
                  >
                    Find Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats/Trust Points - Ensure no cut-off */}
            <div className={`flex flex-wrap items-center gap-10 transition-all duration-700 delay-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="group">
                <div className="text-3xl font-extrabold text-[#181d29] group-hover:text-[#ffa300] transition-colors">100+</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">Programs</div>
              </div>
              <div className="h-10 w-[1px] bg-gray-200 hidden sm:block" />
              <div className="group">
                <div className="text-3xl font-extrabold text-[#181d29] group-hover:text-[#ffa300] transition-colors">50+</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">Nationalities</div>
              </div>
              <div className="h-10 w-[1px] bg-gray-200 hidden sm:block" />
              <div className="group">
                <div className="text-3xl font-extrabold text-[#181d29] flex items-center gap-2 group-hover:text-[#ffa300] transition-colors">
                  4.9/5 <Star className="h-5 w-5 text-[#ffa300] fill-[#ffa300]" />
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">Student Rating</div>
              </div>
            </div>
          </div>

          <div className={`flex-1 relative hidden lg:block transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
            <div className="relative z-20 w-full max-w-[600px] ml-auto">
              <div className="relative">
                <img 
                  src="/input_file_0.png" 
                  alt="Student Success in Malaysia" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-20"
                />
              </div>
            </div>

            {/* Decorative circle behind student */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ffa300]/20 to-transparent rounded-sm blur-3xl z-0" />
          </div>
        </div>
      </div>

      <LeadCaptureModal open={leadOpen} onOpenChange={setLeadOpen} source="homepage_hero" />
    </section>
  );
}

