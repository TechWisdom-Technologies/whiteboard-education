import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import { useParams, Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { courses as mockCourses, universities as mockUniversities } from "@/data/mockData";
import { getActiveIntake, generateSlug } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { BookOpen, Copy, Check, Info, Building2 } from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { data: liveCourses = [], isLoading: loadingC } = useTableData("courses");
  const { data: liveUniversities = [] } = useTableData("universities");
  const courses = liveCourses.length > 0 ? liveCourses : (mockCourses as any[]);
  const universities = liveUniversities.length > 0 ? liveUniversities : (mockUniversities as any[]);
  const [activeSection, setActiveSection] = useState("key-info");
  const [copied, setCopied] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  const course = courses.find((c: any) => generateSlug(c.title) === courseId || String(c.id) === String(courseId));
  const uni = course ? universities.find((u: any) => String(u.id) === String(course.university_id)) : null;

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["key-info", "overview", "curriculum"];
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }

      // Check if scrolled past hero
      if (window.scrollY > 350) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };


  if (loadingC) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <MegaMenu />
        <LoadingScreen label="Loading course details" sublabel="Getting program information" className="flex-1" />
        <PublicFooter />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Course Not Found</h1>
            <Link to="/courses"><Button>Browse All Courses</Button></Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Robustly parse curriculum to handle JSON strings from the database
  let curriculum = [];
  if (Array.isArray(course.curriculum)) {
    curriculum = course.curriculum;
  } else if (typeof course.curriculum === 'string') {
    try {
      const parsed = JSON.parse(course.curriculum);
      curriculum = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse curriculum string", e);
    }
  } else if (course.curriculum && typeof course.curriculum === 'object') {
    if (Array.isArray((course.curriculum as any).data)) {
      curriculum = (course.curriculum as any).data;
    }
  }

  // Handle both snake_case (DB) and camelCase (mockData) gracefully
  const careerOutcomes = Array.isArray(course.careerOutcomes || course.career_outcomes) ? (course.careerOutcomes || course.career_outcomes) : [];
  
  let intakeMonths = [];
  const rawIntake = course.intake_months || course.intakeMonths;
  if (Array.isArray(rawIntake)) {
    intakeMonths = rawIntake;
  } else if (typeof rawIntake === 'string') {
    try {
      const parsed = JSON.parse(rawIntake);
      intakeMonths = Array.isArray(parsed) ? parsed : [rawIntake];
    } catch(e) {
      // If it's a comma separated string
      intakeMonths = rawIntake.split(',').map(s => s.trim());
    }
  }

  const entryReqs = (course.entryRequirements || course.entry_requirements) && typeof (course.entryRequirements || course.entry_requirements) === "object" ? (course.entryRequirements || course.entry_requirements) : null;

  const handleCopy = () => {
    if (!course) return;

    let engReq = 'Not Specified';
    if (entryReqs && typeof entryReqs === 'object') {
      const rawIelts = (entryReqs as any).IELTS || (entryReqs as any).ielts;
      if (rawIelts) {
        const parts = String(rawIelts).split(/[-–-]/);
        engReq = `IELTS ${parts[parts.length - 1].trim()}`;
      }
    }

    const intakeStr = intakeMonths.length > 0 ? intakeMonths.join(',') : 'Not Specified';
    const yearlyFees = course.tuition_fee || 'Not Specified';

    const copyText = `${uni?.name || 'University Name Not Available'}
  ${course.title}

Duration: ${course.duration || 'Not Specified'}
English requirement: ${engReq}

Intake: ${intakeStr}

Course fee for international students

Yearly Tuition fees

1st year: ${yearlyFees}

Other fees${course.offer_letter ? `\n\n\t Offer Letter: ${course.offer_letter}` : ''}${course.entry_requirements_text ? `\n\t Other Entry Req: ${course.entry_requirements_text}` : ''}

University fees for this course do not include 6% tax (SST)

More details visit the link below:
${window.location.href}`;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If curriculum is empty, it means we couldn't scrape it for this course yet.
  // We should just let it be empty instead of showing dummy data.

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu disableSticky={isScrolledPastHero} />

      <div className="w-full flex-1 flex flex-col">
        {/* ═══ HERO: Big Logo + Name + Buttons ═══ */}
        <section className="pb-10 pt-4 md:pt-0">
          <div className="w-full max-w-[1640px] mx-auto px-4 lg:px-6">
            <div className="bg-[#EEF4FF] p-5 md:py-16 md:px-10 flex flex-col md:flex-row items-center md:items-start gap-8 rounded-2xl md:rounded-tl-md md:rounded-tr-[3rem] md:rounded-bl-[3rem] md:rounded-br-md min-h-[160px] md:min-h-[220px]">
              {/* Desktop Logo */}
              {uni?.logo_url ? (
                <img src={uni.logo_url} alt={uni.name} className="hidden md:block h-40 w-40 object-contain rounded-xl bg-white p-4 shadow shrink-0" />
              ) : (
                <div className="hidden md:flex h-40 w-40 bg-white rounded-xl border border-gray-200 p-4 shrink-0 items-center justify-center shadow-sm">
                  <BookOpen className="h-16 w-16 text-[#2F4F97]" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col w-full">
                {/* Mobile Header Block (Logo + Name + Location) */}
                <div className="flex flex-row items-start gap-4 mb-5 md:hidden">
                  {uni?.logo_url ? (
                    <img src={uni.logo_url} alt={uni.name} className="h-[84px] w-[84px] object-contain rounded-xl bg-white p-2 shadow-sm shrink-0" />
                  ) : (
                    <div className="h-[84px] w-[84px] bg-white rounded-xl shadow-sm shrink-0 flex items-center justify-center p-2">
                      <BookOpen className="h-10 w-10 text-[#2F4F97]" />
                    </div>
                  )}
                  <div className="flex flex-col pt-1">
                    <h1 className="text-[20px] font-semibold text-[#1E293B] leading-tight">{course.title}</h1>
                    <p className="flex text-black items-center justify-start gap-1.5 text-[13px] mt-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#2F4F97]" />
                      {uni?.name || 'University'}
                    </p>
                  </div>
                </div>

                {/* Desktop Header Text */}
                <h1 className="hidden md:block text-4xl font-semibold text-[#1E293B] mb-4 text-left">{course.title}</h1>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Desktop Location */}
                  <p className="hidden md:flex text-black items-center justify-start gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-[#2F4F97]" />
                    {uni?.name || 'University'}
                  </p>
                  
                  {/* Mobile Buttons */}
                  <div className="flex md:hidden flex-row gap-3 w-full justify-center">
                    <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold h-[52px] flex-1 text-[14px]" onClick={() => navigate(`/apply?courseId=${course.id}`)}>
                      Apply Now
                    </Button>
                    <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold h-[52px] flex-1 text-[14px]" onClick={() => navigate("/contact")}>
                      Ask Us
                    </Button>
                  </div>

                  {/* Desktop Buttons */}
                  <div className="hidden md:flex flex-row gap-3 w-auto justify-end">
                    <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold px-10 h-14 text-[15px]" onClick={() => navigate(`/apply?courseId=${course.id}`)}>
                      Apply Now
                    </Button>
                    <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold px-10 h-14 text-[15px]" onClick={() => navigate("/contact")}>
                      Ask Us
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Tab Bar */}
        <nav className="sticky top-0 z-40 shadow-sm transition-all duration-300 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <div className="w-full max-w-[1000px] mx-auto px-4 flex items-center justify-between min-h-[60px] md:min-h-[80px] py-2">
            {/* Left: Logo + Tabs */}
            <div className="flex items-center gap-3 md:gap-6 min-w-0 overflow-hidden flex-1">
              <div className={`flex items-center transition-all duration-300 ${isScrolledPastHero ? 'opacity-100 translate-x-0 w-auto mr-1 md:mr-4' : 'opacity-0 -translate-x-4 w-0 overflow-hidden m-0'}`}>
                {uni?.logo_url ? (
                  <img src={uni.logo_url} alt={uni.name} className="h-10 w-12 md:h-20 md:w-28 object-contain shrink-0" />
                ) : (
                  <BookOpen className="h-8 w-8 text-[#2F4F97]" />
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
                <button onClick={() => scrollToSection('key-info')} className={`capitalize whitespace-nowrap shrink-0 text-[11px] sm:text-[12px] md:text-base font-medium md:font-normal px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-colors block ${activeSection === 'key-info' ? 'text-[#2F4F97] bg-[#2F4F97]/10' : 'text-gray-500 hover:text-[#1E293B] hover:bg-gray-100'}`}>Key Information</button>
                <button onClick={() => scrollToSection('overview')} className={`capitalize whitespace-nowrap shrink-0 text-[11px] sm:text-[12px] md:text-base font-medium md:font-normal px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-colors block ${activeSection === 'overview' ? 'text-[#2F4F97] bg-[#2F4F97]/10' : 'text-gray-500 hover:text-[#1E293B] hover:bg-gray-100'}`}>Course Overview</button>
                <button onClick={() => scrollToSection('curriculum')} className={`capitalize whitespace-nowrap shrink-0 text-[11px] sm:text-[12px] md:text-base font-medium md:font-normal px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-colors block ${activeSection === 'curriculum' ? 'text-[#2F4F97] bg-[#2F4F97]/10' : 'text-gray-500 hover:text-[#1E293B] hover:bg-gray-100'}`}>Curriculum</button>
              </div>
            </div>
            
            {/* Right: CTA Buttons */}
            <div className={`flex items-center transition-all duration-300 shrink-0 ${isScrolledPastHero ? 'gap-2 pl-3 opacity-100 translate-x-0 w-auto' : 'opacity-0 translate-x-4 pointer-events-none w-0 overflow-hidden m-0 p-0'}`}>
              {/* Mobile Buttons */}
              <div className="flex md:hidden items-center gap-2">
                <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold px-5 h-10 text-[14px]" onClick={() => navigate(`/apply?courseId=${course.id}`)}>
                  Apply
                </Button>
                <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold h-10 w-12 p-0 flex items-center justify-center shrink-0" onClick={() => navigate("/contact")}>
                  <span className="font-bold text-[16px]">?</span>
                </Button>
              </div>
              
              {/* Desktop Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold px-6 h-10 text-[14px]" onClick={() => navigate(`/apply?courseId=${course.id}`)}>
                  Apply Now
                </Button>
                <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold px-6 h-10 text-[14px]" onClick={() => navigate("/contact")}>
                  Ask Us
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 pb-16">
          <div className="w-full max-w-[1000px] mx-auto px-4 pt-8 space-y-[46px]">
            
            {/* Key Information Section */}
            <div id="key-info" className="space-y-[46px] scroll-m-20">
              <div>
                <div className="flex flex-row items-start md:items-center justify-start gap-3 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="shrink-0 rounded-xl md:px-3 px-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-normal h-10 md:h-8 text-xs shadow-none bg-white flex items-center gap-1.5" 
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-5 h-5 md:w-3.5 md:h-3.5 text-green-600" /> : <Copy className="w-5 h-5 md:w-3.5 md:h-3.5" />}
                    <span className="hidden md:inline">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-1 w-fit">
                  <div className="py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 md:w-56 shrink-0">
                      <Info className="hidden md:block w-4 h-4 text-[#2F4F97] shrink-0" />
                      <div className="text-gray-700 text-[12px] md:text-base font-semibold whitespace-nowrap">Qualification</div>
                    </div>
                    <div className="text-gray-900 font-normal text-[12px] md:text-base text-left">
                      {course.degree_level === "Bachelor" ? "Bachelor's Degree" : 
                       course.degree_level === "Master" ? "Master's Degree" : 
                       course.degree_level}
                    </div>
                  </div>

                  <div className="py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 md:w-56 shrink-0">
                      <Info className="hidden md:block w-4 h-4 text-[#2F4F97] shrink-0" />
                      <div className="text-gray-700 text-[12px] md:text-base font-semibold whitespace-nowrap">Duration</div>
                    </div>
                    <div className="text-gray-900 font-normal text-[12px] md:text-base text-left">{course.duration}</div>
                  </div>

                  <div className="py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 md:w-56 shrink-0">
                      <Info className="hidden md:block w-4 h-4 text-[#2F4F97] shrink-0" />
                      <div className="text-gray-700 text-[12px] md:text-base font-semibold whitespace-nowrap">Intake</div>
                    </div>
                    <div className="flex flex-wrap justify-start gap-1.5">
                      {intakeMonths.length > 0 ? (() => {
                        const activeIntake = getActiveIntake(intakeMonths);
                        return intakeMonths.map((m: string) => {
                          const isActive = m === activeIntake;
                          return (
                            <span 
                              key={m} 
                              className={`px-2.5 py-0.5 rounded-xl text-[12px] md:text-sm ${
                                isActive 
                                  ? 'bg-[#2F4F97] text-white border border-[#2F4F97] font-medium' 
                                  : 'font-normal bg-[#EEF4FF] text-[#2F4F97] border border-[#D6E4FF]'
                              }`}
                            >
                              {m}
                            </span>
                          );
                        });
                      })() : <span className="text-gray-900 font-normal text-[12px] md:text-base">TBA</span>}
                    </div>
                  </div>

                  <div className="py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 md:w-56 shrink-0">
                      <Info className="hidden md:block w-4 h-4 text-[#2F4F97] shrink-0" />
                      <div className="text-gray-700 text-[12px] md:text-base font-semibold whitespace-nowrap">English Requirements</div>
                    </div>
                    <div className="text-gray-900 font-normal text-[12px] md:text-base text-left">
                      {(() => {
                        const rawIelts = entryReqs && typeof entryReqs === 'object' 
                          ? ((entryReqs as any).IELTS || (entryReqs as any).ielts) 
                          : null;
                        
                        if (!rawIelts) return 'Not Specified';
                        
                        // If it's a range like "6.0 - 6.5", take the last part
                        const parts = String(rawIelts).split(/[-–-]/);
                        const displayScore = parts[parts.length - 1].trim();
                        
                        return `IELTS ${displayScore}`;
                      })()}
                    </div>
                  </div>

                  <div className="py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 md:w-56 shrink-0">
                      <Info className="hidden md:block w-4 h-4 text-[#2F4F97] shrink-0" />
                      <div className="text-gray-700 text-[12px] md:text-base font-semibold whitespace-nowrap">Offer Letter</div>
                    </div>
                    <div className="text-gray-900 font-normal text-[12px] md:text-base text-left">{course.offer_letter || "Fees Applies"}</div>
                  </div>

                  <div className="py-2 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 md:w-56 shrink-0">
                      <Info className="hidden md:block w-4 h-4 text-[#2F4F97] shrink-0" />
                      <div className="text-gray-700 text-[12px] md:text-base font-semibold whitespace-nowrap">Class Type</div>
                    </div>
                    <div className="text-gray-900 font-normal text-[12px] md:text-base text-left">Physical</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-5">Course Fee for International Students</h3>
                <div className="grid md:grid-cols-2 gap-12 w-full lg:w-[75%]">
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#2F4F97]/20 px-4 py-3 border-b border-[#2F4F97]/30">
                      <h4 className="font-semibold text-gray-900 text-[16px]">Yearly Tuition fees</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-[12px] md:text-[14px] font-light">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left pb-3 font-semibold text-gray-700">Year</th>
                            <th className="text-left pb-3 font-semibold text-gray-700">Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.yearly_fees && course.yearly_fees.length > 0 ? (
                            course.yearly_fees.map((yf: any, i: number) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 text-gray-600">{yf.year}</td>
                                <td className="py-3 text-gray-600">{formatCurrency(yf.fee)}</td>
                              </tr>
                            ))
                          ) : course.tuition_fee && Number(course.tuition_fee) > 0 ? (
                            <tr>
                              <td className="py-3 text-gray-600">1st Year</td>
                              <td className="py-3 text-gray-600">{formatCurrency(course.tuition_fee)}</td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan={2} className="py-3 text-gray-500 text-center italic">No Data</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#2F4F97]/20 px-4 py-3 border-b border-[#2F4F97]/30">
                      <h4 className="font-semibold text-gray-900 text-[16px]">Other Fees</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-[12px] md:text-[14px] font-light">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left pb-3 font-semibold text-gray-700">Description</th>
                            <th className="text-left pb-3 font-semibold text-gray-700">Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredOtherFees = (course.other_fees || []).filter((of: any) => {
                              const feeStr = String(of.fee || '').toUpperCase();
                              const descStr = String(of.description || '').toUpperCase();
                              
                              if (feeStr.includes('MYR') || feeStr.includes('USD') || feeStr.includes('RM') || feeStr.includes('GBP')) return true;
                              if (descStr.includes('FEE') || descStr.includes('DEPOSIT') || descStr.includes('BOND') || descStr.includes('ADMIN')) return true;
                              
                              // Check if it's purely a number >= 50
                              const numStr = feeStr.replace(/[^0-9]/g, '');
                              if (numStr && parseInt(numStr) >= 50) return true;
                              
                              return false;
                            });

                            return filteredOtherFees.length > 0 ? (
                              filteredOtherFees.map((of: any, i: number) => (
                                <tr key={i} className="border-b border-gray-100 last:border-0">
                                  <td className="py-3 text-gray-600">{of.description}</td>
                                  <td className="py-3 text-gray-600">{formatCurrency(of.fee)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="py-3 text-gray-500 text-center italic">No additional fees data available</td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-[12px] md:text-[14px] text-gray-500 font-medium flex items-center gap-2">
                  <span className="text-2xl font-bold leading-none mt-1">+</span> University fees for this course do not include 6% tax (SST)
                </div>
              </div>

              {/* Apply Banner CTA */}
              <div className="bg-gradient-to-r from-[#EEF4FF] to-[#DCE6FA] border border-[#D6E4FF] rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
                <h2 className="text-[20px] font-medium md:font-semibold text-center md:text-left text-[#1A2C5B] max-w-md relative z-10 leading-tight">
                  Would you like to apply to {uni?.name} ?
                </h2>
                <Button variant="outline" className="relative z-10 bg-transparent border-2 border-[#2F4F97] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white h-[52px] md:h-14 px-8 rounded-xl font-bold text-[14px] md:text-base transition-colors shadow-none w-full md:w-auto" onClick={() => navigate(`/apply?courseId=${course.id}`)}>
                  Apply now
                </Button>
              </div>
            </div>

            {/* Course Overview Section */}
            <div id="overview" className="space-y-[46px] scroll-m-24">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-5">Course Overview</h3>
                <div className="text-gray-600 font-normal leading-relaxed text-justify">
                  <style>{`
                    .course-overview-content, .course-overview-content p, .course-overview-content span, .course-overview-content ul, .course-overview-content li {
                      font-size: 12px !important;
                    }
                    @media (min-width: 768px) {
                      .course-overview-content, .course-overview-content p, .course-overview-content span, .course-overview-content ul, .course-overview-content li {
                        font-size: 14px !important;
                      }
                    }
                  `}</style>
                  {course.overview ? (
                    course.overview.trim().startsWith('<') ? (
                      <div 
                        className="prose max-w-none text-gray-600 course-overview-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.overview) }} 
                      />
                    ) : (
                      <div className="space-y-4">
                        {course.overview.split('Entry Requirements')[0].split(/\n\s*\n/).map((para: string, idx: number) => (
                          <p key={idx} className="text-[12px] md:text-[14px]">
                            {para.replace(/\n/g, ' ').trim()}
                          </p>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-[12px] md:text-[14px]">Overview information is currently being updated.</p>
                  )}
                </div>
              </div>
              
              {course.entry_requirements_text && course.entry_requirements_text.split('Curriculum')[0].trim().length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-5">Entry Requirements</h3>
                  <div className="text-gray-600 font-normal leading-relaxed text-justify space-y-4">
                    {course.entry_requirements_text
                      .split('Curriculum')[0]
                      .replace(/:\s*\n+/g, ': ')
                      .split(/\n\s*\n/)
                      .map((para: string, idx: number) => (
                      <p key={idx} className="text-[12px] md:text-[14px]">{para.replace(/\n/g, ' ').trim()}</p>
                    ))}
                  </div>
                </div>
              )}

              {careerOutcomes.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-5">Career opportunities</h3>
                  <ul className="list-disc pl-5 space-y-2 font-normal text-gray-600 text-[12px] md:text-[14px]">
                    {careerOutcomes.map((role: string, i: number) => (
                      <li key={i} className="whitespace-pre-wrap">{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Programme Structure Section (Curriculum Accordion) */}
            <div id="curriculum" className="scroll-m-24">
              <Accordion type="single" collapsible className="w-full bg-white rounded-xl overflow-hidden">
                <AccordionItem value="curriculum" className="border-b-0">
                  <AccordionTrigger className="px-0 py-6 hover:no-underline text-xl font-semibold text-gray-900 text-left bg-transparent">
                    Curriculum
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-8 pt-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6">Programme Structure</h4>
                    {curriculum.length > 0 ? (
                      <div className="space-y-10">
                        {curriculum.map((cy: any, idx: number) => (
                          <div key={idx} className="space-y-4">
                            <h5 className="text-lg font-bold text-gray-900">{cy.year}</h5>
                            {cy.year === "Manufacturing System Engineering" && <h6 className="font-bold text-gray-900">Subjects</h6>}
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-[12px] md:text-[14px] border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 font-semibold text-gray-800">Subject</th>
                                    {(cy.modules || []).some((mod: any) => typeof mod !== 'string' && mod.credits) && (
                                      <th className="text-right py-3 font-semibold text-gray-800 w-32 whitespace-nowrap">Credit Hours</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(cy.modules || []).map((mod: any, i: number) => {
                                    const hasCreditsCol = (cy.modules || []).some((m: any) => typeof m !== 'string' && m.credits);
                                    if (typeof mod === 'string') {
                                      return (
                                        <tr key={i} className="border-b border-gray-100 last:border-0">
                                          <td className="py-3 text-gray-600" colSpan={hasCreditsCol ? 2 : 1}>{mod}</td>
                                        </tr>
                                      );
                                    }
                                    return (
                                      <tr key={i} className="border-b border-gray-100 last:border-0">
                                        <td className="py-3 text-gray-600">{mod.name}</td>
                                        {hasCreditsCol && (
                                          <td className="py-3 text-gray-600 text-right">{mod.credits}</td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            {cy.totalCredits && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="font-bold text-gray-900 mb-2">
                                  {cy.year === "Core Subjects" ? "Programme Core Credit Hours" : `Total Credit Hours in ${cy.year}`}
                                </p>
                                <ul className="list-disc pl-5 text-gray-800 text-[12px] md:text-[14px]">
                                  <li>Total {cy.year === "Core Subjects" ? "Core " : ""}Credit Hours: {cy.totalCredits}</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-[15px]">Programme structure details coming soon.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
          </div>
        </div>
      </div>

      

      <PublicFooter />
    </div>
  );
}
