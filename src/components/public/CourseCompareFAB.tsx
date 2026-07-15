import { useCourseCompare } from "@/contexts/CourseCompareContext";
import { Layers, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CourseCompareFAB() {
  const { compareList, clearCompare } = useCourseCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={() => navigate("/course-comparison")}
        className="relative bg-[#1E293B] text-white rounded-2xl flex items-center gap-2 px-5 py-3 font-semibold shadow-lg hover:bg-[#1E293B]/90 transition-colors"
       
      >
        <Layers className="h-5 w-5" />
        Course Comparison
        
        {/* Badge */}
        <div className="absolute -top-2 -right-2 bg-[#2F4F97] text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-md ring-2 ring-white">
          {compareList.length}
        </div>

        {/* Clear Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            clearCompare();
          }}
          className="absolute -top-2 -left-2 bg-white text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded-full shadow-md ring-2 ring-gray-100 transition-colors"
          title="Clear comparison"
        >
          <X className="h-3.5 w-3.5" />
        </div>
      </button>
    </div>
  );
}
