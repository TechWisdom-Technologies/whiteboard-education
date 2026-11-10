import { describe, it, expect } from "vitest";
import {
  ALL_PRIORITY_UNIVERSITIES,
  getUniversityPriorityIndex,
  sortUniversitiesWithPriority,
  mergePriorityUniversities,
} from "@/lib/universityPriority";
import { generateSlug } from "@/lib/utils";

describe("universityPriority 6-level mapping", () => {
  it("contains exactly 42 universities (7 per level across 6 levels)", () => {
    expect(ALL_PRIORITY_UNIVERSITIES).toHaveLength(42);

    for (let level = 1; level <= 6; level++) {
      const levelUnis = ALL_PRIORITY_UNIVERSITIES.filter((u) => u.level === level);
      expect(levelUnis).toHaveLength(7);
    }
  });

  it("assigns sequential priority indices 0 to 41 for each university", () => {
    ALL_PRIORITY_UNIVERSITIES.forEach((uni, idx) => {
      expect(getUniversityPriorityIndex(uni.name)).toBe(idx);
    });
  });

  it("correctly distinguishes UTM, UTeM, and UTP", () => {
    const utmIdx = getUniversityPriorityIndex("Universiti Teknologi Malaysia (UTM)");
    const utemIdx = getUniversityPriorityIndex("Universiti Teknikal Malaysia Melaka (UTeM)");
    const utpIdx = getUniversityPriorityIndex("Universiti Teknologi PETRONAS (UTP)");

    expect(utmIdx).toBe(25);
    expect(utemIdx).toBe(26);
    expect(utpIdx).toBe(27);
  });

  it("places each level on its corresponding page (7 items per page)", () => {
    const merged = mergePriorityUniversities([]);
    const pageSize = 7;

    for (let page = 1; page <= 6; page++) {
      const pageItems = merged.slice((page - 1) * pageSize, page * pageSize);
      expect(pageItems).toHaveLength(7);

      const expectedLevelUnis = ALL_PRIORITY_UNIVERSITIES.filter((u) => u.level === page);
      pageItems.forEach((item, itemIdx) => {
        expect(item.name).toBe(expectedLevelUnis[itemIdx].name);
      });
    }
  });

  it("sorts unranked universities alphabetically after the 42 priority universities", () => {
    const customList = [
      { name: "Zebra University of Technology" },
      { name: "Alpha International College" },
      { name: "MAHSA University" }, // Level 2 (#8, idx 7)
      { name: "INTI International University" }, // Level 1 (#1, idx 0)
    ];

    const sorted = sortUniversitiesWithPriority(customList);
    expect(sorted[0].name).toBe("INTI International University");
    expect(sorted[1].name).toBe("MAHSA University");
    expect(sorted[2].name).toBe("Alpha International College");
    expect(sorted[3].name).toBe("Zebra University of Technology");
  });

  it("ensures all 42 universities have valid names, logos, cities, and can be matched by slug", () => {
    const merged = mergePriorityUniversities([]);
    expect(merged).toHaveLength(42);

    const slugs = new Set<string>();
    merged.forEach((u) => {
      expect(u.name).toBeTruthy();
      expect(u.city).toBeTruthy();
      expect(u.description).toBeTruthy();
      expect(u.logo_url).toBeTruthy();
      expect(u.hero_image).toBeTruthy();

      const slug = generateSlug(u.name);
      expect(slug).toBeTruthy();
      expect(slugs.has(slug)).toBe(false);
      slugs.add(slug);
    });
  });
});

