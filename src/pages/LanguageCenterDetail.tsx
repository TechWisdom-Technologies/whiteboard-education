import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  CalendarDays,
  GraduationCap,
  Languages,
  BookOpen,
  Building,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  BedDouble,
  Car,
  MapPinCheck,
} from "lucide-react";

export default function LanguageCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { data: languageCenters = [], isLoading } = useTableData("language_centers");
  const lc = languageCenters.find((l: any) => generateSlug(l.name) === id || String(l.id) === String(id));
  const [isScrolled, setIsScrolled] = useState(false);
  
  // State for tracking open FAQ items
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Similar language centers — same city, excluding current
  const similarCenters = useMemo(() => {
    if (!lc) return [];
    return languageCenters
      .filter((c: any) => c.id !== lc.id && c.city === lc.city)
      .slice(0, 3);
  }, [lc, languageCenters]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <MegaMenu />
        <LoadingScreen
          label="Loading program details"
          sublabel="Getting language center information"
          className="flex-1"
        />
        <PublicFooter />
      </div>
    );
  }

  if (!lc) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Languages className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">
              Language Center Not Found
            </h1>
            <Link to="/language-centers">
              <Button>Browse All Centers</Button>
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const moreInfo = Array.isArray(lc.more_info) ? lc.more_info : [];
  const tuitionFees = Array.isArray(lc.tuition_fees) ? lc.tuition_fees : [];
  const faqs = Array.isArray(lc.faqs) ? lc.faqs : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu disableSticky />

      {/* ═══ HERO: Logo + Name + Location + Buttons ═══ */}
      <section className="pb-10 pt-4 md:pt-0">
        <div className="w-full max-w-[1640px] mx-auto px-4 lg:px-6">
          <div className="bg-[#EEF4FF] p-5 md:py-16 md:px-10 flex flex-col md:flex-row items-center md:items-start gap-8 rounded-2xl md:rounded-tl-md md:rounded-tr-[3rem] md:rounded-bl-[3rem] md:rounded-br-md min-h-[160px] md:min-h-[220px]">
            {/* Desktop Logo / Icon */}
            <div className="hidden md:flex h-40 w-40 bg-white rounded-xl shadow items-center justify-center shrink-0 p-4">
              {lc.logo_url ? (
                <img
                  src={lc.logo_url}
                  alt={lc.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Languages className="h-20 w-20 text-[#2F4F97]" />
              )}
            </div>
            
            {/* Title + Location */}
            <div className="flex-1 flex flex-col w-full">
              {/* Mobile Header Block (Logo + Name + Location) */}
              <div className="flex flex-row items-start gap-4 mb-5 md:hidden">
                {lc.logo_url ? (
                  <img src={lc.logo_url} alt={lc.name} className="h-[84px] w-[84px] object-contain rounded-xl bg-white p-2 shadow-sm shrink-0" />
                ) : (
                  <div className="h-[84px] w-[84px] bg-white rounded-xl shadow-sm shrink-0 flex items-center justify-center p-2">
                    <Languages className="h-10 w-10 text-[#2F4F97]" />
                  </div>
                )}
                <div className="flex flex-col pt-1">
                  <h1 className="text-[20px] font-semibold text-[#1E293B] leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>{lc.name}</h1>
                  {lc.city && (
                    <p className="flex text-gray-700 items-center justify-start gap-1.5 text-[13px] mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#2F4F97]" />
                      {lc.city}, Malaysia
                    </p>
                  )}
                </div>
              </div>

              {/* Desktop Header Text */}
              <h1 className="hidden md:block text-4xl font-bold text-[#1E293B] mb-4 text-left" style={{ fontFamily: "Poppins, sans-serif" }}>
                {lc.name}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Desktop Location */}
                {lc.city && (
                  <p className="hidden md:flex text-gray-700 items-center justify-start gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-[#2F4F97]" />
                    {lc.city}, Malaysia
                  </p>
                )}
                
                {/* Mobile Buttons */}
                <div className="flex md:hidden flex-row gap-3 w-full justify-center">
                  <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-2 border-gray-900 shadow-none font-semibold h-[52px] flex-1 text-[14px]" onClick={() => navigate(`/apply?centerId=${lc.id}`)}>
                    Apply Now
                  </Button>
                  <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-gray-900 shadow-none hover:bg-gray-50 rounded-[20px] font-semibold h-[52px] flex-1 text-[14px]" onClick={() => navigate("/contact")}>
                    Ask Us
                  </Button>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex flex-row gap-3 w-auto justify-end">
                  <Button
                    className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-2 border-gray-900 shadow-none font-bold px-8 h-12"
                    onClick={() => navigate(`/apply?centerId=${lc.id}`)}
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white text-[#2F4F97] hover:bg-gray-50 border-2 border-gray-900 rounded-[20px] shadow-none font-bold px-8 h-12"
                    onClick={() => navigate("/contact")}
                  >
                    Ask Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STICKY NAV BAR (appears on scroll) ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-gradient-to-r from-[#EEF4FF] to-[#DCE6FA] border-b border-[#D6E4FF] ${isScrolled ? 'translate-y-0 shadow-sm opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="w-full max-w-[1000px] mx-auto px-4 flex items-center justify-between min-h-[60px] py-2">
          {/* Left: Logo + Center Name */}
          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
            <div
              className={`flex items-center min-w-0 transition-all duration-300 ${isScrolled ? "opacity-100 translate-x-0 w-full" : "opacity-0 -translate-x-4 w-0 overflow-hidden"}`}
            >
              <div className="h-10 w-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                {lc.logo_url ? (
                  <img
                    src={lc.logo_url}
                    alt={lc.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Languages className="h-5 w-5 text-[#2F4F97]" />
                )}
              </div>
              <span
                className="hidden md:block ml-3 font-semibold text-[#1E293B] text-sm truncate flex-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
                title={lc.name}
              >
                {lc.name}
              </span>
            </div>
          </div>
          {/* Right: CTA Buttons (Desktop) */}
          <div
            className={`hidden md:flex items-center gap-2 transition-all duration-300 ${isScrolled ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}
          >
            <Button
              className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-2 border-gray-900 shadow-none font-bold px-6 h-10"
              onClick={() => navigate(`/apply?centerId=${lc.id}`)}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="bg-white text-[#2F4F97] hover:bg-gray-50 border-2 border-gray-900 rounded-[20px] shadow-none font-bold px-6 h-10"
              onClick={() => navigate("/contact")}
            >
              Ask Us
            </Button>
          </div>

          {/* Right: CTA Buttons (Mobile) */}
          <div
            className={`flex md:hidden items-center gap-2 transition-all duration-300 ${isScrolled ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}
          >
            <Button
              className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-2 border-gray-900 shadow-none font-bold px-4 h-10 text-[13px]"
              onClick={() => navigate(`/apply?centerId=${lc.id}`)}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="bg-white text-[#2F4F97] hover:bg-gray-50 border-2 border-gray-900 rounded-[20px] shadow-none font-bold px-4 h-10 flex items-center justify-center text-lg min-w-[50px]"
              onClick={() => navigate("/contact")}
            >
              ?
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex-1 pb-16">
        <div className="w-full max-w-[1000px] mx-auto px-4 pt-8 space-y-[58px]">

          {/* ═══ ABOUT SECTION ═══ */}
          <div id="about" className="scroll-m-20">
          <h2
            className="text-[20px] font-semibold text-[#1E293B] mb-8"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            About {lc.name}
          </h2>

          <div className="space-y-6 text-gray-600 leading-relaxed text-justify">
            {lc.about_text ? (
              lc.about_text.split("\n\n").map((p: string, i: number) => (
                <p key={i} className="text-[12px] md:text-[14px]">{p}</p>
              ))
            ) : (
              <p className="text-[12px] md:text-[14px]">
                Welcome to {lc.name}, one of the premier language centers in {lc.city || "Malaysia"}. We are dedicated to delivering exceptional language learning opportunities with experienced instructors, state-of-the-art facilities, and a supportive environment.
              </p>
            )}
          </div>

          {/* Render scraped about section image URL directly under the description */}
          {lc.about_image_url && (
            <div className="mt-8 flex justify-center rounded-xl rounded-bl-[8rem] overflow-hidden shadow-md border border-gray-100 bg-gray-50 w-full mx-auto">
              <img
                src={lc.about_image_url}
                alt={`${lc.name} image`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          </div>

          {/* ═══ MORE INFO SECTION ═══ */}
          {moreInfo.length > 0 && (
            <div id="more-info" className="scroll-m-20 space-y-8">
            {moreInfo.map((info: any, idx: number) => (
              <div key={idx} className="w-full">
                <h2 className="text-[20px] font-semibold text-[#1E293B] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {info.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-[12px] md:text-[14px] text-justify">
                  {info.description}
                </p>
              </div>
            ))}
            </div>
          )}

          {/* ═══ TUITION FEES TABLE ═══ */}
          {tuitionFees.length > 0 && (
            <div id="tuition-fees" className="scroll-m-20">
            <h2
              className="text-[20px] font-semibold text-[#1E293B] mb-8"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {lc.name} tuition fees for International students
            </h2>
            <div className="border border-gray-400 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] md:text-[14px]">
                  <thead>
                    <tr className="bg-[#EEF4FF] text-center border-b border-gray-400">
                      <th className="px-4 py-2.5 font-medium text-gray-800">
                        Duration
                      </th>
                      <th className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                        Tuition Fees
                      </th>
                      <th className="px-4 py-2.5 font-medium text-gray-800">
                        Visa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tuitionFees.map((tier: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-center">
                          {tier.duration}
                        </td>
                        <td className="px-4 py-2.5 text-[#2F4F97] font-bold whitespace-nowrap text-center">
                          {formatCurrency(tier.tuition_fee)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-center">
                          {tier.visa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}


          {/* ═══ INTERACTIVE FAQS SECTION ═══ */}
          {faqs.length > 0 && (
            <div id="faqs" className="scroll-m-20">
            <h2
              className="text-[20px] font-semibold text-[#1E293B] mb-8"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq: any, idx: number) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border rounded-xl shadow-sm overflow-hidden transition-all"
                    style={{ borderColor: isOpen ? "#2F4F97" : "#e8e8e8" }}
                  >
                    <button
                      className="w-full px-6 py-4 flex items-start justify-between text-left font-medium text-gray-800 hover:bg-gray-50/50 transition-colors"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    >
                      <span className="flex items-start gap-3">
                        <span className="text-[#2F4F97] font-bold mt-[1px]">&gt;</span>
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-[#2F4F97] shrink-0 ml-4 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 shrink-0 ml-4 mt-0.5" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          )}

          {/* ═══ REGISTRATION STEPS ═══ */}
          <div id="registration-steps" className="scroll-m-20">
            <h2 className="text-[20px] font-semibold text-[#1E293B] text-center mb-10" style={{ fontFamily: "Poppins, sans-serif" }}>
              Registration steps at {lc.name}
            </h2>
            <div className="grid grid-cols-6 md:grid-cols-5 gap-x-4 gap-y-10 md:gap-4 text-center">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#1E293B] rounded flex items-center justify-center font-bold text-[#1E293B] text-xs md:text-sm mb-2 md:mb-4 relative" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  1
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[11px] md:text-[15px] mb-2 md:mb-4 h-8 md:h-10 flex items-center justify-center leading-tight">Eligibility<br className="hidden md:block"/> Letter</h4>
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white border-2 border-[#1E293B] rounded-xl flex items-center justify-center mt-auto" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  <FileText className="w-6 h-6 md:w-10 md:h-10 text-[#2F4F97]" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#1E293B] rounded flex items-center justify-center font-bold text-[#1E293B] text-xs md:text-sm mb-2 md:mb-4 relative" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  2
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[11px] md:text-[15px] mb-2 md:mb-4 h-8 md:h-10 flex items-center justify-center leading-tight">Student Visa<br/>Process</h4>
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white border-2 border-[#1E293B] rounded-xl flex items-center justify-center mt-auto" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  <CheckCircle className="w-6 h-6 md:w-10 md:h-10 text-[#2F4F97]" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#1E293B] rounded flex items-center justify-center font-bold text-[#1E293B] text-xs md:text-sm mb-2 md:mb-4 relative" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  3
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[11px] md:text-[15px] mb-2 md:mb-4 h-8 md:h-10 flex items-center justify-center leading-tight">Accommodation</h4>
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white border-2 border-[#1E293B] rounded-xl flex items-center justify-center mt-auto" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  <BedDouble className="w-6 h-6 md:w-10 md:h-10 text-[#2F4F97]" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center col-span-2 col-start-2 md:col-span-1 md:col-start-auto">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#1E293B] rounded flex items-center justify-center font-bold text-[#1E293B] text-xs md:text-sm mb-2 md:mb-4 relative" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  4
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[11px] md:text-[15px] mb-2 md:mb-4 h-8 md:h-10 flex items-center justify-center leading-tight">Airport Pickup</h4>
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white border-2 border-[#1E293B] rounded-xl flex items-center justify-center mt-auto" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  <Car className="w-6 h-6 md:w-10 md:h-10 text-[#2F4F97]" />
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#1E293B] rounded flex items-center justify-center font-bold text-[#1E293B] text-xs md:text-sm mb-2 md:mb-4 relative" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  5
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[11px] md:text-[15px] mb-2 md:mb-4 h-8 md:h-10 flex items-center justify-center leading-tight">Arrival</h4>
                <div className="w-12 h-12 md:w-20 md:h-20 bg-white border-2 border-[#1E293B] rounded-xl flex items-center justify-center mt-auto" style={{ boxShadow: '3px 3px 0px 0px #2F4F97' }}>
                  <MapPinCheck className="w-6 h-6 md:w-10 md:h-10 text-[#2F4F97]" />
                </div>
              </div>

            </div>
          </div>

          {/* ═══ REGISTER NOW CTA ═══ */}
          <div id="register-cta" className="scroll-m-20">
          <div className="bg-gradient-to-r from-[#EEF4FF] to-[#DCE6FA] border border-[#D6E4FF] rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h2
                className="text-[20px] font-semibold text-[#1E293B] mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Register Now and Secure Your Spot!
              </h2>
              <p className="text-gray-700 text-sm mb-2">
                Your Future Starts Here: Register Today for the Upcoming Intake
              </p>
              <p className="text-[#1A2C5B] font-medium text-sm">
                Secure Your Seat Now! Join {lc.name} and Start Your Language Journey
              </p>
            </div>
            
            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:w-auto bg-transparent text-[#1A2C5B] hover:bg-[#EEF4FF] border-2 border-[#1A2C5B] rounded-[20px] shadow-none font-bold px-10 h-12"
                onClick={() => navigate(`/apply?centerId=${lc.id}`)}
              >
                Register Now
              </Button>
            </div>
          </div>
          </div>

          {/* ═══ SIMILAR LANGUAGE CENTERS ═══ */}
          {similarCenters.length > 0 && (
            <div id="similar" className="scroll-m-20">
            <h2
              className="text-[20px] font-semibold text-[#1E293B] mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Similar Language Centers
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:pb-0 snap-x snap-mandatory sm:snap-none">
              {similarCenters.map((sc: any) => (
                <Link
                  key={sc.id}
                  to={`/language-centers/${generateSlug(sc.name)}`}
                  className="h-full w-[300px] sm:w-auto shrink-0 sm:shrink snap-center"
                >
                  <Card className="h-full border-[#e8e8e8] group hover:border-[#2F4F97] transition-colors overflow-hidden" style={{ borderRadius: "16px" }}>
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Logo Container */}
                      <div className="h-48 flex items-center justify-center bg-gray-50/50 border-b p-6 shrink-0">
                        {sc.logo_url ? (
                          <img
                            src={sc.logo_url}
                            alt={sc.name}
                            className="max-h-32 max-w-[200px] object-contain"
                          />
                        ) : (
                          <Languages className="h-16 w-16 text-[#2F4F97]" />
                        )}
                      </div>
                      {/* Card Info */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3
                          className="font-bold text-base text-[#1E293B] mb-2 line-clamp-2 leading-snug h-12"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {sc.name}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-[#2F4F97]" />
                            <span>{sc.city || "Malaysia"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <GraduationCap className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>{sc.level || "General"} Level</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <DollarSign className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>
                              {formatCurrency(sc.tuition_fee)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-auto">
                          {sc.about_text || "Language Center"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            </div>
          )}

        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
