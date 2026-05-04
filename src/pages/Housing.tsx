import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Home, MapPin, Wifi, Dumbbell, ShieldCheck, Car, BedDouble, Building2, Clock, Phone, Mail, ChevronRight, LayoutGrid, Map } from "lucide-react";
import { useState, useMemo, lazy, Suspense } from "react";
import { AccommodationMap } from "@/components/public/AccommodationMap";

const accommodationTypes = ["All", "Apartment", "Hostel", "Condominium", "Studio", "Shared House", "Dormitory"];
const propertyTypes = ["All", "Residential", "Commercial", "Mixed-Use", "Student Housing"];

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi, gym: Dumbbell, security: ShieldCheck, parking: Car,
};

function getAmenityIcon(amenity: string) {
  const key = amenity.toLowerCase();
  for (const [k, Icon] of Object.entries(amenityIcons)) {
    if (key.includes(k)) return Icon;
  }
  return null;
}

export default function Housing() {
  const { data: accommodations = [], isLoading } = useTableData("accommodations");
  const { data: universities = [] } = useTableData("universities");
  const [typeFilter, setTypeFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState([2000]);
  const [selected, setSelected] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<string>("grid");

  const filtered = useMemo(() => accommodations.filter((a: any) => {
    if (typeFilter !== "All" && a.type !== typeFilter) return false;
    if (propertyFilter !== "All" && a.property_type !== propertyFilter) return false;
    if (Number(a.price_per_month) > maxPrice[0]) return false;
    return true;
  }), [accommodations, typeFilter, propertyFilter, maxPrice]);

  const parseJsonArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">
        {/* Hero */}
        <section className="intro-surface py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">Accommodations</Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Student Housing in Malaysia</h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Find the perfect place to stay near your university.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <aside className="lg:w-1/4 shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-5 space-y-6">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Accommodation Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{accommodationTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Property Type</label>
                    <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{propertyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Max Price: RM {maxPrice[0].toLocaleString()}/mo</label>
                    <Slider min={200} max={3000} step={50} value={maxPrice} onValueChange={setMaxPrice} />
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Showing {filtered.length} of {accommodations.length} properties
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Listings / Map */}
            <div className="flex-1">
              <Tabs value={viewMode} onValueChange={setViewMode} className="mb-4">
                <TabsList className="grid w-full sm:w-[200px] grid-cols-2">
                  <TabsTrigger value="grid" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Grid</TabsTrigger>
                  <TabsTrigger value="map" className="gap-1.5"><Map className="h-3.5 w-3.5" /> Map</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <LoadingScreen label="Loading accommodations" sublabel="Finding available housing" className="py-12" />
              ) : viewMode === "map" ? (
                <AccommodationMap
                  accommodations={filtered as any}
                  universities={universities as any}
                  onSelect={setSelected}
                />
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No accommodations found matching your filters.</div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((a: any) => {
                    const amenities = parseJsonArray(a.amenities);
                    const roomTypes = parseJsonArray(a.room_types);
                    return (
                      <Card key={a.id} className="group hover:shadow-lg transition-all cursor-pointer border-border/60" onClick={() => setSelected(a)}>
                        {/* Image placeholder */}
                        {a.image_url ? (
                          <div className="h-40 overflow-hidden rounded-t-xl">
                            <img src={a.image_url} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className="h-32 bg-gradient-to-br from-muted to-muted/50 rounded-t-xl flex items-center justify-center">
                            <Building2 className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{a.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" /> {a.city}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-[11px]">{a.type}</Badge>
                            <Badge variant="secondary" className="text-[11px]">{a.property_type}</Badge>
                          </div>

                          {a.travel_distance && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 text-[#ffa300]" /> {a.travel_distance} from nearest university
                            </div>
                          )}

                          {roomTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {roomTypes.slice(0, 3).map((r: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[10px] bg-muted/50 border-border/50">
                                  <BedDouble className="h-2.5 w-2.5 mr-1" />{r}
                                </Badge>
                              ))}
                              {roomTypes.length > 3 && <Badge variant="outline" className="text-[10px]">+{roomTypes.length - 3}</Badge>}
                            </div>
                          )}

                          {amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {amenities.slice(0, 4).map((am: string, i: number) => (
                                <span key={i} className="text-[10px] text-muted-foreground bg-muted/60 rounded-md px-1.5 py-0.5">{am}</span>
                              ))}
                              {amenities.length > 4 && <span className="text-[10px] text-muted-foreground">+{amenities.length - 4}</span>}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="font-extrabold text-[#ffa300] text-base">RM {Number(a.price_per_month).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                              Details <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.name}</DialogTitle>
              </DialogHeader>

              {selected.image_url && (
                <div className="rounded-md overflow-hidden h-56">
                  <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-5 mt-2">
                {/* Location & Price */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" /> {selected.city}</Badge>
                  <Badge variant="outline">{selected.type}</Badge>
                  <Badge variant="secondary">{selected.property_type}</Badge>
                  <span className="ml-auto font-extrabold text-lg text-[#ffa300]">RM {Number(selected.price_per_month).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                </div>

                {selected.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                )}

                {/* Travel Distance */}
                {selected.travel_distance && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-[#ffa300]/10 border border-[#ffa300]/20">
                    <Clock className="h-4 w-4 text-[#ffa300]" />
                    <span className="text-sm font-medium">{selected.travel_distance}</span>
                    <span className="text-xs text-muted-foreground">from nearest university</span>
                  </div>
                )}

                {/* Unit Types */}
                {parseJsonArray(selected.unit_types).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Unit Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseJsonArray(selected.unit_types).map((u: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-muted/50">{u}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Types */}
                {parseJsonArray(selected.room_types).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Available Room Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseJsonArray(selected.room_types).map((r: string, i: number) => (
                        <Badge key={i} variant="outline" className="gap-1 bg-muted/50"><BedDouble className="h-3 w-3" /> {r}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {parseJsonArray(selected.amenities).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseJsonArray(selected.amenities).map((am: string, i: number) => {
                        const Icon = getAmenityIcon(am);
                        return (
                          <Badge key={i} variant="secondary" className="gap-1.5">
                            {Icon && <Icon className="h-3 w-3" />} {am}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {(selected.contact_phone || selected.contact_email) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Contact</h4>
                    <div className="flex flex-wrap gap-4">
                      {selected.contact_phone && (
                        <a href={`tel:${selected.contact_phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone className="h-4 w-4" /> {selected.contact_phone}
                        </a>
                      )}
                      {selected.contact_email && (
                        <a href={`mailto:${selected.contact_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Mail className="h-4 w-4" /> {selected.contact_email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
