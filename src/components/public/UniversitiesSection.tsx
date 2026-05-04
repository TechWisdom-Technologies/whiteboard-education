import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTableData } from "@/hooks/useSupabaseData";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function UniversitiesSection() {
  const { data: universities = [], isLoading } = useTableData("universities");

  if (isLoading) {
    return (
      <section id="universities" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Top Universities</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Explore our partnered universities worldwide
          </p>
          <LoadingScreen label="Loading universities" sublabel="Getting partner institutions" className="py-10" />
        </div>
      </section>
    );
  }

  return (
    <section id="universities" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Top Universities</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Explore our partnered universities worldwide
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.slice(0, 6).map((uni: any) => (
            <Link key={uni.id} to={`/universities/${uni.id}`}>
              <Card className="group overflow-hidden hover:border-[#ffa300] transition-all duration-300" style={{ borderRadius: "5px" }}>
                <div className="h-44 overflow-hidden">
                  <img src={uni.hero_image || uni.logo_url || "/placeholder.svg"} alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[#ffa300] transition-colors">{uni.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{uni.city}</span>
                    {uni.ranking && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />#{uni.ranking}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{uni.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/universities">
            <Button variant="outline" size="lg" className="gap-2">
              View All Universities <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
