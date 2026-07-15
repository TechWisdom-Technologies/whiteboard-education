import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";

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
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu hideBreadcrumbs />
      
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#243B71] to-[#2F4F97] border-b border-[#2F4F97]/20 shadow-sm">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none"></div>
        
        <div className="relative z-20">
          <GlobalBreadcrumbs theme="transparent" />
        </div>
        
        <div className="relative z-10 w-full mx-auto px-4 py-12 md:py-16 max-w-4xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Insights & Guides
            </div>
            <h1 className="text-2xl md:text-[32px] font-extrabold text-white tracking-tight mb-2 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Study Abroad Insights
            </h1>
            <p className="text-blue-100/80 text-sm md:text-base max-w-lg mx-auto md:mx-0">
              Discover the latest articles, student stories, and expert tips to help you navigate your journey to studying in Malaysia.
            </p>
          </div>
          
          <div className="hidden md:flex shrink-0 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 items-center justify-center rotate-3 hover:rotate-6 transition-transform shadow-xl">
            <BookOpen className="w-10 h-10 text-blue-100 drop-shadow-lg" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 flex-1">
        {isLoading ? (
          <LoadingScreen label="Loading articles" sublabel="Preparing stories and guides" className="py-16" />
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-[#64748B] flex flex-col items-center">
            <BookOpen className="h-12 w-12 opacity-40 mb-4" />
            <p className="font-semibold text-lg">No articles published yet.</p>
            <p className="text-sm">Check back soon for updates!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paged.map((post: any) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group">
                  <article className="relative rounded-2xl overflow-hidden aspect-square md:aspect-[4/5] group/card shadow-sm hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <img
                      src={post.cover_image || "/placeholder-blog.jpg"}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#1E293B]/40 to-[#1E293B]/20 transition-opacity duration-300" />

                    {/* Top Meta (Category & Date) */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                      {post.category ? (
                        <span className="bg-[#2F4F97] text-white text-[10px] font-bold px-2 py-1 rounded-xl uppercase tracking-wider shadow-sm">
                          {post.category}
                        </span>
                      ) : (
                        <div />
                      )}
                      <span className="text-white/90 text-[10px] font-medium flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2 py-1 rounded-xl border border-white/10 shadow-sm">
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
                      <h3 className="text-white font-bold text-[15px] md:text-base leading-snug group-hover/card:text-[#2F4F97] transition-colors shadow-sm line-clamp-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {post.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-[#2F4F97] text-xs font-bold uppercase tracking-wider opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
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
                  className="h-10 border-gray-200 text-[#64748B] hover:text-[#1E293B] rounded-xl bg-white"
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
                      className={`h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl border transition-colors ${
                        currentPage === i + 1 
                          ? "bg-[#2F4F97] border-[#2F4F97] text-[#1E293B]" 
                          : "bg-white border-gray-200 text-[#64748B] hover:bg-gray-50"
                      }`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="h-10 border-gray-200 text-[#64748B] hover:text-[#1E293B] rounded-xl bg-white"
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
