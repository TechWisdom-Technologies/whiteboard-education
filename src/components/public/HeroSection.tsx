import { useState, useEffect } from "react";
import { Search, ArrowRight, Sparkles, Star, ChevronRight, GraduationCap } from "lucide-react";
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
    <section className="relative min-h-[680px] flex items-center justify-center overflow-hidden">
      {/* Background — light gradient matching reference */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #e8edf5 0%, #f0f2f5 30%, #fef1da 70%, #f9c569 100%)" }} />
      {/* Decorative blobs */}
      <div className="absolute top-20 left-0 w-[400px] h-[400px] rounded-full opacity-30" style={{ background: "#fef1da" }} />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-30" style={{ background: "#ffa300" }} />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Trust badge */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-2.5 mb-8 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ backgroundColor: "#fef1da", borderRadius: "50px" }}
        >
          <Sparkles className="h-4 w-4 text-[#ffa300]" />
          <span className="text-sm font-semibold text-[#181d29]">#1 Platform for International Students in Malaysia</span>
          <Star className="h-3.5 w-3.5 text-[#ffa300] fill-[#ffa300]" />
        </div>

        {/* Heading */}
        <h1
          className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] max-w-5xl mx-auto tracking-tight transition-all duration-700 delay-150 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ fontFamily: "'Poppins', sans-serif", color: "#181d29" }}
        >
          Your Journey to{" "}
          <span className="text-[#ffa300]">World-Class</span>{" "}
          Education Starts Here
        </h1>

        <p
          className={`text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ color: "#515768" }}
        >
          Discover top universities, courses, and accommodations with personalized support every step of the way.
        </p>

        {/* Search card */}
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 delay-[450ms] ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="bg-white border overflow-hidden" style={{ borderColor: "#cacdd4", borderRadius: "5px", boxShadow: "rgba(0,0,0,0.1) 0px 4px 12px" }}>
            <div className="flex border-b" style={{ borderColor: "#dddddd" }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 relative`}
                  style={{
                    color: activeTab === tab ? "#181d29" : "#999999",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#ffa300]" style={{ borderRadius: "2px" }} />
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 flex gap-3">
              <Input
                placeholder={`Search for a ${activeTab.toLowerCase()}...`}
                className="flex-1 h-12 text-base placeholder:text-[#999999]"
                style={{ borderColor: "#cacdd4", borderRadius: "5px", color: "#181d29", fontFamily: "Manrope, sans-serif" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                className="h-12 px-6 font-bold transition-all"
                style={{ backgroundColor: "#ffa300", color: "#181d29", borderRadius: "5px", fontFamily: "Poppins, sans-serif", border: "1px solid #ffa300" }}
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`mt-6 transition-all duration-700 delay-[520ms] ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            size="lg"
            className="font-bold text-base px-8 h-13 transition-all"
            style={{ backgroundColor: "#181d29", color: "#ffffff", borderRadius: "5px", fontFamily: "Poppins, sans-serif" }}
            onClick={() => setLeadOpen(true)}
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Get Free Consultation
          </Button>
        </div>

        {/* Trust points */}
        <div
          className={`flex flex-wrap items-center justify-center gap-6 mt-10 transition-all duration-700 delay-[600ms] ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {trustPoints.map((point) => (
            <div key={point} className="flex items-center gap-2" style={{ color: "#515768" }}>
              <div className="h-2 w-2 rounded-full bg-[#ffa300]" />
              <span className="text-sm font-medium">{point}</span>
            </div>
          ))}
        </div>
      </div>

      <LeadCaptureModal open={leadOpen} onOpenChange={setLeadOpen} source="homepage_hero" />
    </section>
  );
}
