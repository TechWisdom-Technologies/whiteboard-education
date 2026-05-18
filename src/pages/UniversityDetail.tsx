import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { universities as mockU, courses as mockC, accommodations as mockA } from "@/data/mockData";

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
  ChevronRight, Search, CalendarDays, Globe, DollarSign, RotateCcw
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
  "Swinburne University of Technology Sarawak": "https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://www.tarc.edu.my/images/tarumt-logo1.png?v=beyongEducation2",
};

const PAID_UNIS = ["Universiti Putra Malaysia (UPM)", "UTM University Malaysia", "UTeM University Malaysia"];

const CAMPUS_IMAGES: Record<string, string> = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/accommodation/8/Mutiara_Ville_@_Cyberjaya_202405221211_2.jpg",
  "UCSI University Malaysia": "https://www.ucsiinternationalschool.edu.my/sh/wp-content/uploads/sites/6/2021/08/About-The-School.png",
  "Taylor's University Malaysia": "https://www.easyuni.com/media/institution/photo/2016/11/17/thumbs/Taylors_5116.jpg.1024x683_q85.webp",
  "APU University Malaysia": "https://www.easyuni.com/media/institution/photo/2017/12/19/thumbs/APU_new_campus_sky3_preview.jpeg.600x400_q85_crop-scale.webp",
  "UNITEN University Malaysia": "https://i.ytimg.com/vi/xlaFIc9-GDE/maxresdefault.jpg",
  "City University Malaysia": "https://backend.studyfans.com/storage/media/Universities/main_image/2744/ba09kUzoog7K4WWfq0aJeBIXTNSG9AQr2wRcqw52.webp",
  "Cyberjaya University Malaysia (UoC)": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Campus6.png",
  "MAHSA University Malaysia": "https://edufair.fsi.com.my/img/sponsor/97/resize/04f3aa33dddbdf46fbb3aa392abfded4.png",
  "UTP University Malaysia": "https://themalaysiavoice.com/wp-content/uploads/2023/07/UTP_Solar_Rooftop-scaled.jpg",
  "SEGi University Malaysia": "https://edufair.fsi.com.my/img/sponsor/20/cover_1530346726.jpeg",
  "Limkokwing University Malaysia": "https://www.msb-my.com/campus_images/Limkokwing_University_Malaysia_Selangor/image_4.jpg",
  "Infrastructure University Kuala Lumpur (IUKL)": "https://www.easyuni.com/media/institution/photo/2018/09/06/thumbs/Hostel_and_Block_A.jpg.1200x800_q85.webp",
  "INTI International University Malaysia": "https://www.easyuni.com/media/institution/photo/2012/10/04/inti_Sarawak.jpg",
  "UniKL University Malaysia": "https://www.ryugaku.or.jp/malaysia/image/unikl_img65.jpg",
  "Tunku Abdul Rahman University (UTAR)": "https://edufair.fsi.com.my/img/sponsor/16/cover_1695083511.jpeg",
  "Nottingham University Malaysia": "https://www.nottingham.ac.uk/About/Images-Multimedia/UNM-Trent-Building.jpg",
  "MONASH University Malaysia": "https://apply.emga.com.my/wp-content/uploads/2023/09/MONASH_UNIVERSITY_MALAYSIA-1-scaled-1.jpg",
  "International University of Malaya-Wales (IUMW)": "https://keystoneacademic-res.cloudinary.com/image/upload/f_auto/q_auto/g_auto/w_650/dpr_2.0/element/17/177916_DJI_0021_V21.jpg",
  "UTM University Malaysia": "https://news.utm.my/wp-content/uploads/2024/06/Featured-Image-NewsHub-1536x865.png",
  "UTeM University Malaysia": "https://www.utem.edu.my/images/slider/cache/68de67d9ab091884fd4e0e5f98534698/mainPicUTeM.jpg",
  "Lincoln University College": "https://en.your-uni.com/assets/images/university/46/Lincoln%20University.webp",
  "Sunway University": "https://apply.emga.com.my/wp-content/uploads/2024/01/SUNWAY-1.jpg",
  "Management and Science University (MSU)": "https://www.msu.edu.my/theme-2023/assets/uploads/2023/03/11-1600x800.webp",
  "Swinburne University of Technology Sarawak": "https://www.swinburne.edu.my/wp-content/uploads/2024/07/DJI_0061-scaled.jpg",
  "UTM SPACE University Malaysia": "https://en.your-uni.com/assets/images/university/50/UTMSPACE.webp",
  "Heriot-Watt University Malaysia Campus": "http://fteducation-bd.com/wp-content/uploads/2018/05/Heriot-Watt-University-Malaysia-2.jpg",
  "University of Southampton Malaysia": "https://www.ncuk.ac.uk/wp-content/uploads/2020/12/University-of-Southampton-Malaysia-Image-Gallery-2.jpg",
  "Curtin University Malaysia": "https://s43414.pcdn.co/study/wp-content/uploads/sites/2/2023/03/DSC01319_1_1-scaled-1.jpg",
  "Swinburne University of Technology Sarawak Campus": "https://www.swinburne.edu.my/wp-content/uploads/2016/03/SWINBURNE.jpg",
  "Xiamen University Malaysia Campus": "https://www.etawau.com/edu/UniversitiesBranch/Xiamen/XiamenUniversity_01b.jpg",
  "International Medical University (IMU)": "https://www.worldwidecolleges.com/wp-content/uploads/classified-listing/2025/02/IMU-1.jpg",
  "Universiti Geomatika Malaysia": "https://i0.wp.com/www.geomatika.edu.my/wp-content/uploads/2023/07/campus-ugm-lores.jpg?fit=1000%2C617&ssl=1",
  "NILAI University": "https://www.nilai.edu.my/sites/default/files/slide-item/image/2007.png",
  "University of Wollongong (UOW) Malaysia": "https://pxl-uoweduau.terminalfour.net/prod01/channel_3/assets/live-migration/www/images/content/groups/public/web/media/documents/mm/uow253477.jpg",
  "Newcastle University Medicine Malaysia (NUMed)": "https://www.easyuni.com/media/institution/photo/2021/12/08/thumbs/1_Featured_Photo__Microsite-Header.jpg.1150x500_q85.webp",
  "Universiti Malaya (UM)": "https://www.studymalaysiainfo.com/wp-content/uploads/2016/11/UM.jpg",
  "Kings University College Malaysia": "https://tse1.mm.bing.net/th/id/OIP.686TBPmG_4tkMEFIJyzI3QHaES?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "Binary University": "https://oktamam.com/wp-content/uploads/2023/05/binary-1024x768.jpg",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://edufair.fsi.com.my/img/sponsor/2/cover_1667892130.jpeg",
};

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
  const navigate = useNavigate();
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
  // removed leadOpen and leadCtx
  const [cSearch, setCSearch] = useState("");
  const [cLevel, setCLevel] = useState("all");
  const [cCategory, setCCategory] = useState("all");
  const [cPage, setCPage] = useState(1);
  const itemsPerPage = 8;
  const [isScrolled, setIsScrolled] = useState(false);

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
  const filtered = uniCourses.filter((c: any) => {
    const s = cSearch.toLowerCase();
    const matchesSearch = !cSearch || c.title.toLowerCase().includes(s);
    const matchesLevel = cLevel === "all" || 
      (c.degree_level && c.degree_level.toLowerCase().includes(cLevel)) || 
      levelKey(c.degree_level).toLowerCase() === cLevel;
    // Aligning category filter with the Overview table's logic
    const matchesCategory = cCategory === "all" || categoryKey(c.title).toLowerCase() === cCategory.toLowerCase();
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const paged = filtered.slice((cPage - 1) * itemsPerPage, cPage * itemsPerPage);
  const totalP = Math.ceil(filtered.length / itemsPerPage);

  // Take categories directly from the same logic used in "Courses and Fees" section
  const categories = useMemo(() => {
    const unique = new Set(uniCourses.map((c: any) => categoryKey(c.title)));
    return CATEGORY_ORDER.filter(cat => unique.has(cat));
  }, [uniCourses]);
  const levels = useMemo(() => [...new Set(uniCourses.map((c: any) => levelKey(c.degree_level)))], [uniCourses]);

  if (isLoading) return <div className="min-h-screen flex flex-col bg-background"><MegaMenu /><LoadingScreen label="Loading university" className="flex-1" /><PublicFooter /></div>;
  if (!uni) return <div className="min-h-screen flex flex-col bg-background"><MegaMenu /><div className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><Building className="h-16 w-16 text-muted-foreground mx-auto" /><h1 className="text-2xl font-bold">University Not Found</h1><Link to="/universities"><Button>Browse All</Button></Link></div></div><PublicFooter /></div>;

  // removed open function
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
      <section className="bg-[#fdf0d5] py-16">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center gap-6">
          <img src={logo} alt={uni.name} className="h-28 w-28 md:h-36 md:w-36 object-contain rounded-sm bg-white p-3 shadow" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-semibold text-[#181d29] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{uni.name}</h1>
            {uni.city && <p className="text-gray-600 flex items-center gap-1 justify-center md:justify-start"><MapPin className="h-4 w-4 text-[#ffa300]" />{uni.city}, Malaysia</p>}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-8 h-11" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>Apply Now</Button>
            <Button variant="outline" className="font-bold px-8 h-11" onClick={() => navigate("/contact")}>Ask Us</Button>
          </div>
        </div>
      </section>

      {/* ═══ STICKY TAB NAV (replaces navbar when scrolled) ═══ */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between min-h-[80px] py-2">
          {/* Left: Logo + Tabs */}
          <div className="flex items-center gap-6 min-w-0">
            <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'opacity-100 translate-x-0 w-auto mr-4' : 'opacity-0 -translate-x-4 w-0 overflow-hidden m-0'}`}>
              <img src={logo} alt={uni.name} className="h-16 w-20 md:h-20 md:w-28 object-contain shrink-0" />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(["overview", "courses", "accommodation"] as TabKey[]).map(k => (
                <button key={k} onClick={() => { setTab(k); setCPage(1); }}
                  className={`capitalize text-sm md:text-base font-normal px-3 md:px-4 py-2 rounded-sm transition-colors ${tab === k ? "text-[#ffa300] bg-[#ffa300]/10" : "text-gray-500 hover:text-[#181d29] hover:bg-gray-100"}`}
                >{k}</button>
              ))}
            </div>
          </div>
          {/* Right: CTA Buttons */}
          <div className={`flex items-center gap-2 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none hidden md:flex'}`}>
            <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-normal px-6 h-10 text-sm" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>Apply Now</Button>
            <Button variant="outline" className="font-normal px-6 h-10 text-sm border-gray-200" onClick={() => navigate("/contact")}>Ask Us</Button>
          </div>
        </div>
      </nav>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {tab === "overview" && (
        <>
          {/* About */}
          <section className="bg-white py-12">
            <div className="container mx-auto px-4 max-w-5xl">
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
                <div className="rounded-sm overflow-hidden shadow-md border border-gray-100 bg-gray-50 flex justify-center">
                  <img 
                    src={
                      CAMPUS_IMAGES[uni.name] || 
                      `https://en.your-uni.com/assets/images/university/${uni.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}.webp`
                    }
                    alt={`Campus of ${uni.name}`} 
                    className="w-full h-auto object-contain"
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
            <section className="bg-white py-10">
              <div className="container mx-auto px-4 max-w-5xl">
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
                                    <Link to={`/courses/${c.id}`} className="text-[#181d29] font-semibold text-md hover:text-[#ffa300] transition-colors">{c.title}</Link>
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
            <div className="container mx-auto px-4 max-w-5xl grid sm:grid-cols-3 gap-6">
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
            <div className="container mx-auto px-4 max-w-5xl text-center">
              <h2 className="text-xl md:text-2xl font-extrabold text-[#181d29] mb-2">Register Now and Secure Your Spot!</h2>
              <p className="text-gray-700 text-sm mb-2">Your Future Starts Here: Register Today for the Upcoming Intake</p>
              <p className="text-gray-600 text-sm mb-6">Secure Your Seat Now! Join {uni.name} and Start Your Journey</p>
              <Button size="lg" className="bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold px-10 h-12" onClick={() => navigate("/contact")}>Register Now</Button>
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
              <div className="container mx-auto px-4 max-w-5xl">
                <h2 className="text-xl font-extrabold text-[#181d29] mb-6 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#ffa300]" />Frequently Asked Questions About {uni.name}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((f: any, i: number) => (
                    <AccordionItem key={i} value={`f${i}`} className="border rounded-sm px-4 bg-gray-50">
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
              <div className="container mx-auto px-4 max-w-5xl">
                <h2 className="text-xl font-extrabold text-[#181d29] mb-6">Similar to {uni.name}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarUnis.map((su: any) => (
                    <Link key={su.id} to={`/universities/${su.id}`} className="h-full">
                      <Card className="bg-white hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col rounded-sm">
                        <CardContent className="p-0 flex flex-col h-full">
                          <div className="h-48 flex items-center justify-center bg-gray-50/50 border-b p-6 shrink-0">
                            <img 
                              src={LOGOS[su.name] || su.logo_url} 
                              alt={su.name} 
                              className="max-h-32 max-w-[200px] object-contain" 
                            />
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-base text-[#181d29] mb-2 line-clamp-2 leading-snug h-12" style={{ fontFamily: "Poppins, sans-serif" }}>{su.name}</h3>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="h-3.5 w-3.5 text-[#ffa300]" />
                                <span>{su.city || "Malaysia"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <BookOpen className="h-3.5 w-3.5 text-[#515768]" />
                                <span>{courses.filter((c: any) => String(c.university_id) === String(su.id)).length} Courses Available</span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-auto">
                              {su.description}
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
        </>
      )}

      {/* ══════════ COURSES TAB ══════════ */}
      {tab === "courses" && (
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Opaque Sticky Filter Bar */}
            <div className="sticky top-[80px] z-30 bg-[#f0f4f8] py-4 -mx-4 px-4 mb-4">
              <div className="bg-white p-4 rounded-sm border shadow-md flex flex-col md:flex-row gap-4 items-center">
                {/* Category Filter */}
                <div className="w-full md:flex-1">
                  <Select value={cCategory} onValueChange={v => { setCCategory(v); setCPage(1); }}>
                    <SelectTrigger className="w-full bg-gray-50 border-gray-200 h-11 rounded-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Qualification Filter */}
                <div className="w-full md:w-48">
                  <Select value={cLevel} onValueChange={v => { setCLevel(v); setCPage(1); }}>
                    <SelectTrigger className="w-full bg-gray-50 border-gray-200 h-11 rounded-sm"><SelectValue placeholder="All Levels" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(l => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input + Reset */}
                <div className="w-full md:flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search Program..." 
                      value={cSearch} 
                      onChange={e => { setCSearch(e.target.value); setCPage(1); }} 
                      className="pl-9 bg-gray-50 border-gray-200 h-11 rounded-sm" 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-11 w-11 rounded-sm border-gray-200 text-gray-500 hover:text-[#181d29]"
                    onClick={() => { setCSearch(""); setCLevel("all"); setCCategory("all"); setCPage(1); }}
                    title="Reset Filters"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4"><span className="font-bold text-[#181d29]">{filtered.length}</span> courses found</p>
            <div className="space-y-5">
              {paged.map((c: any, idx: number) => (
                <Card key={`${c.id || idx}-${cLevel}-${cCategory}`} className="bg-white hover:shadow-lg transition-all border-gray-200 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Left: Info Section */}
                      <div className="flex-1 p-10 space-y-6">
                        <div>
                          <Link to={`/courses/${c.id}`} className="font-semibold text-md text-[#181d29] hover:text-[#ffa300] transition-colors block mb-1">
                            {c.title}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-gray-500 my-4 font-normal">
                            <Building className="h-4 w-4 text-[#ffa300]" />
                            {uni.name}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase font-normal text-black tracking-wider mb-2">Tuition Fee</span>
                            <span className="text-sm font-normal text-[#ffa300]">MYR {Number(c.tuition_fee).toLocaleString()}/Year</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase font-normal text-black tracking-wider mb-2">Perks</span>
                            <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {isPaid ? "Paid Offer" : "Free Offer"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] uppercase font-normal text-black tracking-wider mb-2">Duration</span>
                            <span className="text-sm font-normal text-gray-700">{c.duration}</span>
                          </div>
                          {c.intake_months?.length > 0 && (
                            <div className="flex flex-col">
                              <span className="text-[12px] uppercase font-normal text-black tracking-wider mb-2">Intakes</span>
                              <span className="text-sm font-normal text-gray-700">{c.intake_months.slice(0, 3).join(", ")}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-0">
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest ${levelColor(c.degree_level)} bg-opacity-10 border-current rounded-sm`}>
                            {c.degree_level}
                          </Badge>
                        </div>
                      </div>

                      {/* Right: Actions Section */}
                      <div className="bg-gray-50/50 md:w-56 border-t md:border-t-0 md:border-l border-gray-100 p-10 flex flex-col justify-center gap-3">
                        <Button className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#e69200] font-bold h-11" onClick={e => { e.preventDefault(); navigate(`/apply?courseId=${c.id}`); }}>
                          Apply Now
                        </Button>
                        <Button variant="outline" className="w-full font-bold h-11 border-gray-200 text-[#181d29] hover:bg-white" onClick={e => { e.preventDefault(); navigate("/contact"); }}>
                          Ask Us
                        </Button>
                      </div>
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
          <div className="container mx-auto px-4 max-w-5xl">
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
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-xl font-extrabold text-[#181d29] mb-2">Ready to Start Your Journey?</h2>
          <p className="text-[#181d29]/70 text-sm mb-6">Fill in your details and our counsellors will guide you - completely free.</p>
          <Button size="lg" className="bg-[#181d29] text-white hover:bg-[#181d29]/90 font-bold px-10 h-12" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>Start Your Application</Button>
        </div>
      </section>

      
      <PublicFooter />
    </div>
  );
}
