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
import { accommodations as mockAccommodations } from "@/data/mockData";

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

const fallbackImages = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
];

export default function Housing() {
  const { data: accommodations = [], isLoading } = useTableData("accommodations");
  const { data: universities = [] } = useTableData("universities");
  const [typeFilter, setTypeFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState([2000]);
  const [selected, setSelected] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<string>("grid");

  const safeAccommodations = useMemo(() => {
    const raw = accommodations.length > 0 ? accommodations : mockAccommodations;
    return raw.map((a: any, index: number) => {
      const hasValidImage = typeof a.image_url === "string" && a.image_url.trim() !== "" && a.image_url !== "null";
      if (hasValidImage) return a;
      
      const mockMatch = mockAccommodations.find((m) => m.name === a.name || m.id === a.id);
      const mockHasValidImage = typeof mockMatch?.image_url === "string" && mockMatch.image_url.trim() !== "" && mockMatch.image_url !== "null";
      
      const fallbackUrl = fallbackImages[index % fallbackImages.length];
      return { ...a, image_url: mockHasValidImage ? mockMatch.image_url : fallbackUrl };
    });
  }, [accommodations]);

  const filtered = useMemo(() => safeAccommodations.filter((a: any) => {
    if (typeFilter !== "All" && a.type !== typeFilter) return false;
    if (propertyFilter !== "All" && a.property_type !== propertyFilter) return false;
    if (Number(a.price_per_month) > maxPrice[0]) return false;
    return true;
  }), [safeAccommodations, typeFilter, propertyFilter, maxPrice]);

  const parseJsonArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <MegaMenu />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center max-w-3xl">
          <div className="h-16 w-16 bg-[#ffa300]/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="h-8 w-8 text-[#ffa300]" />
          </div>
          <h1 className="text-3xl md:text-[40px] font-extrabold mb-4" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29", lineHeight: 1.2 }}>
            Student <span className="text-[#ffa300]">Housing</span>
          </h1>
          <p className="text-[#515768] text-base md:text-lg">
            Find the perfect place to stay near your university with our curated selection of premium student accommodations in Malaysia.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Top Filters Row */}
          <div className="bg-white p-5 border border-gray-200/60 rounded-md flex flex-col lg:flex-row items-stretch lg:items-center gap-6 shadow-sm mb-8">
            <div className="w-full lg:w-[240px]">
              <label className="text-xs font-bold text-[#181d29] uppercase tracking-wider mb-2 block" style={{ fontFamily: "Poppins, sans-serif" }}>Accommodation Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 text-[13px] border-gray-200/80 rounded-md bg-white hover:bg-gray-50/50 transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}><SelectValue /></SelectTrigger>
                <SelectContent>{accommodationTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
            <div className="w-full lg:w-[240px]">
              <label className="text-xs font-bold text-[#181d29] uppercase tracking-wider mb-2 block" style={{ fontFamily: "Poppins, sans-serif" }}>Property Type</label>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-10 text-[13px] border-gray-200/80 rounded-md bg-white hover:bg-gray-50/50 transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}><SelectValue /></SelectTrigger>
                <SelectContent>{propertyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#181d29] uppercase tracking-wider block" style={{ fontFamily: "Poppins, sans-serif" }}>Max Price</label>
                <span className="text-xs font-bold text-[#ffa300]" style={{ fontFamily: "Poppins, sans-serif" }}>RM {maxPrice[0].toLocaleString()}/mo</span>
              </div>
              <div className="py-2">
                <Slider min={200} max={3000} step={50} value={maxPrice} onValueChange={setMaxPrice} />
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center lg:pl-6 border-t lg:border-t-0 lg:border-l border-gray-200/60 pt-4 lg:pt-0 gap-2">
              <div className="text-left lg:text-right">
                <div className="text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Showing <span className="font-bold text-[#181d29]">{filtered.length}</span> of <span className="font-semibold">{safeAccommodations.length}</span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-none mt-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>properties available</div>
              </div>
            </div>
          </div>

          {/* View Mode & Listings */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full sm:w-auto">
                <TabsList className="grid w-full sm:w-[200px] grid-cols-2">
                  <TabsTrigger value="grid" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Grid</TabsTrigger>
                  <TabsTrigger value="map" className="gap-1.5"><Map className="h-3.5 w-3.5" /> Map</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map((a: any) => {
                  const amenities = parseJsonArray(a.amenities);
                  const roomTypes = parseJsonArray(a.room_types);
                  return (
                    <Card key={a.id} className="group shadow-sm border-gray-200/60 rounded-md hover:shadow-lg transition-all cursor-pointer overflow-hidden" onClick={() => setSelected(a)}>
                      {/* Image */}
                      <div className="h-40 overflow-hidden bg-gray-100">
                        <img
                          src={a.image_url || fallbackImages[0]}
                          alt={a.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.retried) {
                              target.dataset.retried = "1";
                              target.src = fallbackImages[Math.abs(a.name.length) % fallbackImages.length];
                            }
                          }}
                        />
                      </div>
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
                              <span key={i} className="text-[10px] text-muted-foreground bg-muted/60 rounded-sm px-1.5 py-0.5">{am}</span>
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
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.name}</DialogTitle>
              </DialogHeader>

              <div className="rounded-sm overflow-hidden h-56 bg-gray-100">
                <img
                  src={selected.image_url || fallbackImages[0]}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.retried) {
                      target.dataset.retried = "1";
                      target.src = fallbackImages[Math.abs(selected.name.length) % fallbackImages.length];
                    }
                  }}
                />
              </div>

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
                  <div className="flex items-center gap-2 p-3 rounded-sm bg-[#ffa300]/10 border border-[#ffa300]/20">
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
