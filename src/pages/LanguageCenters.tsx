import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Languages,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 10;
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export default function LanguageCentersPage() {
  const { data: languageCenters = [], isLoading } = useTableData("language_centers");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All Levels");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadUni, setLeadUni] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(
    () => [...new Set(languageCenters.map((lc: any) => lc.city).filter(Boolean))].sort(),
    [languageCenters]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, level, selectedCity]);

  const filtered = useMemo(() => {
    return languageCenters.filter((lc: any) => {
      if (
        search &&
        !lc.name.toLowerCase().includes(search.toLowerCase()) &&
        !(lc.institute || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (level !== "All Levels" && lc.level !== level) return false;
      if (selectedCity !== "all" && lc.city !== selectedCity) return false;
      return true;
    });
  }, [languageCenters, search, level, selectedCity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApply = (centerName: string) => {
    setLeadUni(centerName);
    setLeadOpen(true);
  };

  // Generate page numbers for pagination with sliding window matching Universities2 / Courses2
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const startPage = Math.floor((currentPage - 1) / 9) * 9 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 2) {
      pages.push("ellipsis");
      pages.push(totalPages - 1);
      pages.push(totalPages);
    } else if (endPage < totalPages) {
      for (let i = endPage + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f7f8fa" }}>
      <MegaMenu />

      {/* Page Header */}
      <div className="container mx-auto px-4 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}>
          Language Centers
        </h1>
        <div className="text-[15px] font-bold" style={{ color: "#515768", fontFamily: "Poppins, sans-serif" }}>
          Total programs: <span style={{ color: "#ffa300" }}>{filtered.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading programs" sublabel="Gathering available classes" className="py-12" />
        ) : (
          <div className="flex flex-col">
            {/* Top Filters Row Wrapper - Sticky, matching Universities2 / Courses2 */}
            <div
              className="sticky top-[112px] z-30 pb-4 -mt-1"
              style={{
                backgroundColor: "#f7f8fa",
                paddingTop: "16px",
                marginTop: "-1px",
                boxShadow: "0 -20px 0 0 #f7f8fa",
              }}
            >
              <div
                className="bg-white p-4 border flex flex-col lg:flex-row items-center gap-4 shadow-sm"
                style={{ borderColor: "#e8e8e8", borderRadius: "5px" }}
              >
                {/* Search Field */}
                <div className="relative flex-1 w-full">
                  <Input
                    placeholder="Search by center or course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10 h-11 text-[12.5px]"
                    style={{
                      borderColor: "#cacdd4",
                      borderRadius: "5px",
                      fontFamily: "Poppins, sans-serif",
                      color: "#444444",
                    }}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#999999" }} />
                </div>

                {/* Level Selector */}
                <div className="w-full lg:w-[200px]">
                  <Select value={level} onValueChange={setLevel} modal={false}>
                    <SelectTrigger
                      className="h-11 text-[12.5px]"
                      style={{
                        borderColor: "#cacdd4",
                        borderRadius: "5px",
                        fontFamily: "Poppins, sans-serif",
                        color: level === "All Levels" ? "#999999" : "#444444",
                      }}
                    >
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Selector */}
                <div className="w-full lg:w-[200px]">
                  <Select value={selectedCity} onValueChange={setSelectedCity} modal={false}>
                    <SelectTrigger
                      className="h-11 text-[12.5px]"
                      style={{
                        borderColor: "#cacdd4",
                        borderRadius: "5px",
                        fontFamily: "Poppins, sans-serif",
                        color: selectedCity === "all" ? "#999999" : "#444444",
                      }}
                    >
                      <SelectValue placeholder="Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {cities.map((city: string) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters Trigger */}
                <button
                  onClick={() => {
                    setSearch("");
                    setLevel("All Levels");
                    setSelectedCity("all");
                  }}
                  className="p-2 text-[#999999] hover:text-[#181d29] transition-colors shrink-0"
                  title="Reset Filters"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Programs List */}
            {paged.length === 0 ? (
              <div
                className="text-center py-20"
                style={{ color: "#999999", fontFamily: "Poppins, sans-serif" }}
              >
                <Languages className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-semibold text-lg mb-1" style={{ color: "#515768" }}>
                  No programs found
                </p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-5 mt-4">
                {paged.map((lc: any) => {
                  return (
                    <div
                      key={lc.id}
                      className="bg-white py-10 md:py-12 px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center gap-6 border animate-fade-in"
                      style={{
                        borderColor: "#e8e8e8",
                        borderRadius: "5px",
                      }}
                    >
                      {/* Elegant Icon Representation or Image */}
                      <Link
                        to={`/language-centers/${lc.id}`}
                        className="shrink-0 w-[200px] h-[120px] bg-[#ffa300]/10 rounded-sm flex items-center justify-center overflow-hidden border border-[#ffa300]/15"
                      >
                        <Languages className="h-12 w-12 text-[#ffa300]" />
                      </Link>

                      {/* Info block */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/language-centers/${lc.id}`}>
                          <h3
                            className="font-semibold hover:underline"
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "20px",
                              color: "#181d29",
                            }}
                          >
                            {lc.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 mt-4 mb-4">
                          <GraduationCap className="h-4 w-4 text-[#ffa300]" />
                          <span className="text-[15px] font-medium text-gray-600">
                            {lc.institute || "Language Center"}
                          </span>
                        </div>

                        {/* Metadata Row - minimal style exactly like Courses2 */}
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[13px] text-gray-500 mb-4">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-[#ffa300]" />
                            <span className="font-semibold text-[#181d29]">
                              MYR {Number(lc.tuition_fee).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{lc.city || "Malaysia"}, Malaysia</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{lc.duration || "N/A"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-sm text-[11px] font-bold uppercase tracking-wider">
                            <Languages className="h-3 w-3" />
                            {lc.level || "General"} Level
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons styled like Courses2 */}
                      <div className="flex flex-col gap-3 shrink-0 w-full md:w-[180px]">
                        <Button
                          className="h-11 px-8 font-bold text-base w-full"
                          style={{
                            backgroundColor: "#ffa300",
                            color: "#181d29",
                            borderRadius: "5px",
                            fontFamily: "Poppins, sans-serif",
                            border: "1px solid #ffa300",
                          }}
                          onClick={() => handleApply(lc.name)}
                        >
                          Apply Now
                        </Button>
                        <Link to={`/language-centers/${lc.id}`} className="block w-full">
                          <Button
                            variant="outline"
                            className="h-11 px-8 font-bold text-base w-full"
                            style={{
                              borderColor: "#9273b6",
                              color: "#9273b6",
                              borderRadius: "5px",
                              fontFamily: "Poppins, sans-serif",
                              backgroundColor: "transparent",
                            }}
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination styled like Universities2 / Courses2 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-1.5 mt-10 mb-4">
                {/* Previous */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                  className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                  style={{
                    borderColor: "#cacdd4",
                    borderRadius: "4px",
                    color: "#515768",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, i) =>
                  page === "ellipsis" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="h-9 w-9 flex items-center justify-center text-sm"
                      style={{ color: "#999999" }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className="h-9 w-9 flex items-center justify-center border text-sm font-bold transition-colors"
                      style={{
                        borderRadius: "4px",
                        fontFamily: "Poppins, sans-serif",
                        backgroundColor: currentPage === page ? "#ffa300" : "#ffffff",
                        color: currentPage === page ? "#181d29" : "#515768",
                        borderColor: currentPage === page ? "#ffa300" : "#cacdd4",
                      }}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                  className="h-9 w-9 flex items-center justify-center border transition-colors disabled:opacity-30"
                  style={{
                    borderColor: "#cacdd4",
                    borderRadius: "4px",
                    color: "#515768",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <PublicFooter />
      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultUniversity={leadUni}
        source="language_center_listing"
      />
    </div>
  );
}
