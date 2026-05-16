import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowRight, BookOpen } from "lucide-react";

const ITEMS_PER_PAGE = 6;

export default function Blog() {
  const { data: blogPosts = [], isLoading } = useTableData("blogs");
  const [currentPage, setCurrentPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...blogPosts].sort(
        (a: any, b: any) =>
          new Date(b.date || b.created_at).getTime() -
          new Date(a.date || a.created_at).getTime()
      ),
    [blogPosts]
  );
  
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <MegaMenu />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center max-w-3xl">
          <h1 className="text-3xl md:text-[40px] font-extrabold mb-4" style={{ fontFamily: "Poppins, sans-serif", color: "#181d29", lineHeight: 1.2 }}>
            Study Abroad <span className="text-[#ffa300]">Insights & Guides</span>
          </h1>
          <p className="text-[#515768] text-base md:text-lg">
            Discover the latest articles, student stories, and expert tips to help you navigate your journey to studying in Malaysia.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 flex-1">
        {isLoading ? (
          <LoadingScreen label="Loading articles" sublabel="Preparing stories and guides" className="py-16" />
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-[#515768] flex flex-col items-center">
            <BookOpen className="h-12 w-12 opacity-40 mb-4" />
            <p className="font-semibold text-lg">No articles published yet.</p>
            <p className="text-sm">Check back soon for updates!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paged.map((post: any) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group">
                  <article className="relative rounded-md overflow-hidden aspect-square md:aspect-[4/5] group/card shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <img
                      src={post.cover_image || "/placeholder-blog.jpg"}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/95 via-[#181d29]/40 to-[#181d29]/20 transition-opacity duration-300" />

                    {/* Top Meta (Category & Date) */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                      {post.category ? (
                        <span className="bg-[#ffa300] text-[#181d29] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-sm">
                          {post.category}
                        </span>
                      ) : (
                        <div />
                      )}
                      <span className="text-white/90 text-[10px] font-medium flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2 py-1 rounded-sm border border-white/10 shadow-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date || post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Bottom Title & Read More */}
                    <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col gap-3">
                      <h3 className="text-white font-bold text-[15px] md:text-base leading-snug group-hover/card:text-[#ffa300] transition-colors shadow-sm line-clamp-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {post.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-[#ffa300] text-xs font-bold uppercase tracking-wider opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
                        Read Article <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <Button 
                  variant="outline" 
                  className="h-10 border-gray-200 text-[#515768] hover:text-[#181d29] rounded-sm bg-white"
                  disabled={currentPage === 1} 
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`h-10 w-10 flex items-center justify-center text-sm font-bold rounded-sm border transition-colors ${
                        currentPage === i + 1 
                          ? "bg-[#ffa300] border-[#ffa300] text-[#181d29]" 
                          : "bg-white border-gray-200 text-[#515768] hover:bg-gray-50"
                      }`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="h-10 border-gray-200 text-[#515768] hover:text-[#181d29] rounded-sm bg-white"
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
      <PublicFooter />
    </div>
  );
}
