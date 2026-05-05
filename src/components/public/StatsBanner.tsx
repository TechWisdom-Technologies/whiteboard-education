import { useTableData } from "@/hooks/useSupabaseData";
import { GraduationCap, BookOpen, Languages, Globe } from "lucide-react";

export function StatsBanner() {
  const { data: universities = [] } = useTableData("universities");
  const { data: courses = [] } = useTableData("courses");
  const { data: languageCenters = [] } = useTableData("language_centers");

  const stats = [
    { icon: GraduationCap, value: universities.length || 14, suffix: "+", label: "Partner Universities", sublabel: "Live in platform" },
    { icon: BookOpen, value: courses.length || 21, suffix: "+", label: "Courses Available", sublabel: "Updated in real time" },
    { icon: Languages, value: languageCenters.length || 6, suffix: "+", label: "Language Centers", sublabel: "English and Malay prep" },
    { icon: Globe, value: 11, suffix: "+", label: "Countries Supported", sublabel: "Active destinations" },
  ];

  return (
    <section className="py-16" style={{ backgroundColor: "#181d29" }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-sm flex items-center justify-center" style={{ backgroundColor: "rgba(255, 163, 0, 0.15)" }}>
                <stat.icon className="h-6 w-6 text-[#ffa300]" />
              </div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {stat.value}{stat.suffix}
              </p>
              <p className="text-base font-semibold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>{stat.label}</p>
              <p className="text-xs mt-1" style={{ color: "#a2a6b0" }}>{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
