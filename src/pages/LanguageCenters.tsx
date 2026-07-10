import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { generateSlug } from "@/lib/utils";
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
  Filter,
  ChevronDown,
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
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(
    () => [...new Set(languageCenters.map((lc: any) => lc.city).filter(Boolean))].sort(),
    [languageCenters]
  );

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    selectedCity: "all"
  });

  const applyFilters = () => {
    setAppliedFilters({ search, selectedCity });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCity("all");
    setAppliedFilters({ search: "", selectedCity: "all" });
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const filtered = useMemo(() => {
    const { search, selectedCity } = appliedFilters;
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
  }, [languageCenters, appliedFilters]);

  const [sortBy, setSortBy] = useState("best_match");

  const sorted = useMemo(() => {
    let result = [...filtered];
    if (sortBy === "name_a_z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_z_a") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-10 pb-16 flex-1 w-full" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading language centers" sublabel="Gathering available schools" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ─── SIDEBAR ─── */}
            <aside className="lg:w-[300px] xl:w-[320px] shrink-0">
              <div className="overflow-hidden lg:sticky lg:top-[152px] border bg-white" style={{ borderColor: "#e8e8e8", borderRadius: "5px" }}>
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between p-4 lg:hidden text-[#181d29] font-semibold border-b" style={{ borderColor: "#e8e8e8" }}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Centers
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Sidebar Header */}
                  <div className="px-5 py-4 flex items-center justify-between bg-[#fef1da] hidden lg:flex">
                    <h3 className="font-bold text-[20px] text-[#181d29]">Search by Filter</h3>
                  </div>

                  {/* Sidebar Body */}
                  <div className="px-5 py-5 space-y-4">
                    <div className="relative w-full">
                      <Input
                        placeholder="Search by center name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 h-11 text-[14px]"
                        style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: "#444444" }}
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#999999" }} />
                    </div>

                    <div className="w-full">
                      <Select value={selectedCity} onValueChange={setSelectedCity} modal={false}>
                        <SelectTrigger className="h-11 text-[14px]" style={{ borderColor: "#cacdd4", borderRadius: "5px", fontFamily: "Poppins, sans-serif", color: selectedCity === "all" ? "#999999" : "#444444" }}>
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
                  </div>

                  {/* Apply/Reset Buttons */}
                  <div className="flex items-center gap-3 px-5 pb-5">
                    <Button 
                      className="flex-1 font-bold h-11 text-sm bg-[#ffa300] text-[#181d29] hover:bg-[#e69200]"
                      onClick={applyFilters}
                    >
                      Apply Filter
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 font-bold h-11 text-sm border-gray-200 text-[#181d29] hover:bg-gray-50"
                      onClick={resetFilters}
                    >
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
                <h1 className="text-[20px] md:text-[22px] font-bold shrink-0" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}>
                  Language Centers
                </h1>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4 text-[14px]">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-[#181d29] whitespace-nowrap">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-[#ffa300]"
                    >
                      <option value="best_match">Best Match (Default)</option>
                      <option value="name_a_z">Name (A to Z)</option>
                      <option value="name_z_a">Name (Z to A)</option>
                    </select>
                  </div>
                  
                  <div className="text-gray-500 hidden sm:block">|</div>
                  
                  <div className="font-medium text-gray-600 whitespace-nowrap shrink-0">
                    Total Centers: {filtered.length}
                  </div>
                </div>
              </div>
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
              <div className="space-y-5">
                {paged.map((lc: any) => {
                  return (
                    <div
                      key={lc.id}
                      className="bg-white p-5 md:p-6 lg:p-8 border border-gray-200 rounded-[8px] animate-fade-in"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] lg:grid-cols-[180px_1fr_180px] gap-6 lg:gap-8 items-center lg:items-start">
                        {/* Elegant Icon Representation or Image */}
                        <Link
                          to={`/language-centers/${generateSlug(lc.name)}`}
                          className="w-full h-[100px] bg-white flex items-center justify-center overflow-hidden border border-gray-100 rounded-md p-2"
                        >
                          {lc.logo_url ? (
                            <img
                              src={lc.logo_url}
                              alt={lc.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                                (e.target as HTMLImageElement).className = "hidden";
                              }}
                            />
                          ) : (
                            <Languages className="h-10 w-10 text-[#ffa300]" />
                          )}
                        </Link>

                        {/* Info block */}
                        <div className="min-w-0 flex flex-col justify-center space-y-3 md:col-span-1 lg:col-span-1">
                          <Link to={`/language-centers/${generateSlug(lc.name)}`}>
                            <h3 className="font-semibold hover:underline text-[18px] md:text-[20px] text-[#181d29] leading-tight mb-1">
                              {lc.name}
                            </h3>
                          </Link>

                          <div className="flex flex-col gap-2.5">
                            {/* Location */}
                            <div className="flex items-center gap-2.5 text-[15px] text-[#515768]">
                              <MapPin className="shrink-0 h-4 w-4 text-[#515768]" />
                              <span>{lc.city || "Malaysia"}, Malaysia</span>
                            </div>

                            {/* About text summary */}
                            {lc.about_text && (
                              <div className="flex items-start gap-2.5 text-[15px] text-[#515768]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info shrink-0 mt-0.5 text-[#515768]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                <span className="line-clamp-2">
                                  {lc.about_text}
                                </span>
                              </div>
                            )}

                            {/* Courses list tags */}
                            {lc.more_info && Array.isArray(lc.more_info) && lc.more_info.length > 0 && (
                              <div className="flex items-start gap-2.5 text-[15px] text-[#515768] mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open shrink-0 mt-0.5 text-[#515768]"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                <div className="flex flex-wrap gap-1.5">
                                  {lc.more_info.slice(0, 3).map((c: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[12px] font-medium rounded-[4px]"
                                    >
                                      {c.title}
                                    </span>
                                  ))}
                                  {lc.more_info.length > 3 && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[12px] font-medium rounded-[4px]">
                                      +{lc.more_info.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col gap-3 w-full md:col-span-2 lg:col-span-1 mt-4 lg:mt-2">
                          <Button
                            className="w-full h-10 font-bold text-[14px] bg-[#f9c365] text-[#181d29] hover:bg-[#e6a845] rounded-[6px] border border-[#f9c365]"
                            onClick={() => navigate(`/apply?centerId=${lc.id}`)}
                          >
                            Apply Now
                          </Button>
                          <Link to={`/language-centers/${generateSlug(lc.name)}`} className="block w-full">
                            <Button
                              className="w-full h-10 font-bold text-[14px] border border-gray-800 text-[#181d29] hover:bg-gray-50 rounded-[6px] bg-white"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination styled like Universities2 / Courses2 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
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
          </div>
        )}
      </div>

      <PublicFooter />
      
    </div>
  );
}
