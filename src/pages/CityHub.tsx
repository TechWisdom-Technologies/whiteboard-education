import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  universities as mockUniversities,
  courses as mockCourses,
  accommodations as mockAccommodations,
  costOfLivingData,
} from "@/data/mockData";
import { useTableData } from "@/hooks/useSupabaseData";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Trophy, ArrowRight, Building, GraduationCap, Home, UtensilsCrossed,
  Bus, Wifi, DollarSign, BookOpen, Users, Coffee, Train, ShoppingBag,
  Utensils, Landmark, Sun, Palette, Cpu, Waves, Phone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CityInfo {
  name: string;
  tagline: string;
  image: string;
  description: string;
  studentLifeIntro: string;
  highlights: { icon: React.ElementType; title: string; text: string }[];
  topCourseFields: string[];
  transport: string[];
  foodScene: string;
  safetyRating: string;
  averageTemp: string;
  costLabel: string;
}

const cityData: Record<string, CityInfo> = {
  "kuala-lumpur": {
    name: "Kuala Lumpur",
    tagline: "Malaysia's vibrant capital and education powerhouse",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1400&h=600&fit=crop",
    description:
      "Kuala Lumpur is the cultural and economic heart of Malaysia, home to iconic landmarks like the Petronas Twin Towers. The city hosts some of the country's most prestigious universities and offers an unmatched urban student experience with affordable living, world-class transit (LRT/MRT), and a thriving food scene. With over 7 million residents in the greater metro area, KL is a true megacity that remains remarkably affordable for international students.",
    studentLifeIntro: "KL offers the most dynamic student lifestyle in Malaysia - from world-class malls and street food markets to cultural festivals and nightlife. Students enjoy easy access to co-working spaces, tech meetups, and a massive international community.",
    highlights: [
      { icon: Train, title: "World-Class Transit", text: "LRT, MRT, KTM, and monorail connect you to every corner of the city for under RM5/trip." },
      { icon: Utensils, title: "Food Capital", text: "From Jalan Alor hawker stalls to fine dining - eat world-class food for $2-5 a meal." },
      { icon: ShoppingBag, title: "Shopping & Entertainment", text: "Bukit Bintang, KLCC, and Mid Valley offer endless shopping, cinema, and social spots." },
      { icon: Users, title: "International Community", text: "Home to the largest international student population in Malaysia with 50+ nationalities." },
    ],
    topCourseFields: ["Computer Science", "Business & MBA", "Medicine", "Pharmacy", "Psychology", "Data Science"],
    transport: ["MRT Putrajaya Line", "LRT Kelana Jaya Line", "KTM Komuter", "Grab (ride-hailing)", "Go KL free city bus"],
    foodScene: "KL's food scene is legendary - Nasi Lemak for RM3, Roti Canai for RM1.50, and bubble tea on every corner. Jalan Alor, Bangsar, and SS15 are student food hotspots.",
    safetyRating: "Safe - Well-lit streets, CCTV coverage, and active tourist police",
    averageTemp: "27-33°C year-round",
    costLabel: "Kuala Lumpur",
  },
  cyberjaya: {
    name: "Cyberjaya",
    tagline: "Malaysia's Silicon Valley - built for tech students",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=600&fit=crop",
    description:
      "Cyberjaya is Malaysia's flagship tech city, purpose-built as part of the Multimedia Super Corridor initiative. It hosts leading tech universities like MMU and APU, and is surrounded by 900+ multinational tech companies - giving students direct access to internships and graduate employment. The city is designed around innovation, with smart infrastructure, free Wi-Fi zones, and tech incubators within walking distance of campus.",
    studentLifeIntro: "Life in Cyberjaya revolves around tech, gaming, and campus culture. It's quieter than KL but has a tight-knit student community with esports tournaments, hackathons, and startup weekends. Living costs are significantly lower than in the capital.",
    highlights: [
      { icon: Cpu, title: "Tech Ecosystem", text: "900+ tech companies including Dell, DHL, BMW, and Huawei - internships are everywhere." },
      { icon: Wifi, title: "Smart City", text: "Free public Wi-Fi, smart traffic systems, and digital government services." },
      { icon: Coffee, title: "Campus-Centric Living", text: "Everything is walkable - cafés, convenience stores, and student housing are clustered near campuses." },
      { icon: Palette, title: "Creative Hub", text: "MMU's animation and film programs make Cyberjaya a hub for creative technology and digital media." },
    ],
    topCourseFields: ["Software Engineering", "Cybersecurity", "Multimedia Design", "IT & Computing", "Animation & Film"],
    transport: ["Dedicated bus routes to KL Sentral", "Grab (ride-hailing)", "Cyberjaya-Putrajaya ERL feeder bus", "Bicycle-friendly roads"],
    foodScene: "Cyberjaya has a growing food scene with affordable mamak stalls, food courts at D'Pulze Mall, and student-favourite spots along Persiaran Multimedia. Expect meals from RM5-10.",
    safetyRating: "Very Safe - Gated communities, 24/7 security patrols",
    averageTemp: "26-32°C year-round",
    costLabel: "Cyberjaya",
  },
  penang: {
    name: "Penang",
    tagline: "Heritage charm meets modern education",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&h=600&fit=crop",
    description:
      "Penang, a UNESCO World Heritage Site, offers a unique blend of colonial architecture, street art, and cutting-edge engineering campuses. Known for its lower cost of living compared to KL, Penang is home to USM - one of Malaysia's top research universities - and a booming electronics manufacturing sector. The island vibe creates a relaxed yet intellectually stimulating environment that students love.",
    studentLifeIntro: "Penang offers the most unique student lifestyle in Malaysia - ride a bicycle through Georgetown's street art alleys, eat the best hawker food in the country, and study with ocean breezes. The pace is slower than KL, and students describe it as the perfect balance between focus and fun.",
    highlights: [
      { icon: Landmark, title: "UNESCO Heritage", text: "Georgetown's colonial architecture, temples, and street art make every walk an adventure." },
      { icon: Waves, title: "Island Living", text: "Beaches, national parks, and hilltop trails are minutes from campus." },
      { icon: Sun, title: "Best Food in Malaysia", text: "Penang is widely considered Malaysia's food capital - Char Kway Teow, Assam Laksa, and Cendol are legendary." },
      { icon: Building, title: "Electronics Hub", text: "Intel, Bosch, and Osram have manufacturing plants here - engineering internships abound." },
    ],
    topCourseFields: ["Medical Sciences", "Sustainable Development", "Engineering", "Environmental Science", "Pharmacology"],
    transport: ["Rapid Penang bus network", "Penang Ferry", "Grab (ride-hailing)", "Bicycle rentals", "Penang Bridge to mainland"],
    foodScene: "Penang is Malaysia's undisputed food capital. Gurney Drive, New Lane, and Kimberly Street serve world-famous hawker food for RM3-8. Students eat like kings on a tight budget.",
    safetyRating: "Very Safe - Tight island community with low crime rates",
    averageTemp: "27-32°C year-round",
    costLabel: "Penang",
  },
};

// Approximate cost data for cities not in costOfLivingData
const fallbackCosts: Record<string, { rent: number; food: number; transport: number; utilities: number; entertainment: number }> = {
  "Cyberjaya": { rent: 250, food: 150, transport: 30, utilities: 35, entertainment: 40 },
};

export default function CityHub() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = cityData[citySlug || ""];
  const { toast } = useToast();
  const [leadOpen, setLeadOpen] = useState(false);
  const { data: liveUniversities = [] } = useTableData("universities");
  const { data: liveCourses = [] } = useTableData("courses");
  const { data: liveAccommodations = [] } = useTableData("accommodations");

  const universities = useMemo(() => (liveUniversities.length > 0 ? liveUniversities : mockUniversities), [liveUniversities]);
  const courses = useMemo(() => (liveCourses.length > 0 ? liveCourses : mockCourses), [liveCourses]);
  const accommodations = useMemo(() => (liveAccommodations.length > 0 ? liveAccommodations : mockAccommodations), [liveAccommodations]);

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-extrabold text-foreground">City Not Found</h1>
            <Link to="/destinations/malaysia">
              <Button variant="outline">Back to Malaysia Hub</Button>
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const cityUnis = universities.filter(
    (u) => u.city.toLowerCase().replace(/\s+/g, "-") === citySlug || u.city.toLowerCase() === city.name.toLowerCase()
  );

  const cityUniIds = cityUnis.map((u: any) => String(u.id));
  const cityCourses = courses.filter((c: any) => cityUniIds.includes(String(c.university_id)));
  const cityAccom = accommodations.filter(
    (a: any) => {
      const nearIds = Array.isArray(a.near_university_ids) ? a.near_university_ids.map((id: any) => String(id)) : [];
      return a.city?.toLowerCase() === city.name.toLowerCase() || nearIds.some((id: string) => cityUniIds.includes(id));
    }
  );

  const costs = costOfLivingData?.find((c) => c.city === city.costLabel) || fallbackCosts[city.name];
  const totalCost = costs ? costs.rent + costs.food + costs.transport + costs.utilities + (costs.entertainment || 0) : 0;
  const maxCost = 900;

  const handleConsult = () => {
    setLeadOpen(true);
    toast({ title: "Consultation booked!", description: `Our ${city.name} advisor will contact you within 24 hours.` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />

      {/* ── HERO ── */}
      <section className="relative h-[380px] md:h-[460px] overflow-hidden">
        <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/95 via-[hsl(var(--primary))]/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Badge className="bg-[#ffa300]/20 text-[#181d29] mb-3">
              <MapPin className="h-3 w-3 mr-1" /> Malaysia
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-2">
              Study in {city.name}
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">{city.tagline}</p>
            <div className="flex gap-3 mt-6 flex-wrap">
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80 text-xs py-1 px-3">
                <Sun className="h-3 w-3 mr-1" /> {city.averageTemp}
              </Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80 text-xs py-1 px-3">
                <GraduationCap className="h-3 w-3 mr-1" /> {cityUnis.length} Universities
              </Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80 text-xs py-1 px-3">
                <BookOpen className="h-3 w-3 mr-1" /> {cityCourses.length} Courses
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT + HIGHLIGHTS ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">About {city.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{city.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-sm bg-[#ffa300]/10 flex items-center justify-center shrink-0">
                    <Sun className="h-4 w-4 text-[#ffa300]" />
                  </div>
                  <span className="text-muted-foreground">{city.averageTemp}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-sm bg-[#ffa300]/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-[#ffa300]" />
                  </div>
                  <span className="text-muted-foreground">{city.safetyRating.split("-")[0].trim()}</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 grid sm:grid-cols-2 gap-4">
              {city.highlights.map((h, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <CardContent className="p-5">
                    <div className="h-9 w-9 rounded-sm bg-[#ffa300]/15 flex items-center justify-center mb-3">
                      <h.icon className="h-4 w-4 text-[#ffa300]" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{h.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{h.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COST OF LIVING ── */}
      {costs && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Cost of Living in {city.name}</h2>
            <p className="text-muted-foreground mb-8">Estimated monthly expenses for international students (USD).</p>
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6 space-y-5">
                  {[
                    { label: "Rent (shared/studio)", value: costs.rent, icon: Home, color: "bg-[#ffa300]" },
                    { label: "Food & Groceries", value: costs.food, icon: UtensilsCrossed, color: "bg-primary" },
                    { label: "Transport", value: costs.transport, icon: Bus, color: "bg-accent" },
                    { label: "Utilities & Internet", value: costs.utilities, icon: Wifi, color: "bg-muted-foreground" },
                    { label: "Entertainment", value: costs.entertainment || 0, icon: Coffee, color: "bg-[#ffa300]/70" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <item.icon className="h-4 w-4 text-muted-foreground" /> {item.label}
                        </span>
                        <span className="font-bold text-foreground">${item.value}/mo</span>
                      </div>
                      <Progress value={(item.value / maxCost) * 100} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-bold text-foreground">Estimated Total</span>
                    <span className="text-xl font-extrabold text-[#ffa300]">${totalCost}/mo</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-[#ffa300]" /> Food Scene
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{city.foodScene}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <Train className="h-4 w-4 text-[#ffa300]" /> Getting Around
                    </h3>
                    <ul className="space-y-1.5">
                      {city.transport.map((t) => (
                        <li key={t} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-sm bg-secondary shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Link to="/tools/calculator">
                  <Button variant="outline" className="w-full gap-2">
                    <DollarSign className="h-4 w-4" /> Open Full Cost Calculator
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TOP COURSES ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Top Courses in {city.name}</h2>
              <p className="text-muted-foreground mt-1">{cityCourses.length} programs across {cityUnis.length} universities</p>
            </div>
            <Link to="/courses">
              <Button variant="outline" size="sm" className="hidden md:inline-flex gap-1">
                All Courses <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Popular fields */}
          <div className="flex flex-wrap gap-2 mb-6">
            {city.topCourseFields.map((f) => (
              <Badge key={f} variant="outline" className="border-[#ffa300]/30 text-[#ffa300] text-xs py-1 px-3">
                {f}
              </Badge>
            ))}
          </div>

          {cityCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-1">Courses coming soon</h3>
                <p className="text-sm text-muted-foreground">We're adding programs for {city.name} universities.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cityCourses.slice(0, 6).map((course: any) => {
                const uni = universities.find((u: any) => String(u.id) === String(course.university_id));
                return (
                  <Link key={course.id} to={`/courses/${course.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                      <CardContent className="p-5 space-y-3">
                        <Badge variant="secondary" className="text-xs">{course.degree_level}</Badge>
                        <h3 className="font-bold text-sm leading-tight group-hover:text-[#ffa300] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{uni?.name}</p>
                        <div className="flex items-center justify-between pt-2 border-t text-xs">
                          <span className="text-muted-foreground">{course.duration}</span>
                          <span className="font-bold text-[#ffa300]">${course.tuition_fee.toLocaleString()}/yr</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── UNIVERSITIES ── */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Universities in {city.name}</h2>
              <p className="text-muted-foreground mt-1">{cityUnis.length} partner institutions</p>
            </div>
            <Link to="/universities">
              <Button variant="outline" size="sm" className="gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {cityUnis.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-1">More universities coming soon</h3>
                <p className="text-sm text-muted-foreground">We're adding more partner institutions in {city.name}.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityUnis.map((uni) => (
                <Link key={uni.id} to={`/universities/${uni.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                    <div className="h-36 overflow-hidden bg-muted">
                      <img src={uni.heroImage || uni.logo_url} alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <h3 className="font-bold text-sm leading-tight group-hover:text-[#ffa300] transition-colors">{uni.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{uni.description}</p>
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
          )}
        </div>
      </section>

      {/* ── STUDENT LIFE ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Student Life in {city.name}</h2>
          <p className="text-muted-foreground max-w-2xl mb-8">{city.studentLifeIntro}</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Accommodation snapshot */}
            <Card className="md:col-span-1">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#ffa300]" /> Accommodation
                </h3>
                {cityAccom.length > 0 ? (
                  <div className="space-y-3">
                    {cityAccom.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-foreground text-xs">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.type}</p>
                        </div>
                        <span className="font-bold text-[#ffa300] text-xs">${a.price_per_month}/mo</span>
                      </div>
                    ))}
                    <Link to="/housing" className="text-xs font-semibold text-[#ffa300] hover:underline flex items-center gap-1 pt-1">
                      View all housing <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Housing listings coming soon.</p>
                )}
              </CardContent>
            </Card>

            {/* Safety & Weather */}
            <Card className="md:col-span-1">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground mb-1 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#ffa300]" /> Safety
                  </h3>
                  <p className="text-xs text-muted-foreground">{city.safetyRating}</p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 flex items-center gap-2 text-sm">
                    <Sun className="h-4 w-4 text-[#ffa300]" /> Climate
                  </h3>
                  <p className="text-xs text-muted-foreground">Tropical - {city.averageTemp}. Pack light clothes, an umbrella, and sunscreen.</p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-[#ffa300]" /> Student Community
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {cityUnis.reduce((sum, u) => sum + (u.totalStudents || 0), 0).toLocaleString()} students across {cityUnis.length} universities
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card className="md:col-span-1 bg-[#ffa300]/5 border-[#ffa300]/20">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-foreground mb-1 text-sm">{city.name} at a Glance</h3>
                {[
                  { label: "Universities", value: cityUnis.length },
                  { label: "Courses Available", value: cityCourses.length },
                  { label: "Housing Options", value: cityAccom.length },
                  { label: "Est. Monthly Cost", value: costs ? `$${totalCost}` : "N/A" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
                <Link to="/eligibility">
                  <Button size="sm" className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 mt-2 gap-1">
                    Check Eligibility <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-[#ffa300] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#181d29] mb-3">
            Ready to start your journey in {city.name}?
          </h2>
          <p className="text-[#181d29]/80 max-w-md mx-auto mb-8">
            Our expert counselors will guide you from application to arrival - completely free.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-13 px-8" onClick={handleConsult}>
              <Phone className="h-4 w-4 mr-2" /> Free Consultation
            </Button>
            <Link to="/destinations/malaysia">
              <Button size="lg" variant="outline" className="border-[#181d29]/30 text-[#181d29] hover:bg-[#181d29]/10 font-bold h-13 px-8">
                <Building className="h-4 w-4 mr-2" /> Explore All of Malaysia
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultUniversity={city.name}
        source={`city-${citySlug || "unknown"}`}
      />

      <PublicFooter />
    </div>
  );
}
