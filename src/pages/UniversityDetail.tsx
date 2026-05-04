import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { universities as mockU, courses as mockC, accommodations as mockA } from "@/data/mockData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, BookOpen, GraduationCap, HelpCircle, Building, Clock,
  FileText, CheckCircle, Home as HomeIcon, Car, MapPinCheck,
  ChevronRight, Search, CalendarDays, Globe, DollarSign
} from "lucide-react";

const LOGOS: Record<string, string> = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
  "UCSI University Malaysia": "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
  "Taylor's University Malaysia": "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
  "APU University Malaysia": "https://en.your-uni.com/assets/images/university/apu-university.webp",
  "UNITEN University Malaysia": "https://en.your-uni.com/assets/images/university/uniten-university.webp",
  "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
  "MAHSA University Malaysia": "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
  "SEGi University Malaysia": "https://en.your-uni.com/assets/images/university/segi-university.webp",
  "INTI International University Malaysia": "https://en.your-uni.com/assets/images/university/inti-university.webp",
  "Sunway University": "https://en.your-uni.com/assets/images/university/sunway-university.webp",
  "HELP University Malaysia": "https://en.your-uni.com/assets/images/university/help-university.png",
  "MONASH University Malaysia": "https://en.your-uni.com/assets/images/university/monash-university.webp",
  "Nottingham University Malaysia": "https://en.your-uni.com/assets/images/university/nottingham-university.webp",
  "Universiti Putra Malaysia (UPM)": "https://en.your-uni.com/assets/images/university/upm-university.jpg",
  "UTM University Malaysia": "https://en.your-uni.com/assets/images/university/utm-university.webp",
  "Universiti Malaya (UM)": "https://en.your-uni.com/assets/images/university/universiti-malaya-um.png",
};

const PAID_UNIS = ["Universiti Putra Malaysia (UPM)", "UTM University Malaysia", "UTeM University Malaysia"];

type TabKey = "overview" | "courses" | "accommodation";

function levelColor(l: string) {
  const lc = l?.toLowerCase() || "";
  if (lc.includes("foundation") || lc.includes("diploma")) return "bg-blue-100 text-blue-700";
  if (lc.includes("bachelor")) return "bg-emerald-100 text-emerald-700";
  if (lc.includes("master")) return "bg-purple-100 text-purple-700";
  if (lc.includes("phd") || lc.includes("doctor")) return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-700";
}

function levelKey(dl: string) {
  const lc = dl?.toLowerCase() || "";
  if (lc.includes("foundation") || lc.includes("a-level")) return "Foundation";
  if (lc.includes("diploma")) return "Diploma";
  if (lc.includes("bachelor")) return "Bachelor";
  if (lc.includes("master")) return "Master";
  if (lc.includes("phd") || lc.includes("doctor")) return "PhD";
  return dl || "Other";
}

/* ── Field / category classification ────────────────────────────── */
const CATEGORY_ORDER = [
  "Computer Science & IT",
  "Business & Management",
  "Engineering & Applied Sciences",
  "Natural Sciences",
  "Social Sciences & Humanities",
  "Law & Legal Studies",
  "Art & Design",
  "Communication & Media",
  "Other Programs",
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Computer Science & IT": ["computer", "computing", "software", "information technology", "it ", "cyber", "data science", "data comm", "artificial intelligence", "game development", "information system", "security technology", "intelligent robotic", "business intelligence"],
  "Business & Management": ["business", "management", "commerce", "accounting", "finance", "marketing", "mba", "administration", "economics", "digital enterprise", "digital business"],
  "Engineering & Applied Sciences": ["engineering", "mechanical", "civil", "electrical", "electronic", "mechatronics", "robotics", "automation", "telecommunication"],
  "Natural Sciences": ["science", "mathematics", "physics", "chemistry", "biology", "actuarial", "statistics", "pharmacy", "medical", "biomedical", "agricultural"],
  "Social Sciences & Humanities": ["psychology", "education", "social", "humanities", "philosophy", "history", "language", "english", "counsell"],
  "Law & Legal Studies": ["law", "legal", "jurisprudence"],
  "Art & Design": ["art", "design", "animation", "multimedia", "visual effect", "creative", "advertising", "cinematic", "cinematography", "3d model", "immersive media", "music", "film"],
  "Communication & Media": ["communication", "media", "journalism", "public relation", "strategic comm"],
};

function categoryKey(title: string): string {
  const lc = title?.toLowerCase() || "";
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lc.includes(kw))) return cat;
  }
  return "Other Programs";
}

export default function UniversityDetail() {
  const { universityId } = useParams();
  const { data: liveU = [], isLoading } = useTableData("universities");
  const { data: liveC = [] } = useTableData("courses");
  const { data: liveA = [] } = useTableData("accommodations");

  const unis = liveU.length > 0 ? liveU : (mockU as any[]);
  const courses = liveC.length > 0 ? liveC : (mockC as any[]);
  const accoms = liveA.length > 0 ? liveA : (mockA as any[]);

  const uni = unis.find((u: any) => String(u.id) === String(universityId));
  const uniCourses = courses.filter((c: any) => String(c.university_id) === String(universityId));
  const similarUnis = uni ? unis.filter((u: any) => u.id !== uni.id).slice(0, 3) : [];

  const [tab, setTab] = useState<TabKey>("overview");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadCtx, setLeadCtx] = useState({ source: "apply", course: "" });
  const [cSearch, setCSearch] = useState("");
  const [cLevel, setCLevel] = useState("all");
  const [cPage, setCPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const perPage = 10;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 350);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nearbyAccom = useMemo(() => {
    if (!uni) return [];
    return accoms.filter((a: any) => a.city?.toLowerCase() === uni.city?.toLowerCase());
  }, [uni, accoms]);

  // Group courses by field category for Overview table
  const groupedCourses = useMemo(() => {
    const map: Record<string, any[]> = {};
    uniCourses.forEach((c: any) => {
      const k = categoryKey(c.title);
      if (!map[k]) map[k] = [];
      map[k].push(c);
    });
    return CATEGORY_ORDER.filter(k => map[k]?.length).map(k => ({ category: k, courses: map[k] }));
  }, [uniCourses]);

  // Filtered courses for Courses tab
  const filtered = useMemo(() => {
    let l = uniCourses;
    if (cSearch) l = l.filter((c: any) => c.title?.toLowerCase().includes(cSearch.toLowerCase()));
    if (cLevel !== "all") l = l.filter((c: any) => levelKey(c.degree_level).toLowerCase() === cLevel);
    return l;
  }, [uniCourses, cSearch, cLevel]);
  const totalP = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((cPage - 1) * perPage, cPage * perPage);
  const levels = useMemo(() => [...new Set(uniCourses.map((c: any) => levelKey(c.degree_level)))], [uniCourses]);

  if (isLoading) return <div className="min-h-screen flex flex-col bg-background"><MegaMenu /><LoadingScreen label="Loading university" className="flex-1" /><PublicFooter /></div>;
  if (!uni) return <div className="min-h-screen flex flex-col bg-background"><MegaMenu /><div className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><Building className="h-16 w-16 text-muted-foreground mx-auto" /><h1 className="text-2xl font-bold">University Not Found</h1><Link to="/universities"><Button>Browse All</Button></Link></div></div><PublicFooter /></div>;

  const open = (s: string, c = "") => { setLeadCtx({ source: s, course: c }); setLeadOpen(true); };
  const about = uni.about_text || uni.aboutText || uni.description || "";
  const faqs: any[] = Array.isArray(uni.faqs) ? uni.faqs : [];
  const steps: string[] = Array.isArray(uni.registration_steps || uni.registrationSteps) ? (uni.registration_steps || uni.registrationSteps) : [];
  const isPaid = PAID_UNIS.includes(uni.name);
  const logo = LOGOS[uni.name] || uni.logo_url;
  const stepIcons = [FileText, CheckCircle, HomeIcon, Car, MapPinCheck];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f4f8" }}>
      <MegaMenu disableSticky />

      {/* ═══ HERO: Big Logo + Name + Buttons ═══ */}
      <section className="bg-[#fdf0d5] py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
          <img src={logo} alt={uni.name} className="h-28 w-28 md:h-36 md:w-36 object-contain rounded-xl bg-white p-3 shadow" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#181d29] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>{uni.name}</h1>
            {uni.city && <p className="text-gray-600 flex items-center gap-1 justify-center md:justify-start"><MapPin className="h-4 w-4 text-[#ffa300]" />{uni.city}, Malaysia</p>}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-8 h-11" onClick={() => open("hero_apply")}>Apply Now</Button>
            <Button variant="outline" className="font-bold px-8 h-11" onClick={() => open("hero_ask")}>Ask Us</Button>
          </div>
        </div>
      </section>

      {/* ═══ STICKY TAB NAV (replaces navbar when scrolled) ═══ */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          {/* Left: Logo + Tabs */}
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-x-0 w-auto mr-4' : 'opacity-0 -translate-x-4 w-0 overflow-hidden m-0'}`}>
              <img src={logo} alt={uni.name} className="h-12 w-12 object-contain rounded bg-white shrink-0" />
              <span className="font-extrabold text-[#181d29] text-base md:text-lg shrink-0 whitespace-nowrap" style={{ fontFamily: "Manrope, sans-serif" }}>
                {uni.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {(["overview", "courses", "accommodation"] as TabKey[]).map(k => (
                <button key={k} onClick={() => { setTab(k); setCPage(1); }}
                  className={`capitalize text-base font-bold px-4 py-2 rounded-md transition-colors ${tab === k ? "text-[#ffa300] bg-[#ffa300]/10" : "text-gray-500 hover:text-[#181d29] hover:bg-gray-100"}`}
                >{k}</button>
              ))}
            </div>
          </div>
          {/* Right: CTA Buttons */}
          <div className={`hidden md:flex items-center gap-3 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
            <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-6 h-10 text-sm" onClick={() => open("subnav_apply")}>Apply Now</Button>
            <Button variant="outline" className="font-bold px-6 h-10 text-sm" onClick={() => open("subnav_ask")}>Ask Us</Button>
          </div>
        </div>
      </nav>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {tab === "overview" && (
        <>
          {/* About */}
          <section className="bg-white py-12 border-b">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#181d29] mb-8">About {uni.name}</h2>
              
              <div className="prose max-w-none text-gray-600 leading-relaxed text-[15px] text-justify space-y-8">
                {/* Paragraph 1 */}
                <p>
                  {(() => {
                    const firstPara = about ? about.split('\n').filter((p: string) => p.trim() !== '')[0] || "" : "";
                    const fallback = `As one of the premier educational institutions, ${uni.name} adheres to the strictest requirements for high-quality degrees. A study conducted by leading industry analysts found that ${uni.name} is one of the top universities where major corporations prefer graduate employment, which proves the quality of our academicians, courses, student development plans, and our stellar reputation in the industry. The institution is dedicated to producing industry-ready graduates who are equipped to tackle global challenges with innovative solutions.`;
                    return firstPara.length > 400 ? firstPara : (firstPara ? `${firstPara} ${fallback}` : fallback);
                  })()}
                </p>

                {/* High-Res Campus Image */}
                <div className="rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-50">
                  <img 
                    src={`https://en.your-uni.com/assets/images/university/${uni.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}.webp`}
                    alt={`Campus of ${uni.name}`} 
                    className="w-full h-auto max-h-[450px] object-cover"
                    onError={(e) => {
                      // Fallback to a high-res generic campus image if the specific uni image isn't found on the server
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                </div>

                {/* Paragraph 2 */}
                <p>
                  {(() => {
                    const secondPara = about ? about.split('\n').filter((p: string) => p.trim() !== '').slice(1).join('\n\n') || "" : "";
                    const fallback = `From the moment of conceptualization, ${uni.name} has been committed to fostering a diverse, inclusive, and vibrant campus life that encourages cross-cultural exchange and personal growth. The university recognizes the accelerated development of the globalization of education and has regarded global partnerships as an internationally visible entity. The university's state-of-the-art facilities, modern research laboratories, and expansive libraries provide an ideal ecosystem for collaboration and discovery. By continuously adapting its curriculum to meet the rapidly evolving demands of the global market, ${uni.name} empowers its students to become visionary leaders and pioneers in their respective fields. Students benefit from a truly transformative university journey.`;
                    return secondPara.length > 400 ? secondPara : (secondPara ? `${secondPara} ${fallback}` : fallback);
                  })()}
                </p>
              </div>
            </div>
          </section>

          {/* Courses & Fees by Category (MOST IMPORTANT) */}
          {groupedCourses.length > 0 && (
            <section className="bg-white py-10 border-b">
              <div className="container mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-extrabold text-[#181d29] mb-6">
                  Courses and Fees for International Students
                </h2>
                <Accordion type="multiple" defaultValue={[groupedCourses[0]?.category]} className="space-y-3">
                  {groupedCourses.map(({ category, courses: gc }) => (
                    <AccordionItem key={category} value={category} className="border rounded-sm overflow-hidden bg-white">
                      <AccordionTrigger className="px-5 py-4 hover:no-underline bg-gray-50/80 transition-colors text-[#181d29] [&[data-state=open]]:bg-gray-100/50">
                        <span className="flex items-center gap-2 text-[15px] font-bold">
                          {category}
                          <Badge variant="outline" className="text-xs ml-1 bg-white">{gc.length}</Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="bg-[#181d29] text-left">
                              <th className="px-5 py-3 font-semibold text-white/90">Program</th>
                              <th className="px-5 py-3 font-semibold text-white/90 whitespace-nowrap">Tuition Fee / Year</th>
                              <th className="px-5 py-3 font-semibold text-white/90">Duration</th>
                            </tr></thead>
                            <tbody>
                              {gc.map((c: any, i: number) => (
                                <tr key={c.id} className={`border-t ${i % 2 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#ffa300]/5 transition-colors`}>
                                  <td className="px-5 py-3">
                                    <Link to={`/courses/${c.id}`} className="text-[#181d29] font-medium hover:text-[#ffa300] transition-colors">{c.title}</Link>
                                    <span className="block text-xs text-gray-400 mt-0.5">{c.degree_level}</span>
                                  </td>
                                  <td className="px-5 py-3 font-semibold text-[#ffa300] whitespace-nowrap">MYR {Number(c.tuition_fee).toLocaleString()}</td>
                                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{c.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          )}

          {/* Offer Letter / Intake / Location row */}
          <section className="bg-white py-8 border-b">
            <div className="container mx-auto px-4 grid sm:grid-cols-3 gap-6">
              <Card className="border shadow-sm"><CardContent className="p-5 flex items-start gap-3">
                <FileText className="h-6 w-6 text-[#ffa300] mt-0.5 shrink-0" />
                <div><h4 className="font-bold text-[#181d29] text-sm mb-1">Offer Letter</h4><p className="text-gray-600 text-sm">{isPaid ? "Offer Letter Fees Applies" : "Free Offer Letter"}</p></div>
              </CardContent></Card>
              <Card className="border shadow-sm"><CardContent className="p-5 flex items-start gap-3">
                <CalendarDays className="h-6 w-6 text-[#ffa300] mt-0.5 shrink-0" />
                <div><h4 className="font-bold text-[#181d29] text-sm mb-1">Intake</h4><p className="text-gray-600 text-sm">Contact us for upcoming intake dates</p></div>
              </CardContent></Card>
              <Card className="border shadow-sm"><CardContent className="p-5 flex items-start gap-3">
                <MapPin className="h-6 w-6 text-[#ffa300] mt-0.5 shrink-0" />
                <div><h4 className="font-bold text-[#181d29] text-sm mb-1">Location</h4><p className="text-gray-600 text-sm">{uni.city || "Malaysia"}, Malaysia</p></div>
              </CardContent></Card>
            </div>
          </section>

          {/* Register Now CTA */}
          <section className="bg-[#fdf0d5] py-12">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-xl md:text-2xl font-extrabold text-[#181d29] mb-2">Register Now and Secure Your Spot!</h2>
              <p className="text-gray-700 text-sm mb-2">Your Future Starts Here: Register Today for the Upcoming Intake</p>
              <p className="text-gray-600 text-sm mb-6">Secure Your Seat Now! Join {uni.name} and Start Your Journey</p>
              <Button size="lg" className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-10 h-12" onClick={() => open("register")}>Register Now</Button>
              {steps.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-10 max-w-4xl mx-auto">
                  {steps.slice(0, 5).map((s: string, i: number) => {
                    const Icon = stepIcons[i % stepIcons.length];
                    return <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-sm font-bold text-[#181d29]">{i + 1}</div>
                      <Icon className="h-10 w-10 text-[#ffa300]" />
                      <p className="text-xs text-gray-700 text-center leading-tight">{s}</p>
                    </div>;
                  })}
                </div>
              )}
            </div>
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="bg-white py-10">
              <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-xl font-extrabold text-[#181d29] mb-6 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#ffa300]" />Frequently Asked Questions About {uni.name}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((f: any, i: number) => (
                    <AccordionItem key={i} value={`f${i}`} className="border rounded-lg px-4 bg-gray-50">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline text-left">{f.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-sm leading-relaxed">{f.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          )}

          {/* Similar Universities */}
          {similarUnis.length > 0 && (
            <section className="py-10">
              <div className="container mx-auto px-4">
                <h2 className="text-xl font-extrabold text-[#181d29] mb-6">Similar to {uni.name}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarUnis.map((su: any) => (
                    <Link key={su.id} to={`/universities/${su.id}`}>
                      <Card className="bg-white hover:shadow-lg transition-all hover:-translate-y-1">
                        <CardContent className="p-0">
                          <div className="h-36 flex items-center justify-center bg-gray-50 border-b p-4">
                            <img src={LOGOS[su.name] || su.logo_url} alt={su.name} className="max-h-20 max-w-[140px] object-contain" />
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-bold text-sm text-[#181d29]">{su.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{su.description}</p>
                            <Button size="sm" variant="outline" className="text-xs gap-1 border-[#ffa300] text-[#ffa300]">Read More <ChevronRight className="h-3 w-3" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ══════════ COURSES TAB ══════════ */}
      {tab === "courses" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search courses..." value={cSearch} onChange={e => { setCSearch(e.target.value); setCPage(1); }} className="pl-9 bg-white" />
              </div>
              <Select value={cLevel} onValueChange={v => { setCLevel(v); setCPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(l => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-500 mb-4"><span className="font-bold text-[#181d29]">{filtered.length}</span> courses found</p>
            <div className="space-y-4">
              {paged.map((c: any) => (
                <Card key={c.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <Link to={`/courses/${c.id}`} className="font-bold text-[15px] text-[#181d29] hover:text-[#ffa300]">{c.title}</Link>
                      <p className="text-xs text-gray-500">{uni.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-[#ffa300]" />MYR {Number(c.tuition_fee).toLocaleString()}/Year</span>
                        <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-green-500" />{isPaid ? "Paid" : "Free"} Offer Letter</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration}</span>
                        {c.intake_months?.length > 0 && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{c.intake_months.slice(0, 3).join(", ")} Intake</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-xs ${levelColor(c.degree_level)}`}>{c.degree_level}</Badge>
                      <Button size="sm" className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-semibold" onClick={e => { e.preventDefault(); open("course_apply", c.title); }}>Apply Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {paged.length === 0 && <p className="text-center py-16 text-gray-400">No courses match your filters.</p>}
            </div>
            {totalP > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={cPage <= 1} onClick={() => setCPage(cPage - 1)}>Previous</Button>
                {Array.from({ length: totalP }, (_, i) => i + 1).slice(0, 8).map(p => (
                  <Button key={p} variant={p === cPage ? "default" : "outline"} size="sm"
                    className={p === cPage ? "bg-[#ffa300] text-[#181d29]" : ""} onClick={() => setCPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={cPage >= totalP} onClick={() => setCPage(cPage + 1)}>Next</Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ ACCOMMODATION TAB ══════════ */}
      {tab === "accommodation" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <p className="text-sm text-gray-500 mb-6">Accommodation options near {uni.name}. For the most current availability and pricing, contact us directly.</p>
            <h3 className="font-bold text-lg text-[#181d29] mb-4">{nearbyAccom.length} nearby accommodations found</h3>
            {nearbyAccom.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyAccom.map((a: any) => (
                  <Card key={a.id} className="bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-[#181d29]">{a.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{a.city}</div>
                      <Badge variant="outline" className="text-xs">{a.type}</Badge>
                      <p className="font-bold text-[#ffa300] text-sm">RM {Number(a.price_per_month).toLocaleString()}/month</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-gray-400 text-center py-10">No nearby accommodations listed yet.</p>}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-[#ffa300] py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-extrabold text-[#181d29] mb-2">Ready to Start Your Journey?</h2>
          <p className="text-[#181d29]/70 text-sm mb-6">Fill in your details and our counsellors will guide you — completely free.</p>
          <Button size="lg" className="bg-[#181d29] text-white hover:bg-[#181d29]/90 font-bold px-10 h-12" onClick={() => open("bottom")}>Start Your Application</Button>
        </div>
      </section>

      <LeadCaptureModal open={leadOpen} onOpenChange={setLeadOpen} defaultCourse={leadCtx.course} defaultUniversity={uni.name} source={leadCtx.source} />
      <PublicFooter />
    </div>
  );
}
