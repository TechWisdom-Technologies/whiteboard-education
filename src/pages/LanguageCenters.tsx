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
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 3) {
        end = 5;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
      }

      if (start > 2) pages.push("ellipsis");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("ellipsis");

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu />

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-10 pb-16 flex-1" ref={gridRef}>
        {isLoading ? (
          <LoadingScreen label="Loading language centers" sublabel="Gathering available schools" className="py-12" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ─── SIDEBAR ─── */}
            <aside className="lg:w-[320px] xl:w-[360px] shrink-0">
              <div className="overflow-hidden border bg-white" style={{ borderColor: "#e8e8e8", borderRadius: "12px" }}>
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between p-4 lg:hidden text-[#1E293B] font-semibold border-b" style={{ borderColor: "#e8e8e8" }}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Centers
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Sidebar Header */}
                  <div className="px-5 py-4 flex items-center justify-between bg-[#F8FAFC] hidden lg:flex">
                    <h3 className="font-semibold text-[20px] text-[#1E293B]">Search by Filter</h3>
                  </div>

                  {/* Sidebar Body */}
                  <div className="px-5 py-5 space-y-4">
                    <div className="relative w-full">
                      <Input
                        placeholder="Search by center name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 h-11 text-[12px] md:text-[14px]"
                        style={{ borderColor: "#cacdd4", borderRadius: "12px", fontFamily: "Poppins, sans-serif", color: "#444444" }}
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#999999" }} />
                    </div>

                    <div className="w-full">
                      <Select value={selectedCity} onValueChange={setSelectedCity} modal={false}>
                        <SelectTrigger className="h-11 text-[12px] md:text-[14px]" style={{ borderColor: "#cacdd4", borderRadius: "12px", fontFamily: "Poppins, sans-serif", color: selectedCity === "all" ? "#999999" : "#444444" }}>
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
                      className="flex-1 font-bold h-11 text-sm hover:text-[#2F4F97]"
                      onClick={applyFilters}
                    >
                      Apply Filter
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 font-bold h-11 text-sm"
                      onClick={resetFilters}
                    >
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-400 pb-4 mb-0 gap-4">
                <h1 className="text-[20px] md:text-[22px] font-semibold shrink-0" style={{ fontFamily: "Poppins, sans-serif", color: "#1E293B" }}>
                  Language Centers
                </h1>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4 text-[12px] md:text-[14px]">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-[#1E293B] whitespace-nowrap">Sort By:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px] h-[34px] border border-gray-300 rounded-xl px-3 text-gray-600 bg-white focus:ring-0 focus:ring-offset-0 focus:border-[#2F4F97]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="best_match">Best Match (Default)</SelectItem>
                        <SelectItem value="name_a_z">Name (A to Z)</SelectItem>
                        <SelectItem value="name_z_a">Name (Z to A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>



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
                  <p className="font-semibold text-lg mb-1" style={{ color: "#64748B" }}>
                    No programs found
                  </p>
                  <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-400">
                  {paged.map((lc: any) => {
                    return (
                      <div
                        key={lc.id}
                        className="bg-white py-8 lg:py-11 animate-fade-in group"
                      >
                        <div className="flex flex-row gap-4 md:gap-6 lg:gap-8 items-start md:items-center">
                          {/* Elegant Icon Representation or Image */}
                          <Link
                            to={`/language-centers/${generateSlug(lc.name)}`}
                            className="w-[100px] md:w-[170px] lg:w-[200px] shrink-0 h-[100px] md:h-[110px] flex items-center justify-center overflow-hidden"
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
                              <Languages className="h-10 w-10 text-[#2F4F97]" />
                            )}
                          </Link>

                          <div className="flex-1 min-w-0 flex flex-col justify-between lg:flex-row lg:items-center gap-4 lg:gap-8">
                            {/* Info block */}
                            <div className="min-w-0 flex flex-col justify-center space-y-4 md:col-span-1 lg:col-span-1">
                              <Link to={`/language-centers/${generateSlug(lc.name)}`}>
                                <h3 className="font-medium hover:text-[#2F4F97] transition-colors text-[17px] md:text-[18px] text-[#1E293B] leading-tight mb-1">
                                  {lc.name}
                                </h3>
                              </Link>

                              <div className="flex flex-col gap-3">
                                {/* Location */}
                                <div className="flex items-center gap-3 text-[12px] md:text-[14px] text-[#475569]">
                                  <MapPin className="shrink-0 h-4 w-4 text-[#475569]" />
                                  <span>{lc.city || "Malaysia"}, Malaysia</span>
                                </div>


                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-row lg:flex-col gap-2 md:gap-3 mt-1 lg:mt-0 shrink-0 lg:w-[140px]">
                              <Button
                                className="rounded-xl border-[#1E293B] h-10 px-3 text-[13px] font-medium w-[110px] lg:w-full"
                                onClick={() => navigate(`/apply?centerId=${lc.id}`)}
                              >
                                Apply Now
                              </Button>
                              <Link to={`/language-centers/${generateSlug(lc.name)}`} className="block">
                                <Button
                                  variant="outline"
                                  className="border-[#1E293B] rounded-xl h-10 px-3 text-[13px] font-medium w-[110px] lg:w-full hover:bg-[#2F4F97] hover:border-[#2F4F97] hover:text-white transition-colors"
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
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
                      borderRadius: "8px",
                      color: "#64748B",
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
                        className="h-9 w-9 flex items-center justify-center border text-sm font-light transition-colors"
                        style={{
                          borderRadius: "8px",
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: currentPage === page ? "#2F4F97" : "#ffffff",
                          color: currentPage === page ? "#ffffff" : "#64748B",
                          borderColor: currentPage === page ? "#2F4F97" : "#cacdd4",
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
                      borderRadius: "8px",
                      color: "#64748B",
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
