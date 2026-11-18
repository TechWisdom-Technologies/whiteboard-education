import { describe, it, expect } from "vitest";
import { matchesCourseDepartment, matchesCourseLevel, getEffectiveDegreeLevel } from "@/lib/courseFilters";

describe("courseFilters - matchesCourseDepartment", () => {
  it("matches 'all' or empty string as true", () => {
    const course = { title: "Bachelor of Science", category: null };
    expect(matchesCourseDepartment(course, "all")).toBe(true);
    expect(matchesCourseDepartment(course, "All Areas")).toBe(true);
    expect(matchesCourseDepartment(course, "All Fields")).toBe(true);
    expect(matchesCourseDepartment(course, "")).toBe(true);
  });

  it("matches when course.category is set directly", () => {
    const course = { title: "Some Course", category: "Engineering" };
    expect(matchesCourseDepartment(course, "Engineering")).toBe(true);
    expect(matchesCourseDepartment(course, "engineering")).toBe(true);
    expect(matchesCourseDepartment(course, "Business & Management")).toBe(false);
  });

  it("matches category aliases (e.g. Engineering & Applied Sciences vs Engineering)", () => {
    const course = { title: "Robotics", category: "Engineering & Applied Sciences" };
    expect(matchesCourseDepartment(course, "Engineering")).toBe(true);
  });

  it("infers department from title when course.category is null (Engineering)", () => {
    const course = { title: "Bachelor of Civil Engineering (Hons)", category: null };
    expect(matchesCourseDepartment(course, "Engineering")).toBe(true);
    expect(matchesCourseDepartment(course, "Computer Science & IT")).toBe(false);
  });

  it("infers department from title when course.category is empty string (Computer Science & IT)", () => {
    const course = { title: "Bachelor of Software Engineering (AI & Cyber Security)", category: "" };
    expect(matchesCourseDepartment(course, "Computer Science & IT")).toBe(true);
  });

  it("infers Business & Management from BBA, MBA, or business keywords", () => {
    const course1 = { title: "Bachelor of Business Administration (Hons)", category: null };
    const course2 = { title: "Master of Business Administration (MBA)", category: null };
    const course3 = { title: "Bachelor of Accounting and Finance", category: null };
    expect(matchesCourseDepartment(course1, "Business & Management")).toBe(true);
    expect(matchesCourseDepartment(course2, "Business & Management")).toBe(true);
    expect(matchesCourseDepartment(course3, "Business & Management")).toBe(true);
  });

  it("infers Medicine & Health from MBBS, nursing, pharmacy, dental", () => {
    const course1 = { title: "Bachelor of Pharmacy (Hons)", category: null };
    const course2 = { title: "Bachelor of Dental Surgery", category: null };
    const course3 = { title: "Bachelor of Nursing", category: null };
    expect(matchesCourseDepartment(course1, "Medicine & Health")).toBe(true);
    expect(matchesCourseDepartment(course2, "Medicine & Health")).toBe(true);
    expect(matchesCourseDepartment(course3, "Medicine & Health")).toBe(true);
  });

  it("matches dynamically added custom departments (e.g. Hospitality & Tourism)", () => {
    const course = { title: "Bachelor of International Tourism and Hospitality Management", category: null };
    expect(matchesCourseDepartment(course, "Hospitality & Tourism")).toBe(true);
  });

  it("matches custom department like 'Biotechnology'", () => {
    const course = { title: "BSc (Hons) in Medical Biotechnology", category: null };
    expect(matchesCourseDepartment(course, "Biotechnology")).toBe(true);
  });

  it("does not match unrelated courses", () => {
    const course = { title: "Bachelor of Laws (LLB)", category: null };
    expect(matchesCourseDepartment(course, "Engineering")).toBe(false);
    expect(matchesCourseDepartment(course, "Computer Science & IT")).toBe(false);
    expect(matchesCourseDepartment(course, "Law")).toBe(true);
  });
});

describe("courseFilters - matchesCourseLevel", () => {
  it("matches 'all' or empty string", () => {
    const course = { title: "Bachelor of Science", degree_level: "Bachelor" };
    expect(matchesCourseLevel(course, "all")).toBe(true);
    expect(matchesCourseLevel(course, "All Levels")).toBe(true);
  });

  it("matches Bachelor degree level by title or field", () => {
    const course1 = { title: "Bachelor of Computer Science", degree_level: "Bachelor" };
    const course2 = { title: "BSc (Hons) Computer Science", degree_level: "Bachelor's Degree" };
    expect(matchesCourseLevel(course1, "Bachelor")).toBe(true);
    expect(matchesCourseLevel(course2, "Bachelor")).toBe(true);
  });

  it("distinguishes Diploma and Advanced Diploma", () => {
    const advDip = { title: "Advanced Diploma in Business Management", degree_level: "Advanced Diploma" };
    const dip = { title: "Diploma in Information Technology", degree_level: "Diploma" };
    expect(matchesCourseLevel(advDip, "Advanced Diploma")).toBe(true);
    expect(matchesCourseLevel(dip, "Diploma")).toBe(true);
  });
});

