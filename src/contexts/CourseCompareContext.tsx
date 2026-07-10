import React, { createContext, useContext, useState, useEffect } from "react";

interface CourseCompareContextType {
  compareList: string[]; // array of course IDs
  addCourse: (courseId: string) => void;
  removeCourse: (courseId: string) => void;
  clearCompare: () => void;
  isComparing: (courseId: string) => boolean;
}

const CourseCompareContext = createContext<CourseCompareContextType | undefined>(undefined);

export function CourseCompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("courseCompareList");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("courseCompareList", JSON.stringify(compareList));
  }, [compareList]);

  const addCourse = (courseId: string) => {
    setCompareList((prev) => {
      if (prev.includes(courseId)) return prev;
      if (prev.length >= 3) {
        // We can't add more than 3
        return prev;
      }
      return [...prev, courseId];
    });
  };

  const removeCourse = (courseId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== courseId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (courseId: string) => {
    return compareList.includes(courseId);
  };

  return (
    <CourseCompareContext.Provider value={{ compareList, addCourse, removeCourse, clearCompare, isComparing }}>
      {children}
    </CourseCompareContext.Provider>
  );
}

export function useCourseCompare() {
  const context = useContext(CourseCompareContext);
  if (context === undefined) {
    throw new Error("useCourseCompare must be used within a CourseCompareProvider");
  }
  return context;
}
