import { accommodations, universities } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin } from "lucide-react";

export function AccommodationsSection() {
  return (
    <section id="accommodations" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Student Accommodations</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Safe and affordable housing options near top universities
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accommodations.map((acc) => {
            const nearUnis = universities.filter((u) => acc.near_university_ids.includes(u.id));
            return (
              <Card key={acc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-11 w-11 rounded-md bg-[#ffa300]/10 flex items-center justify-center">
                      <Home className="h-5 w-5 text-[#ffa300]" />
                    </div>
                    <Badge variant="outline" className="text-xs">{acc.type}</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{acc.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5" />{acc.city}
                  </p>
                  <div className="text-2xl font-extrabold text-[#ffa300] mb-3">
                    RM {acc.price_per_month}<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Nearby Universities:</p>
                    <div className="flex flex-wrap gap-1">
                      {nearUnis.map((u) => (
                        <Badge key={u.id} variant="secondary" className="text-xs">{u.name}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
