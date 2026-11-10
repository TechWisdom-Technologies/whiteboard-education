// Priority universities ordering for Whiteboard Education
export interface PriorityUniConfig {
  id: string;
  name: string;
  shortName: string;
  level: number;
  city: string;
  description: string;
  logo_url: string;
  hero_image: string;
  matchKeys: string[];
}

export const ALL_PRIORITY_UNIVERSITIES: PriorityUniConfig[] = [
  // ─────────────────────────────────────────────────────────────
  // LEVEL 1 (PAGE 1)
  // ─────────────────────────────────────────────────────────────
  {
    id: "priority-inti",
    name: "INTI International University",
    shortName: "INTI",
    level: 1,
    city: "Nilai, Negeri Sembilan",
    description: "INTI International University is one of Malaysia's leading private higher education institutions, acclaimed for career-ready graduates and world-class international degree pathways.",
    logo_url: "https://en.your-uni.com/assets/images/university/inti-university.webp",
    hero_image: "https://www.easyuni.com/media/institution/photo/2012/10/04/inti_Sarawak.jpg",
    matchKeys: ["inti"],
  },
  {
    id: "priority-segi",
    name: "SEGi University",
    shortName: "SEGi",
    level: 1,
    city: "Kota Damansara, Selangor",
    description: "SEGi University is a premier Malaysian higher education institution offering quality, industry-driven programmes in Health Sciences, Engineering, Business, and Technology.",
    logo_url: "https://en.your-uni.com/assets/images/university/segi-university.webp",
    hero_image: "https://en.your-uni.com/assets/images/university/segi-university.webp",
    matchKeys: ["segi"],
  },
  {
    id: "priority-lincoln",
    name: "Lincoln University College",
    shortName: "Lincoln",
    level: 1,
    city: "Petaling Jaya, Selangor",
    description: "Lincoln University College is a globally recognized institution in Malaysia offering world-standard medical, nursing, business, and pharmacy degrees with robust clinical training.",
    logo_url: "https://en.your-uni.com/assets/images/university/lincoln-university-college.png",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["lincoln"],
  },
  {
    id: "priority-lsbf",
    name: "London School of Business and Finance Malaysia (LSBF)",
    shortName: "LSBF",
    level: 1,
    city: "Kuala Lumpur",
    description: "London School of Business and Finance (LSBF) Malaysia provides British-standard business, finance, accounting, and executive leadership qualifications in the commercial heart of Kuala Lumpur.",
    logo_url: "https://en.your-uni.com/assets/images/university/lsbf-malaysia.png",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["london school of business", "lsbf"],
  },
  {
    id: "priority-unirazak",
    name: "Universiti Tun Abdul Razak (UNIRAZAK)",
    shortName: "UNIRAZAK",
    level: 1,
    city: "Kuala Lumpur",
    description: "Universiti Tun Abdul Razak (UNIRAZAK) is Malaysia's pioneering boutique university known for AACSB-accredited business programmes, leadership education, and exceptional graduate employability.",
    logo_url: "https://en.your-uni.com/assets/images/university/unirazak-university.png",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["unirazak", "tun abdul razak"],
  },
  {
    id: "priority-unikl",
    name: "Universiti Kuala Lumpur (UniKL)",
    shortName: "UniKL",
    level: 1,
    city: "Kuala Lumpur",
    description: "Universiti Kuala Lumpur (UniKL) is Malaysia's leading technical university with 12 campuses offering specialized high-tech engineering, aviation, maritime, and information technology programmes.",
    logo_url: "https://en.your-uni.com/assets/images/university/unikl-university.webp",
    hero_image: "https://en.your-uni.com/assets/images/university/unikl-university.webp",
    matchKeys: ["unikl", "universiti kuala lumpur"],
  },
  {
    id: "priority-aeu",
    name: "Asia e University (AeU)",
    shortName: "AeU",
    level: 1,
    city: "Subang Jaya, Selangor",
    description: "Asia e University (AeU) is an international university established under the 34-nation Asia Cooperation Dialogue (ACD), offering flexible, accredited blended and on-campus bachelor's, master's, and PhD degrees.",
    logo_url: "https://en.your-uni.com/assets/images/university/aeu-university.png",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["asia e", "aeu"],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 2 (PAGE 2)
  // ─────────────────────────────────────────────────────────────
  {
    id: "priority-mahsa",
    name: "MAHSA University",
    shortName: "MAHSA",
    level: 2,
    city: "Bandar Saujana Putra, Selangor",
    description: "MAHSA University is committed to excellence in healthcare, medical, dentistry, pharmacy, nursing, business, and engineering education with a cutting-edge 48-acre campus.",
    logo_url: "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["mahsa"],
  },
  {
    id: "priority-cyberjaya",
    name: "University of Cyberjaya",
    shortName: "UoC",
    level: 2,
    city: "Cyberjaya, Selangor",
    description: "University of Cyberjaya (UoC) is a top-tier healthcare and technology-focused institution offering premier medical, pharmacy, psychology, and computing degrees in Malaysia's Silicon Valley.",
    logo_url: "https://en.your-uni.com/assets/images/university/cyberjaya-university.png",
    hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80",
    matchKeys: ["university of cyberjaya", "cyberjaya university", "uoc"],
  },
  {
    id: "priority-apu",
    name: "Asia Pacific University of Technology & Innovation (APU)",
    shortName: "APU",
    level: 2,
    city: "Kuala Lumpur",
    description: "Asia Pacific University of Technology & Innovation (APU) is Malaysia's premier tech and digital innovation university, recognized globally for artificial intelligence, cybersecurity, and fintech education.",
    logo_url: "https://en.your-uni.com/assets/images/university/apu-university.webp",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["asia pacific university", "apu"],
  },
  {
    id: "priority-taylors",
    name: "Taylor’s University",
    shortName: "Taylor's",
    level: 2,
    city: "Subang Jaya, Selangor",
    description: "Taylor's University is ranked among the top private universities in Southeast Asia, celebrated for world-class hospitality, business, architecture, and innovative campus lakeside living.",
    logo_url: "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["taylor's", "taylors", "taylor"],
  },
  {
    id: "priority-sunway",
    name: "Sunway University",
    shortName: "Sunway",
    level: 2,
    city: "Subang Jaya, Selangor",
    description: "Sunway University is a leading non-profit Malaysian university renowned for high-impact research, global academic partnerships with Lancaster and Harvard, and modern facilities.",
    logo_url: "https://en.your-uni.com/assets/images/university/sunway-university.webp",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["sunway"],
  },
  {
    id: "priority-uow",
    name: "Wollongong University Malaysia",
    shortName: "UOW",
    level: 2,
    city: "Glenmarie, Shah Alam",
    description: "UOW Malaysia, part of the University of Wollongong Australia global network, delivers globally accredited Australian business, game development, engineering, and computing degrees.",
    logo_url: "https://en.your-uni.com/assets/images/university/university-of-wollongong-uow.png",
    hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80",
    matchKeys: ["wollongong", "uow"],
  },
  {
    id: "priority-swinburne",
    name: "Swinburne University of Technology",
    shortName: "Swinburne",
    level: 2,
    city: "Kuching, Sarawak",
    description: "Swinburne University of Technology Sarawak Campus is the international branch campus of Swinburne Australia, granting identical Australian degrees in engineering, design, and business.",
    logo_url: "https://en.your-uni.com/assets/images/university/swinburne-university-of-technology-malaysia.webp",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["swinburne"],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 3 (PAGE 3)
  // ─────────────────────────────────────────────────────────────
  {
    id: "priority-kpj",
    name: "KPJ Healthcare University",
    shortName: "KPJ",
    level: 3,
    city: "Nilai, Negeri Sembilan",
    description: "KPJ Healthcare University is a healthcare education leader supported by KPJ Healthcare Berhad's hospital network, offering medical, nursing, and allied health training.",
    logo_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80",
    matchKeys: ["kpj healthcare", "kpj"],
  },
  {
    id: "priority-bac",
    name: "BAC - Brickfields Asia College",
    shortName: "BAC",
    level: 3,
    city: "Kuala Lumpur",
    description: "Brickfields Asia College (BAC) is acclaimed as the nation's premier law and business school, producing outstanding UK law degree results and career-ready professionals.",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["brickfields", "bac"],
  },
  {
    id: "priority-iact",
    name: "IACT College",
    shortName: "IACT",
    level: 3,
    city: "Petaling Jaya, Selangor",
    description: "IACT College is Malaysia's premier creative communication specialist, founded by advertising industry leaders to provide hands-on media, design, broadcasting, and marketing degrees.",
    logo_url: "https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["iact"],
  },
  {
    id: "priority-veritas",
    name: "Veritas University College",
    shortName: "Veritas",
    level: 3,
    city: "Petaling Jaya, Selangor",
    description: "Veritas University College offers forward-thinking degrees in law, business, education, and social sciences with strong international credit transfers and blended study formats.",
    logo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["veritas"],
  },
  {
    id: "priority-unimy",
    name: "UNIMY – University of Malaysia of Computer Science & Engineering",
    shortName: "UNIMY",
    level: 3,
    city: "Cyberjaya, Selangor",
    description: "UNIMY is a premier ICT-specialist boutique university devoted to nurturing high-demand technology professionals in software engineering, cybersecurity, and data science.",
    logo_url: "https://en.your-uni.com/assets/images/university/university-malaysia-of-computer-science-and-engineering-unimy.webp",
    hero_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    matchKeys: ["unimy", "computer science & engineering", "computer science and engineering"],
  },
  {
    id: "priority-reliance",
    name: "Reliance College",
    shortName: "Reliance",
    level: 3,
    city: "Kuala Lumpur",
    description: "Reliance College is a pioneer in tourism and hospitality management education in Malaysia, empowering students with direct international internships and real-world hospitality training.",
    logo_url: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80",
    matchKeys: ["reliance"],
  },
  {
    id: "priority-msu",
    name: "Management & Science University (MSU)",
    shortName: "MSU",
    level: 3,
    city: "Shah Alam, Selangor",
    description: "Management & Science University (MSU) is a QS-ranked global institution focused on high graduate employability, medicine, health sciences, business, and tech qualifications.",
    logo_url: "https://en.your-uni.com/assets/images/university/msu-university.webp",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["msu", "management & science", "management and science"],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 4 (PAGE 4)
  // ─────────────────────────────────────────────────────────────
  {
    id: "priority-ucsi",
    name: "UCSI University",
    shortName: "UCSI",
    level: 4,
    city: "Kuala Lumpur",
    description: "UCSI University is ranked among the top 1% of universities worldwide, celebrated for stellar music, engineering, pharmacy, business, and extensive global university linkages.",
    logo_url: "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["ucsi"],
  },
  {
    id: "priority-utar",
    name: "Universiti Tunku Abdul Rahman (UTAR)",
    shortName: "UTAR",
    level: 4,
    city: "Kampar & Sungai Long",
    description: "Universiti Tunku Abdul Rahman (UTAR) is a premier non-profit Malaysian university renowned for academic excellence, affordable quality tuition, and high industry employability.",
    logo_url: "https://en.your-uni.com/assets/images/university/utar-university.webp",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["utar", "tunku abdul rahman university (utar)"],
  },
  {
    id: "priority-raffles",
    name: "Raffles University",
    shortName: "Raffles",
    level: 4,
    city: "Iskandar Puteri, Johor",
    description: "Raffles University is a practice-oriented university in EduCity Iskandar offering premier international curricula in design, business, psychology, and artificial intelligence.",
    logo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["raffles"],
  },
  {
    id: "priority-unisza",
    name: "Universiti Sultan Zainal Abidin (UniSZA)",
    shortName: "UniSZA",
    level: 4,
    city: "Kuala Terengganu, Terengganu",
    description: "Universiti Sultan Zainal Abidin (UniSZA) is a distinguished public university in Terengganu offering comprehensive medical, Islamic contemporary studies, law, and business programmes.",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["unisza", "sultan zainal abidin"],
  },
  {
    id: "priority-utm",
    name: "Universiti Teknologi Malaysia (UTM)",
    shortName: "UTM",
    level: 4,
    city: "Skudai, Johor",
    description: "Universiti Teknologi Malaysia (UTM) is a premier Malaysian public research university and a regional technological powerhouse in engineering, science, and architectural innovation.",
    logo_url: "https://en.your-uni.com/assets/images/university/utm-university.webp",
    hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80",
    matchKeys: ["universiti teknologi malaysia", "utm university", "utm"],
  },
  {
    id: "priority-utem",
    name: "Universiti Teknikal Malaysia Melaka (UTeM)",
    shortName: "UTeM",
    level: 4,
    city: "Durian Tunggal, Melaka",
    description: "Universiti Teknikal Malaysia Melaka (UTeM) is the pioneer technical public university in Malaysia, pioneering advanced technical and vocational education and engineering.",
    logo_url: "https://en.your-uni.com/assets/images/university/utem-university.webp",
    hero_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    matchKeys: ["utem", "teknikal malaysia melaka"],
  },
  {
    id: "priority-utp",
    name: "Universiti Teknologi PETRONAS (UTP)",
    shortName: "UTP",
    level: 4,
    city: "Seri Iskandar, Perak",
    description: "Universiti Teknologi PETRONAS (UTP) is a premier private university in Malaysia wholly owned by PETRONAS, globally ranked for engineering, energy transition, and computer science.",
    logo_url: "https://en.your-uni.com/assets/images/university/utp-university.webp",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["utp", "petronas"],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 5 (PAGE 5)
  // ─────────────────────────────────────────────────────────────
  {
    id: "priority-help",
    name: "HELP University",
    shortName: "HELP",
    level: 5,
    city: "Kuala Lumpur",
    description: "HELP University is renowned across Asia for premier psychology, business, law, education, and analytics education with dual degree options and prestigious international credit transfers.",
    logo_url: "https://en.your-uni.com/assets/images/university/help-university.png",
    hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80",
    matchKeys: ["help university", "help"],
  },
  {
    id: "priority-limkokwing",
    name: "Limkokwing University",
    shortName: "Limkokwing",
    level: 5,
    city: "Cyberjaya, Selangor",
    description: "Limkokwing University of Creative Technology is an international creative hub known for cutting-edge design, multimedia, fashion, animation, and creative entrepreneurship.",
    logo_url: "https://en.your-uni.com/assets/images/university/limkokwing-university.webp",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["limkokwing"],
  },
  {
    id: "priority-space",
    name: "Kolej Space",
    shortName: "Kolej Space",
    level: 5,
    city: "Kuala Lumpur",
    description: "Kolej Space provides professional diploma and degree pathways connected with leading technical institutions, delivering accessible executive and industry-aligned higher education.",
    logo_url: "https://en.your-uni.com/assets/images/university/utm-space-university-malaysia.webp",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["kolej space", "utm space", "space"],
  },
  {
    id: "priority-cityu",
    name: "City University Malaysia",
    shortName: "City U",
    level: 5,
    city: "Petaling Jaya, Selangor",
    description: "City University Malaysia delivers quality, career-focused bachelor's and postgraduate qualifications in business, design, information technology, and allied health sciences.",
    logo_url: "https://en.your-uni.com/assets/images/university/city-university.webp",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["city university"],
  },
  {
    id: "priority-unitar",
    name: "UNITAR International University",
    shortName: "UNITAR",
    level: 5,
    city: "Petaling Jaya, Selangor",
    description: "UNITAR International University is a premier digital-first Malaysian university offering highly accessible business, education, IT, and culinary arts programmes.",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["unitar"],
  },
  {
    id: "priority-nmuc",
    name: "NMUC (Netherlands Maritime University College) City Campus (Formerly known as NMIT)",
    shortName: "NMUC",
    level: 5,
    city: "Johor Bahru & KL",
    description: "NMUC specializes in maritime transport, port management, logistics, and shipping operations with direct European maritime academic partnerships.",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["nmuc", "nmit", "netherlands maritime"],
  },
  {
    id: "priority-iimat",
    name: "IIMAT College - International Institute of Management and Technology",
    shortName: "IIMAT",
    level: 5,
    city: "Kuala Lumpur",
    description: "IIMAT College provides accredited diploma and degree pathways in business management, accounting, information technology, and vocational leadership.",
    logo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["iimat", "international institute of management and technology"],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 6 (PAGE 6)
  // ─────────────────────────────────────────────────────────────
  {
    id: "priority-mmu",
    name: "Multimedia University",
    shortName: "MMU",
    level: 6,
    city: "Cyberjaya, Selangor",
    description: "Multimedia University (MMU) is Malaysia's first private university and premier incubator of digital creative talent, multimedia innovation, software engineering, and AI.",
    logo_url: "https://en.your-uni.com/assets/images/university/mmu-university.webp",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["multimedia university", "mmu"],
  },
  {
    id: "priority-iumw",
    name: "Universiti Malaya-Wales",
    shortName: "IUMW",
    level: 6,
    city: "Kuala Lumpur",
    description: "International University of Malaya-Wales (IUMW) is a joint university established between University of Malaya (UM) and the University of Wales, UK, awarding dual-award qualifications.",
    logo_url: "https://en.your-uni.com/assets/images/university/iumw-university.webp",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["malaya-wales", "malaya wales", "iumw"],
  },
  {
    id: "priority-kings",
    name: "Kings University College",
    shortName: "Kings",
    level: 6,
    city: "Kuala Lumpur",
    description: "Kings University College delivers market-responsive qualifications in business, technology, early childhood education, and logistics in metropolitan Kuala Lumpur.",
    logo_url: "https://en.your-uni.com/assets/images/university/kings-university-college.png",
    hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80",
    matchKeys: ["kings university", "kings"],
  },
  {
    id: "priority-ypc",
    name: "YPC International College",
    shortName: "YPC",
    level: 6,
    city: "Kuala Lumpur",
    description: "YPC International College collaborates with Liverpool John Moores University (UK) to provide quality, cost-effective British undergraduate and postgraduate degrees.",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["ypc"],
  },
  {
    id: "priority-unimaiwp",
    name: "Universiti Antarabangsa MAIWP (UniMAIWP)",
    shortName: "UniMAIWP",
    level: 6,
    city: "Batu Caves, Selangor",
    description: "UniMAIWP (formerly UUCMS) is an Islamic and allied health sciences university offering nursing, pharmacy, Islamic finance, and contemporary digital studies.",
    logo_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    matchKeys: ["unimaiwp", "maiwp"],
  },
  {
    id: "priority-siuc",
    name: "Spectrum International University College (SIUC)",
    shortName: "SIUC",
    level: 6,
    city: "Petaling Jaya, Selangor",
    description: "SIUC delivers cutting-edge programs in business administration, computing, technology, and multimedia design for regional and international learners.",
    logo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["spectrum", "siuc"],
  },
  {
    id: "priority-klust",
    name: "Kuala Lumpur University of Science and Technology (KLUST)",
    shortName: "KLUST",
    level: 6,
    city: "Kuala Lumpur",
    description: "KLUST is an innovative technology-driven institution preparing future engineers, data analysts, and science innovators for Industry 4.0.",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["klust", "kuala lumpur university of science"],
  },
];

// Preserved for backward compatibility
export const TOP_7_PRIORITY_UNIVERSITIES = ALL_PRIORITY_UNIVERSITIES.slice(0, 7);

/**
 * Checks whether an institution name matches a given key.
 * For short acronyms (<= 5 chars), uses word-boundary matching to avoid substring false positives (e.g. 'utem' matching 'utm').
 */
function matchesKey(nameLower: string, key: string): boolean {
  if (key.length <= 5) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    return regex.test(nameLower);
  }
  return nameLower.includes(key);
}

export function getUniversityPriorityIndex(name: string): number {
  if (!name) return 999;
  const lower = name.toLowerCase().trim();
  for (let i = 0; i < ALL_PRIORITY_UNIVERSITIES.length; i++) {
    const config = ALL_PRIORITY_UNIVERSITIES[i];
    if (config.matchKeys.some((k) => matchesKey(lower, k))) {
      return i;
    }
  }
  return 999;
}

export function isPriorityUniversity(name: string): boolean {
  return getUniversityPriorityIndex(name) < 999;
}

/**
 * Sorts any array of universities so that the 42 priority universities across
 * Level 1 to Level 6 are placed at the beginning in their designated sequence,
 * followed by all other institutions sorted alphabetically.
 */
export function sortUniversitiesWithPriority<T extends { name?: string | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const nameA = a.name || "";
    const nameB = b.name || "";
    const pA = getUniversityPriorityIndex(nameA);
    const pB = getUniversityPriorityIndex(nameB);

    if (pA !== pB) {
      return pA - pB;
    }
    return nameA.localeCompare(nameB);
  });
}

/**
 * Ensures that if any of the 42 priority universities are missing from the backend list,
 * they are merged into the list with high-quality fallback details so that
 * all 6 levels (42 universities across Pages 1-6) are GUARANTEED to appear.
 */
export function mergePriorityUniversities<T extends { id?: string; name?: string | null }>(
  existingList: T[]
): T[] {
  const result: T[] = [...existingList];

  ALL_PRIORITY_UNIVERSITIES.forEach((topUni) => {
    const alreadyExists = result.some((item) => {
      const lower = (item.name || "").toLowerCase();
      return topUni.matchKeys.some((k) => matchesKey(lower, k));
    });

    if (!alreadyExists) {
      result.push({
        id: topUni.id,
        name: topUni.name,
        city: topUni.city,
        description: topUni.description,
        logo_url: topUni.logo_url,
        hero_image: topUni.hero_image,
      } as unknown as T);
    }
  });

  return sortUniversitiesWithPriority(result);
}
