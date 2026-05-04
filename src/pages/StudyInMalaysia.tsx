import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { countries, universities as mockUniversities, costOfLivingData } from "@/data/mockData";
import { useTableData } from "@/hooks/useSupabaseData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Trophy, ArrowRight, Landmark, Banknote, Languages, Users,
  DollarSign, Globe, Laptop, Plane, Shield, Award, GraduationCap,
  Home, UtensilsCrossed, Bus, FileText, Phone, BookOpen, Cpu,
  Building, Wifi, Coffee, Briefcase,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, Globe, Laptop, Plane, Shield, Award, GraduationCap,
  Cpu, MapPin, Languages, Briefcase, Building,
};

const malaysia = countries[0];

export default function StudyInMalaysia() {
  const { toast } = useToast();
  const [leadOpen, setLeadOpen] = useState(false);
  const { data: liveUniversities = [] } = useTableData("universities", { orderBy: "ranking" });

  const universities = useMemo(() => (liveUniversities.length > 0 ? liveUniversities : mockUniversities), [liveUniversities]);

  const handleConsult = () => {
    setLeadOpen(true);
    toast({ title: "Great choice", description: "Fill out the form and our counselor will contact you shortly." });
  };

  const quickFacts = [
    { icon: Landmark, label: "Capital", value: malaysia.capital || "Kuala Lumpur" },
    { icon: Banknote, label: "Currency", value: malaysia.currency || "MYR" },
    { icon: Languages, label: "Language", value: malaysia.language || "Malay & English" },
    { icon: Users, label: "Population", value: malaysia.population || "33 Million" },
  ];

  // City cost comparison
  const klCost = costOfLivingData.find((c) => c.city === "Kuala Lumpur");
  const penangCost = costOfLivingData.find((c) => c.city === "Penang");
  const jbCost = costOfLivingData.find((c) => c.city === "Johor Bahru");

  const cityCosts = [
    { city: "Kuala Lumpur", data: klCost, icon: Building },
    { city: "Penang", data: penangCost, icon: Coffee },
    { city: "Johor Bahru", data: jbCost, icon: Home },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />

      {/* HERO */}
      <section className="relative h-[400px] md:h-[480px] overflow-hidden">
        <img
          src={malaysia.bannerImage || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1400&h=600&fit=crop"}
          alt="Study in Malaysia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/95 via-[hsl(var(--primary))]/50 to-[hsl(var(--primary))]/20" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <span className="text-6xl mb-4 block">🇲🇾</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-3">
              Study in Malaysia
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              Your gateway to world-class, affordable education in Southeast Asia's top tech hub.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Facts Floating Card */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <Card className="shadow-xl border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {quickFacts.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-[#ffa300]/15 flex items-center justify-center shrink-0">
                    <f.icon className="h-5 w-5 text-[#ffa300]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-bold text-foreground">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WHY MALAYSIA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Why Malaysia Is a Top Education Hub</h2>
          <div className="flex flex-col lg:flex-row gap-10 mt-6">
            <div className="lg:w-1/2">
              <p className="text-muted-foreground leading-relaxed text-base">{malaysia.aboutText}</p>
              <div className="mt-6 p-4 rounded-md bg-[#ffa300]/10 border border-[#ffa300]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-5 w-5 text-[#ffa300]" />
                  <h3 className="font-bold text-sm text-foreground">Malaysia's Tech Advantage</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cyberjaya, Malaysia's Silicon Valley, hosts 900+ tech companies including Dell, DHL, and BMW. 
                  The Malaysia Digital (MD) initiative provides tax incentives and visa pathways for tech graduates, 
                  making it one of the best places in Asia to launch a tech career.
                </p>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="grid sm:grid-cols-2 gap-4">
                {(malaysia.reasonsToStudy || []).map((r, i) => {
                  const Icon = iconMap[r.iconName] || BookOpen;
                  return (
                    <Card key={i} className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <CardContent className="p-5">
                        <div className="h-9 w-9 rounded-md bg-[#ffa300]/15 flex items-center justify-center mb-3">
                          <Icon className="h-4 w-4 text-[#ffa300]" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1">{r.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP UNIVERSITIES */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Top Universities in Malaysia</h2>
              <p className="text-muted-foreground mt-1">{universities.length} partner universities</p>
            </div>
            <Link to="/universities">
              <Button variant="outline" size="sm" className="hidden md:inline-flex gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.slice(0, 6).map((uni) => (
              <Link key={uni.id} to={`/universities/${uni.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                  <div className="h-36 overflow-hidden bg-muted">
                    <img src={uni.hero_image || uni.heroImage || uni.logo_url} alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <CardContent className="p-5 space-y-2">
                    <h3 className="font-bold text-sm leading-tight group-hover:text-[#ffa300] transition-colors">{uni.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {uni.city}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="outline" className="text-xs border-[#ffa300]/30 text-[#ffa300]">
                        <Trophy className="h-3 w-3 mr-1" /> #{uni.ranking}
                      </Badge>
                      <span className="text-xs font-semibold text-[#ffa300] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COST OF LIVING: KL vs Penang vs JB */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Cost of Living: KL vs Penang vs Johor Bahru</h2>
          <p className="text-muted-foreground mb-8">Estimated monthly expenses for international students (USD).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityCosts.map((c) => (
              <Card key={c.city}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-md bg-[#ffa300]/15 flex items-center justify-center">
                      <c.icon className="h-5 w-5 text-[#ffa300]" />
                    </div>
                    <h3 className="font-bold text-foreground">{c.city}</h3>
                  </div>
                  {c.data && (
                    <div className="space-y-3">
                      {[
                        { label: "Rent", value: c.data.rent, icon: Home },
                        { label: "Food", value: c.data.food, icon: UtensilsCrossed },
                        { label: "Transport", value: c.data.transport, icon: Bus },
                        { label: "Utilities", value: c.data.utilities, icon: Wifi },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <item.icon className="h-3.5 w-3.5" /> {item.label}
                          </span>
                          <span className="font-semibold text-foreground">${item.value}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span className="text-[#ffa300]">${c.data.rent + c.data.food + c.data.transport + c.data.utilities}/mo</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EMGS VISA PROCESS */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="lg:w-1/2">
              <div className="rounded-md overflow-hidden bg-muted aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=500&fit=crop"
                  alt="Student visa process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">The EMGS Student Visa Process</h2>
              <p className="text-muted-foreground leading-relaxed">
                Malaysia uses the Education Malaysia Global Services (EMGS) system — a centralised, online platform that streamlines the entire student visa process. Here's how it works:
              </p>
              <ol className="space-y-3 mt-4">
                {[
                  "Submit application via your university's international office",
                  "University forwards documents to EMGS for processing",
                  "EMGS conducts background & health verification (4-8 weeks)",
                  "Receive your Visa Approval Letter (VAL) electronically",
                  "Collect your Student Pass upon arrival in Malaysia",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-secondary text-[#181d29] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="flex items-start gap-3 pt-4 p-3 rounded-md bg-[#ffa300]/10">
                <FileText className="h-5 w-5 text-[#ffa300] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Post-Study Work Rights</p>
                  <p className="text-xs text-muted-foreground mt-1">{malaysia.postStudyWorkRights}</p>
                </div>
              </div>
              <Link to="/visa-guide">
                <Button variant="outline" size="sm" className="mt-2 gap-1">
                  Read Full Visa Guide <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-[#ffa300] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#181d29] mb-3">
            Ready to Start Your Journey in Malaysia?
          </h2>
          <p className="text-[#181d29]/80 max-w-xl mx-auto mb-8">
            Our expert counselors will guide you from application to arrival — completely free of charge.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-13 px-8" onClick={handleConsult}>
              <Phone className="h-4 w-4 mr-2" /> Book a Free Consultation
            </Button>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="border-[#181d29]/30 text-[#181d29] hover:bg-[#181d29]/10 font-bold h-13 px-8">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultUniversity="Malaysia"
        source="destination-malaysia"
      />

      <PublicFooter />
    </div>
  );
}
