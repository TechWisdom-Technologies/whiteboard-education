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
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

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

      // Check if scrolled past hero
      if (window.scrollY > 350) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
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

  const handleCopy = () => {
    if (!course) return;

    let engReq = 'Not Specified';
    if (entryReqs && typeof entryReqs === 'object') {
      const rawIelts = (entryReqs as any).IELTS || (entryReqs as any).ielts;
      if (rawIelts) {
        const parts = String(rawIelts).split(/[-–—]/);
        engReq = `IELTS ${parts[parts.length - 1].trim()}`;
      }
    }

    const intakeStr = intakeMonths.length > 0 ? intakeMonths.join(',') : 'Not Specified';
    const yearlyFees = course.tuition_fee || 'Not Specified';

    const copyText = `${uni?.name || 'University Name Not Available'}
  ${course.title}

Duration: ${course.duration || 'Not Specified'}
English requirement: ${engReq}

Intake: ${intakeStr}

Course fee for international students

Yearly Tuition fees

1st year: ${yearlyFees}

Other fees${course.offer_letter ? `\n\n\t Offer Letter: ${course.offer_letter}` : ''}${course.entry_requirements_text ? `\n\t Other Entry Req: ${course.entry_requirements_text}` : ''}

University fees for this course do not include 6% tax (SST)

More details visit the link below:
${window.location.href}`;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If curriculum is empty, it means we couldn't scrape it for this course yet.
  // We should just let it be empty instead of showing dummy data.

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu disableSticky={isScrolledPastHero} />

      <div className="w-full flex-1 flex flex-col">
        {/* Top Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-20 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">
              {uni?.logo_url && (
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-sm border border-gray-200 p-4 shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src={uni.logo_url} alt={uni.name} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div className="w-full flex-1">
                <div className="space-y-4 md:space-y-6 text-center md:text-left">
                  <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{course.title}</h1>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-xl text-gray-600 font-medium">{uni?.name}</p>
                    
                    <div className="flex items-center gap-3 shrink-0 justify-center md:justify-end">
                      <Button className="bg-[#f1a51c] hover:bg-[#e09819] text-black font-semibold rounded-sm px-6 h-10 shadow-none text-sm" onClick={() => setLeadOpen(true)}>Apply Now</Button>
                      <Button variant="outline" className="rounded-sm px-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium h-10 text-sm shadow-none bg-white">Ask Us</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tab Bar */}
        <div className="sticky top-0 z-40 bg-white border-y border-gray-200 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 min-h-[64px] py-1.5 flex items-center max-w-5xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6">
                {isScrolledPastHero && uni?.logo_url && (
                  <div className="hidden md:flex w-16 h-16 items-center justify-center shrink-0">
                    <img src={uni.logo_url} alt={uni.name} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex items-center h-full space-x-6 md:space-x-10">
                  <button onClick={() => scrollToSection('key-info')} className={`h-full px-0 font-normal text-base whitespace-nowrap transition-colors ${activeSection === 'key-info' ? 'text-[#f1a51c]' : 'text-gray-500 hover:text-[#e09819]'}`}>Key Information</button>
                  <button onClick={() => scrollToSection('overview')} className={`h-full px-0 font-normal text-base whitespace-nowrap transition-colors ${activeSection === 'overview' ? 'text-[#f1a51c]' : 'text-gray-500 hover:text-[#e09819]'}`}>Course Overview</button>
                  <button onClick={() => scrollToSection('curriculum')} className={`h-full px-0 font-normal text-base whitespace-nowrap transition-colors ${activeSection === 'curriculum' ? 'text-[#f1a51c]' : 'text-gray-500 hover:text-[#e09819]'}`}>Curriculum</button>
                </div>
              </div>
              
              {/* Actions in sticky nav (visible mostly on desktop) */}
              {isScrolledPastHero && (
                <div className="hidden md:flex items-center gap-3 shrink-0 ml-6">
                  <Button className="bg-[#f1a51c] hover:bg-[#e09819] text-black font-normal rounded-sm px-4 h-8 shadow-none text-base" onClick={() => setLeadOpen(true)}>Apply Now</Button>
                  <Button variant="outline" className="rounded-sm px-4 border-gray-300 text-gray-700 hover:bg-gray-50 font-normal h-8 text-base shadow-none bg-white">Ask Us</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pb-24">
          <div className="container mx-auto px-4 pt-10 max-w-5xl space-y-12">
            
            {/* Key Information Section */}
            <div id="key-info" className="space-y-10 scroll-m-20">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-sm px-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-normal h-8 text-xs shadow-none bg-white flex items-center gap-1.5" 
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-y-5 text-[16px] font-normal items-center">
                  <div className="text-gray-800">Qualification</div>
                  <div className="text-gray-600">{course.degree_level}</div>

                  <div className="text-gray-800">Duration</div>
                  <div className="text-gray-600">{course.duration}</div>

                  <div className="text-gray-800">Intake</div>
                  <div className="flex flex-wrap gap-2">
                    {intakeMonths.length > 0 ? intakeMonths.map((m: string, idx: number) => (
                      <span key={m} className="px-4 py-1.5 rounded-sm text-[16px] font-normal bg-[#fcecc9] text-gray-900 border border-[#f5d9a0]">{m}</span>
                    )) : <span className="text-gray-600">TBA</span>}
                  </div>

                  <div className="text-gray-800">English Requirement</div>
                  <div className="text-gray-600">
                    {(() => {
                      const rawIelts = entryReqs && typeof entryReqs === 'object' 
                        ? ((entryReqs as any).IELTS || (entryReqs as any).ielts) 
                        : null;
                      
                      if (!rawIelts) return 'Not Specified';
                      
                      // If it's a range like "6.0 - 6.5", take the last part
                      const parts = String(rawIelts).split(/[-–—]/);
                      const displayScore = parts[parts.length - 1].trim();
                      
                      return `IELTS ${displayScore}`;
                    })()}
                  </div>

                  <div className="text-gray-800">Offer Letter</div>
                  <div className="text-gray-600">{course.offer_letter || "Fees Applies"}</div>

                  <div className="text-gray-800">Class Type</div>
                  <div className="text-gray-600">Physical</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-5">Course Fee for International Students</h3>
                <div className="grid md:grid-cols-2 gap-12 w-full lg:w-[75%]">
                  <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#ffa300]/20 px-4 py-3 border-b border-[#ffa300]/30">
                      <h4 className="font-semibold text-gray-900 text-[16px]">Yearly Tuition fees</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-[15px] font-light">
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
                                <td className="py-3 text-gray-600">{yf.fee}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="py-3 text-gray-600">1st Year</td>
                              <td className="py-3 text-gray-600">MYR {Number(course.tuition_fee || 0).toLocaleString()}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#ffa300]/20 px-4 py-3 border-b border-[#ffa300]/30">
                      <h4 className="font-semibold text-gray-900 text-[16px]">Other Fees</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-[15px] font-light">
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
                                <td className="py-3 text-gray-600">{of.fee}</td>
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
                <h2 className="text-[20px] font-semibold text-gray-900 max-w-md relative z-10 leading-tight">
                  Would you like to apply to {uni?.name} ?
                </h2>
                <Button variant="outline" className="relative z-10 bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-50 h-14 px-8 rounded-sm font-bold text-base transition-colors shadow-none w-full md:w-auto" onClick={() => setLeadOpen(true)}>
                  Apply now
                </Button>
              </div>
            </div>

            {/* Course Overview Section */}
            <div id="overview" className="space-y-10 scroll-m-24 pt-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-5">Course Overview</h3>
                <div className="text-gray-600 font-normal leading-relaxed text-[16px]">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-5">Entry Requirements</h3>
                  <div className="text-gray-600 font-normal leading-relaxed text-[16px] whitespace-pre-wrap">
                    {course.entry_requirements_text.split('Curriculum')[0].replace(/\n\s*\n/g, '\n\n').trim()}
                  </div>
                </div>
              )}

              {careerOutcomes.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-5">Career opportunities</h3>
                  <ul className="list-disc pl-5 space-y-2 font-normal text-gray-600 text-[16px]">
                    {careerOutcomes.map((role: string, i: number) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Programme Structure Section (Curriculum Accordion) */}
            <div id="curriculum" className="scroll-m-24 pt-10">
              <Accordion type="single" collapsible className="w-full bg-white rounded-sm overflow-hidden">
                <AccordionItem value="curriculum" className="border-b-0">
                  <AccordionTrigger className="px-0 py-6 hover:no-underline text-xl font-semibold text-gray-900 text-left bg-transparent">
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

      <PublicFooter />
    </div>
  );
}
