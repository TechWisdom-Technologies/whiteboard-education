import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { courses as mockCourses, universities as mockUniversities } from "@/data/mockData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { BookOpen, Copy, Check } from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { data: liveCourses = [], isLoading: loadingC } = useTableData("courses");
  const { data: liveUniversities = [] } = useTableData("universities");
  const courses = liveCourses.length > 0 ? liveCourses : (mockCourses as any[]);
  const universities = liveUniversities.length > 0 ? liveUniversities : (mockUniversities as any[]);
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("key-info");
  const [copied, setCopied] = useState(false);

  const course = courses.find((c: any) => String(c.id) === String(courseId));
  const uni = course ? universities.find((u: any) => String(u.id) === String(course.university_id)) : null;

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["key-info", "overview", "curriculum"];
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const handleCopy = () => {
    if (course?.title) {
      navigator.clipboard.writeText(course.title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loadingC) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <LoadingScreen label="Loading course details" sublabel="Getting program information" className="flex-1" />
        <PublicFooter />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Course Not Found</h1>
            <Link to="/courses"><Button>Browse All Courses</Button></Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Robustly parse curriculum to handle JSON strings from the database
  let curriculum = [];
  if (Array.isArray(course.curriculum)) {
    curriculum = course.curriculum;
  } else if (typeof course.curriculum === 'string') {
    try {
      const parsed = JSON.parse(course.curriculum);
      curriculum = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse curriculum string", e);
    }
  } else if (course.curriculum && typeof course.curriculum === 'object') {
    if (Array.isArray((course.curriculum as any).data)) {
      curriculum = (course.curriculum as any).data;
    }
  }

  // Handle both snake_case (DB) and camelCase (mockData) gracefully
  const careerOutcomes = Array.isArray(course.careerOutcomes || course.career_outcomes) ? (course.careerOutcomes || course.career_outcomes) : [];
  
  let intakeMonths = [];
  const rawIntake = course.intake_months || course.intakeMonths;
  if (Array.isArray(rawIntake)) {
    intakeMonths = rawIntake;
  } else if (typeof rawIntake === 'string') {
    try {
      const parsed = JSON.parse(rawIntake);
      intakeMonths = Array.isArray(parsed) ? parsed : [rawIntake];
    } catch(e) {
      // If it's a comma separated string
      intakeMonths = rawIntake.split(',').map(s => s.trim());
    }
  }

  const entryReqs = (course.entryRequirements || course.entry_requirements) && typeof (course.entryRequirements || course.entry_requirements) === "object" ? (course.entryRequirements || course.entry_requirements) : null;

  // If curriculum is empty, it means we couldn't scrape it for this course yet.
  // We should just let it be empty instead of showing dummy data.

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <MegaMenu />

      <div className="w-full flex-1 flex flex-col">
        {/* Top Hero Section */}
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4 md:gap-5">
              {uni?.logo_url && (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-sm border border-gray-200 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src={uni.logo_url} alt={uni.name} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">{course.title}</h1>
                  <button onClick={handleCopy} className="mt-1 p-1 text-gray-400 hover:text-gray-600 rounded-sm hover:bg-gray-100 transition-colors" title="Copy course title">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-lg text-gray-600 font-medium">{uni?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-start md:mt-0 mt-2">
              <Button className="bg-[#f1a51c] hover:bg-[#e09819] text-black font-semibold rounded-sm px-6 h-10 shadow-none text-sm" onClick={() => setLeadOpen(true)}>Apply Now</Button>
              <Button variant="outline" className="rounded-sm px-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium h-10 text-sm shadow-none bg-white">Ask Us</Button>
            </div>
          </div>
        </div>

        {/* Sticky Tab Bar */}
        <div className="sticky top-0 z-40 bg-[#faf9f6] border-y border-gray-200 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 h-14 flex items-center overflow-x-auto no-scrollbar max-w-5xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center h-full space-x-6 md:space-x-10">
                <button onClick={() => scrollToSection('key-info')} className={`h-full border-b-4 px-0 font-semibold text-sm whitespace-nowrap transition-colors ${activeSection === 'key-info' ? 'border-[#f1a51c] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Key Information</button>
                <button onClick={() => scrollToSection('overview')} className={`h-full border-b-4 px-0 font-semibold text-sm whitespace-nowrap transition-colors ${activeSection === 'overview' ? 'border-[#f1a51c] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Course Overview</button>
                <button onClick={() => scrollToSection('curriculum')} className={`h-full border-b-4 px-0 font-semibold text-sm whitespace-nowrap transition-colors ${activeSection === 'curriculum' ? 'border-[#f1a51c] text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Curriculum</button>
              </div>
              
              {/* Actions in sticky nav (visible mostly on desktop) */}
              <div className="hidden md:flex items-center gap-3 shrink-0 ml-6">
                <Button className="bg-[#f1a51c] hover:bg-[#e09819] text-black font-semibold rounded-sm px-4 h-8 shadow-none text-xs" onClick={() => setLeadOpen(true)}>Apply Now</Button>
                <Button variant="outline" className="rounded-sm px-4 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium h-8 text-xs shadow-none bg-white">Ask Us</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pb-24">
          <div className="container mx-auto px-4 pt-10 max-w-5xl space-y-12">
            
            {/* Key Information Section */}
            <div id="key-info" className="space-y-10 scroll-m-20">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{course.title}</h3>
                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-y-4 text-sm sm:text-[14px] items-center">
                  <div className="font-semibold text-gray-800">Qualification</div>
                  <div className="text-gray-600">{course.degree_level}</div>

                  <div className="font-semibold text-gray-800">Duration</div>
                  <div className="text-gray-600">{course.duration}</div>

                  <div className="font-semibold text-gray-800">Intake</div>
                  <div className="flex flex-wrap gap-2">
                    {intakeMonths.length > 0 ? intakeMonths.map((m: string, idx: number) => (
                      <span key={m} className="px-3 py-1 rounded-sm text-xs font-medium bg-[#fcecc9] text-gray-900 border border-[#f5d9a0]">{m}</span>
                    )) : <span className="text-gray-600">TBA</span>}
                  </div>

                  <div className="font-semibold text-gray-800">English Requirement</div>
                  <div className="text-gray-600">{(entryReqs as any)?.ielts ? `IELTS ${(entryReqs as any).ielts}` : 'Not Specified'}</div>

                  <div className="font-semibold text-gray-800">Offer Letter</div>
                  <div className="text-gray-600">{course.offer_letter || "Fees Applies"}</div>

                  <div className="font-semibold text-gray-800">Class Type</div>
                  <div className="text-gray-600">Physical</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Course Fee for International Students</h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#eedaad] px-4 py-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm">Yearly Tuition fees</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left pb-3 font-semibold text-gray-700">Year</th>
                            <th className="text-left pb-3 font-semibold text-gray-700">Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.yearly_fees ? (
                            course.yearly_fees.map((yf: any, i: number) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 text-gray-600">{yf.year}</td>
                                <td className="py-3 text-gray-600 font-medium">{yf.fee}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="py-3 text-gray-600">1st Year</td>
                              <td className="py-3 text-gray-600 font-medium">MYR {Number(course.tuition_fee || 0).toLocaleString()}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#eedaad] px-4 py-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm">Other Fees</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left pb-3 font-semibold text-gray-700">Description</th>
                            <th className="text-left pb-3 font-semibold text-gray-700">Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.other_fees ? (
                            course.other_fees.map((of: any, i: number) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 text-gray-600">{of.description}</td>
                                <td className="py-3 text-gray-600 font-medium">{of.fee}</td>
                              </tr>
                            ))
                          ) : (
                            <>
                              <tr className="border-b border-gray-100">
                                <td className="py-3 text-gray-600">Registration Fee</td>
                                <td className="py-3 text-gray-600">MYR 280</td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-3 text-gray-600">Administration Fees</td>
                                <td className="py-3 text-gray-600">MYR 3,000</td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-3 text-gray-600">Personal Bond (Estimate)</td>
                                <td className="py-3 text-gray-600">MYR 1,500</td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-600">Visa Application Fee (approx)</td>
                                <td className="py-3 text-gray-600">MYR 2,850</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-[15px] text-gray-500 font-medium flex items-center gap-2">
                  <span className="text-2xl font-bold leading-none mt-1">+</span> University fees for this course do not include 6% tax (SST)
                </div>
              </div>

              {/* Apply Banner CTA */}
              <div className="mt-16 bg-gradient-to-r from-blue-50 to-[#fdf9f1] border border-blue-100 rounded-sm p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
                <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 max-w-md relative z-10 leading-tight">
                  Would you like to apply to {uni?.name} ?
                </h2>
                <Button variant="outline" className="relative z-10 bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-50 h-14 px-8 rounded-sm font-bold text-base transition-colors shadow-none w-full md:w-auto" onClick={() => setLeadOpen(true)}>
                  Apply now
                </Button>
              </div>
            </div>

            {/* Course Overview Section */}
            <div id="overview" className="space-y-10 scroll-m-24 border-t border-gray-200 pt-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-5">Course Overview</h3>
                <div className="text-gray-600 leading-relaxed text-[15px] sm:text-base">
                  {course.overview ? (
                    <p className="whitespace-pre-wrap">
                      {course.overview.split('Entry Requirements')[0].replace(/\n\s*\n/g, '\n\n').trim()}
                    </p>
                  ) : (
                    <p>Overview information is currently being updated.</p>
                  )}
                </div>
              </div>
              
              {course.entry_requirements_text && course.entry_requirements_text.split('Curriculum')[0].trim().length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Entry Requirements</h3>
                  <div className="text-gray-600 leading-relaxed text-[15px] sm:text-base whitespace-pre-wrap">
                    {course.entry_requirements_text.split('Curriculum')[0].replace(/\n\s*\n/g, '\n\n').trim()}
                  </div>
                </div>
              )}

              {careerOutcomes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Career opportunities</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 text-[15px] sm:text-base">
                    {careerOutcomes.map((role: string, i: number) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Programme Structure Section (Curriculum Accordion) */}
            <div id="curriculum" className="scroll-m-24 border-t border-gray-200 pt-16">
              <Accordion type="single" collapsible className="w-full bg-white rounded-sm shadow-sm overflow-hidden">
                <AccordionItem value="curriculum" className="border-b-0">
                  <AccordionTrigger className="px-6 py-6 hover:no-underline text-2xl font-bold text-gray-900 text-left bg-gray-50/50">
                    Curriculum
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-8 pt-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6">Programme Structure</h4>
                    {curriculum.length > 0 ? (
                      <div className="space-y-10">
                        {curriculum.map((cy: any, idx: number) => (
                          <div key={idx} className="space-y-4">
                            <h5 className="text-lg font-bold text-gray-900">{cy.year}</h5>
                            {cy.year === "Manufacturing System Engineering" && <h6 className="font-bold text-gray-900">Subjects</h6>}
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-[15px] border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 font-semibold text-gray-800">Subject</th>
                                    {(cy.modules || []).some((mod: any) => typeof mod !== 'string' && mod.credits) && (
                                      <th className="text-right py-3 font-semibold text-gray-800 w-32 whitespace-nowrap">Credit Hours</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(cy.modules || []).map((mod: any, i: number) => {
                                    const hasCreditsCol = (cy.modules || []).some((m: any) => typeof m !== 'string' && m.credits);
                                    if (typeof mod === 'string') {
                                      return (
                                        <tr key={i} className="border-b border-gray-100 last:border-0">
                                          <td className="py-3 text-gray-600" colSpan={hasCreditsCol ? 2 : 1}>{mod}</td>
                                        </tr>
                                      );
                                    }
                                    return (
                                      <tr key={i} className="border-b border-gray-100 last:border-0">
                                        <td className="py-3 text-gray-600">{mod.name}</td>
                                        {hasCreditsCol && (
                                          <td className="py-3 text-gray-600 text-right">{mod.credits}</td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            {cy.totalCredits && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="font-bold text-gray-900 mb-2">
                                  {cy.year === "Core Subjects" ? "Programme Core Credit Hours" : `Total Credit Hours in ${cy.year}`}
                                </p>
                                <ul className="list-disc pl-5 text-gray-800 text-[15px]">
                                  <li>Total {cy.year === "Core Subjects" ? "Core " : ""}Credit Hours: {cy.totalCredits}</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-[15px]">Programme structure details coming soon.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
          </div>
        </div>
      </div>

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultCourse={course.title}
        defaultUniversity={uni?.name || ""}
        source="course_apply"
      />

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/60123456789" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        <div className="bg-white px-4 py-2 rounded-sm shadow-md text-sm font-medium text-gray-800 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 hidden md:block">
          Need help? Chat with us
        </div>
        <div className="w-14 h-14 bg-[#25D366] rounded-sm flex items-center justify-center shadow-lg hover:bg-[#20bd5a] transition-colors">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </div>
      </a>

      <PublicFooter />
    </div>
  );
}
