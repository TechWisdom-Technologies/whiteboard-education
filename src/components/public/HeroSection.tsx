import { useState, useEffect } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTableData } from "@/hooks/useSupabaseData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tabs = ["University", "Course"];

const trustPoints = [
  "50+ Partner Universities",
  "98% Visa Success Rate",
  "24/7 Student Support",
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState("University");
  const [query, setQuery] = useState("");

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
    if (activeTab === "University") {
      navigate(`/universities?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative bg-[#f8f9fb] pt-8 lg:pt-0 pb-8 lg:pb-16 overflow-hidden">
      {/* Background Watermark Text */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] flex flex-col gap-24 transform -rotate-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-32 whitespace-nowrap text-8xl font-black tracking-widest uppercase">
              {[...Array(4)].map((_, j) => (
                <span key={j} className={j % 2 === 0 ? "text-[#1E293B]/[0.04]" : "text-[#2F4F97]/[0.08]"}>
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
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:-mt-40 mx-auto lg:mx-0">
            <div className={`inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white shadow-sm border border-gray-100 rounded-xl transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <img
                src="https://flagcdn.com/w40/my.png"
                alt="Malaysia Flag"
                className="w-5 h-auto shadow-sm rounded-xl"
              />
              <span className="text-xs md:text-sm font-bold text-[#1E293B] tracking-tight">The Most Trusted Platform for Study in Malaysia</span>
            </div>

            <h1 className={`text-3xl md:text-5xl lg:text-5xl font-semibold mb-4 leading-[1.2] text-[#1E293B] tracking-tighter transition-all duration-700 delay-150 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className="block mb-2">Expert Guidance</span>
              <span className="inline-block bg-[#2F4F97] text-white px-4 py-1 rounded-xl mb-2 shadow-sm">For International</span>
              <span className="block">students In Malaysia</span>
            </h1>

            <p className={`text-lg text-gray-600 mb-8 max-w-xl leading-relaxed font-light transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              We made searching for and applying to Malaysian universities easier.
            </p>

            {/* Integrated Search Bar - Pulled UP */}
            <div className={`max-w-3xl -mt-4 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="bg-white rounded-[20px] overflow-hidden border border-[#2F4F97] flex flex-row items-stretch gap-0">
                {/* Category Dropdown - Auto on mobile, 25% desktop */}
                <div className="w-[120px] md:w-1/4 shrink-0">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="h-12 border-none bg-transparent focus:ring-0 focus:ring-offset-0 font-bold text-[#1E293B] shadow-none rounded-none pl-4 pr-2 md:pl-6 md:pr-3 text-xs md:text-sm">
                      <SelectValue placeholder="University" />
                    </SelectTrigger>
                    <SelectContent className="rounded-tl-[20px] rounded-tr-md rounded-b-md border-[#2F4F97] shadow-xl">
                      <SelectItem value="University" className="!rounded-tl-[16px] !rounded-tr-sm !rounded-b-sm focus:bg-[#2F4F97] focus:text-white">University</SelectItem>
                      <SelectItem value="Course" className="!rounded-sm focus:bg-[#2F4F97] focus:text-white">Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vertical Divider */}
                <div className="block w-px bg-[#2F4F97]/30 my-2 shrink-0" />

                {/* Search Input - Flex 1 */}
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hidden sm:block" />
                  <Input
                    placeholder="Search..."
                    className="w-full h-12 pl-2 sm:pl-10 border-none bg-transparent focus-visible:ring-0 text-sm md:text-base placeholder:text-gray-400 shadow-none rounded-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {/* Vertical Divider */}
                <div className="block w-px bg-[#2F4F97]/30 my-2 shrink-0" />

                {/* Search Button */}
                <Button
                  className="h-12 w-12 md:w-1/4 bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] border-l border-transparent hover:border-[#2F4F97] font-bold text-sm rounded-none transition-all active:scale-95 shrink-0 px-0 md:px-4 flex items-center justify-center"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4 md:hidden block" />
                  <span className="hidden md:block">Find Now</span>
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
              <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#2F4F97]/30 to-transparent rounded-full blur-3xl" />

              {/* Blob 1 */}
              <div className="absolute w-[550px] h-[550px] text-[#2F4F97]/20" style={{ animation: 'spin 25s linear infinite' }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
                  <path d="M47.7,-57.2C59.4,-45.5,65.8,-28.9,67.3,-12.3C68.7,4.3,65.3,21,56.7,35.2C48.1,49.4,34.4,61.1,18.5,66.8C2.6,72.4,-15.5,72.1,-31.6,65.8C-47.7,59.4,-61.8,47.1,-70.7,31.4C-79.6,15.7,-83.4,-3.3,-78.3,-20.3C-73.3,-37.2,-59.5,-52.1,-43.8,-63.4C-28.1,-74.6,-10.5,-82.1,3.4,-86.2C17.3,-90.2,36,-68.8,47.7,-57.2Z" transform="translate(100 100)" />
                </svg>
              </div>

              {/* Blob 2 */}
              <div className="absolute w-[600px] h-[600px] text-[#1E293B]/5" style={{ animation: 'spin 35s linear infinite reverse' }}>
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

      
    </section>
  );
}

