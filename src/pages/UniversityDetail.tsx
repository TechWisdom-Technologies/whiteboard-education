import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { universities as mockU, courses as mockC, accommodations as mockA } from "@/data/mockData";
import { getActiveIntake, generateSlug } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  ChevronRight, Search, CalendarDays, Globe, DollarSign, RotateCcw,
  BedDouble, Building2, Phone, Mail, Layers
} from "lucide-react";
import { toast } from "sonner";
import { useCourseCompare } from "@/contexts/CourseCompareContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  return "bg-gray-100 text-black";
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


const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 29, hours: 19, minutes: 0, seconds: 4 });

  useEffect(() => {
    // Generate a fixed target date every time the component mounts, so it always ticks down from ~29 days
    const targetDate = new Date().getTime() + (29 * 24 * 60 * 60 * 1000) + (19 * 60 * 60 * 1000) + (4 * 1000);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center justify-center w-20 h-24 md:w-32 md:h-36 bg-white border border-gray-300 rounded-2xl shadow-sm">
      <span className="text-4xl md:text-[56px] font-extrabold text-[#475569] leading-none mb-1 md:mb-2">{value}</span>
      <span className="text-[13px] md:text-base font-semibold text-gray-500">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-4 my-8 md:my-10">
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="text-2xl md:text-4xl font-extrabold text-[#475569] mb-8">:</span>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <span className="text-2xl md:text-4xl font-extrabold text-[#475569] mb-8">:</span>
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <span className="text-2xl md:text-4xl font-extrabold text-[#475569] mb-8">:</span>
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
};

export default function UniversityDetail() {

  const { universityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency } = useCurrency();
  const { data: liveU = [], isLoading } = useTableData("universities");
  const { data: liveC = [] } = useTableData("courses");
  const { data: liveA = [] } = useTableData("accommodations");
  const { addCourse, removeCourse, isComparing, compareList } = useCourseCompare();

  const unis = liveU.length > 0 ? liveU : (mockU as any[]);
  const courses = liveC.length > 0 ? liveC : (mockC as any[]);
  const accoms = liveA.length > 0 ? liveA : (mockA as any[]);

  const uni = unis.find((u: any) => generateSlug(u.name) === universityId || String(u.id) === String(universityId));
  const uniCourses = courses.filter((c: any) => String(c.university_id) === String(uni?.id));
  const similarUnis = uni ? unis.filter((u: any) => u.id !== uni.id).slice(0, 3) : [];

  const [tab, setTab] = useState<TabKey>("overview");
  // removed leadOpen and leadCtx
  const [cSearch, setCSearch] = useState("");
  const [cLevel, setCLevel] = useState("all");
  const [cCategory, setCCategory] = useState("all");
  const [tempSearch, setTempSearch] = useState("");
  const [tempLevel, setTempLevel] = useState("all");
  const [tempCategory, setTempCategory] = useState("all");
  const [cPage, setCPage] = useState(1);
  const itemsPerPage = 8;
  const [isScrolled, setIsScrolled] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setActiveImage(selected.image_url);
    } else {
      setActiveImage(null);
    }
  }, [selected]);

  const parseJsonArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 350);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nearbyAccom = useMemo(() => {
    if (!uni) return [];
    return accoms.filter((a: any) => {
      const ids = parseJsonArray(a.near_university_ids);
      return ids.map(String).includes(String(uni.id));
    });
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
    const titleLower = c.title?.toLowerCase() || "";
    let effLevel = c.degree_level || "";
    if (titleLower.includes("advanced diploma")) effLevel = "Advanced Diploma";
    else if (titleLower.includes("diploma")) effLevel = "Diploma";
    else if (titleLower.includes("certificate")) effLevel = "Certificate";
    else if (titleLower.includes("foundation")) effLevel = "Foundation";

    const matchesLevel = cLevel === "all" || 
      effLevel.toLowerCase().includes(cLevel) || 
      levelKey(effLevel).toLowerCase() === cLevel;
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
  const levels = useMemo(() => {
    return [...new Set(uniCourses.map((c: any) => {
      const titleLower = c.title?.toLowerCase() || "";
      let effLevel = c.degree_level || "";
      if (titleLower.includes("advanced diploma")) effLevel = "Advanced Diploma";
      else if (titleLower.includes("diploma")) effLevel = "Diploma";
      else if (titleLower.includes("certificate")) effLevel = "Certificate";
      else if (titleLower.includes("foundation")) effLevel = "Foundation";
      return levelKey(effLevel);
    }))];
  }, [uniCourses]);

  if (isLoading) return <div className="min-h-screen flex flex-col bg-white"><MegaMenu /><LoadingScreen label="Loading university" className="flex-1" /><PublicFooter /></div>;
  if (!uni) return <div className="min-h-screen flex flex-col bg-background"><MegaMenu /><div className="flex-1 flex items-center justify-center"><div className="text-center space-y-4"><Building className="h-16 w-16 text-muted-foreground mx-auto" /><h1 className="text-2xl font-bold">University Not Found</h1><Link to="/universities"><Button>Browse All</Button></Link></div></div><PublicFooter /></div>;

  // removed open function
  const about = uni.about_text || uni.aboutText || uni.description || "";
  const faqs: any[] = Array.isArray(uni.faqs) ? uni.faqs : [];
  const steps: string[] = Array.isArray(uni.registration_steps || uni.registrationSteps) ? (uni.registration_steps || uni.registrationSteps) : [];
  const isPaid = PAID_UNIS.includes(uni.name);
  const logo = LOGOS[uni.name] || uni.logo_url;
  const stepIcons = [FileText, CheckCircle, HomeIcon, Car, MapPinCheck];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu disableSticky />

      {/* ═══ HERO: Big Logo + Name + Buttons ═══ */}
      <section className="pb-10 pt-4 md:pt-0">
        <div className="w-full max-w-[1640px] mx-auto px-4 lg:px-6">
          <div className="bg-[#EEF4FF] p-5 md:py-16 md:px-10 flex flex-col md:flex-row items-center md:items-start gap-8 rounded-2xl md:rounded-tl-md md:rounded-tr-[3rem] md:rounded-bl-[3rem] md:rounded-br-md min-h-[160px] md:min-h-[220px]">
            {/* Desktop Logo */}
            <img src={logo} alt={uni.name} className="hidden md:block h-40 w-40 object-contain rounded-xl bg-white p-4 shadow shrink-0" />
            
            <div className="flex-1 flex flex-col w-full">
              {/* Mobile Header Block (Logo + Name + Location) */}
              <div className="flex flex-row items-start gap-4 mb-5 md:hidden">
                <img src={logo} alt={uni.name} className="h-[84px] w-[84px] object-contain rounded-xl bg-white p-2 shadow-sm shrink-0" />
                <div className="flex flex-col pt-1">
                  <h1 className="text-[20px] font-semibold text-[#1E293B] leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>{uni.name}</h1>
                  {uni.city && (
                    <p className="flex text-black items-center justify-start gap-1.5 text-[13px] mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#2F4F97]" />
                      {uni.city}, Malaysia
                    </p>
                  )}
                </div>
              </div>

              {/* Desktop Header Text */}
              <h1 className="hidden md:block text-4xl font-semibold text-[#1E293B] mb-4 text-left" style={{ fontFamily: "Poppins, sans-serif" }}>{uni.name}</h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Desktop Location */}
                {uni.city && (
                  <p className="hidden md:flex text-black items-center justify-start gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-[#2F4F97]" />
                    {uni.city}, Malaysia
                  </p>
                )}
                
                {/* Mobile Buttons */}
                <div className="flex md:hidden flex-row gap-3 w-full justify-center">
                  <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold h-[52px] flex-1 text-[14px]" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>
                    Apply Now
                  </Button>
                  <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold h-[52px] flex-1 text-[14px]" onClick={() => navigate("/contact")}>
                    Ask Us
                  </Button>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex flex-row gap-3 w-auto justify-end">
                  <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold px-10 h-14 text-[15px]" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>
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

      {/* ═══ STICKY TAB NAV (replaces navbar when scrolled) ═══ */}
      <nav className="sticky top-0 z-40 shadow-sm transition-all duration-300 bg-white">
        <div className="w-full max-w-[1000px] mx-auto px-4 flex items-center justify-between min-h-[60px] md:min-h-[80px] py-2">
          {/* Left: Logo + Tabs */}
          <div className="flex items-center gap-3 md:gap-6 min-w-0 overflow-hidden flex-1">
            <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'opacity-100 translate-x-0 w-auto mr-1 md:mr-4' : 'opacity-0 -translate-x-4 w-0 overflow-hidden m-0'}`}>
              <img src={logo} alt={uni.name} className="h-10 w-12 md:h-20 md:w-28 object-contain shrink-0" />
            </div>
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
              {(["overview", "courses", "accommodation"] as TabKey[]).map(k => (
                <button key={k} onClick={() => { setTab(k); setCPage(1); }}
                  className={`capitalize whitespace-nowrap shrink-0 text-[13px] md:text-base font-medium md:font-normal px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-colors ${k === "accommodation" ? (isScrolled ? "hidden md:block" : "block") : "block"} ${tab === k ? "text-[#2F4F97] bg-[#2F4F97]/10" : "text-gray-500 hover:text-[#1E293B] hover:bg-gray-100"}`}
                >{k}</button>
              ))}
            </div>
          </div>
          {/* Right: CTA Buttons */}
          <div className={`flex items-center transition-all duration-300 shrink-0 ${isScrolled ? 'gap-2 pl-3 opacity-100 translate-x-0 w-auto' : 'opacity-0 translate-x-4 pointer-events-none w-0 overflow-hidden m-0 p-0'}`}>
            {/* Mobile Buttons */}
            <div className="flex md:hidden items-center gap-2">
              <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold px-5 h-10 text-[14px]" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>
                Apply
              </Button>
              <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold h-10 w-12 p-0 flex items-center justify-center shrink-0" onClick={() => navigate("/contact")}>
                <span className="font-bold text-[16px]">?</span>
              </Button>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button className="bg-[#2F4F97] text-white hover:bg-[#243E79] hover:text-white rounded-[20px] border-none font-semibold px-6 h-10 text-[14px]" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>
                Apply Now
              </Button>
              <Button variant="outline" className="bg-white text-[#2F4F97] border-2 border-[#2F4F97] hover:bg-[#EEF4FF] hover:text-[#2F4F97] hover:border-[#2F4F97] rounded-[20px] font-semibold px-6 h-10 text-[14px]" onClick={() => navigate("/contact")}>
                Ask Us
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {tab === "overview" && (
        <>
          {/* About */}
          <section className="py-12 bg-white">
            <div className="w-full max-w-[1000px] mx-auto px-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1E293B] mb-8">About {uni.name}</h2>
              
              <div className="text-black leading-relaxed text-justify space-y-8">
                {/* Paragraph 1 */}
                <p className="text-black text-[12px] md:text-[14px]">
                  {(() => {
                    const firstPara = about ? about.split('\n').filter((p: string) => p.trim() !== '')[0] || "" : "";
                    const fallback = `As one of the premier educational institutions, ${uni.name} adheres to the strictest requirements for high-quality degrees. A study conducted by leading industry analysts found that ${uni.name} is one of the top universities where major corporations prefer graduate employment, which proves the quality of our academicians, courses, student development plans, and our stellar reputation in the industry. The institution is dedicated to producing industry-ready graduates who are equipped to tackle global challenges with innovative solutions.`;
                    return firstPara.length > 400 ? firstPara : (firstPara ? `${firstPara} ${fallback}` : fallback);
                  })()}
                </p>

                {/* High-Res Campus Image */}
                <div className="rounded-xl rounded-bl-[8rem] md:rounded-bl-[11rem] overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
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
                <p className="text-black text-[12px] md:text-[14px]">
                  {(() => {
                    const secondPara = about ? about.split('\n').filter((p: string) => p.trim() !== '').slice(1).join('\n\n') || "" : "";
                    const fallback = `From the moment of conceptualization, ${uni.name} has been committed to fostering a diverse, inclusive, and vibrant campus life that encourages cross-cultural exchange and personal growth. The university recognizes the accelerated development of the globalization of education and has regarded global partnerships as an internationally visible entity. The university's state-of-the-art facilities, modern research laboratories, and expansive libraries provide an ideal ecosystem for collaboration and discovery. By continuously adapting its curriculum to meet the rapidly evolving demands of the global market, ${uni.name} empowers its students to become visionary leaders and pioneers in their respective fields. Students benefit from a truly transformative university journey.`;
                    return secondPara.length > 400 ? secondPara : (secondPara ? `${secondPara} ${fallback}` : fallback);
                  })()}
                </p>
              </div>
            </div>
          </section>

          {/* Register Now CTA */}
          <section className="bg-white py-12">
            <div className="w-full max-w-[1000px] mx-auto px-4 text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1E293B] mb-2">Register Now and Secure Your Spot!</h2>
              <p className="text-black text-[12px] md:text-[14px] mb-2">Your Future Starts Here: Register Today for the Upcoming Intake</p>
              <Countdown />
              <p className="text-black text-[12px] md:text-[14px]">Secure Your Seat Now! Join {uni.name} and Start Your Journey</p>
            </div>
          </section>

          {/* Courses & Fees by Category (MOST IMPORTANT) */}
          {groupedCourses.length > 0 && (
            <section className="bg-white py-10">
              <div className="w-full max-w-[1000px] mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-semibold text-[#1E293B] mb-6">
                  Courses and Fees for International Students
                </h2>
                <Accordion type="multiple" defaultValue={[groupedCourses[0]?.category]} className="space-y-0">
                  {groupedCourses.map(({ category, courses: gc }) => (
                    <AccordionItem key={category} value={category} className="border-b border-gray-200 bg-transparent last:border-b-0">
                      <AccordionTrigger className="px-0 py-4 hover:no-underline text-black">
                        <span className="text-[12px] md:text-[14px] font-medium">
                          {category}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 pb-6">
                        <div className="border border-gray-400 rounded-lg overflow-hidden bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[12px] md:text-[14px]">
                              <thead>
                                <tr className="bg-[#EEF4FF] text-left border-b border-gray-400">
                                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-800 w-[60%] md:w-auto">Program</th>
                                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-800 whitespace-normal md:whitespace-nowrap leading-tight w-[20%] md:w-auto">Tuition Fees per Year</th>
                                  <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-800 w-[20%] md:w-auto">Duration</th>
                                </tr>
                              </thead>
                              <tbody>
                                {gc.map((c: any, i: number) => (
                                  <tr key={c.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-3 md:px-6 py-3 md:py-4">
                                      <Link to={`/courses/${generateSlug(c.title)}`} className="text-black hover:text-[#2F4F97] transition-colors">
                                        {c.title}
                                      </Link>
                                    </td>
                                    <td className="px-3 md:px-6 py-3 md:py-4 text-black whitespace-normal md:whitespace-nowrap leading-tight">{c.tuition_fee ? formatCurrency(c.tuition_fee) : "-"}</td>
                                    <td className="px-3 md:px-6 py-3 md:py-4 text-black whitespace-nowrap">{c.duration}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          )}

          {/* Offer Letter / Intake / Location row */}
          {/* Offer Letter / Intake / Location row */}
          <section className="bg-white py-8 md:py-16">
            <div className="w-full max-w-[1000px] mx-auto px-2 md:px-4 grid grid-cols-3 gap-2 md:gap-8">
              
              {/* Item 1: Offer Letter */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 flex items-center justify-center mb-3 md:mb-6 mt-4 md:mt-0">
                  <div className="absolute inset-0 bg-[#EEF4FF] transition-transform duration-700 hover:scale-105" style={{ borderRadius: '73% 27% 41% 59% / 43% 44% 56% 57%' }}></div>
                  <div className="absolute -top-1 -left-2 md:-top-2 md:-left-4 w-6 h-6 md:w-10 md:h-10 bg-[#EEF4FF] opacity-90" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
                  <div className="absolute -bottom-1 -right-1 md:-bottom-1 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-[#EEF4FF] opacity-90" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}></div>
                  <FileText className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-20 md:h-20 text-[#2F4F97]" />
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[12px] sm:text-base md:text-2xl mb-1 md:mb-2 leading-tight">Offer Letter</h4>
                <p className="text-gray-500 text-[10px] sm:text-xs md:text-base leading-tight">{isPaid ? "Fees Apply" : "Free"}</p>
              </div>

              {/* Item 2: Intake */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 flex items-center justify-center mb-3 md:mb-6 mt-4 md:mt-0">
                  <div className="absolute inset-0 bg-[#EEF4FF] transition-transform duration-700 hover:scale-105" style={{ borderRadius: '43% 57% 55% 45% / 54% 28% 72% 46%' }}></div>
                  <div className="absolute -top-2 -right-1 md:-top-4 md:-right-1 w-7 h-7 md:w-12 md:h-12 bg-[#EEF4FF] opacity-90" style={{ borderRadius: '50% 50% 30% 70% / 50% 60% 40% 50%' }}></div>
                  <div className="absolute top-1/2 -left-2 md:-left-5 w-5 h-5 md:w-8 md:h-8 bg-[#EEF4FF] opacity-90" style={{ borderRadius: '73% 27% 41% 59% / 43% 44% 56% 57%' }}></div>
                  <CalendarDays className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-20 md:h-20 text-[#2F4F97]" />
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[12px] sm:text-base md:text-2xl mb-1 md:mb-2 leading-tight">Intake</h4>
                <p className="text-gray-500 text-[10px] sm:text-xs md:text-base leading-tight">
                  {(() => {
                    const intakes = new Set<string>();
                    uniCourses.forEach((c: any) => {
                      if (c.intake_months && Array.isArray(c.intake_months)) {
                        c.intake_months.forEach((m: string) => intakes.add(m.substring(0, 3)));
                      }
                    });
                    const intakeArr = Array.from(intakes);
                    return intakeArr.sort(() => 0.5 - Math.random()).slice(0, 3).join(', ') || "Mar, Jul, Oct";
                  })()}
                </p>
              </div>

              {/* Item 3: Location */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 flex items-center justify-center mb-3 md:mb-6 mt-4 md:mt-0">
                  <div className="absolute inset-0 bg-[#EEF4FF] transition-transform duration-700 hover:scale-105" style={{ borderRadius: '52% 48% 69% 31% / 43% 66% 34% 57%' }}></div>
                  <div className="absolute top-2 -right-2 md:top-6 md:-right-6 w-6 h-6 md:w-10 md:h-10 bg-[#EEF4FF] opacity-90" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
                  <MapPin className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-20 md:h-20 text-[#2F4F97]" />
                </div>
                <h4 className="font-semibold text-[#1E293B] text-[12px] sm:text-base md:text-2xl mb-1 md:mb-2 leading-tight">Location</h4>
                <p className="text-gray-500 text-[10px] sm:text-xs md:text-base leading-tight">{uni.city || "Malaysia"}, MY</p>
              </div>

            </div>
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="bg-white py-10">
              <div className="w-full max-w-[1000px] mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-semibold text-[#1E293B] mb-6 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#2F4F97]" />Frequently Asked Questions About {uni.name}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((f: any, i: number) => (
                    <AccordionItem key={i} value={`f${i}`} className="border rounded-xl px-4 bg-gray-50">
                      <AccordionTrigger className="text-[12px] md:text-[14px] font-semibold hover:no-underline text-left">{f.question}</AccordionTrigger>
                      <AccordionContent className="text-black text-[12px] md:text-[14px] leading-relaxed">{f.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          )}
          {/* Registration Steps */}
          <section className="bg-white py-12">
            <div className="w-full max-w-[1000px] mx-auto px-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1E293B] text-center mb-10">
                Registration steps at {uni.name}
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
          </section>

          {/* Similar Universities */}
          {similarUnis.length > 0 && (
            <section className="py-10">
              <div className="w-full max-w-[1000px] mx-auto px-4">
                <h2 className="text-xl font-semibold text-[#1E293B] mb-6">Similar to {uni.name}</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:pb-0 snap-x snap-mandatory sm:snap-none">
                  {similarUnis.map((su: any) => (
                    <Link key={su.id} to={`/universities/${generateSlug(su.name)}`} className="h-full w-[300px] sm:w-auto shrink-0 sm:shrink snap-center">
                      <Card className="h-full border-[#e8e8e8] group hover:border-[#2F4F97] transition-colors overflow-hidden" style={{ borderRadius: "16px" }}>
                        <CardContent className="p-0 flex flex-col h-full">
                          <div className="h-48 flex items-center justify-center bg-gray-50/50 border-b p-6 shrink-0">
                            <img 
                              src={LOGOS[su.name] || su.logo_url} 
                              alt={su.name} 
                              className="max-h-32 max-w-[200px] object-contain" 
                            />
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-base text-[#1E293B] mb-2 line-clamp-2 leading-snug h-12" style={{ fontFamily: "Poppins, sans-serif" }}>{su.name}</h3>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="h-3.5 w-3.5 text-[#2F4F97]" />
                                <span>{su.city || "Malaysia"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <BookOpen className="h-3.5 w-3.5 text-[#64748B]" />
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
          <div className="w-full max-w-[1000px] mx-auto px-4">
            {/* Filter Bar */}
            <div className="mb-8">
              <div className="rounded-xl border border-gray-900 bg-white overflow-hidden shadow-sm">
                <div className="bg-[#EEF4FF] border-b border-gray-900 px-6 py-4">
                  <h3 className="text-[20px] font-bold text-gray-900">Filter courses</h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {/* Filter Inputs Row */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full md:flex-1">
                      <Select value={tempCategory} onValueChange={setTempCategory}>
                        <SelectTrigger className="w-full bg-white border border-gray-300 h-11 rounded-lg text-gray-500"><SelectValue placeholder="All Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Category</SelectItem>
                          {categories.map(cat => <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:flex-1">
                      <Select value={tempLevel} onValueChange={setTempLevel}>
                        <SelectTrigger className="w-full bg-white border border-gray-300 h-11 rounded-lg text-gray-500"><SelectValue placeholder="All Qualification" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Qualification</SelectItem>
                          {levels.map(l => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:flex-[1.5] relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search by Program Title" 
                        value={tempSearch} 
                        onChange={e => setTempSearch(e.target.value)} 
                        className="pr-9 bg-white border border-gray-300 h-11 rounded-lg text-gray-500" 
                      />
                    </div>
                  </div>
                  
                  {/* Actions Row */}
                  <div className="flex gap-2 justify-end w-full pt-2">
                    <Button 
                      className="w-full md:w-auto h-11 px-8 rounded-[20px] bg-[#2F4F97] text-white hover:bg-[#243E79] border-2 border-gray-900 font-bold shadow-none"
                      onClick={() => { setCSearch(tempSearch); setCLevel(tempLevel); setCCategory(tempCategory); setCPage(1); }}
                    >
                      Apply
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full md:w-auto h-11 px-8 rounded-[20px] bg-white text-[#2F4F97] border-2 border-gray-900 hover:bg-gray-50 font-bold shadow-none"
                      onClick={() => { setTempSearch(""); setTempLevel("all"); setTempCategory("all"); setCSearch(""); setCLevel("all"); setCCategory("all"); setCPage(1); }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4"><span className="font-bold text-[#1E293B]">{filtered.length}</span> courses found</p>
            <div className="flex flex-col divide-y divide-gray-200 border-t border-gray-200 mt-4">
              {paged.map((c: any, idx: number) => (
                <div key={`${c.id || idx}-${cLevel}-${cCategory}`} className="bg-white py-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      {/* Left: Info Section */}
                      <div className="flex-1 space-y-4">
                        <Link to={`/courses/${generateSlug(c.title)}`} className="text-[18px] font-medium text-[#1E293B] hover:text-[#2F4F97] transition-colors block">
                          {c.title}
                        </Link>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2 text-[14px] text-gray-600 font-normal">
                            <Building className="h-4 w-4 text-gray-500" />
                            {uni.name}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[14px] text-gray-600 font-normal flex-wrap">
                            <span className="flex items-center justify-center w-4 h-4 bg-gray-500 text-white rounded-full text-[10px] font-bold shrink-0 italic font-serif">i</span>
                            <span>
                              {formatCurrency(c.tuition_fee)}/Year • {isPaid ? "Paid Offer" : "Free Offer Letter"} • {c.duration} {c.intake_months?.length > 0 && `• ${c.intake_months.slice(0, 3).join(', ')} Intake`}
                            </span>
                          </div>
                        </div>

                        {/* Compare button for desktop */}
                        <div className="hidden md:block pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-9 px-4 rounded-lg font-medium transition-colors bg-white border ${
                              isComparing(c.id) 
                                ? "text-[#2F4F97] border-[#2F4F97] bg-[#EEF4FF]" 
                                : "text-gray-600 border-gray-200 hover:text-[#2F4F97] hover:border-[#2F4F97] hover:bg-gray-50"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (isComparing(c.id)) {
                                removeCourse(c.id);
                              } else {
                                if (compareList.length >= 3) {
                                  toast.error("You can only compare up to 3 courses at once.");
                                  return;
                                }
                                addCourse(c);
                                toast.success("Added to comparison");
                              }
                            }}
                          >
                            <Layers className="h-3.5 w-3.5 mr-2" />
                            Compare
                          </Button>
                        </div>
                      </div>

                      {/* Right: Actions Section */}
                      <div className="flex flex-row md:flex-col gap-2 md:gap-3 w-full md:w-40 shrink-0 mt-4 md:mt-0 pt-4 border-t border-gray-100 md:border-none md:pt-0">
                        {/* Mobile Compare Button */}
                        <Button
                          variant="outline"
                          className={`md:hidden h-11 w-11 shrink-0 rounded-[20px] border bg-white ${
                            isComparing(c.id) 
                              ? "border-[#2F4F97] text-[#2F4F97] bg-[#EEF4FF]" 
                              : "border-gray-200 text-gray-500"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (isComparing(c.id)) {
                              removeCourse(c.id);
                            } else {
                              if (compareList.length >= 3) {
                                toast.error("You can only compare up to 3 courses at once.");
                                return;
                              }
                              addCourse(c);
                              toast.success("Added to comparison");
                            }
                          }}
                        >
                          <Layers className="h-4 w-4" />
                        </Button>
                        <Button className="flex-1 md:w-full bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-2 border-gray-900 shadow-none font-bold h-11" onClick={e => { e.preventDefault(); navigate(`/apply?courseId=${c.id}`); }}>
                          Apply Now
                        </Button>
                        <Button variant="outline" className="flex-1 md:w-full bg-white text-[#2F4F97] border-2 border-gray-900 shadow-none rounded-[20px] font-bold h-11 hover:bg-gray-50" onClick={e => { e.preventDefault(); navigate("/contact"); }}>
                          Ask Us
                        </Button>
                      </div>
                    </div>
                  </div>
              ))}
              {paged.length === 0 && <p className="text-center py-16 text-gray-400">No courses match your filters.</p>}
            </div>
            {totalP > 1 && (
              <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-8 flex-wrap">
                <Button variant="outline" size="sm" className="bg-white" disabled={cPage <= 1} onClick={() => setCPage(cPage - 1)}>Prev</Button>
                {Array.from({ length: totalP }, (_, i) => i + 1)
                  .filter(p => {
                    if (totalP <= 5) return true;
                    if (cPage <= 3) return p <= 5;
                    if (cPage >= totalP - 2) return p >= totalP - 4;
                    return p >= cPage - 2 && p <= cPage + 2;
                  })
                  .map(p => (
                  <Button key={p} variant={p === cPage ? "default" : "outline"} size="sm"
                    className={p === cPage ? "bg-[#2F4F97] text-white hover:bg-[#243E79] border-[#2F4F97]" : "bg-white text-gray-700"} onClick={() => setCPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" className="bg-white" disabled={cPage >= totalP} onClick={() => setCPage(cPage + 1)}>Next</Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ ACCOMMODATION TAB ══════════ */}
      {tab === "accommodation" && (
        <section className="py-8">
          <div className="w-full max-w-[1000px] mx-auto px-4">
            <p className="text-sm text-gray-500 mb-6">Accommodation options near {uni.name}. For the most current availability and pricing, contact us directly.</p>
            <h3 className="font-bold text-lg text-[#1E293B] mb-4">{nearbyAccom.length} nearby accommodations found</h3>
            {nearbyAccom.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyAccom.map((a: any) => (
                  <Card key={a.id} className="bg-white hover:shadow-md hover:border-[#2F4F97]/40 transition-all cursor-pointer" onClick={() => setSelected(a)}>
                    <CardContent className="p-4 space-y-2.5">
                      <h4 className="font-bold text-sm text-[#1E293B]">{a.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{a.city}</div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">{a.type}</Badge>
                        {a.tag && <Badge className="text-[10px] bg-[#2F4F97] hover:bg-[#2F4F97] text-white border-0">{a.tag}</Badge>}
                      </div>
                      {a.travel_distance_time && typeof a.travel_distance_time === 'object' && Object.keys(a.travel_distance_time).length > 0 ? (
                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {a.travel_distance_time.walking && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#2F4F97]" /> {a.travel_distance_time.walking} walk</span>
                          )}
                          {a.travel_distance_time.car && (
                            <span className="flex items-center gap-1"><Car className="h-3 w-3 text-[#2F4F97]" /> {a.travel_distance_time.car} drive</span>
                          )}
                        </div>
                      ) : a.travel_distance && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3 text-[#2F4F97]" /> {a.travel_distance} from campus</p>
                      )}
                      <p className="font-bold text-[#2F4F97] text-sm">RM {Number(a.price_per_month).toLocaleString()}/month</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-gray-400 text-center py-10">No nearby accommodations listed yet.</p>}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-[#2F4F97] py-10 mt-auto">
        <div className="w-full max-w-[1000px] mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Ready to Start Your Journey?</h2>
          <p className="text-white/90 text-sm mb-6">Fill in your details and our counsellors will guide you - completely free.</p>
          <Button size="lg" className="bg-[#1E293B] text-white hover:bg-[#1E293B]/90 font-bold px-10 h-12" onClick={() => navigate(`/apply?universityId=${uni.id}`)}>Start Your Application</Button>
        </div>
      </section>

      
      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.name}</DialogTitle>
              </DialogHeader>

              <div className="rounded-xl overflow-hidden h-56 bg-gray-100 relative">
                <img
                  src={activeImage || fallbackImages[0]}
                  alt={selected.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.retried) {
                      target.dataset.retried = "1";
                      target.src = fallbackImages[Math.abs(selected.name.length) % fallbackImages.length];
                    }
                  }}
                />
                {selected.tag && (
                  <Badge className="absolute top-3 left-3 bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white font-bold border-0">{selected.tag}</Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {selected.image_urls && Array.isArray(selected.image_urls) && selected.image_urls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {selected.image_urls.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-14 w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img ? "border-[#2F4F97] scale-95" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-5 mt-2">
                {/* Location & Price */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" /> {selected.city}</Badge>
                  <Badge variant="outline">{selected.type}</Badge>
                  <Badge variant="secondary">{selected.property_type || "Student Housing"}</Badge>
                  <span className="ml-auto font-extrabold text-lg text-[#2F4F97]">RM {Number(selected.price_per_month).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                </div>

                {selected.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                )}

                {/* Travel Distance & Times */}
                {selected.travel_distance_time && typeof selected.travel_distance_time === 'object' && Object.keys(selected.travel_distance_time).length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif" }}>Travel Distance / Time</h4>
                    <div className="flex flex-wrap gap-4 p-3 rounded-2xl bg-[#2F4F97]/10 border border-[#2F4F97]/20">
                      {selected.travel_distance_time.walking && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-black">
                          <Clock className="h-4 w-4 text-[#2F4F97]" />
                          <span>{selected.travel_distance_time.walking} walk</span>
                        </div>
                      )}
                      {selected.travel_distance_time.car && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-black">
                          <Car className="h-4 w-4 text-[#2F4F97]" />
                          <span>{selected.travel_distance_time.car} by car</span>
                        </div>
                      )}
                      {selected.travel_distance_time.bus && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-black">
                          <Building2 className="h-4 w-4 text-[#2F4F97]" />
                          <span>{selected.travel_distance_time.bus} by bus</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selected.travel_distance && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#2F4F97]/10 border border-[#2F4F97]/20">
                    <Clock className="h-4 w-4 text-[#2F4F97]" />
                    <span className="text-sm font-medium">{selected.travel_distance}</span>
                    <span className="text-xs text-muted-foreground">from nearest university</span>
                  </div>
                )}

                {/* Unit Types */}
                {parseJsonArray(selected.unit_types).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif" }}>Unit Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseJsonArray(selected.unit_types).map((u: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-muted/50">{u}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Rents Table */}
                {selected.room_rents && Array.isArray(selected.room_rents) && selected.room_rents.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif" }}>Available Room Types & Rents</h4>
                    <div className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200/80">
                          <tr>
                            <th className="px-4 py-2.5 font-bold text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif" }}>Room Type</th>
                            <th className="px-4 py-2.5 font-bold text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif" }}>Rent / Month</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.room_rents.map((r: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                              <td className="px-4 py-2.5 text-black font-medium">{r.room_type}</td>
                              <td className="px-4 py-2.5 text-gray-900 font-bold text-[#2F4F97]">{formatCurrency(r.rent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : parseJsonArray(selected.available_room_types || selected.room_types).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-[#1E293B]" style={{ fontFamily: "Poppins, sans-serif" }}>Available Room Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseJsonArray(selected.available_room_types || selected.room_types).map((r: string, i: number) => (
                        <Badge key={i} variant="outline" className="gap-1 bg-muted/50"><BedDouble className="h-3 w-3" /> {r}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {(selected.contact_phone || selected.contact_email) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Contact</h4>
                    <div className="flex flex-wrap gap-4">
                      {selected.contact_phone && (
                        <a href={`tel:${selected.contact_phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone className="h-4 w-4" /> {selected.contact_phone}
                        </a>
                      )}
                      {selected.contact_email && (
                        <a href={`mailto:${selected.contact_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Mail className="h-4 w-4" /> {selected.contact_email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
