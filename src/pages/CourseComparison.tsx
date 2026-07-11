import { useCourseCompare } from "@/contexts/CourseCompareContext";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { X, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getActiveIntake } from "@/lib/utils";

// Mock university logos mapping if needed (you can keep it similar to Courses.tsx or fallback to default)
const UNIVERSITY_LOGOS: Record<string, string> = {
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "https://www.tarc.edu.my/images/tarumt-logo1.png?v=beyongEducation2",
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
  "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
  "UTeM University Malaysia": "https://en.your-uni.com/assets/images/university/utem-university.webp",
};

const PAID_OFFER_LETTER_UNIS = [
  "Universiti Putra Malaysia (UPM)",
  "UTM University Malaysia",
  "UTeM University Malaysia",
  "UTM SPACE University Malaysia",
  "Swinburne University of Technology Sarawak Campus"
];

export default function CourseComparison() {
  const { compareList, removeCourse } = useCourseCompare();
  const navigate = useNavigate();
  const { data: allCourses = [], isLoading: loadingCourses } = useTableData("courses");
  const { data: allUnis = [], isLoading: loadingUnis } = useTableData("universities");

  // Filter the selected courses
  const selectedCourses = allCourses.filter((c: any) => compareList.includes(c.id));

  const getUniversityInfo = (course: any) => {
    return allUnis.find((u: any) => u.id === course.university_id || u.name === course.university);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingCourses || loadingUnis) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading comparison...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="print:hidden">
        <MegaMenu />
      </div>

      <main className="flex-1 container mx-auto px-4 pb-16 max-w-6xl">
        {selectedCourses.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>No Courses Selected</h2>
            <p className="text-gray-600 mb-8">You haven't selected any courses to compare yet.</p>
            <Button onClick={() => navigate("/courses")} style={{ backgroundColor: "#2F4F97", color: "#1E293B", borderRadius: "5px" }}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-[120px] md:w-[160px] p-4 border-b border-gray-200"></th>
                  {selectedCourses.map((course: any) => {
                    const uni = getUniversityInfo(course);
                    const uniLogo = (uni?.logo_url) || (uni ? UNIVERSITY_LOGOS[uni.name] : "");
                    return (
                      <th key={course.id} className="p-4 border-b border-gray-200 align-top relative group">
                        <button 
                          onClick={() => removeCourse(course.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10 print:hidden"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-start text-left pr-6">
                          <div className="h-12 w-28 mb-3 flex items-center justify-start">
                            {uniLogo ? (
                              <img src={uniLogo} alt={uni?.name || course.title} className="max-h-full max-w-full object-contain object-left" />
                            ) : (
                              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 text-center p-1">
                                No Logo
                              </div>
                            )}
                          </div>
                          <h3 className="text-[15px] font-bold text-[#1E293B] mb-2 leading-snug" style={{ fontFamily: "Poppins, sans-serif" }}>
                            {course.title}
                          </h3>
                          <p className="text-[13px] text-gray-500 font-normal">
                            {uni?.name || course.university}
                          </p>
                        </div>
                      </th>
                    );
                  })}
                  {/* Fill empty columns if less than 3 courses selected */}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => (
                    <th key={`empty-${idx}`} className="p-4 border-b border-gray-200 align-top">
                       <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 min-h-[160px] print:hidden">
                         <p className="text-gray-400 text-sm mb-4">Add another course</p>
                         <Button variant="outline" size="sm" onClick={() => navigate("/courses")} className="text-xs">
                           Browse
                         </Button>
                       </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Qualification */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Qualification</td>
                  {selectedCourses.map((course: any) => (
                    <td key={course.id} className="p-5 text-gray-600 text-sm border-b border-gray-100 align-top">
                      {course.degree_level || "-"}
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-qual-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Location */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Location</td>
                  {selectedCourses.map((course: any) => {
                    const uni = getUniversityInfo(course);
                    return (
                      <td key={course.id} className="p-5 text-gray-600 text-sm border-b border-gray-100 align-top">
                        {uni?.city ? String(uni.city) : "-"}
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-loc-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Duration */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Duration</td>
                  {selectedCourses.map((course: any) => (
                    <td key={course.id} className="p-5 text-gray-600 text-sm border-b border-gray-100 align-top">
                      {course.duration || "-"}
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-dur-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Intakes */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Intakes</td>
                  {selectedCourses.map((course: any) => {
                    const intakes = Array.isArray(course.intake_months) ? course.intake_months : (Array.isArray(course.intakes) ? course.intakes : []);
                    const activeIntake = getActiveIntake(intakes);
                    return (
                      <td key={course.id} className="p-5 border-b border-gray-100 align-top">
                         <div className="flex flex-wrap gap-1.5">
                            {intakes.length > 0 ? intakes.map((intake: string, i: number) => (
                              <Badge key={i} className={`border-0 font-medium ${intake === activeIntake ? "bg-[#2F4F97]/20 text-[#2F4F97] hover:bg-[#2F4F97]/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                {intake}
                              </Badge>
                            )) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                         </div>
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-intake-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Offer Letter Fee */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Offer Letter Fee</td>
                  {selectedCourses.map((course: any) => {
                    const isPaid = PAID_OFFER_LETTER_UNIS.includes(course.university);
                    return (
                      <td key={course.id} className="p-5 text-gray-600 text-sm border-b border-gray-100 align-top">
                        {isPaid ? "Fees Applies" : "Free"}
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-offer-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Class Type */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Class Type</td>
                  {selectedCourses.map((course: any) => (
                    <td key={course.id} className="p-5 text-gray-600 text-sm border-b border-gray-100 align-top">
                      Physical
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-class-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Tuition Fee */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Tuition fee</td>
                  {selectedCourses.map((course: any) => (
                    <td key={course.id} className="p-5 text-gray-600 text-sm border-b border-gray-100 align-top">
                      {course.tuition_fee ? `MYR ${Number(course.tuition_fee).toLocaleString()}/Year` : "-"}
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-tuition-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Other fee */}
                <tr>
                  <td className="p-5 font-semibold text-gray-700 text-sm border-b border-gray-100 align-top">Other fee</td>
                  {selectedCourses.map((course: any) => {
                    let otherFeesRender = <span className="text-gray-400">No data</span>;
                    if (course.other_fees && Array.isArray(course.other_fees) && course.other_fees.length > 0) {
                      otherFeesRender = (
                        <div className="flex flex-col gap-2">
                          {course.other_fees.map((of: any, i: number) => {
                            if (!of.fee || of.fee === "-" || of.fee === "0") return null;
                            const amount = isNaN(Number(of.fee)) ? of.fee : `MYR ${Number(of.fee).toLocaleString()}`;
                            return (
                              <div key={i} className="text-xs text-gray-600 leading-tight">
                                <span className="uppercase text-gray-500 font-medium">{of.description || "Other Fee"}</span> - {amount}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                      <td key={course.id} className="p-5 border-b border-gray-100 align-top max-w-[250px]">
                        {otherFeesRender}
                      </td>
                    );
                  })}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-other-${idx}`} className="border-b border-gray-100"></td>)}
                </tr>

                {/* Action Buttons */}
                <tr className="print:hidden">
                  <td className="p-5 align-top"></td>
                  {selectedCourses.map((course: any) => (
                    <td key={course.id} className="p-5 align-top">
                      <div className="flex flex-col gap-3">
                        <Button
                          className="bg-[#2F4F97] text-white hover:bg-[#243E79] rounded-[20px] border-transparent w-full"
                          style={{
                            
                            
                            
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "bold",
                            
                          }}
                          onClick={() => navigate(`/apply?courseId=${course.id}`)}
                        >

                          Apply Now
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-white w-full"
                          style={{
                            
                            
                            
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "600",
                          }}
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >

                          Ask Us
                        </Button>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedCourses.length }).map((_, idx) => <td key={`empty-action-${idx}`}></td>)}
                </tr>
              </tbody>
            </table>

            {/* Print Button */}
            <div className="mt-12 flex justify-center print:hidden">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="rounded-full px-8 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Print this page
              </Button>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <PublicFooter />
      </div>
    </div>
  );
}
