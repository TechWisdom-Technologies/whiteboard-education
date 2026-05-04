export interface CountryReason {
  title: string;
  description: string;
  iconName: string;
}

export interface CountryCostOfLiving {
  housing: string;
  food: string;
  transport: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  flag_icon: string;
  bannerImage?: string;
  capital?: string;
  currency?: string;
  language?: string;
  population?: string;
  aboutText?: string;
  reasonsToStudy?: CountryReason[];
  costOfLiving?: CountryCostOfLiving;
  postStudyWorkRights?: string;
}

export interface UniversityFAQ {
  question: string;
  answer: string;
}

export interface University {
  id: number;
  name: string;
  country_id: number;
  city: string;
  logo_url: string;
  description: string;
  ranking: number;
  global_score: number;
  aboutText?: string;
  studyReasons?: string[];
  faqs?: UniversityFAQ[];
  registrationSteps?: string[];
  totalStudents?: number;
  internationalRatio?: number;
  established?: number;
  campusSize?: string;
  heroImage?: string;
}

export interface CurriculumYear {
  year: string;
  modules: string[];
}

export interface EntryRequirements {
  gpa: number;
  ielts: number;
}

export interface Course {
  id: number;
  title: string;
  university_id: number;
  degree_level: string;
  tuition_fee: number;
  duration: string;
  intake_months: string[];
  overview?: string;
  curriculum?: CurriculumYear[];
  entryRequirements?: EntryRequirements;
  careerOutcomes?: string[];
}

export interface Accommodation {
  id: number;
  name: string;
  city: string;
  distance_to_university_id: number;
  near_university_ids: number[];
  price_per_month: number;
  type: string;
  amenities: string[];
}

export interface Scholarship {
  id: number;
  name: string;
  university_id: number;
  coverage_amount: string;
  criteria: string;
}

export interface B2BPartner {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  total_sent: number;
  processing: number;
  converted: number;
  commission: number;
  agency_name: string;
  contact_person: string;
  total_referrals: number;
  successful_enrollments: number;
  commission_earned: number;
}

export interface Student {
  id: number;
  name: string;
  partner_id: number | null;
  academic_score: number;
  ielts_score: number;
  status: "Document Review" | "Applied" | "Offer Letter" | "Visa" | "Done" | "Rejected";
  target_university_id: number;
  target_course_id: number;
  referred_by_partner_id: number;
  application_status: string;
}

export interface Testimonial {
  id: number;
  name: string;
  country: string;
  university: string;
  quote: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  coverImage: string;
  category: string;
  readTime: string;
}

export interface LanguageCenter {
  id: number;
  name: string;
  institute: string;
  city: string;
  duration: string;
  tuitionFee: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  overview: string;
  curriculum?: string[];
  intakeMonths?: string[];
}

export interface CostOfLivingData {
  country: string;
  city: string;
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  entertainment: number;
}

export interface UniversityComparison {
  university_id: number;
  academic_difficulty: number;
  affordability: number;
  campus_life: number;
  min_ielts: number;
  min_toefl: number;
  avg_living_cost: number;
}

export interface IntakeDeadline {
  id: number;
  university_id: number;
  intake: string;
  deadline: string;
  semester: "Fall" | "Spring" | "Summer";
}

export interface Event {
  id: number;
  title: string;
  type: "Open Day" | "Workshop" | "Webinar" | "Info Session";
  date: string;
  time: string;
  university_ids: number[];
  description: string;
  spots_left: number;
}

export interface Ambassador {
  id: number;
  name: string;
  country: string;
  university: string;
  course: string;
  avatar: string;
  bio: string;
  icebreakers: string[];
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: "checklist" | "guide" | "ebook";
  icon: string;
}

// ─── Malaysia-only country ───────────────────────────────────────────────────

export const countries: Country[] = [
  {
    id: 1, name: "Malaysia", code: "MY", flag_icon: "🇲🇾",
    bannerImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1400&h=600&fit=crop",
    capital: "Kuala Lumpur", currency: "MYR (Ringgit)", language: "Malay & English", population: "33 Million",
    aboutText: "Malaysia has emerged as one of the top education hubs in Asia, hosting over 170,000 international students from 150+ countries. The Malaysian government actively promotes its 'Education Malaysia' initiative, offering world-class programs at public and private universities, many with dual-degree partnerships with institutions in the UK, Australia, and the US. English is widely spoken and used as the medium of instruction in most international programs, making it an accessible destination for students worldwide.",
    reasonsToStudy: [
      { title: "Affordable Tuition", description: "Tuition fees are 50-70% lower than the US, UK, or Australia while maintaining international standards.", iconName: "DollarSign" },
      { title: "Cultural Diversity", description: "Experience a rich multicultural society with Malay, Chinese, Indian, and indigenous cultures.", iconName: "Globe" },
      { title: "High-Tech Campuses", description: "Modern universities with state-of-the-art labs, smart classrooms, and digital libraries.", iconName: "Laptop" },
      { title: "Gateway to Asia", description: "Strategic location with easy access to Singapore, Thailand, Indonesia, and beyond.", iconName: "Plane" },
      { title: "Safe & Welcoming", description: "Ranked one of the safest countries in Southeast Asia with friendly locals.", iconName: "Shield" },
      { title: "Globally Recognized Degrees", description: "Many programs are accredited by UK, Australian, and international bodies.", iconName: "Award" },
    ],
    costOfLiving: { housing: "$200 – $600/month", food: "$150 – $250/month", transport: "$30 – $60/month" },
    postStudyWorkRights: "International graduates from Malaysian universities can apply for a 12-month Professional Visit Pass to seek employment. Malaysia's Digital Nomad visa and growing tech sector also provide pathways for graduates in STEM fields. The Malaysia My Second Home (MM2H) program offers long-term residency options for qualifying individuals.",
  },
];

// ─── Malaysian cities (for filters) ──────────────────────────────────────────

export const malaysianCities = [
  "Kuala Lumpur",
  "Subang Jaya",
  "Cyberjaya",
  "Johor Bahru",
  "Serdang",
  "Penang",
] as const;

export type MalaysianCity = typeof malaysianCities[number];

// ─── Universities (Malaysia only) ────────────────────────────────────────────

const defaultFaqs: UniversityFAQ[] = [
  { question: "Are scholarships available for international students?", answer: "Yes, we offer a range of merit-based and need-based scholarships for international students. Eligibility varies by program and academic performance. Contact our admissions team for details." },
  { question: "Is on-campus accommodation guaranteed?", answer: "On-campus housing is available on a first-come, first-served basis. We also assist students in finding affordable off-campus accommodation near the university." },
  { question: "Can I work part-time while studying?", answer: "International students on a student visa are typically allowed to work part-time (up to 20 hours/week) during semester breaks, subject to local regulations." },
  { question: "What is the language of instruction?", answer: "All programs are taught in English. Some universities may offer preparatory English courses if you need additional language support." },
  { question: "How do I apply for a student visa?", answer: "Once you receive your offer letter, our international office will guide you through the entire visa application process, including EMGS processing." },
];

const defaultSteps = [
  "Submit your application and supporting documents online",
  "Receive your Conditional Offer Letter within 5-10 business days",
  "Pay the EMGS/Visa processing fee and submit medical reports",
  "Receive Visa Approval Letter (VAL) from immigration",
  "Book your flight and arrive on campus for orientation",
];

export const universities: University[] = [
  { id: 1, name: "University of Malaya (UM)", country_id: 1, city: "Kuala Lumpur", logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop", description: "Malaysia's oldest and top-ranked university, renowned for research excellence and a vibrant international community.", ranking: 65, global_score: 88, totalStudents: 28000, internationalRatio: 25, established: 1905, campusSize: "900 Acres", aboutText: "Founded in 1905, the University of Malaya (UM) is Malaysia's oldest and highest-ranked university. Located in the heart of Kuala Lumpur, UM is a comprehensive research university with a commitment to academic excellence, innovative research, and community engagement. With over 28,000 students from more than 80 countries, UM provides a truly global learning environment.", studyReasons: ["Top-ranked university in Malaysia with global recognition", "World-class research facilities and laboratories", "Vibrant multicultural campus in the heart of KL", "Strong industry partnerships and career placement", "Affordable tuition compared to Western universities", "Beautiful 900-acre campus with modern amenities"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 2, name: "Universiti Teknologi Malaysia (UTM)", country_id: 1, city: "Johor Bahru", logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop", description: "Leading technical university with strong engineering programs and industry partnerships.", ranking: 188, global_score: 74, totalStudents: 22000, internationalRatio: 18, established: 1972, campusSize: "1200 Acres", aboutText: "Universiti Teknologi Malaysia (UTM) is a premier science and technology university committed to developing creative and innovative human capital. With a sprawling 1200-acre campus in Johor Bahru, UTM is known for its engineering programs and deep industry ties with companies like Petronas and Intel.", studyReasons: ["Leading engineering and technology programs", "Massive 1200-acre campus with cutting-edge labs", "Strong industry partnerships with Fortune 500 companies", "Affordable living costs in Johor Bahru", "Dedicated international student support", "Active student clubs and sports facilities"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 3, name: "Monash University Malaysia", country_id: 1, city: "Subang Jaya", logo_url: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200&h=600&fit=crop", description: "A branch campus of Australia's prestigious Monash University with world-class facilities.", ranking: 42, global_score: 91, totalStudents: 8500, internationalRatio: 40, established: 1998, campusSize: "65 Acres", aboutText: "Monash University Malaysia is the largest campus outside Australia of the prestigious Monash University. Located in Subang Jaya, it offers Australian-quality education at Malaysian prices. Students receive a Monash Australia degree while benefiting from Southeast Asia's dynamic growth.", studyReasons: ["Australian degree at a fraction of the cost", "40% international student community", "World-class medical and engineering programs", "Seamless transfer pathways to Australia campus", "Modern campus with state-of-the-art facilities", "Strong alumni network across Asia-Pacific"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 4, name: "Taylor's University", country_id: 1, city: "Subang Jaya", logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1200&h=600&fit=crop", description: "Premier private university known for hospitality and business programs.", ranking: 284, global_score: 68, totalStudents: 12000, internationalRatio: 22, established: 1969, campusSize: "27 Acres", aboutText: "Taylor's University is Malaysia's top private university, ranked among the world's best for hospitality and leisure management. Its lakeside campus in Subang Jaya offers a vibrant student experience with modern facilities, industry-linked programs, and a strong entrepreneurial culture.", studyReasons: ["#1 in Malaysia for Hospitality & Tourism", "Award-winning lakeside campus", "Industry-integrated curriculum with internships", "Entrepreneurship hub and startup incubator", "Diverse student body from 80+ countries", "Strong career services and employer connections"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 5, name: "UCSI University", country_id: 1, city: "Kuala Lumpur", logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=600&fit=crop", description: "Top private university with diverse programs and global partnerships.", ranking: 347, global_score: 63, totalStudents: 10000, internationalRatio: 30, established: 1986, campusSize: "19 Acres", aboutText: "UCSI University is one of Malaysia's leading private universities, recognized for its commitment to praxis-oriented education. With campuses in KL, Kuching, and Springhill, UCSI offers a diverse range of programs with strong emphasis on practical, hands-on learning.", studyReasons: ["Praxis-oriented education philosophy", "30% international student population", "Strong music and pharmacy programs", "Multiple campus locations in Malaysia", "Industry-certified training programs", "Active research culture with funded projects"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 6, name: "Universiti Putra Malaysia (UPM)", country_id: 1, city: "Serdang", logo_url: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=600&fit=crop", description: "Research-intensive university with agriculture and science focus.", ranking: 123, global_score: 81, totalStudents: 30000, internationalRatio: 15, established: 1931, campusSize: "1500 Acres", aboutText: "Universiti Putra Malaysia (UPM) is a leading research university with roots in agriculture and a modern focus spanning science, engineering, and the humanities. Its massive 1500-acre campus in Serdang is one of the most beautiful in Malaysia.", studyReasons: ["Top 5 in Malaysia for research output", "Massive 1500-acre green campus", "World-leading agricultural science programs", "Affordable tuition and living costs", "Strong postgraduate research community", "Excellent sports and recreational facilities"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 7, name: "Universiti Sains Malaysia (USM)", country_id: 1, city: "Penang", logo_url: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=600&fit=crop", description: "Malaysia's APEX (Accelerated Programme for Excellence) university on the island of Penang.", ranking: 137, global_score: 79, totalStudents: 30000, internationalRatio: 12, established: 1969, campusSize: "416 Acres", aboutText: "Universiti Sains Malaysia (USM) is the only university in Malaysia granted the APEX (Accelerated Programme for Excellence) status by the government. Located on the beautiful island of Penang, USM excels in sustainability, medical sciences, and engineering. Its campus offers a unique blend of academic rigour and island lifestyle.", studyReasons: ["APEX status — Malaysia's only accelerated excellence university", "Beautiful island campus in Penang", "Strong medical and pharmaceutical sciences", "Pioneer in sustainability research", "Affordable island living with rich food culture", "Active international exchange programs"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 8, name: "Asia Pacific University (APU)", country_id: 1, city: "Kuala Lumpur", logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=600&fit=crop", description: "Award-winning university specialising in technology, innovation, and digital skills.", ranking: 450, global_score: 60, totalStudents: 13000, internationalRatio: 50, established: 1993, campusSize: "Modern Campus", aboutText: "Asia Pacific University (APU) is one of Malaysia's most international universities, with students from over 130 countries making up 50% of its student body. Located in the Technology Park Malaysia, APU specialises in computing, engineering, and business programs with strong industry partnerships.", studyReasons: ["50% international student body from 130+ countries", "Specialised in technology and digital innovation", "Located in Technology Park Malaysia", "Award-winning teaching and learning", "Strong employability rate of 100% within 6 months", "Industry-certified programs (Cisco, Oracle, IBM)"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 9, name: "HELP University", country_id: 1, city: "Kuala Lumpur", logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1200&h=600&fit=crop", description: "Leading private university with strong psychology and business faculties.", ranking: 520, global_score: 55, totalStudents: 8000, internationalRatio: 15, established: 1986, campusSize: "Urban Campus", aboutText: "HELP University is renowned for its psychology and business programs, consistently producing top-performing graduates. Located in the heart of Kuala Lumpur, HELP offers a supportive learning environment with small class sizes and personalised mentoring.", studyReasons: ["Top psychology program in Malaysia", "Small class sizes for personalised learning", "Central KL location with excellent connectivity", "Strong career counselling services", "Affordable tuition with scholarship options", "Active student clubs and professional societies"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 10, name: "Sunway University", country_id: 1, city: "Subang Jaya", logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=600&fit=crop", description: "Rapidly growing private university with Lancaster University partnerships.", ranking: 580, global_score: 52, totalStudents: 9000, internationalRatio: 20, established: 2004, campusSize: "Integrated Resort Campus", aboutText: "Sunway University is part of the Sunway Education Group and offers dual-degree programs with Lancaster University, UK. Located within the vibrant Sunway City integrated township, students enjoy world-class facilities including a medical centre, shopping mall, and theme park.", studyReasons: ["Dual-degree programs with Lancaster University", "Integrated township with all amenities", "Modern campus with green building design", "Strong business and computing programs", "Active student exchange opportunities", "Scholarship programs for top achievers"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 11, name: "Multimedia University (MMU)", country_id: 1, city: "Cyberjaya", logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop", description: "Pioneer in multimedia and IT education in Malaysia.", ranking: 600, global_score: 50, totalStudents: 18000, internationalRatio: 12, established: 1996, campusSize: "Cyberjaya & Melaka Campuses", aboutText: "Multimedia University (MMU) was Malaysia's first private university dedicated to ICT and multimedia education. Located in the tech hub of Cyberjaya, MMU is a pioneer in creative technology, film, and animation education, producing graduates who lead Malaysia's digital economy.", studyReasons: ["Pioneer in multimedia and ICT education", "Located in Malaysia's tech hub Cyberjaya", "Award-winning film and animation programs", "Strong ties with Telekom Malaysia", "Affordable tuition and living costs", "Active esports and gaming community"], faqs: defaultFaqs, registrationSteps: defaultSteps },
  { id: 12, name: "Universiti Teknologi MARA (UiTM)", country_id: 1, city: "Kuala Lumpur", logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop", heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop", description: "Malaysia's largest university with 35 campuses nationwide and strong professional programs.", ranking: 550, global_score: 54, totalStudents: 170000, internationalRatio: 5, established: 1956, campusSize: "Multiple Campuses", aboutText: "Universiti Teknologi MARA (UiTM) is the largest university in Malaysia with 35 campuses across the country. It offers a wide range of programs accredited by international bodies, with particular strength in accounting (ACCA), architecture, and business.", studyReasons: ["Largest university network in Malaysia", "ACCA-accredited accounting programs", "35 campuses for flexible learning", "Strong professional program partnerships", "Vibrant campus culture and sports", "Affordable tuition for all programs"], faqs: defaultFaqs, registrationSteps: defaultSteps },
];

// ─── Courses (Malaysia universities only) ────────────────────────────────────

export const courses: Course[] = [
  { id: 1, title: "Bachelor of Computer Science", university_id: 1, degree_level: "Bachelor", tuition_fee: 12000, duration: "3 years", intake_months: ["March", "September"], overview: "This program equips students with a strong foundation in algorithms, software engineering, data structures, and AI. Graduates are prepared for careers in the rapidly growing tech industry across Southeast Asia and beyond.", curriculum: [{ year: "Year 1", modules: ["Introduction to Programming", "Discrete Mathematics", "Computer Architecture", "Web Development Fundamentals"] }, { year: "Year 2", modules: ["Data Structures & Algorithms", "Database Systems", "Operating Systems", "Software Engineering"] }, { year: "Year 3", modules: ["Artificial Intelligence", "Cloud Computing", "Capstone Project", "Cybersecurity Fundamentals"] }], entryRequirements: { gpa: 3.0, ielts: 6.0 }, careerOutcomes: ["Software Engineer", "Data Analyst", "Full-Stack Developer", "Systems Architect", "DevOps Engineer", "AI/ML Engineer"] },
  { id: 2, title: "Master of Business Administration", university_id: 1, degree_level: "Master", tuition_fee: 18000, duration: "2 years", intake_months: ["September"], overview: "A transformative MBA program designed for aspiring leaders. Covers strategic management, finance, marketing, and entrepreneurship with real-world case studies and industry projects.", curriculum: [{ year: "Year 1", modules: ["Strategic Management", "Financial Accounting", "Marketing Management", "Organizational Behaviour"] }, { year: "Year 2", modules: ["Entrepreneurship & Innovation", "Global Business Strategy", "Leadership Seminar", "MBA Capstone Project"] }], entryRequirements: { gpa: 3.2, ielts: 6.5 }, careerOutcomes: ["Business Consultant", "Marketing Director", "Product Manager", "Startup Founder", "Operations Manager"] },
  { id: 3, title: "Bachelor of Engineering (Mechanical)", university_id: 2, degree_level: "Bachelor", tuition_fee: 14000, duration: "4 years", intake_months: ["February", "September"], overview: "A comprehensive mechanical engineering program covering thermodynamics, materials science, and manufacturing processes with hands-on lab experience.", curriculum: [{ year: "Year 1", modules: ["Engineering Mathematics", "Physics for Engineers", "Engineering Drawing", "Workshop Practice"] }, { year: "Year 2", modules: ["Thermodynamics", "Mechanics of Materials", "Fluid Mechanics", "Manufacturing Processes"] }, { year: "Year 3", modules: ["Machine Design", "Control Systems", "Heat Transfer", "Industrial Training"] }, { year: "Year 4", modules: ["Finite Element Analysis", "Robotics", "Final Year Project", "Professional Ethics"] }], entryRequirements: { gpa: 3.0, ielts: 5.5 }, careerOutcomes: ["Mechanical Engineer", "Design Engineer", "Project Manager", "Manufacturing Engineer", "R&D Engineer"] },
  { id: 4, title: "Bachelor of Medicine (MBBS)", university_id: 3, degree_level: "Bachelor", tuition_fee: 45000, duration: "5 years", intake_months: ["March"], overview: "A world-class medical program offering clinical rotations at leading hospitals. Graduates are eligible to practice medicine globally with additional licensing.", curriculum: [{ year: "Year 1-2", modules: ["Anatomy", "Biochemistry", "Physiology", "Pathology", "Pharmacology"] }, { year: "Year 3-4", modules: ["Clinical Medicine", "Surgery", "Paediatrics", "Obstetrics & Gynaecology"] }, { year: "Year 5", modules: ["Hospital Rotations", "Emergency Medicine", "Community Medicine", "Final Clinical Exams"] }], entryRequirements: { gpa: 3.7, ielts: 7.0 }, careerOutcomes: ["Medical Doctor", "Surgeon", "Specialist Physician", "Medical Researcher", "Hospital Administrator"] },
  { id: 5, title: "Diploma in Culinary Arts", university_id: 4, degree_level: "Foundation", tuition_fee: 8000, duration: "2 years", intake_months: ["January", "May", "September"], overview: "Hands-on culinary training covering international cuisines, pastry arts, food safety, and restaurant management in professional kitchen facilities.", curriculum: [{ year: "Year 1", modules: ["Culinary Fundamentals", "Food Safety & Hygiene", "Pastry & Bakery Basics", "Asian Cuisines"] }, { year: "Year 2", modules: ["Western Cuisines", "Restaurant Management", "Food Photography", "Industry Internship"] }], entryRequirements: { gpa: 2.5, ielts: 5.0 }, careerOutcomes: ["Chef de Partie", "Pastry Chef", "Restaurant Manager", "Food Consultant", "Catering Manager"] },
  { id: 6, title: "Bachelor of Pharmacy", university_id: 5, degree_level: "Bachelor", tuition_fee: 16000, duration: "4 years", intake_months: ["March", "September"], overview: "A rigorous pharmacy program covering pharmaceutical sciences, clinical pharmacy, and drug development with extensive practical training.", curriculum: [{ year: "Year 1", modules: ["Pharmaceutical Chemistry", "Human Anatomy", "Microbiology", "Mathematics for Pharmacy"] }, { year: "Year 2", modules: ["Pharmacology", "Pharmaceutical Analysis", "Medicinal Chemistry", "Pharmacognosy"] }, { year: "Year 3", modules: ["Clinical Pharmacy", "Hospital Pharmacy Practice", "Drug Formulation", "Regulatory Affairs"] }, { year: "Year 4", modules: ["Advanced Pharmacotherapy", "Research Project", "Community Pharmacy Internship", "Professional Practice"] }], entryRequirements: { gpa: 3.2, ielts: 6.0 }, careerOutcomes: ["Hospital Pharmacist", "Clinical Pharmacist", "Pharmaceutical Researcher", "Regulatory Affairs Specialist", "Drug Safety Officer"] },
  { id: 7, title: "PhD in Agricultural Science", university_id: 6, degree_level: "PhD", tuition_fee: 10000, duration: "3 years", intake_months: ["February"], overview: "An advanced research program focused on sustainable agriculture, crop science, and food security. Students conduct original research under expert supervision.", curriculum: [{ year: "Year 1", modules: ["Research Methodology", "Advanced Crop Science", "Soil Science & Sustainability", "Literature Review"] }, { year: "Year 2", modules: ["Fieldwork & Data Collection", "Statistical Analysis", "Publication Writing", "Conference Presentation"] }, { year: "Year 3", modules: ["Thesis Writing", "Viva Voce Preparation", "Knowledge Transfer", "Final Defence"] }], entryRequirements: { gpa: 3.5, ielts: 6.5 }, careerOutcomes: ["Agricultural Researcher", "University Lecturer", "Policy Advisor", "Agri-Tech Consultant", "Sustainability Officer"] },
  { id: 8, title: "Master of Data Science", university_id: 1, degree_level: "Master", tuition_fee: 20000, duration: "2 years", intake_months: ["September"], overview: "A cutting-edge program combining statistics, machine learning, and big data analytics. Ideal for professionals transitioning into data-driven roles.", curriculum: [{ year: "Year 1", modules: ["Statistical Learning", "Big Data Technologies", "Machine Learning", "Data Visualization"] }, { year: "Year 2", modules: ["Deep Learning", "Natural Language Processing", "Capstone Project", "Ethics in AI"] }], entryRequirements: { gpa: 3.0, ielts: 6.5 }, careerOutcomes: ["Data Scientist", "Machine Learning Engineer", "Business Intelligence Analyst", "AI Researcher", "Chief Data Officer"] },
  { id: 9, title: "Bachelor of Hospitality Management", university_id: 4, degree_level: "Bachelor", tuition_fee: 15000, duration: "3 years", intake_months: ["January", "September"], overview: "Combines business management with hands-on hospitality training. Students gain experience through internships at 5-star hotels and resorts.", curriculum: [{ year: "Year 1", modules: ["Introduction to Hospitality", "Food & Beverage Operations", "Front Office Management", "Business Communication"] }, { year: "Year 2", modules: ["Revenue Management", "Event Planning", "Housekeeping Management", "Industry Internship"] }, { year: "Year 3", modules: ["Strategic Hotel Management", "Tourism Marketing", "Hospitality Entrepreneurship", "Final Year Project"] }], entryRequirements: { gpa: 2.8, ielts: 5.5 }, careerOutcomes: ["Hotel Manager", "Event Coordinator", "Tourism Officer", "F&B Director", "Hospitality Consultant"] },
  { id: 10, title: "Master of Engineering (Electrical)", university_id: 2, degree_level: "Master", tuition_fee: 16000, duration: "2 years", intake_months: ["September"], overview: "Advanced electrical engineering covering power systems, telecommunications, and embedded systems with research-oriented coursework.", curriculum: [{ year: "Year 1", modules: ["Advanced Power Systems", "Digital Signal Processing", "Embedded Systems Design", "Research Methods"] }, { year: "Year 2", modules: ["IoT & Smart Systems", "Renewable Energy Engineering", "Dissertation", "Industry Seminar"] }], entryRequirements: { gpa: 3.0, ielts: 6.0 }, careerOutcomes: ["Electrical Engineer", "Power Systems Analyst", "Telecommunications Engineer", "IoT Specialist", "R&D Manager"] },
  { id: 11, title: "Foundation in Science", university_id: 8, degree_level: "Foundation", tuition_fee: 6000, duration: "1 year", intake_months: ["January", "May", "September"], overview: "A pathway program preparing students for degree-level studies in IT, engineering, and science disciplines.", curriculum: [{ year: "Year 1", modules: ["Mathematics", "Physics", "Chemistry", "English Proficiency", "IT Fundamentals"] }], entryRequirements: { gpa: 2.0, ielts: 5.0 }, careerOutcomes: ["Progress to Bachelor's Degree"] },
  { id: 12, title: "Bachelor of Software Engineering", university_id: 8, degree_level: "Bachelor", tuition_fee: 13000, duration: "3 years", intake_months: ["March", "September"], overview: "Focuses on software design patterns, agile methodologies, and full-stack development with industry certifications included.", curriculum: [{ year: "Year 1", modules: ["Programming Fundamentals", "Web Technologies", "Mathematics for Computing", "Database Design"] }, { year: "Year 2", modules: ["Software Architecture", "Mobile App Development", "Agile Project Management", "UI/UX Design"] }, { year: "Year 3", modules: ["Cloud Architecture", "DevOps Practices", "Industry Project", "Entrepreneurship"] }], entryRequirements: { gpa: 2.8, ielts: 5.5 }, careerOutcomes: ["Software Developer", "Mobile App Developer", "QA Engineer", "Scrum Master", "Technical Project Manager"] },
  { id: 13, title: "Bachelor of Psychology", university_id: 9, degree_level: "Bachelor", tuition_fee: 11000, duration: "3 years", intake_months: ["January", "September"], overview: "An accredited psychology program covering clinical, developmental, and organizational psychology with supervised practicum.", curriculum: [{ year: "Year 1", modules: ["Introduction to Psychology", "Biological Psychology", "Statistics for Psychology", "Developmental Psychology"] }, { year: "Year 2", modules: ["Cognitive Psychology", "Social Psychology", "Research Methods", "Abnormal Psychology"] }, { year: "Year 3", modules: ["Clinical Psychology", "Counselling Practicum", "Honours Research", "Organizational Psychology"] }], entryRequirements: { gpa: 3.0, ielts: 6.0 }, careerOutcomes: ["Clinical Psychologist", "Counsellor", "HR Specialist", "UX Researcher", "Organizational Consultant"] },
  { id: 14, title: "Bachelor of Accounting", university_id: 10, degree_level: "Bachelor", tuition_fee: 10000, duration: "3 years", intake_months: ["January", "March", "September"], overview: "An ACCA-accredited accounting program with exemptions covering financial reporting, auditing, and taxation.", curriculum: [{ year: "Year 1", modules: ["Financial Accounting", "Business Mathematics", "Economics", "Business Law"] }, { year: "Year 2", modules: ["Management Accounting", "Taxation", "Auditing", "Corporate Finance"] }, { year: "Year 3", modules: ["Advanced Financial Reporting", "Strategic Management Accounting", "Internship", "Final Year Project"] }], entryRequirements: { gpa: 2.5, ielts: 5.5 }, careerOutcomes: ["Chartered Accountant", "Auditor", "Tax Consultant", "Financial Controller", "CFO"] },
  { id: 15, title: "Foundation in Business", university_id: 10, degree_level: "Foundation", tuition_fee: 5500, duration: "1 year", intake_months: ["January", "May", "September"], overview: "A pathway into business degrees covering accounting, economics, and business fundamentals.", curriculum: [{ year: "Year 1", modules: ["Business Studies", "Accounting Principles", "Economics", "Mathematics", "English for Academic Purposes"] }], entryRequirements: { gpa: 2.0, ielts: 5.0 }, careerOutcomes: ["Progress to Bachelor's Degree"] },
  { id: 16, title: "Bachelor of Multimedia Design", university_id: 11, degree_level: "Bachelor", tuition_fee: 9000, duration: "3 years", intake_months: ["February", "September"], overview: "A creative program covering 3D animation, motion graphics, and interactive media at Malaysia's pioneer multimedia university.", curriculum: [{ year: "Year 1", modules: ["Design Fundamentals", "Digital Illustration", "Photography", "Web Design"] }, { year: "Year 2", modules: ["3D Modelling", "Motion Graphics", "UI/UX Design", "Video Production"] }, { year: "Year 3", modules: ["Advanced Animation", "Interactive Media", "Portfolio Project", "Industry Internship"] }], entryRequirements: { gpa: 2.5, ielts: 5.5 }, careerOutcomes: ["Graphic Designer", "Motion Graphics Artist", "UI/UX Designer", "3D Animator", "Creative Director"] },
  { id: 17, title: "Master of Cybersecurity", university_id: 11, degree_level: "Master", tuition_fee: 14000, duration: "2 years", intake_months: ["September"], overview: "An industry-aligned cybersecurity program covering ethical hacking, digital forensics, and security architecture.", curriculum: [{ year: "Year 1", modules: ["Network Security", "Ethical Hacking", "Cryptography", "Digital Forensics"] }, { year: "Year 2", modules: ["Security Architecture", "Incident Response", "Research Project", "Cloud Security"] }], entryRequirements: { gpa: 3.0, ielts: 6.0 }, careerOutcomes: ["Security Analyst", "Penetration Tester", "CISO", "Security Consultant", "Forensics Investigator"] },
  { id: 18, title: "Bachelor of Medical Sciences", university_id: 7, degree_level: "Bachelor", tuition_fee: 13000, duration: "4 years", intake_months: ["September"], overview: "A comprehensive medical sciences program at USM covering biomedical research, pharmacology, and public health on the island of Penang.", curriculum: [{ year: "Year 1", modules: ["Cell Biology", "Anatomy", "Biostatistics", "Medical Ethics"] }, { year: "Year 2", modules: ["Pharmacology", "Pathology", "Microbiology", "Immunology"] }, { year: "Year 3", modules: ["Clinical Biochemistry", "Public Health", "Research Methods", "Elective"] }, { year: "Year 4", modules: ["Research Project", "Advanced Pharmacology", "Community Health", "Seminar"] }], entryRequirements: { gpa: 3.3, ielts: 6.0 }, careerOutcomes: ["Biomedical Researcher", "Public Health Officer", "Pharmaceutical Scientist", "Lab Manager", "Healthcare Consultant"] },
  { id: 19, title: "Bachelor of Architecture", university_id: 12, degree_level: "Bachelor", tuition_fee: 11000, duration: "3.5 years", intake_months: ["March", "September"], overview: "An accredited architecture program at UiTM covering design studio, building technology, and urban planning.", curriculum: [{ year: "Year 1", modules: ["Design Studio I", "Architectural Drawing", "History of Architecture", "Mathematics for Design"] }, { year: "Year 2", modules: ["Design Studio II", "Building Technology", "Structural Systems", "Environmental Design"] }, { year: "Year 3", modules: ["Design Studio III", "Urban Planning", "Professional Practice", "Research Methods"] }, { year: "Year 3.5", modules: ["Final Design Thesis", "Portfolio Presentation"] }], entryRequirements: { gpa: 3.0, ielts: 6.0 }, careerOutcomes: ["Architect", "Urban Planner", "Interior Designer", "Landscape Architect", "BIM Specialist"] },
  { id: 20, title: "Master of Sustainable Development", university_id: 7, degree_level: "Master", tuition_fee: 12000, duration: "2 years", intake_months: ["February", "September"], overview: "An interdisciplinary program at USM focusing on environmental sustainability, green technology, and policy — aligning with USM's APEX mission.", curriculum: [{ year: "Year 1", modules: ["Sustainability Science", "Environmental Policy", "Green Technology", "Research Methods"] }, { year: "Year 2", modules: ["Climate Change Adaptation", "Sustainable Urban Planning", "Thesis", "Fieldwork"] }], entryRequirements: { gpa: 3.0, ielts: 6.0 }, careerOutcomes: ["Sustainability Officer", "Environmental Consultant", "Policy Analyst", "NGO Director", "Green Tech Entrepreneur"] },
];

// ─── Accommodations ──────────────────────────────────────────────────────────

export const accommodations: Accommodation[] = [
  { id: 1, name: "KL Sentral Residence", city: "Kuala Lumpur", near_university_ids: [1, 5], distance_to_university_id: 1, price_per_month: 800, type: "Apartment", amenities: ["WiFi", "Gym", "Pool", "Security"] },
  { id: 2, name: "Subang Student Hostel", city: "Subang Jaya", near_university_ids: [3, 4], distance_to_university_id: 3, price_per_month: 450, type: "Hostel", amenities: ["WiFi", "Laundry", "Cafeteria"] },
  { id: 3, name: "JB Student Lodge", city: "Johor Bahru", near_university_ids: [2], distance_to_university_id: 2, price_per_month: 350, type: "Hostel", amenities: ["WiFi", "Study Room", "Bus Service"] },
  { id: 4, name: "Serdang Heights Condo", city: "Serdang", near_university_ids: [6], distance_to_university_id: 6, price_per_month: 600, type: "Condominium", amenities: ["WiFi", "Pool", "Parking", "Gym"] },
  { id: 5, name: "Bangsar South Studio", city: "Kuala Lumpur", near_university_ids: [1, 5], distance_to_university_id: 1, price_per_month: 950, type: "Studio", amenities: ["WiFi", "Gym", "Concierge", "Pool"] },
  { id: 6, name: "SS15 Shared House", city: "Subang Jaya", near_university_ids: [3, 4], distance_to_university_id: 4, price_per_month: 300, type: "Shared House", amenities: ["WiFi", "Kitchen", "Garden"] },
  { id: 7, name: "Cyberjaya Student Suites", city: "Cyberjaya", near_university_ids: [11], distance_to_university_id: 11, price_per_month: 400, type: "Apartment", amenities: ["WiFi", "Gym", "Shuttle Bus", "Study Lounge"] },
  { id: 8, name: "Penang Heritage Hostel", city: "Penang", near_university_ids: [7], distance_to_university_id: 7, price_per_month: 350, type: "Hostel", amenities: ["WiFi", "Rooftop Terrace", "Kitchen", "Bicycle Rental"] },
];

// ─── Scholarships ────────────────────────────────────────────────────────────

export const scholarships: Scholarship[] = [
  { id: 1, name: "UM Global Excellence Award", university_id: 1, coverage_amount: "Full Tuition", criteria: "GPA 3.7+, IELTS 7.0+" },
  { id: 2, name: "UM Merit Scholarship", university_id: 1, coverage_amount: "50% Tuition", criteria: "GPA 3.5+, IELTS 6.5+" },
  { id: 3, name: "UTM Engineering Grant", university_id: 2, coverage_amount: "RM 15,000/year", criteria: "GPA 3.5+, Engineering applicants" },
  { id: 4, name: "Monash International Scholarship", university_id: 3, coverage_amount: "Full Tuition + Stipend", criteria: "GPA 3.8+, IELTS 7.0+" },
  { id: 5, name: "Taylor's Excellence Award", university_id: 4, coverage_amount: "30% Tuition", criteria: "GPA 3.3+, Leadership activities" },
  { id: 6, name: "UCSI Global Award", university_id: 5, coverage_amount: "RM 10,000/year", criteria: "GPA 3.4+, Community service" },
  { id: 7, name: "UPM Research Fellowship", university_id: 6, coverage_amount: "Full Tuition + Monthly Stipend", criteria: "PhD applicants, Published research" },
  { id: 8, name: "USM APEX Scholarship", university_id: 7, coverage_amount: "Full Tuition", criteria: "GPA 3.6+, STEM applicants" },
  { id: 9, name: "APU Global Tech Scholarship", university_id: 8, coverage_amount: "50% Tuition", criteria: "GPA 3.5+, Computing applicants" },
  { id: 10, name: "Sunway-Lancaster Dual Award", university_id: 10, coverage_amount: "40% Tuition", criteria: "GPA 3.4+, Business applicants" },
];

// ─── B2B Partners ────────────────────────────────────────────────────────────

export const b2bPartners: B2BPartner[] = [
  { id: 1, company_name: "Global Education Hub", contact_name: "Ahmad Ibrahim", email: "ahmad@globaledhub.com", total_sent: 156, processing: 18, converted: 124, commission: 62000, agency_name: "Global Education Hub", contact_person: "Ahmad Ibrahim", total_referrals: 156, successful_enrollments: 124, commission_earned: 62000 },
  { id: 2, company_name: "StudyBridge International", contact_name: "Sarah Chen", email: "sarah@studybridge.com", total_sent: 89, processing: 12, converted: 67, commission: 33500, agency_name: "StudyBridge International", contact_person: "Sarah Chen", total_referrals: 89, successful_enrollments: 67, commission_earned: 33500 },
  { id: 3, company_name: "EduConnect Africa", contact_name: "James Okonkwo", email: "james@educonnect.africa", total_sent: 210, processing: 22, converted: 178, commission: 89000, agency_name: "EduConnect Africa", contact_person: "James Okonkwo", total_referrals: 210, successful_enrollments: 178, commission_earned: 89000 },
  { id: 4, company_name: "Pacific Student Services", contact_name: "Mei Ling Wong", email: "mei@pacificstudent.com", total_sent: 45, processing: 5, converted: 38, commission: 19000, agency_name: "Pacific Student Services", contact_person: "Mei Ling Wong", total_referrals: 45, successful_enrollments: 38, commission_earned: 19000 },
  { id: 5, company_name: "Mideast Scholars Agency", contact_name: "Omar Farouk", email: "omar@mideastscholars.com", total_sent: 112, processing: 9, converted: 95, commission: 47500, agency_name: "Mideast Scholars Agency", contact_person: "Omar Farouk", total_referrals: 112, successful_enrollments: 95, commission_earned: 47500 },
];

// ─── Students ────────────────────────────────────────────────────────────────

export const students: Student[] = [
  { id: 1, name: "Ali Hassan", partner_id: 1, academic_score: 85, ielts_score: 7.0, status: "Done", target_university_id: 1, target_course_id: 1, referred_by_partner_id: 1, application_status: "Accepted" },
  { id: 2, name: "Fatima Zahra", partner_id: 1, academic_score: 78, ielts_score: 6.5, status: "Visa", target_university_id: 3, target_course_id: 4, referred_by_partner_id: 1, application_status: "Processing" },
  { id: 3, name: "John Doe", partner_id: 2, academic_score: 72, ielts_score: 6.0, status: "Document Review", target_university_id: 4, target_course_id: 5, referred_by_partner_id: 2, application_status: "Pending" },
  { id: 4, name: "Priya Sharma", partner_id: 3, academic_score: 91, ielts_score: 7.5, status: "Done", target_university_id: 1, target_course_id: 2, referred_by_partner_id: 3, application_status: "Accepted" },
  { id: 5, name: "David Osei", partner_id: 3, academic_score: 65, ielts_score: 5.5, status: "Rejected", target_university_id: 2, target_course_id: 3, referred_by_partner_id: 3, application_status: "Rejected" },
  { id: 6, name: "Yuki Tanaka", partner_id: 4, academic_score: 82, ielts_score: 6.5, status: "Applied", target_university_id: 5, target_course_id: 6, referred_by_partner_id: 4, application_status: "Processing" },
  { id: 7, name: "Chen Wei", partner_id: 1, academic_score: 88, ielts_score: 7.0, status: "Offer Letter", target_university_id: 6, target_course_id: 7, referred_by_partner_id: 1, application_status: "Accepted" },
  { id: 8, name: "Maria Santos", partner_id: 2, academic_score: 76, ielts_score: 6.0, status: "Document Review", target_university_id: 1, target_course_id: 8, referred_by_partner_id: 2, application_status: "Pending" },
  { id: 9, name: "Rashid Al-Nasser", partner_id: 5, academic_score: 89, ielts_score: 7.0, status: "Done", target_university_id: 4, target_course_id: 9, referred_by_partner_id: 5, application_status: "Accepted" },
  { id: 10, name: "Aisha Mohammed", partner_id: 5, academic_score: 80, ielts_score: 6.5, status: "Visa", target_university_id: 2, target_course_id: 10, referred_by_partner_id: 5, application_status: "Processing" },
];

// ─── Testimonials ────────────────────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  { id: 1, name: "Aminata Diallo", country: "Senegal", university: "University of Malaya", quote: "YourUni made my dream of studying in Malaysia a reality. From visa to accommodation, they handled everything!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: 2, name: "Ravi Patel", country: "India", university: "Taylor's University", quote: "The counselors at YourUni are incredibly helpful. I got my admission within 2 weeks!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: 3, name: "Sophie Muller", country: "Germany", university: "Monash University Malaysia", quote: "Professional service from start to finish. Highly recommend for international students.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: 4, name: "Omar Khalil", country: "Egypt", university: "UCSI University", quote: "They found me the perfect accommodation near my campus. Amazing support team!", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
];

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  { id: 1, title: "Top 5 Cafes in Cyberjaya for Students", excerpt: "From affordable kopitiam spots to Instagram-worthy brunch places, here are the best cafes where students in Cyberjaya study, eat, and socialise.", content: "Cyberjaya may be known as Malaysia's Silicon Valley, but its cafe scene is rapidly becoming a major draw for students. Whether you need a quiet corner to finish your thesis or a buzzing spot for group study sessions, these five cafes have you covered.\n\n## 1. The Grind Coffee Co.\nLocated just 5 minutes from MMU campus, The Grind offers strong flat whites and reliable WiFi. Their student meal deal (coffee + sandwich for RM12) is unbeatable.\n\n## 2. Bytes & Beans\nThis tech-themed cafe in D'Pulze Mall is a favourite among APU students. With power outlets at every table and a no-time-limit policy, it's practically a co-working space.\n\n## 3. Kopitiam Heritage\nFor students on a tight budget, this traditional kopitiam serves roti canai for RM1.50 and teh tarik for RM2. It's authentic Malaysian dining at its finest.\n\n## 4. Bloom Cafe & Bakery\nPerfect for weekend brunch, Bloom offers avocado toast, acai bowls, and artisan pastries in a beautifully decorated space. Great for Instagram content!\n\n## 5. The Study Nook\nAs the name suggests, this cafe was designed for students. Quiet zones, group rooms, and a menu of brain-boosting smoothies make it the ultimate study destination.", author: "Sarah Chen", date: "2026-03-01", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop", coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop", category: "Student Life", readTime: "5 min read" },
  { id: 2, title: "How to Open a Bank Account in Malaysia as an International Student", excerpt: "A step-by-step guide to setting up your Malaysian bank account, from required documents to choosing the right bank.", content: "Opening a bank account is one of the first things you should do when arriving in Malaysia. It makes paying rent, receiving allowances, and shopping much easier.\n\n## Required Documents\n- Valid passport with student visa\n- University offer letter or student ID\n- Proof of address (hostel letter or utility bill)\n- Passport-sized photos (2 copies)\n\n## Best Banks for Students\n\n### Maybank\nMalaysia's largest bank with branches everywhere. Their SaveUp account has zero minimum balance and free online banking.\n\n### CIMB\nPopular among students for their CIMB Clicks app and widespread ATM network. Their Octosaver account is student-friendly.\n\n### Bank Islam\nOffers Islamic banking products with no hidden fees. Good option for students who prefer Shariah-compliant banking.\n\n## Step-by-Step Process\n1. Visit the nearest branch of your chosen bank\n2. Take a queue number and wait for a personal banker\n3. Fill out the application form\n4. Submit your documents\n5. Make an initial deposit (usually RM20-50)\n6. Receive your debit card within 7-14 days\n\n## Pro Tips\n- Go during weekday mornings to avoid long queues\n- Some universities have bank branches on campus\n- Set up online banking immediately for convenience", author: "Ahmad Ibrahim", date: "2026-02-20", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop", coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop", category: "Practical Guide", readTime: "7 min read" },
  { id: 3, title: "Scholarship Opportunities for International Students in 2026", excerpt: "Explore the latest merit-based and need-based scholarships available across Malaysian universities for the 2026 intake.", content: "Malaysia offers a surprising number of scholarships for international students. Here's your comprehensive guide to funding your education.\n\n## Government Scholarships\n\n### Malaysia International Scholarship (MIS)\nFunded by the Malaysian government, this covers tuition, living allowance, and flights for postgraduate students.\n\n### MTCP Scholarship\nThe Malaysian Technical Cooperation Programme offers full funding for students from developing countries.\n\n## University Scholarships\n\nMost Malaysian universities offer their own merit-based awards:\n\n- **UM Global Excellence Award**: Full tuition for students with GPA 3.7+\n- **Monash International Scholarship**: Full tuition + stipend for exceptional students\n- **APU Global Tech Scholarship**: 50% tuition for computing students\n- **Taylor's Excellence Award**: 30% tuition with leadership requirements\n\n## How to Apply\n1. Check eligibility requirements carefully\n2. Prepare academic transcripts and certificates\n3. Write a compelling personal statement\n4. Get strong recommendation letters\n5. Apply early — most deadlines are 3-6 months before intake\n\n## Tips for Success\n- Apply to multiple scholarships simultaneously\n- Highlight extracurricular activities and community service\n- Maintain a high GPA throughout your studies for renewal", author: "Priya Sharma", date: "2026-02-15", image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=250&fit=crop", coverImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=600&fit=crop", category: "Scholarships", readTime: "8 min read" },
  { id: 4, title: "A Weekend Guide to Penang for Students", excerpt: "From George Town street art to Penang Hill, here's how to make the most of your weekend on the Pearl of the Orient.", content: "Penang is more than just a study destination — it's a UNESCO World Heritage treasure with incredible food, culture, and nature.\n\n## Day 1: George Town Heritage\n\n### Morning\nStart at the Armenian Street art trail. The famous 'Children on a Bicycle' mural by Ernest Zacharevic is a must-see. Walk through Lebuh Cannon and Lebuh Armenian for more hidden art.\n\n### Afternoon\nLunch at New Lane Hawker Centre — try char kway teow (RM6) and ais kacang (RM4). Then visit the Clan Jetties, a unique waterfront village.\n\n### Evening\nExplore Gurney Drive for the famous hawker stalls. Don't miss the Penang laksa and oyster omelette.\n\n## Day 2: Nature & Adventure\n\n### Morning\nTake the funicular train up Penang Hill (RM30 for foreigners). The views are breathtaking and it's noticeably cooler at the top.\n\n### Afternoon\nVisit the Tropical Spice Garden in Teluk Bahang (RM29 entry) or the ESCAPE theme park for adventure activities.\n\n### Evening\nCatch the sunset at Batu Ferringhi beach before heading to the night market for souvenirs.\n\n## Budget Breakdown\n- Transport (Grab): ~RM50 for the weekend\n- Food: ~RM60\n- Activities: ~RM100\n- **Total: ~RM210 (USD 45)**", author: "Mei Ling Wong", date: "2026-02-08", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=250&fit=crop", coverImage: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&h=600&fit=crop", category: "Student Life", readTime: "6 min read" },
  { id: 5, title: "IELTS vs TOEFL: Which English Test Should You Take for Malaysia?", excerpt: "A detailed comparison to help you decide which English proficiency test gives you the best chance of admission to Malaysian universities.", content: "Both IELTS and TOEFL are widely accepted by Malaysian universities, but which one should you take? Let's compare.\n\n## IELTS (International English Language Testing System)\n\n### Pros\n- More widely accepted in Malaysia\n- Paper-based option available\n- Face-to-face speaking test\n- Scores valid for 2 years\n\n### Cons\n- Slightly more expensive (RM850)\n- Speaking test scheduled separately\n\n### Typical Requirements\n- Foundation: 5.0-5.5\n- Bachelor's: 5.5-6.5\n- Master's/PhD: 6.0-7.0\n\n## TOEFL iBT (Test of English as a Foreign Language)\n\n### Pros\n- Entirely computer-based\n- Completed in one sitting\n- 'MyBest Scores' policy\n\n### Cons\n- Less commonly accepted in Malaysian public universities\n- American English accent in listening\n\n### Typical Requirements\n- Foundation: 60-70\n- Bachelor's: 70-90\n- Master's/PhD: 80-100\n\n## Our Recommendation\nFor Malaysian universities, **IELTS is generally the safer choice**. It's universally accepted, and the face-to-face speaking test suits many students better. However, if you're also applying to American universities, TOEFL gives you broader coverage.\n\n## Preparation Tips\n- Start preparing 2-3 months before the test\n- Use official practice materials\n- Take at least 2 full mock tests\n- Focus on your weakest section", author: "James Okonkwo", date: "2026-01-28", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop", coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop", category: "Study Tips", readTime: "6 min read" },
  { id: 6, title: "The Complete Pre-Departure Checklist for Malaysia", excerpt: "Everything you need to pack, prepare, and plan before your flight to Malaysia — from documents to daily essentials.", content: "Moving to Malaysia for your studies? Here's everything you need to sort out before you board that plane.\n\n## Documents (Keep in Hand Luggage!)\n- [ ] Passport (valid for 12+ months)\n- [ ] Student visa / VAL letter\n- [ ] University offer letter\n- [ ] Academic transcripts (originals)\n- [ ] Passport photos (10 copies)\n- [ ] Medical reports\n- [ ] Travel insurance documents\n- [ ] Flight tickets (return booking)\n\n## Financial Preparation\n- [ ] Inform your bank about international travel\n- [ ] Carry USD 500-1000 in cash for initial expenses\n- [ ] Set up an international transfer service (Wise/Remitly)\n- [ ] Budget for first month (RM 2000-3000)\n\n## Packing Essentials\n\n### Clothing\nMalaysia is tropical — pack light, breathable fabrics. Bring one formal outfit for university events and a light jacket for air-conditioned classrooms.\n\n### Electronics\n- Universal power adapter (Malaysia uses UK-type plugs)\n- Laptop and charger\n- Smartphone with Grab and WhatsApp installed\n\n### Health\n- Personal medications (with prescriptions)\n- Basic first aid kit\n- Sunscreen SPF 50+\n\n## First Week Action Items\n1. Register at your university\n2. Complete EMGS medical screening\n3. Open a bank account\n4. Get a local SIM card (Digi, Maxis, or Celcom)\n5. Set up your accommodation\n6. Explore the campus and surrounding area", author: "Fatima Zahra", date: "2026-01-15", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=250&fit=crop", coverImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=600&fit=crop", category: "Practical Guide", readTime: "9 min read" },
];

// ─── Language Centers ────────────────────────────────────────────────────────

export const languageCenters: LanguageCenter[] = [
  { id: 1, name: "Intensive Conversational Malay", institute: "APU Language Centre", city: "Kuala Lumpur", duration: "12 weeks", tuitionFee: 1800, level: "Beginner", overview: "A fast-paced immersive program designed for international students with zero Malay language background. Covers daily conversation, market bargaining, asking for directions, and social interactions. Includes weekly cultural immersion excursions to local markets and community centres.", curriculum: ["Basic greetings and self-introduction", "Numbers, dates, and time expressions", "Ordering food and shopping vocabulary", "Transport and directions", "Social conversations and politeness", "Malaysian cultural etiquette"], intakeMonths: ["January", "May", "September"] },
  { id: 2, name: "Bahasa Melayu Foundation", institute: "University of Malaya Language Centre", city: "Kuala Lumpur", duration: "16 weeks", tuitionFee: 2200, level: "Beginner", overview: "A comprehensive foundation course in Bahasa Melayu offered by Malaysia's oldest university. This program combines classroom instruction with language lab sessions and peer conversation practice with local students. Graduates receive a certificate recognised by Malaysian immigration.", curriculum: ["Malay phonetics and pronunciation", "Grammar fundamentals (tatabahasa)", "Reading comprehension", "Writing basic essays and letters", "Listening and comprehension drills", "Cultural awareness workshops"], intakeMonths: ["February", "September"] },
  { id: 3, name: "Business Malay Communication", institute: "Taylor's Language Academy", city: "Subang Jaya", duration: "10 weeks", tuitionFee: 2500, level: "Intermediate", overview: "Designed for working professionals and postgraduate students who already have basic Malay and want to use it in professional settings. Covers business correspondence, meeting etiquette, formal presentations, and networking in Malay.", curriculum: ["Formal vs informal registers", "Business correspondence and emails", "Meeting and presentation vocabulary", "Negotiation phrases", "Professional networking language", "Malaysian business culture"], intakeMonths: ["March", "September"] },
  { id: 4, name: "Survival Malay for Students", institute: "MMU Language Unit", city: "Cyberjaya", duration: "8 weeks", tuitionFee: 1200, level: "Beginner", overview: "A short, practical course for new international students at MMU and nearby universities. Focuses exclusively on the Malay you need for daily life in Cyberjaya — ordering food, using public transport, visiting the clinic, and communicating with landlords.", curriculum: ["Essential daily phrases", "Food and restaurant vocabulary", "Healthcare and emergency phrases", "Housing and landlord communication", "Campus and academic terms", "Local slang and colloquialisms"], intakeMonths: ["January", "May", "September"] },
  { id: 5, name: "Advanced Academic Malay", institute: "USM School of Languages", city: "Penang", duration: "14 weeks", tuitionFee: 2800, level: "Advanced", overview: "An advanced program for students who want to take courses taught in Malay or conduct research requiring Malay language sources. Covers academic writing, research presentation, literature analysis, and advanced grammar structures.", curriculum: ["Advanced grammar and syntax", "Academic writing and citations", "Research presentation skills", "Literary analysis in Malay", "Thesis writing support", "Debate and public speaking"], intakeMonths: ["September"] },
  { id: 6, name: "Malay for Healthcare Professionals", institute: "Monash Language Centre", city: "Subang Jaya", duration: "10 weeks", tuitionFee: 2400, level: "Intermediate", overview: "Tailored for medical, nursing, and pharmacy students who need to communicate with patients in Malay during clinical rotations. Covers medical history-taking, patient instructions, and empathetic communication in healthcare settings.", curriculum: ["Medical terminology in Malay", "Patient history-taking phrases", "Giving instructions and dosage info", "Empathetic communication", "Emergency and triage vocabulary", "Clinical documentation basics"], intakeMonths: ["February", "September"] },
];

// ─── Cost of Living (Malaysia only) ──────────────────────────────────────────

export const costOfLivingData: CostOfLivingData[] = [
  { country: "Malaysia", city: "Kuala Lumpur", rent: 700, food: 250, transport: 50, utilities: 60, entertainment: 100 },
  { country: "Malaysia", city: "Johor Bahru", rent: 450, food: 200, transport: 40, utilities: 50, entertainment: 80 },
  { country: "Malaysia", city: "Subang Jaya", rent: 550, food: 220, transport: 45, utilities: 55, entertainment: 90 },
  { country: "Malaysia", city: "Serdang", rent: 500, food: 200, transport: 40, utilities: 50, entertainment: 70 },
  { country: "Malaysia", city: "Cyberjaya", rent: 480, food: 200, transport: 35, utilities: 50, entertainment: 75 },
  { country: "Malaysia", city: "Penang", rent: 520, food: 180, transport: 35, utilities: 50, entertainment: 85 },
];

// ─── Charts ──────────────────────────────────────────────────────────────────

export const referralChartData = [
  { month: "Oct", referrals: 12 },
  { month: "Nov", referrals: 19 },
  { month: "Dec", referrals: 8 },
  { month: "Jan", referrals: 22 },
  { month: "Feb", referrals: 16 },
  { month: "Mar", referrals: 25 },
];

export const funnelData = [
  { stage: "Lead", value: 500, fill: "hsl(220, 60%, 18%)" },
  { stage: "Applied", value: 380, fill: "hsl(220, 45%, 30%)" },
  { stage: "Offer Received", value: 240, fill: "hsl(38, 92%, 50%)" },
  { stage: "Visa Approved", value: 180, fill: "hsl(142, 76%, 36%)" },
  { stage: "Enrolled", value: 150, fill: "hsl(142, 76%, 28%)" },
];

// ─── University Comparisons ──────────────────────────────────────────────────

export const universityComparisons: UniversityComparison[] = [
  { university_id: 1, academic_difficulty: 82, affordability: 78, campus_life: 85, min_ielts: 6.0, min_toefl: 80, avg_living_cost: 1160 },
  { university_id: 2, academic_difficulty: 75, affordability: 82, campus_life: 70, min_ielts: 5.5, min_toefl: 70, avg_living_cost: 820 },
  { university_id: 3, academic_difficulty: 90, affordability: 55, campus_life: 88, min_ielts: 6.5, min_toefl: 90, avg_living_cost: 960 },
  { university_id: 4, academic_difficulty: 68, affordability: 65, campus_life: 92, min_ielts: 5.5, min_toefl: 70, avg_living_cost: 960 },
  { university_id: 5, academic_difficulty: 65, affordability: 72, campus_life: 75, min_ielts: 5.5, min_toefl: 68, avg_living_cost: 1160 },
  { university_id: 6, academic_difficulty: 78, affordability: 80, campus_life: 72, min_ielts: 5.5, min_toefl: 72, avg_living_cost: 860 },
  { university_id: 7, academic_difficulty: 80, affordability: 82, campus_life: 78, min_ielts: 6.0, min_toefl: 80, avg_living_cost: 870 },
  { university_id: 8, academic_difficulty: 62, affordability: 70, campus_life: 80, min_ielts: 5.5, min_toefl: 65, avg_living_cost: 1160 },
  { university_id: 9, academic_difficulty: 60, affordability: 75, campus_life: 68, min_ielts: 6.0, min_toefl: 72, avg_living_cost: 1160 },
];

// ─── Intake Deadlines ────────────────────────────────────────────────────────

export const intakeDeadlines: IntakeDeadline[] = [
  { id: 1, university_id: 1, intake: "September 2026", deadline: "2026-06-15", semester: "Fall" },
  { id: 2, university_id: 2, intake: "September 2026", deadline: "2026-05-30", semester: "Fall" },
  { id: 3, university_id: 3, intake: "March 2027", deadline: "2026-11-30", semester: "Spring" },
  { id: 4, university_id: 4, intake: "September 2026", deadline: "2026-06-01", semester: "Fall" },
  { id: 5, university_id: 5, intake: "September 2026", deadline: "2026-07-15", semester: "Fall" },
  { id: 6, university_id: 1, intake: "March 2027", deadline: "2026-12-01", semester: "Spring" },
  { id: 7, university_id: 7, intake: "September 2026", deadline: "2026-06-30", semester: "Fall" },
  { id: 8, university_id: 8, intake: "March 2027", deadline: "2026-11-15", semester: "Spring" },
  { id: 9, university_id: 6, intake: "February 2027", deadline: "2026-09-30", semester: "Spring" },
  { id: 10, university_id: 11, intake: "September 2026", deadline: "2026-06-15", semester: "Fall" },
];

// ─── Events ──────────────────────────────────────────────────────────────────

export const events: Event[] = [
  { id: 1, title: "Malaysia Virtual Open Day 2026", type: "Open Day", date: "2026-04-15", time: "10:00 AM GMT+8", university_ids: [1, 2, 6], description: "Explore top Malaysian universities from the comfort of your home. Live campus tours and Q&A sessions.", spots_left: 120 },
  { id: 2, title: "Student Visa Workshop — Malaysia", type: "Workshop", date: "2026-04-22", time: "2:00 PM GMT+8", university_ids: [], description: "Step-by-step visa application walkthrough with our immigration experts. Bring your documents!", spots_left: 45 },
  { id: 3, title: "Scholarship Application Masterclass", type: "Webinar", date: "2026-05-05", time: "11:00 AM GMT+8", university_ids: [1, 3, 4], description: "Learn insider tips to craft winning scholarship applications from previous recipients.", spots_left: 200 },
  { id: 4, title: "Engineering Careers Info Session", type: "Info Session", date: "2026-05-12", time: "3:00 PM GMT+8", university_ids: [2], description: "Discover engineering career paths in Malaysia with UTM faculty and industry partners.", spots_left: 80 },
  { id: 5, title: "Study in Penang — USM Campus Showcase", type: "Open Day", date: "2026-05-20", time: "10:00 AM GMT+8", university_ids: [7], description: "A virtual showcase of USM's APEX campus on Penang island — programs, campus life, and more.", spots_left: 60 },
  { id: 6, title: "Pre-Departure Briefing — Fall 2026", type: "Workshop", date: "2026-07-10", time: "10:00 AM GMT+8", university_ids: [1, 2, 3, 4, 5, 6], description: "Everything you need to know before arriving in Malaysia. Accommodation, banking, transport tips.", spots_left: 150 },
];

// ─── Ambassadors ─────────────────────────────────────────────────────────────

export const ambassadors: Ambassador[] = [
  { id: 1, name: "Abeer Rahman", country: "Bangladesh", university: "University of Malaya", course: "BSc Computer Science", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", bio: "3rd year CS student. Love hackathons and Malaysian food!", icebreakers: ["What's campus life really like?", "How's the food in KL?", "Any tips for new students?"] },
  { id: 2, name: "Chiamaka Obi", country: "Nigeria", university: "Taylor's University", course: "BBA Hospitality", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", bio: "Passionate about hospitality. Former student council president.", icebreakers: ["How did you choose Taylor's?", "What's the social scene like?", "Is it hard to make friends?"] },
  { id: 3, name: "Liam Chen", country: "Singapore", university: "Monash University Malaysia", course: "MBBS Medicine", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", bio: "Future doctor who also plays guitar. Happy to help!", icebreakers: ["How intense is the med program?", "What about accommodation?", "Any scholarship advice?"] },
  { id: 4, name: "Sara Al-Mutairi", country: "Kuwait", university: "UCSI University", course: "BPharm Pharmacy", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", bio: "Pharmacy nerd and travel enthusiast. KL is amazing!", icebreakers: ["Is Malaysia safe for women?", "How's the pharmacy program?", "Cost of living tips?"] },
];

// ─── Resources ───────────────────────────────────────────────────────────────

export const resources: Resource[] = [
  { id: 1, title: "Pre-Departure Checklist 2026", description: "The complete checklist of everything to do before flying to Malaysia.", type: "checklist", icon: "✈️" },
  { id: 2, title: "SOP Writing Guide", description: "Step-by-step guide to writing a compelling Statement of Purpose.", type: "guide", icon: "📝" },
  { id: 3, title: "Ultimate Study in Malaysia Guide", description: "The definitive 50-page guide covering universities, visas, and student life.", type: "ebook", icon: "📚" },
  { id: 4, title: "Scholarship Application Template", description: "Ready-to-use templates for scholarship applications with examples.", type: "guide", icon: "🏆" },
];
