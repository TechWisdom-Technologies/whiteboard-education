import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
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

export default function LanguageCentersPage() {
  const { data: languageCenters = [], isLoading } = useTableData("language_centers");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(
    () => [...new Set(languageCenters.map((lc: any) => lc.city).filter(Boolean))].sort(),
    [languageCenters]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCity]);

  const filtered = useMemo(() => {
    return languageCenters.filter((lc: any) => {
      if (
        search &&
        !lc.name.toLowerCase().includes(search.toLowerCase()) &&
        !lc.more_info?.some((c: any) => c.title.toLowerCase().includes(search.toLowerCase())) &&
        !lc.about_text?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (selectedCity !== "all" && lc.city !== selectedCity) return false;
      return true;
    });
  }, [languageCenters, search, selectedCity]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          Total centers: <span style={{ color: "#ffa300" }}>{filtered.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading language centers" sublabel="Gathering available schools" className="py-12" />
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
                    placeholder="Search by center name, course or keyword..."
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

                {/* Location Selector */}
                <div className="w-full lg:w-[250px]">
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
                  // Find starting fee (first tier from tuition_fees table)
                  const startingFee = lc.tuition_fees && Array.isArray(lc.tuition_fees) && lc.tuition_fees.length > 0
                    ? lc.tuition_fees[0].tuition_fee
                    : "N/A";

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
                        className="shrink-0 w-[200px] h-[120px] bg-white rounded-sm flex items-center justify-center overflow-hidden border border-gray-100 p-2"
                      >
                        {lc.logo_url ? (
                          <img
                            src={lc.logo_url}
                            alt={lc.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "";
                              (e.target as HTMLImageElement).className = "hidden";
                            }}
                          />
                        ) : (
                          <Languages className="h-12 w-12 text-[#ffa300]" />
                        )}
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

                        {/* About text summary */}
                        {lc.about_text && (
                          <p className="text-gray-500 text-[13.5px] line-clamp-2 mt-2 leading-relaxed">
                            {lc.about_text}
                          </p>
                        )}

                        {/* Courses list tags */}
                        {lc.more_info && Array.isArray(lc.more_info) && lc.more_info.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                            {lc.more_info.slice(0, 3).map((c: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11.5px] font-medium rounded-sm"
                              >
                                {c.title}
                              </span>
                            ))}
                            {lc.more_info.length > 3 && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[11.5px] font-medium rounded-sm">
                                +{lc.more_info.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[13px] text-gray-500 mt-3">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-[#ffa300]" />
                            <span className="text-gray-500">Starting from:</span>
                            <span className="font-semibold text-[#181d29]">
                              {startingFee}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{lc.city || "Malaysia"}, Malaysia</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
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
                          onClick={() => navigate(`/apply?centerId=${lc.id}`)}
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
      
    </div>
  );
}
