import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { courses as mockCourses, universities as mockUniversities } from "@/data/mockData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  CheckCircle, Clock, GraduationCap, MapPin, DollarSign,
  CalendarDays, FileText, Download, Briefcase, BookOpen
} from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { data: liveCourses = [], isLoading: loadingC } = useTableData("courses");
  const { data: liveUniversities = [] } = useTableData("universities");
  const courses = liveCourses.length > 0 ? liveCourses : (mockCourses as any[]);
  const universities = liveUniversities.length > 0 ? liveUniversities : (mockUniversities as any[]);
  const [leadOpen, setLeadOpen] = useState(false);

  const course = courses.find((c: any) => String(c.id) === String(courseId));
  const uni = course ? universities.find((u: any) => String(u.id) === String(course.university_id)) : null;

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

  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
  const careerOutcomes = Array.isArray(course.career_outcomes) ? course.career_outcomes : [];
  const intakeMonths = Array.isArray(course.intake_months) ? course.intake_months : [];
  const entryReqs = course.entry_requirements && typeof course.entry_requirements === "object" ? course.entry_requirements : null;
  const nextIntake = intakeMonths[0] ? `${intakeMonths[0]} 2026` : "TBA";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />

      <div className="intro-surface py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4">
            {uni?.logo_url && (
              <div className="h-14 w-14 rounded-md bg-primary-foreground/10 overflow-hidden shrink-0 hidden sm:block">
                <img src={uni.logo_url} alt={uni.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">{course.title}</h1>
              <p className="text-primary-foreground/70 mt-1 text-sm md:text-base">{uni?.name || "University"}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="bg-[#ffa300]/20 text-[#ffa300] border-0"><GraduationCap className="h-3 w-3 mr-1" /> {course.degree_level}</Badge>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground"><Clock className="h-3 w-3 mr-1" /> {course.duration}</Badge>
                {uni && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground"><MapPin className="h-3 w-3 mr-1" /> {uni.city}, Malaysia</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3">Overview</TabsTrigger>
                <TabsTrigger value="curriculum" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3">Curriculum</TabsTrigger>
                <TabsTrigger value="careers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3">Career Outcomes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-8">
                {course.overview && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-3">About This Program</h2>
                    <p className="text-muted-foreground leading-relaxed">{course.overview}</p>
                  </div>
                )}
                {curriculum.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">What You Will Learn</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {curriculum.flatMap((y: any) => y.modules || []).slice(0, 8).map((mod: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-[#ffa300] mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Program Structure</h2>
                {curriculum.length > 0 ? (
                  <Accordion type="multiple" defaultValue={[curriculum[0]?.year]} className="space-y-2">
                    {curriculum.map((cy: any) => (
                      <AccordionItem key={cy.year} value={cy.year} className="border rounded-md px-4">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">{cy.year} Core Modules</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 pb-2">
                            {(cy.modules || []).map((mod: string, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />{mod}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">Curriculum details coming soon.</p>
                )}
              </TabsContent>

              <TabsContent value="careers" className="mt-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Where This Degree Takes You</h2>
                {careerOutcomes.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {careerOutcomes.map((role: string, i: number) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                            <Briefcase className="h-4 w-4 text-accent-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{role}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Career outcomes data coming soon.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <aside className="lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <Card className="shadow-lg border-2 border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-bold text-foreground text-lg">Key Information</h3>
                  <div className="space-y-4">
                    {[
                      { icon: DollarSign, label: "Tuition Fee", value: `USD ${Number(course.tuition_fee).toLocaleString()} / year` },
                      { icon: CalendarDays, label: "Next Intake", value: nextIntake },
                      { icon: Clock, label: "Duration", value: `${course.duration} Full-Time` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-[#ffa300]/15 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-[#ffa300]" /></div>
                        <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold text-foreground">{value}</p></div>
                      </div>
                    ))}
                    {entryReqs && (
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-[#ffa300]/15 flex items-center justify-center shrink-0"><GraduationCap className="h-4 w-4 text-[#ffa300]" /></div>
                        <div>
                          <p className="text-xs text-muted-foreground">Entry Requirements</p>
                          <p className="text-sm font-semibold text-foreground">IELTS {(entryReqs as any).ielts}, Min GPA {(entryReqs as any).gpa}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 space-y-3">
                    <Button className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 h-12 text-base font-bold" onClick={() => setLeadOpen(true)}>Apply Now</Button>
                    <Button variant="outline" className="w-full h-10"><Download className="h-4 w-4 mr-2" /> Download Syllabus</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
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
