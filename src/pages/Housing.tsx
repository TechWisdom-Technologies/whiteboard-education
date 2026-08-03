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
import { Home, MapPin, Wifi, Dumbbell, ShieldCheck, Car, Bus, BedDouble, Building2, Clock, Footprints, Phone, Mail, ChevronRight, ChevronLeft, LayoutGrid, Map, Maximize, Layers } from "lucide-react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { accommodations as mockAccommodations } from "@/data/mockData";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";
import { useCurrency } from "@/contexts/CurrencyContext";

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

const parseJsonArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
};

export default function Housing() {
  const { formatCurrency } = useCurrency();
  const { data: accommodations = [], isLoading } = useTableData("accommodations");
  const { data: universities = [] } = useTableData("universities");
  
  const [draftType, setDraftType] = useState("All");
  const [draftProperty, setDraftProperty] = useState("All");
  const [draftPrice, setDraftPrice] = useState([3000]);
  const [draftUniversity, setDraftUniversity] = useState("All");

  const [appliedType, setAppliedType] = useState("All");
  const [appliedProperty, setAppliedProperty] = useState("All");
  const [appliedPrice, setAppliedPrice] = useState([3000]);
  const [appliedUniversity, setAppliedUniversity] = useState("All");

  const [selected, setSelected] = useState<any | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedType, appliedProperty, appliedPrice, appliedUniversity]);

  useEffect(() => {
    if (selected) {
      setActiveImage(selected.image_url);
    } else {
      setActiveImage(null);
    }
  }, [selected]);

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
    if (appliedType !== "All" && a.type !== appliedType) return false;
    if (appliedProperty !== "All" && a.property_type !== appliedProperty) return false;
    if (Number(a.price_per_month) > appliedPrice[0]) return false;
    
    if (appliedUniversity !== "All") {
      const nearIds = parseJsonArray(a.near_university_ids).map((id: any) => id.toString());
      if (a.distance_to_university_id?.toString() !== appliedUniversity && !nearIds.includes(appliedUniversity)) {
        return false;
      }
    }
    
    return true;
  }), [safeAccommodations, appliedType, appliedProperty, appliedPrice, appliedUniversity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu hideBreadcrumbs />
      
      {/* Page Header */}
      <div className="relative overflow-hidden bg-[#1E293B]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80" 
            alt="Premium Student Accommodation" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#1E293B]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="relative z-20">
          <GlobalBreadcrumbs theme="transparent" />
        </div>
        
        <div className="relative z-10 w-full mx-auto px-4 py-12 md:py-24 max-w-5xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-4 md:mb-5 backdrop-blur-md">
              <Home className="w-3 md:w-3.5 h-3 md:h-3.5" />
              Student Accommodation
            </div>
            <h1 className="text-2xl md:text-[42px] font-extrabold text-white tracking-tight mb-3 md:mb-4 leading-[1.2] md:leading-[1.1]">
              Find Your Perfect Home <br className="hidden md:block"/> Away From Home
            </h1>
            <p className="text-gray-200/90 text-xs md:text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
              Discover the perfect place to stay near your university with our curated selection of premium, safe, and comfortable student accommodations across Malaysia.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Top Filters Row */}
          <div className="bg-white p-4 md:p-5 border border-gray-200/60 rounded-2xl flex flex-col shadow-sm mb-6 md:mb-8">
            
            {/* Header (Count + Mobile Toggle) */}
            <div className="flex justify-between items-center order-1 md:order-2 md:mt-4">
              <div className="text-xs md:text-sm text-muted-foreground">
                <span className="font-bold text-[#1E293B]">{filtered.length}</span> of <span className="font-semibold">{safeAccommodations.length}</span> properties available
              </div>
              
              <button 
                className="md:hidden flex items-center gap-2 text-[#2F4F97] font-semibold text-xs px-3 py-1.5 bg-[#2F4F97]/10 rounded-lg"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <Layers className="h-3.5 w-3.5" />
                {isMobileFilterOpen ? 'Hide Filters' : 'Filters'}
              </button>

              {/* Desktop Buttons */}
              <div className="hidden md:flex shrink-0 items-center gap-3">
                <Button 
                  variant="outline" 
                  className="h-10 text-[#64748B] hover:text-[#1E293B] rounded-xl"
                  onClick={() => {
                    setDraftUniversity("All");
                    setDraftType("All");
                    setDraftProperty("All");
                    setDraftPrice([3000]);
                    setAppliedUniversity("All");
                    setAppliedType("All");
                    setAppliedProperty("All");
                    setAppliedPrice([3000]);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  className="h-10 rounded-xl shadow-sm px-6"
                  onClick={() => {
                    setAppliedUniversity(draftUniversity);
                    setAppliedType(draftType);
                    setAppliedProperty(draftProperty);
                    setAppliedPrice(draftPrice);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Inputs */}
            <div className={`${isMobileFilterOpen ? 'flex mt-4' : 'hidden'} md:flex flex-col lg:flex-row items-stretch lg:items-center gap-6 order-2 md:order-1`}>
              
              <div className="w-full lg:w-[200px]">
                <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 block">University</label>
                <Select value={draftUniversity} onValueChange={setDraftUniversity}>
                  <SelectTrigger className="h-10 text-[13px] border-gray-200/80 rounded-2xl bg-white hover:bg-gray-50/50 transition-colors"><SelectValue placeholder="All Universities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Universities</SelectItem>
                    {universities.map((u: any) => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-[180px]">
                <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 block">Accommodation Type</label>
                <Select value={draftType} onValueChange={setDraftType}>
                  <SelectTrigger className="h-10 text-[13px] border-gray-200/80 rounded-2xl bg-white hover:bg-gray-50/50 transition-colors"><SelectValue /></SelectTrigger>
                  <SelectContent>{accommodationTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              
              <div className="w-full lg:w-[180px]">
                <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2 block">Property Type</label>
                <Select value={draftProperty} onValueChange={setDraftProperty}>
                  <SelectTrigger className="h-10 text-[13px] border-gray-200/80 rounded-2xl bg-white hover:bg-gray-50/50 transition-colors"><SelectValue /></SelectTrigger>
                  <SelectContent>{propertyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px] flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block">Max Price</label>
                  <span className="text-xs font-bold text-[#2F4F97]">RM {draftPrice[0].toLocaleString()}/mo</span>
                </div>
                <div className="py-2">
                  <Slider min={200} max={3000} step={50} value={draftPrice} onValueChange={setDraftPrice} />
                </div>
              </div>
            </div>

            {/* Mobile Buttons */}
            {isMobileFilterOpen && (
              <div className="flex md:hidden shrink-0 items-center gap-3 w-full mt-4 order-3">
                <Button 
                  variant="outline" 
                  className="h-10 flex-1 text-[#64748B] hover:text-[#1E293B] rounded-xl"
                  onClick={() => {
                    setDraftUniversity("All");
                    setDraftType("All");
                    setDraftProperty("All");
                    setDraftPrice([3000]);
                    setAppliedUniversity("All");
                    setAppliedType("All");
                    setAppliedProperty("All");
                    setAppliedPrice([3000]);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  className="h-10 flex-1 rounded-xl shadow-sm"
                  onClick={() => {
                    setAppliedUniversity(draftUniversity);
                    setAppliedType(draftType);
                    setAppliedProperty(draftProperty);
                    setAppliedPrice(draftPrice);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            )}
          </div>

          {/* Listings */}
          <div className="space-y-6">
            {isLoading ? (
              <LoadingScreen label="Loading accommodations" sublabel="Finding available housing" className="py-12" />
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No accommodations found matching your filters.</div>
            ) : (
              <>
                <div className="flex flex-col gap-6">
                  {paged.map((a: any) => {
                    const amenities = parseJsonArray(a.amenities);
                    const unitTypes = parseJsonArray(a.unit_types || a.room_types);
                    const roomRents = parseJsonArray(a.room_rents);
                    const availableRoomTypes = parseJsonArray(a.available_room_types);

                    return (
                      <Card key={a.id} className="group bg-white rounded-[16px] border-none shadow-none mb-10 overflow-hidden">
                        {/* Top Section (Image + Details) */}
                        <div className="flex flex-col md:flex-row gap-6 items-stretch md:h-[320px]">
                          
                          {/* Left: Image (40%) */}
                          <div className="w-full md:w-[40%] h-[240px] md:h-full shrink-0 relative rounded-l-[16px] overflow-hidden bg-gray-100 group/slider">
                            <div 
                              id={`slider-${a.id}`}
                              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory"
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                              {(() => {
                                const imgs = parseJsonArray(a.image_urls);
                                const images = imgs.length > 0 ? imgs : [a.image_url || fallbackImages[0]];
                                return images.map((img: string, i: number) => (
                                  <div key={i} className="w-full h-full shrink-0 snap-center relative">
                                    <img
                                      src={img}
                                      alt={`${a.name} - image ${i + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        if (!target.dataset.retried) {
                                          target.dataset.retried = "1";
                                          target.src = fallbackImages[Math.abs(a.name.length) % fallbackImages.length];
                                        }
                                      }}
                                    />
                                  </div>
                                ));
                              })()}
                            </div>

                            {parseJsonArray(a.image_urls).length > 1 && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    document.getElementById(`slider-${a.id}`)?.scrollBy({ left: -320, behavior: 'smooth' });
                                  }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1E293B] flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    document.getElementById(`slider-${a.id}`)?.scrollBy({ left: 320, behavior: 'smooth' });
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1E293B] flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Right: Details (60%) */}
                          <div className="w-full md:w-[60%] flex flex-col justify-between py-1">
                            
                            {/* Block 1: Tags, Title, Address */}
                            <div className="pb-3 border-b border-gray-200">
                              {/* Tags */}
                              <div className="flex gap-2 mb-2">
                                {a.tag && <span className="bg-[#2F4F97]/10 text-[#2F4F97] font-normal rounded-sm text-[10px] md:text-xs px-2 py-1 leading-none">{a.tag}</span>}
                                {a.city && <span className="bg-[#2F4F97]/10 text-[#2F4F97] font-normal rounded-sm text-[10px] md:text-xs px-2 py-1 leading-none">{a.city}</span>}
                              </div>

                              <h3 className="text-[16px] md:text-[20px] font-semibold text-[#1E293B] group-hover:text-[#2F4F97] transition-colors leading-tight mb-1 line-clamp-1">
                                {a.name}
                              </h3>

                              {/* Address */}
                              <p className="text-xs md:text-sm font-normal text-[#64748B] flex items-start gap-1 line-clamp-1">
                                {a.address || a.city}, Selangor, Malaysia
                              </p>
                            </div>

                            {/* Block 2: Property Type & Unit Types */}
                            <div className="py-3 border-b border-gray-200">
                              <div className="grid grid-cols-2 gap-0">
                                <div className="flex flex-col gap-1 pr-4">
                                  <p className="text-[12px] md:text-sm font-medium text-[#475569]">Property Type</p>
                                  <p className="text-[12px] md:text-sm font-normal text-[#64748B] line-clamp-1">{a.property_type || a.type}</p>
                                </div>
                                <div className="flex flex-col gap-1 pr-4">
                                  <p className="text-[12px] md:text-sm font-medium text-[#475569]">Unit Types</p>
                                  <p className="text-[12px] md:text-sm font-normal text-[#64748B] line-clamp-1">{unitTypes.length > 0 ? unitTypes.join(", ") : "Various"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Block 3: Travel Distance / Time */}
                            <div className="py-3 border-b border-gray-200">
                              <p className="text-[12px] md:text-sm font-medium text-[#475569] mb-2">Travel Distance / Time</p>
                              {(() => {
                                let tdt = a.travel_distance_time;
                                if (typeof tdt === 'string') {
                                  try { tdt = JSON.parse(tdt); } catch { tdt = null; }
                                }
                                return tdt && typeof tdt === 'object' && Object.keys(tdt).length > 0 ? (
                                  <div className="flex items-center gap-6">
                                    {tdt.walking && (
                                      <span className="flex items-center gap-2 text-[12px] md:text-sm font-normal text-[#64748B]">
                                        <Footprints className="h-4 w-4" /> {tdt.walking}
                                      </span>
                                    )}
                                    {tdt.car && (
                                      <span className="flex items-center gap-2 text-[12px] md:text-sm font-normal text-[#64748B]">
                                        <Car className="h-4 w-4" /> {tdt.car}
                                      </span>
                                    )}
                                    {tdt.bus && (
                                      <span className="flex items-center gap-2 text-[12px] md:text-sm font-normal text-[#64748B]">
                                        <Bus className="h-4 w-4" /> {tdt.bus}
                                      </span>
                                    )}
                                  </div>
                                ) : a.travel_distance && (
                                  <div className="flex items-center gap-2 text-[12px] md:text-sm font-normal text-[#64748B]">
                                    <Clock className="h-4 w-4" /> {a.travel_distance}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Block 4: Amenities */}
                            <div className="pt-3">
                              <p className="text-[12px] md:text-[14px] font-medium text-[#1E293B] mb-2">Amenities</p>
                              <div className="flex flex-wrap gap-6 overflow-hidden max-h-6">
                                {amenities.map((amenity: string, idx: number) => {
                                  const Icon = getAmenityIcon(amenity.toLowerCase());
                                  return (
                                    <span key={idx} className="flex items-center gap-2 text-[12px] md:text-sm font-normal text-[#64748B] whitespace-nowrap">
                                      {Icon ? <Icon className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                      {amenity}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Bottom Section (Available Room Types) - Spans Full Width */}
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[12px] md:text-[14px] font-medium text-[#1E293B]">Available Room Types</p>
                            {roomRents.length > 0 && (
                              <p className="text-[12px] md:text-sm font-bold text-[#1E293B]">1/{Math.max(1, Math.ceil(roomRents.length/4))}</p>
                            )}
                          </div>
                          
                          <div className="border border-gray-200 rounded-xl p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-y-0 md:divide-x divide-gray-200">
                              {roomRents.length > 0 ? roomRents.slice(0, 4).map((rent: any, idx: number) => (
                                <div key={idx} className="flex flex-col justify-center text-left bg-white md:px-4 md:first:pl-0 md:last:pr-0">
                                  <p className="text-[12px] md:text-sm font-medium text-[#475569] mb-2 line-clamp-1">{rent.room_type}</p>
                                  <div className="flex items-center gap-2 text-[#64748B] text-[12px] md:text-sm font-normal">
                                    <div className="bg-[#2F4F97]/10 p-1 rounded">
                                      <Home className="h-3.5 w-3.5 text-[#2F4F97]" />
                                    </div>
                                    <span>Around {(() => {
                                      const match = rent.rent.match(/[\d,.]+/);
                                      if (match) {
                                        const num = parseFloat(match[0].replace(/,/g, ''));
                                        const formatted = formatCurrency(num);
                                        return rent.rent.replace(match[0], formatted).replace(/MYR|RM/gi, '').trim();
                                      }
                                      return rent.rent;
                                    })()}</span>
                                  </div>
                                </div>
                              )) : availableRoomTypes.length > 0 ? availableRoomTypes.slice(0, 4).map((room: string, idx: number) => (
                                <div key={idx} className="flex flex-col justify-center text-left bg-white md:px-4 md:first:pl-0 md:last:pr-0">
                                  <p className="text-[12px] md:text-sm font-medium text-[#475569] mb-2 line-clamp-1">{room}</p>
                                  <div className="flex items-center gap-2 text-[#64748B] text-[12px] md:text-sm font-normal">
                                    <div className="bg-[#2F4F97]/10 p-1 rounded">
                                      <Home className="h-3.5 w-3.5 text-[#2F4F97]" />
                                    </div>
                                    <span>Around {formatCurrency(Number(a.price_per_month))}</span>
                                  </div>
                                </div>
                              )) : (
                                <div className="col-span-2 md:col-span-4 flex items-center justify-center text-[12px] md:text-sm text-[#64748B] bg-white">
                                  Contact for availability and pricing
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </Card>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 mb-4">
                    <Button 
                      variant="outline" 
                      className="h-10 text-[#64748B] hover:text-[#1E293B] rounded-xl"
                      disabled={currentPage === 1} 
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        if (
                          i === 0 || 
                          i === totalPages - 1 || 
                          (i >= currentPage - 2 && i <= currentPage)
                        ) {
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setCurrentPage(i + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl border transition-colors ${
                                currentPage === i + 1 
                                  ? "bg-[#2F4F97] border-[#2F4F97] text-white" 
                                  : "bg-white border-gray-200 text-[#64748B] hover:bg-gray-50"
                              }`}
                             
                            >
                              {i + 1}
                            </button>
                          );
                        } else if (
                          i === 1 && currentPage > 3 ||
                          i === totalPages - 2 && currentPage < totalPages - 2
                        ) {
                          return <span key={i} className="text-[#64748B]">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <Button 
                      variant="outline" 
                      className="h-10 text-[#64748B] hover:text-[#1E293B] rounded-xl"
                      disabled={currentPage === totalPages} 
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
