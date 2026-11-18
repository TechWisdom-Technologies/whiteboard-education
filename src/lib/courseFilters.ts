/**
 * Shared course filtering utilities for Whiteboard Education.
 * Provides robust department/field of study matching and qualification matching,
 * handling cases where course.category is null/empty or where custom departments
 * are dynamically added.
 */

export const STUDY_AREAS = [
  "Business & Management",
  "Engineering",
  "Computer Science & IT",
  "Medicine & Health",
  "Arts & Design",
  "Natural Sciences",
  "Law",
  "Social Sciences",
];

export const DEGREE_LEVELS = [
  "Foundation",
  "Diploma",
  "Advanced Diploma",
  "Certificate",
  "Bachelor",
  "Master",
  "PhD",
];

/**
 * Lightweight columns needed for course listing, card views, filters, and admin table views.
 * Excludes heavy columns (overview HTML rich text, curriculum module trees, detailed fee breakdowns)
 * reducing network transfer by ~95% (from ~45MB down to ~1.5MB).
 */
export const COURSE_LIST_SELECT =
  "id,title,university_id,campus,category,degree_level,duration,intake_months,offer_letter,class_type,tuition_fee,entry_requirements,created_at";

// Comprehensive keyword dictionary for standard study areas
export const AREA_KEYWORDS: Record<string, string[]> = {
  "Business & Management": [
    "business", "management", "commerce", "accounting", "finance", "marketing",
    "mba", "bba", "administration", "economics", "entrepreneurship", "human resource",
    "logistics", "supply chain", "banking", "hospitality", "tourism", "hotel", "event",
    "actuarial finance", "international business", "retail"
  ],
  "Engineering": [
    "engineering", "mechanical", "civil", "electrical", "electronic", "mechatronics",
    "manufacturing", "chemical", "petroleum", "aerospace", "automotive",
    "telecommunication", "robotics", "automation", "beng", "meng", "marine engineering",
    "environmental engineering", "materials", "geotechnical"
  ],
  "Engineering & Applied Sciences": [
    "engineering", "mechanical", "civil", "electrical", "electronic", "mechatronics",
    "manufacturing", "chemical", "petroleum", "aerospace", "automotive",
    "telecommunication", "robotics", "automation", "beng", "meng"
  ],
  "Computer Science & IT": [
    "computer", "computing", "software", "information technology", "cyber", "data science",
    "data comm", "data analytics", "data", "ai", "artificial intelligence", "intelligence",
    "network", "programming", "cloud", "web", "multimedia", "informatics", "database",
    "analytics", "it ", "game development", "game design", "information system", "security technology"
  ],
  "Medicine & Health": [
    "medicine", "nursing", "pharmacy", "dental", "dentistry", "health", "biomedical",
    "mbbs", "clinical", "surgery", "physiotherapy", "nutrition", "optometry", "medical",
    "dietetics", "allied health", "radiography", "veterinary", "healthcare", "public health"
  ],
  "Arts & Design": [
    "art", "design", "media", "creative", "communication", "animation", "music",
    "film", "architecture", "interior", "fashion", "graphic", "fine arts", "broadcast",
    "journalism", "theatre", "cinematic", "cinematography", "3d model", "visual arts",
    "industrial design", "advertising"
  ],
  "Natural Sciences": [
    "science", "mathematics", "physics", "chemistry", "biology", "actuarial",
    "statistics", "environmental", "biotechnology", "forensic", "marine", "geology",
    "applied science", "bsc", "biochemistry", "microbiology", "genetics", "food science"
  ],
  "Law": [
    "law", "llb", "llm", "legal", "jurisprudence", "paralegal", "sharia"
  ],
  "Law & Legal Studies": [
    "law", "llb", "llm", "legal", "jurisprudence"
  ],
  "Social Sciences": [
    "social", "psychology", "education", "arts", "language", "english", "politics",
    "international relations", "sociology", "linguistics", "counselling", "history",
    "philosophy", "early childhood", "teaching", "humanities", "criminology", "mass comm"
  ],
  "Social Sciences & Humanities": [
    "social", "psychology", "education", "arts", "language", "english", "politics",
    "international relations", "sociology", "linguistics", "counselling", "history",
    "philosophy", "early childhood", "teaching", "humanities"
  ],
  "Communication & Media": [
    "communication", "media", "journalism", "public relation", "strategic comm",
    "broadcasting", "advertising", "mass comm"
  ]
};

// Aliases between common category variations
const CATEGORY_ALIASES: Record<string, string> = {
  "engineering": "engineering",
  "engineering & applied sciences": "engineering",
  "law": "law",
  "law & legal studies": "law",
  "arts & design": "arts & design",
  "art & design": "arts & design",
  "social sciences": "social sciences",
  "social sciences & humanities": "social sciences",
  "computer science & it": "computer science & it",
  "computing & it": "computer science & it",
  "business & management": "business & management",
  "business": "business & management",
  "medicine & health": "medicine & health",
  "medical & health sciences": "medicine & health",
  "natural sciences": "natural sciences",
  "sciences": "natural sciences"
};

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "studies", "department", "study", "area", "program", "programmes", "of", "in"
]);

/**
 * Checks whether a course matches a selected department / field of study.
 * Matches by:
 * 1. Exact or substring match on course.category
 * 2. Standard area keywords on course.title or course.category
 * 3. Tokenized words fallback for custom/dynamic departments
 */
export function matchesCourseDepartment(course: any, selectedDepartment: string): boolean {
  if (
    !selectedDepartment ||
    selectedDepartment === "all" ||
    selectedDepartment === "All Areas" ||
    selectedDepartment === "All Fields"
  ) {
    return true;
  }

  const rawCat = typeof course?.category === "string" ? course.category.trim() : "";
  const catLower = rawCat.toLowerCase();
  const titleLower = typeof course?.title === "string" ? course.title.trim().toLowerCase() : "";
  const targetLower = selectedDepartment.trim().toLowerCase();

  // 1. Direct equality or substring match on category
  if (catLower) {
    if (catLower === targetLower || catLower.includes(targetLower) || targetLower.includes(catLower)) {
      return true;
    }

    // Check alias normalization
    const normalizedCat = CATEGORY_ALIASES[catLower];
    const normalizedTarget = CATEGORY_ALIASES[targetLower];
    if (normalizedCat && normalizedTarget && normalizedCat === normalizedTarget) {
      return true;
    }
  }

  // 2. Standard Area Keywords lookup (covers cases where course.category is null/empty in DB)
  // Check exact key in AREA_KEYWORDS or normalized alias
  const aliasKey = CATEGORY_ALIASES[targetLower];
  let keywords: string[] | undefined = AREA_KEYWORDS[selectedDepartment];
  if (!keywords && aliasKey) {
    // Find matching key in AREA_KEYWORDS
    for (const [k, v] of Object.entries(AREA_KEYWORDS)) {
      if (CATEGORY_ALIASES[k.toLowerCase()] === aliasKey) {
        keywords = v;
        break;
      }
    }
  }

  if (keywords && keywords.length > 0) {
    const matched = keywords.some(
      (kw) => titleLower.includes(kw) || (catLower && catLower.includes(kw))
    );
    if (matched) return true;
  }

  // 3. Fallback for custom/dynamically created departments (e.g. "Hospitality & Tourism", "Artificial Intelligence")
  // Tokenize the selected department name and check if meaningful tokens appear in the course title or category
  const tokens = targetLower
    .split(/[\s&/,\-_+]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

  if (tokens.length > 0) {
    const matchedToken = tokens.some(
      (token) => titleLower.includes(token) || (catLower && catLower.includes(token))
    );
    if (matchedToken) return true;
  }

  return false;
}

/**
 * Extracts the effective degree level from course title and degree_level field.
 */
export function getEffectiveDegreeLevel(course: any): string {
  const titleLower = typeof course?.title === "string" ? course.title.toLowerCase() : "";
  const rawLevel = typeof course?.degree_level === "string" ? course.degree_level : "";

  if (titleLower.includes("advanced diploma")) return "Advanced Diploma";
  if (titleLower.includes("diploma")) return "Diploma";
  if (titleLower.includes("certificate")) return "Certificate";
  if (titleLower.includes("foundation")) return "Foundation";
  if (titleLower.includes("bachelor") || titleLower.includes("degree")) return "Bachelor";
  if (titleLower.includes("master") || titleLower.includes("mba") || titleLower.includes("msc") || titleLower.includes("meng")) return "Master";
  if (titleLower.includes("phd") || titleLower.includes("doctor")) return "PhD";

  return rawLevel || "Other";
}

/**
 * Checks whether a course matches a selected qualification / degree level.
 */
export function matchesCourseLevel(course: any, selectedLevel: string): boolean {
  if (!selectedLevel || selectedLevel === "all" || selectedLevel === "All Levels") {
    return true;
  }

  const effLevel = getEffectiveDegreeLevel(course).toLowerCase();
  const rawLevel = (course?.degree_level || "").toLowerCase();
  const titleLower = (course?.title || "").toLowerCase();
  const target = selectedLevel.toLowerCase();

  // Handle standard variations (e.g. "Bachelor's Degree" vs "Bachelor")
  if (target.includes("bachelor")) {
    return effLevel.includes("bachelor") || rawLevel.includes("bachelor") || titleLower.includes("bachelor") || titleLower.includes("degree");
  }
  if (target.includes("master")) {
    return effLevel.includes("master") || rawLevel.includes("master") || titleLower.includes("master") || titleLower.includes("mba") || titleLower.includes("msc");
  }
  if (target.includes("phd") || target.includes("doctor")) {
    return effLevel.includes("phd") || rawLevel.includes("phd") || titleLower.includes("phd") || titleLower.includes("doctor");
  }
  if (target.includes("advanced diploma")) {
    return effLevel.includes("advanced diploma") || titleLower.includes("advanced diploma");
  }
  if (target.includes("diploma")) {
    // If selecting standard Diploma, don't mistakenly exclude standard diplomas, but distinguish Advanced Diploma if needed
    return effLevel === "diploma" || rawLevel.includes("diploma") || (titleLower.includes("diploma") && !titleLower.includes("advanced diploma"));
  }
  if (target.includes("foundation")) {
    return effLevel.includes("foundation") || rawLevel.includes("foundation") || titleLower.includes("foundation");
  }
  if (target.includes("certificate")) {
    return effLevel.includes("certificate") || rawLevel.includes("certificate") || titleLower.includes("certificate");
  }

  return effLevel.includes(target) || rawLevel.includes(target) || titleLower.includes(target);
}

