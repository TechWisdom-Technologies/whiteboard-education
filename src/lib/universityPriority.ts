// Priority universities ordering for Whiteboard Education
export interface PriorityUniConfig {
  id: string;
  name: string;
  shortName: string;
  city: string;
  description: string;
  logo_url: string;
  hero_image: string;
  matchKeys: string[];
}

export const TOP_7_PRIORITY_UNIVERSITIES: PriorityUniConfig[] = [
  {
    id: "priority-inti",
    name: "INTI International University",
    shortName: "INTI",
    city: "Nilai, Negeri Sembilan",
    description: "INTI International University is one of Malaysia's leading private higher education institutions, acclaimed for career-ready graduates and world-class international degree pathways.",
    logo_url: "https://en.your-uni.com/assets/images/university/inti-university.webp",
    hero_image: "https://www.easyuni.com/media/institution/photo/2012/10/04/inti_Sarawak.jpg",
    matchKeys: ["inti", "inti international"]
  },
  {
    id: "priority-segi",
    name: "SEGi University",
    shortName: "SEGi",
    city: "Kota Damansara, Selangor",
    description: "SEGi University is a premier Malaysian higher education institution offering quality, industry-driven programmes in Health Sciences, Engineering, Business, and Technology.",
    logo_url: "https://en.your-uni.com/assets/images/university/segi-university.webp",
    hero_image: "https://en.your-uni.com/assets/images/university/segi-university.webp",
    matchKeys: ["segi", "segi university"]
  },
  {
    id: "priority-lincoln",
    name: "Lincoln University College",
    shortName: "Lincoln",
    city: "Petaling Jaya, Selangor",
    description: "Lincoln University College is a globally recognized institution in Malaysia offering world-standard medical, nursing, business, and pharmacy degrees with robust clinical training.",
    logo_url: "https://en.your-uni.com/assets/images/university/lincoln-university-college.png",
    hero_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
    matchKeys: ["lincoln", "lincoln university"]
  },
  {
    id: "priority-lsbf",
    name: "London School of Business and Finance Malaysia (LSBF)",
    shortName: "LSBF",
    city: "Kuala Lumpur",
    description: "London School of Business and Finance (LSBF) Malaysia provides British-standard business, finance, accounting, and executive leadership qualifications in the commercial heart of Kuala Lumpur.",
    logo_url: "https://en.your-uni.com/assets/images/university/lsbf-malaysia.png",
    hero_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    matchKeys: ["london school of business", "lsbf"]
  },
  {
    id: "priority-unirazak",
    name: "Universiti Tun Abdul Razak (UNIRAZAK)",
    shortName: "UNIRAZAK",
    city: "Kuala Lumpur",
    description: "Universiti Tun Abdul Razak (UNIRAZAK) is Malaysia's pioneering boutique university known for AACSB-accredited business programmes, leadership education, and exceptional graduate employability.",
    logo_url: "https://en.your-uni.com/assets/images/university/unirazak-university.png",
    hero_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80",
    matchKeys: ["unirazak", "tun abdul razak"]
  },
  {
    id: "priority-unikl",
    name: "Universiti Kuala Lumpur (UniKL)",
    shortName: "UniKL",
    city: "Kuala Lumpur",
    description: "Universiti Kuala Lumpur (UniKL) is Malaysia's leading technical university with 12 campuses offering specialized high-tech engineering, aviation, maritime, and information technology programmes.",
    logo_url: "https://en.your-uni.com/assets/images/university/unikl-university.webp",
    hero_image: "https://en.your-uni.com/assets/images/university/unikl-university.webp",
    matchKeys: ["unikl", "universiti kuala lumpur"]
  },
  {
    id: "priority-aeu",
    name: "Asia e University (AeU)",
    shortName: "AeU",
    city: "Subang Jaya, Selangor",
    description: "Asia e University (AeU) is an international university established under the 34-nation Asia Cooperation Dialogue (ACD), offering flexible, accredited blended and on-campus bachelor's, master's, and PhD degrees.",
    logo_url: "https://en.your-uni.com/assets/images/university/aeu-university.png",
    hero_image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
    matchKeys: ["asia e", "aeu"]
  }
];

export function getUniversityPriorityIndex(name: string): number {
  if (!name) return 999;
  const lower = name.toLowerCase().trim();
  for (let i = 0; i < TOP_7_PRIORITY_UNIVERSITIES.length; i++) {
    const config = TOP_7_PRIORITY_UNIVERSITIES[i];
    if (config.matchKeys.some((k) => lower.includes(k))) {
      return i;
    }
  }
  return 999;
}

export function isPriorityUniversity(name: string): boolean {
  return getUniversityPriorityIndex(name) < 999;
}

/**
 * Sorts any array of universities so that the 7 top priority universities
 * are strictly placed at the beginning (indices 0..6 in order 1..7),
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
 * Ensures that if any of the top 7 universities are missing from the backend list,
 * they are merged into the list with high-quality fallback details so that
 * the 7 priority universities are GUARANTEED to appear as the first 7 items.
 */
export function mergePriorityUniversities<T extends { id?: string; name?: string | null }>(
  existingList: T[]
): T[] {
  const result: T[] = [...existingList];

  TOP_7_PRIORITY_UNIVERSITIES.forEach((topUni) => {
    const alreadyExists = result.some((item) => {
      const lower = (item.name || "").toLowerCase();
      return topUni.matchKeys.some((k) => lower.includes(k));
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

