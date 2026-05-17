import { useParams, Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { useTableData } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { CheckCircle, Clock, DollarSign, MapPin, CalendarDays, GraduationCap, Languages, Download } from "lucide-react";
import { useState } from "react";

export default function LanguageCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: languageCenters = [], isLoading } = useTableData("language_centers");
  const lc = languageCenters.find((l: any) => l.id === id);
  const [leadOpen, setLeadOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <LoadingScreen label="Loading program details" sublabel="Getting language center information" className="flex-1" />
        <PublicFooter />
      </div>
    );
  }

  if (!lc) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Languages className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Program Not Found</h1>
            <Link to="/language-centers"><Button>Browse All Programs</Button></Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const curriculum = Array.isArray(lc.curriculum) ? lc.curriculum : [];
  const intakeMonths = Array.isArray(lc.intake_months) ? lc.intake_months : [];
  const nextIntake = intakeMonths[0] ? `${intakeMonths[0]} 2026` : "TBA";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />
      <div className="intro-surface py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-sm bg-primary-foreground/10 items-center justify-center shrink-0 hidden sm:flex">
              <Languages className="h-7 w-7 text-[#ffa300]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">{lc.name}</h1>
              <p className="text-primary-foreground/70 mt-1">{lc.institute}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="bg-[#ffa300]/20 text-[#ffa300] border-0"><GraduationCap className="h-3 w-3 mr-1" /> {lc.level}</Badge>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground"><Clock className="h-3 w-3 mr-1" /> {lc.duration}</Badge>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground"><MapPin className="h-3 w-3 mr-1" /> {lc.city}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">About This Program</h2>
              <p className="text-muted-foreground leading-relaxed">{lc.overview}</p>
            </div>
            {curriculum.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">What You Will Learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {curriculum.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#ffa300] mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <aside className="lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <Card className="shadow-lg border-2 border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-bold text-foreground text-lg">Key Information</h3>
                  <div className="space-y-4">
                    {[
                      { icon: DollarSign, label: "Tuition Fee", value: `MYR ${Number(lc.tuition_fee).toLocaleString()}` },
                      { icon: CalendarDays, label: "Next Intake", value: nextIntake },
                      { icon: Clock, label: "Duration", value: lc.duration },
                      { icon: GraduationCap, label: "Level", value: lc.level },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-sm bg-[#ffa300]/15 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-[#ffa300]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold text-foreground">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 space-y-3">
                    <Button className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 h-12 text-base font-bold" onClick={() => navigate("/apply")}>Apply Now</Button>
                  </div>
                  <div className="pt-3 border-t">
                    <Button variant="outline" className="w-full h-10"><Download className="h-4 w-4 mr-2" /> Download Brochure</Button>
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
        defaultCourse={lc?.name || ""}
        defaultUniversity={lc?.institute || ""}
        source="language_center_detail_apply"
      />

      <PublicFooter />
    </div>
  );
}
