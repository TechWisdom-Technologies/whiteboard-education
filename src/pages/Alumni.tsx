import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Play, Quote, Search } from "lucide-react";
import { useState } from "react";

const alumniData = [
  { id: 1, name: "Aminata Diallo", country: "Senegal", university: "University of Malaya", degree: "BSc Computer Science", year: 2024, type: "video" as const, quote: "Whiteboard Education changed my life. I went from not knowing where to start to graduating top of my class in Kuala Lumpur.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", currentRole: "Software Engineer at Grab" },
  { id: 2, name: "Ravi Patel", country: "India", university: "Taylor's University", degree: "BBA Hospitality", year: 2023, type: "written" as const, quote: "The support from application to graduation was incredible. Taylor's hospitality programme opened doors I never imagined. I now manage a 5-star hotel in KL.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", currentRole: "Hotel Manager at Mandarin Oriental" },
  { id: 3, name: "Sophie Muller", country: "Germany", university: "Monash University Malaysia", degree: "Bachelor of Medicine", year: 2024, type: "video" as const, quote: "Studying medicine at Monash Malaysia gave me world-class training at a fraction of the cost of European med schools.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", currentRole: "Junior Doctor at Melbourne Hospital" },
  { id: 4, name: "Omar Khalil", country: "Egypt", university: "UCSI University", degree: "BPharm Pharmacy", year: 2023, type: "written" as const, quote: "UCSI's pharmacy programme was rigorous but incredibly rewarding. The practical lab sessions prepared me well for my career.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop", currentRole: "Clinical Pharmacist at Cairo University Hospital" },
  { id: 5, name: "Priya Nair", country: "India", university: "University of Malaya", degree: "MBA", year: 2022, type: "written" as const, quote: "The MBA programme at UM connected me with industry leaders across Southeast Asia. Best investment I've ever made.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", currentRole: "Management Consultant at McKinsey" },
  { id: 6, name: "James Okonkwo", country: "Nigeria", university: "UTM", degree: "BEng Mechanical", year: 2024, type: "video" as const, quote: "UTM's engineering faculty is on par with top European universities. The campus in Johor is beautiful and the cost of living is very affordable.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", currentRole: "Mechanical Engineer at Petronas" },
];

export default function Alumni() {
  const [search, setSearch] = useState("");
  const filtered = alumniData.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.country.toLowerCase().includes(search.toLowerCase()) ||
    a.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">
        <section className="intro-surface py-16">
          <div className="container mx-auto px-4 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-[#ffa300]" />
            <h1 className="text-4xl font-extrabold mb-3">Alumni Success Network</h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Real stories from real graduates. See where a Whiteboard Education journey can take you.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Find alumni by country or university..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Masonry-style grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filtered.map((a) => (
              <Card key={a.id} className="break-inside-avoid hover:shadow-lg transition-shadow animate-fade-in">
                <CardContent className="p-6">
                  {a.type === "video" && (
                    <div className="h-40 rounded-md bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 cursor-pointer group">
                      <div className="h-14 w-14 rounded-full bg-[#ffa300]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-[#ffa300] ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={a.avatar} alt={a.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-sm">{a.name}</h3>
                      <p className="text-xs text-muted-foreground">{a.country} • Class of {a.year}</p>
                    </div>
                  </div>
                  <Quote className="h-5 w-5 text-secondary/40 mb-2" />
                  <p className="text-sm text-muted-foreground italic mb-4">"{a.quote}"</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">{a.university}</Badge>
                    <Badge variant="outline" className="text-xs">{a.degree}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-[#ffa300] mt-3">Now: {a.currentRole}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-16">No alumni found matching your search.</p>}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
