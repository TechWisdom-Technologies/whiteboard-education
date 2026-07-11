import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
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
} from "lucide-react";

export default function LanguageCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <section className="pb-10">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-[#EEF4FF] py-16 px-10 flex flex-col md:flex-row items-center md:items-start gap-8 rounded-tl-md rounded-tr-[3rem] rounded-bl-[3rem] rounded-br-md min-h-[220px]">
            {/* Logo / Icon */}
            <div className="h-32 w-32 md:h-40 md:w-40 bg-white rounded-xl shadow flex items-center justify-center shrink-0 p-4">
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
              <h1 className="text-4xl font-bold text-[#1E293B] mb-4 text-center md:text-left" style={{ fontFamily: "Poppins, sans-serif" }}>
                {lc.name}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {lc.city && (
                  <p className="text-gray-700 flex items-center justify-center md:justify-start gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-[#2F4F97]" />
                    {lc.city}, Malaysia
                  </p>
                )}
                
                <div className="flex flex-row gap-3 w-full sm:w-auto justify-center md:justify-end">
                  <Button
                    className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-transparent font-bold px-8 h-12 flex-1 sm:flex-none"
                    onClick={() => navigate(`/apply?centerId=${lc.id}`)}
                  >

                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-gray-50 font-bold px-8 h-12 flex-1 sm:flex-none"
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
      <nav className="sticky top-0 z-40 shadow-sm transition-all duration-300 bg-white">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between min-h-[60px] py-2">
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
                className="ml-3 font-semibold text-[#1E293B] text-sm truncate flex-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
                title={lc.name}
              >
                {lc.name}
              </span>
            </div>
          </div>
          {/* Right: CTA Buttons */}
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${isScrolled ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none hidden md:flex"}`}
          >
            <Button
              className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-transparent font-normal px-6 h-10"
              onClick={() => navigate(`/apply?centerId=${lc.id}`)}
            >

              Apply Now
            </Button>
            <Button
              variant="outline"
              className="bg-white font-normal px-6 h-10 hover:bg-gray-50"
              onClick={() => navigate("/contact")}
            >

              Ask Us
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ ABOUT SECTION ═══ */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-2xl md:text-3xl font-extrabold text-[#1E293B] mb-8"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            About {lc.name}
          </h2>

          <div className="space-y-6 text-gray-600 leading-relaxed text-[15px] text-justify">
            {lc.about_text ? (
              lc.about_text.split("\n\n").map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))
            ) : (
              <p>
                Welcome to {lc.name}, one of the premier language centers in {lc.city || "Malaysia"}. We are dedicated to delivering exceptional language learning opportunities with experienced instructors, state-of-the-art facilities, and a supportive environment.
              </p>
            )}
          </div>

          {/* Render scraped about section image URL directly under the description */}
          {lc.about_image_url && (
            <div className="mt-8 flex justify-center rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 max-w-2xl mx-auto">
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
      </section>

      {/* ═══ MORE INFO SECTION (Courses Offered replaced with More Info Blocks) ═══ */}
      {moreInfo.length > 0 && (
        <section className="bg-[#f7f9fb] py-12 border-t border-b">
          <div className="container mx-auto px-4 max-w-5xl space-y-8">
            {moreInfo.map((info: any, idx: number) => (
              <Card key={idx} className="border shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#2F4F97]/10 rounded-xl shrink-0">
                      <BookOpen className="h-6 w-6 text-[#2F4F97]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {info.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-sm text-justify whitespace-pre-line">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ═══ TUITION FEES TABLE ═══ */}
      {tuitionFees.length > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2
              className="text-2xl md:text-3xl font-extrabold text-[#1E293B] mb-8"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {lc.name} tuition fees for International students
            </h2>
            <div className="border border-gray-400 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-center">
                          {tier.tuition_fee}
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
        </section>
      )}

      {/* ═══ KEY INFO CARDS ROW ═══ */}
      <section className="bg-white py-8 border-t">
        <div className="container mx-auto px-4 max-w-5xl grid sm:grid-cols-3 gap-6">
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-start gap-3">
              <CalendarDays className="h-6 w-6 text-[#2F4F97] mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[#1E293B] text-sm mb-1">
                  Intake Period
                </h4>
                <p className="text-gray-600 text-sm">Monthly Intake</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="h-6 w-6 text-[#2F4F97] mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[#1E293B] text-sm mb-1">
                  Flexible Duration
                </h4>
                <p className="text-gray-600 text-sm">1 to 12 Month(s)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-start gap-3">
              <MapPin className="h-6 w-6 text-[#2F4F97] mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[#1E293B] text-sm mb-1">
                  Location
                </h4>
                <p className="text-gray-600 text-sm">
                  {lc.city || "Malaysia"}, Malaysia
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ INTERACTIVE FAQS SECTION ═══ */}
      {faqs.length > 0 && (
        <section className="bg-[#f7f9fb] py-12 border-t border-b">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2
              className="text-2xl md:text-3xl font-extrabold text-[#1E293B] mb-8"
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
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-gray-800 hover:bg-gray-50/50 transition-colors"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-[#2F4F97] shrink-0" />
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-[#2F4F97]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed whitespace-pre-line border-t border-gray-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ REGISTER NOW CTA ═══ */}
      <section className="bg-[#EEF4FF] py-12">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2
            className="text-xl md:text-2xl font-extrabold text-[#1E293B] mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Register Now and Secure Your Spot!
          </h2>
          <p className="text-gray-700 text-sm mb-2">
            Your Future Starts Here: Register Today for the Upcoming Intake
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Secure Your Seat Now! Join {lc.name} and Start Your Language Journey
          </p>
          <Button
            size="lg"
            className="bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97] font-bold px-10 h-12"
            onClick={() => navigate(`/apply?centerId=${lc.id}`)}
          >
            Register Now
          </Button>
        </div>
      </section>

      {/* ═══ SIMILAR LANGUAGE CENTERS ═══ */}
      {similarCenters.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2
              className="text-2xl font-extrabold text-[#1E293B] mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Similar Language Centers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCenters.map((sc: any) => (
                <Link
                  key={sc.id}
                  to={`/language-centers/${generateSlug(sc.name)}`}
                  className="h-full"
                >
                  <Card className="bg-white hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col rounded-xl border border-[#e8e8e8] group hover:border-[#2F4F97]">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Logo Container */}
                      <div className="h-48 flex items-center justify-center bg-white border-b p-6 shrink-0">
                        {sc.logo_url ? (
                          <img
                            src={sc.logo_url}
                            alt={sc.name}
                            className="w-full h-full object-contain"
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
                              MYR {Number(sc.tuition_fee).toLocaleString()}
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
        </section>
      )}

      <PublicFooter />
    </div>
  );
}
