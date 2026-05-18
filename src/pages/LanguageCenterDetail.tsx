import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
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
} from "lucide-react";

/* ── Stock images for the "About" section ── */
const ABOUT_IMAGES = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
];

export default function LanguageCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: languageCenters = [], isLoading } = useTableData("language_centers");
  const lc = languageCenters.find((l: any) => l.id === id);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Similar language centers — same city or level, excluding current
  const similarCenters = useMemo(() => {
    if (!lc) return [];
    return languageCenters
      .filter(
        (c: any) =>
          c.id !== lc.id &&
          (c.city === lc.city || c.level === lc.level)
      )
      .slice(0, 3);
  }, [lc, languageCenters]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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
              Program Not Found
            </h1>
            <Link to="/language-centers">
              <Button>Browse All Programs</Button>
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const curriculum = Array.isArray(lc.curriculum) ? lc.curriculum : [];
  const intakeMonths = Array.isArray(lc.intake_months)
    ? lc.intake_months
    : [];
  const nextIntake = intakeMonths[0] ? `${intakeMonths[0]} 2026` : "TBA";

  // Check if custom image URL exists inside curriculum column (repurposed from admin)
  let customAboutImage = "";
  if (lc.curriculum) {
    if (typeof lc.curriculum === "object" && !Array.isArray(lc.curriculum)) {
      customAboutImage = (lc.curriculum as any).about_image_url || "";
    } else if (typeof lc.curriculum === "string") {
      try {
        const parsed = JSON.parse(lc.curriculum);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          customAboutImage = parsed.about_image_url || "";
        } else {
          customAboutImage = lc.curriculum;
        }
      } catch {
        customAboutImage = lc.curriculum;
      }
    }
  }

  const aboutImage = customAboutImage || ABOUT_IMAGES[Math.abs(lc.name.length) % ABOUT_IMAGES.length];

  // About text — split into two paragraphs
  const rawAbout = lc.overview || "";
  const aboutParagraphs = rawAbout
    .split("\n")
    .map((p: string) => p.trim())
    .filter((p: string) => p !== "");
  const para1 =
    aboutParagraphs[0] ||
    `${lc.name} at ${lc.institute || "our institute"} is a premier language program located in ${lc.city || "Malaysia"}, designed to provide international students with the highest quality Bahasa Melayu instruction. The program combines intensive classroom learning with real-world immersion, ensuring students develop practical communication skills that are essential for academic success and daily life in Malaysia. Our experienced instructors use a communicative approach that makes learning engaging and effective.`;
  const para2 =
    aboutParagraphs.slice(1).join("\n\n") ||
    `Our state-of-the-art facilities include modern language labs, multimedia classrooms, and dedicated study areas where students can practice their skills in a supportive environment. The curriculum is thoughtfully designed to cover all four communication competencies — speaking, listening, reading, and writing — with additional emphasis on cultural understanding and practical vocabulary. Students benefit from small class sizes, personalized attention, and regular progress assessments that help track their language development journey.`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f0f4f8" }}
    >
      <MegaMenu disableSticky />

      {/* ═══ HERO: Logo + Name + Location + Buttons ═══ */}
      <section className="bg-[#fdf0d5] py-16">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center gap-6">
          {/* Logo / Icon */}
          <div className="h-28 w-28 md:h-36 md:w-36 bg-white rounded-sm shadow flex items-center justify-center shrink-0 p-3">
            <Languages className="h-16 w-16 text-[#ffa300]" />
          </div>

          {/* Title + Location */}
          <div className="flex-1 text-center md:text-left">
            <h1
              className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {lc.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-gray-600 text-[15px]">
              <span className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-[#ffa300] shrink-0" />
                {lc.institute || "Language Center"}
              </span>
              {lc.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#ffa300] shrink-0" />
                  {lc.city}, Malaysia
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-8 h-11"
              onClick={() => navigate(`/apply?centerId=${lc.id}`)}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="font-bold px-8 h-11"
              onClick={() => navigate("/contact")}
            >
              Ask Us
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ STICKY NAV BAR (appears on scroll) ═══ */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between min-h-[60px] py-2">
          {/* Left: Logo + Center Name */}
          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
            <div
              className={`flex items-center min-w-0 transition-all duration-300 ${isScrolled ? "opacity-100 translate-x-0 w-full" : "opacity-0 -translate-x-4 w-0 overflow-hidden"}`}
            >
              <div className="h-10 w-10 bg-[#ffa300]/10 rounded-sm flex items-center justify-center shrink-0">
                <Languages className="h-5 w-5 text-[#ffa300]" />
              </div>
              <span
                className="ml-3 font-semibold text-[#181d29] text-sm truncate flex-1"
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
              className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-normal px-6 h-10 text-sm"
              onClick={() => navigate(`/apply?centerId=${lc.id}`)}
            >
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="font-normal px-6 h-10 text-sm border-gray-200"
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
            className="text-2xl md:text-3xl font-extrabold text-[#181d29] mb-8"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            About {lc.name}
          </h2>

          <div className="prose max-w-none text-gray-600 leading-relaxed text-[15px] text-justify space-y-8">
            {/* Paragraph 1 */}
            <p>{para1}</p>

            {/* High-Res Relevant Image */}
            <div className="rounded-sm overflow-hidden shadow-md border border-gray-100 bg-gray-50 flex justify-center">
              <img
                src={aboutImage}
                alt={`${lc.name} classroom`}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>

            {/* Paragraph 2 */}
            <p>{para2}</p>
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU WILL LEARN (Curriculum) ═══ */}
      {curriculum.length > 0 && (
        <section className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2
              className="text-xl md:text-2xl font-extrabold text-[#181d29] mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              What You Will Learn
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {curriculum.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#ffa300] mt-0.5 shrink-0" />
                  <span className="text-[15px] text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ TUITION FEES TABLE ═══ */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-xl md:text-2xl font-extrabold text-[#181d29] mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {lc.name} Tuition Fees for International Students
          </h2>
          <div className="border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#181d29] text-left">
                  <th className="px-5 py-3 font-semibold text-white/90">
                    Program
                  </th>
                  <th className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">
                    Level
                  </th>
                  <th className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">
                    Duration
                  </th>
                  <th className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">
                    Tuition Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-gray-50/50 hover:bg-[#ffa300]/5 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-[#181d29] font-semibold text-[15px]">
                      {lc.name}
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {lc.institute || "Language Center"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {lc.level || "General"}
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {lc.duration || "N/A"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#ffa300] whitespace-nowrap">
                    MYR {Number(lc.tuition_fee).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ KEY INFO CARDS ROW ═══ */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4 max-w-5xl grid sm:grid-cols-3 gap-6">
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-start gap-3">
              <CalendarDays className="h-6 w-6 text-[#ffa300] mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[#181d29] text-sm mb-1">
                  Next Intake
                </h4>
                <p className="text-gray-600 text-sm">{nextIntake}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="h-6 w-6 text-[#ffa300] mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[#181d29] text-sm mb-1">
                  Duration
                </h4>
                <p className="text-gray-600 text-sm">
                  {lc.duration || "Contact us for details"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-start gap-3">
              <MapPin className="h-6 w-6 text-[#ffa300] mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[#181d29] text-sm mb-1">
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

      {/* ═══ REGISTER NOW CTA ═══ */}
      <section className="bg-[#fdf0d5] py-12">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2
            className="text-xl md:text-2xl font-extrabold text-[#181d29] mb-2"
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
            className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-10 h-12"
            onClick={() => navigate(`/apply?centerId=${lc.id}`)}
          >
            Register Now
          </Button>
        </div>
      </section>

      {/* ═══ SIMILAR LANGUAGE CENTERS ═══ */}
      {similarCenters.length > 0 && (
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2
              className="text-xl font-extrabold text-[#181d29] mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Similar Language Centers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCenters.map((sc: any) => (
                <Link
                  key={sc.id}
                  to={`/language-centers/${sc.id}`}
                  className="h-full"
                >
                  <Card className="bg-white hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col rounded-sm">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Icon Header */}
                      <div className="h-48 flex items-center justify-center bg-[#ffa300]/5 border-b p-6 shrink-0">
                        <Languages className="h-16 w-16 text-[#ffa300]" />
                      </div>
                      {/* Card Info */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3
                          className="font-bold text-base text-[#181d29] mb-2 line-clamp-2 leading-snug h-12"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {sc.name}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-[#ffa300]" />
                            <span>{sc.city || "Malaysia"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <GraduationCap className="h-3.5 w-3.5 text-[#515768]" />
                            <span>{sc.level || "General"} Level</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <DollarSign className="h-3.5 w-3.5 text-[#515768]" />
                            <span>
                              MYR {Number(sc.tuition_fee).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-auto">
                          {sc.institute || "Language Center"} · {sc.duration}
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
