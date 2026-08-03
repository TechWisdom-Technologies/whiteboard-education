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
      <div className="relative overflow-hidden bg-[#1E293B]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=80" 
            alt="Study Abroad Insights" 
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
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
              Insights & Guides
            </div>
            <h1 className="text-2xl md:text-[42px] font-extrabold text-white tracking-tight mb-3 md:mb-4 leading-[1.2] md:leading-[1.1]">
              Study Abroad Insights
            </h1>
            <p className="text-gray-200/90 text-xs md:text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
              Discover the latest articles, student stories, and expert tips to help you navigate your journey to studying in Malaysia.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 py-12 md:py-16 flex-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {paged.map((post: any) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group">
                  <article className="group/card bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col lg:flex-row h-full border border-gray-200">
                    {/* Image Section */}
                    <div className="relative h-[180px] lg:h-auto lg:w-[40%] shrink-0 overflow-hidden">
                      <img
                        src={post.cover_image || "/placeholder-blog.jpg"}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col flex-1 p-4 md:p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                        {post.category && (
                          <span className="bg-[#EEF4FF] text-[#2F4F97] text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {post.category}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-[#64748B] text-[10px] font-semibold uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date || post.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <h3 className="text-[#1E293B] font-extrabold text-[16px] md:text-[18px] leading-snug group-hover/card:text-[#2F4F97] transition-colors line-clamp-3 mb-3">
                        {post.title}
                      </h3>

                      {/* Footer of Card */}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-[#2F4F97]">
                        <span className="text-[10px] font-bold uppercase tracking-widest group-hover/card:tracking-[0.15em] transition-all duration-300">
                          Read Article
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#EEF4FF] flex items-center justify-center group-hover/card:bg-[#2F4F97] group-hover/card:text-white transition-colors duration-300 shrink-0 shadow-sm">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
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
                     
                    >
                      {i + 1}
                    </button>
                  ))}
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
      <PublicFooter />
    </div>
  );
}
