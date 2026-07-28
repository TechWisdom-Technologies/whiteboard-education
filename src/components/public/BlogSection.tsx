import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTableData } from "@/hooks/useSupabaseData";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, ArrowRight } from "lucide-react";

export function BlogSection() {
  const { data: blogPosts = [], isLoading } = useTableData("blogs");
  const latestPosts = useMemo(
    () =>
      [...blogPosts]
        .sort(
          (a: any, b: any) =>
            new Date(b.date || b.created_at).getTime() -
            new Date(a.date || a.created_at).getTime()
        )
        .slice(0, 4),
    [blogPosts]
  );

  return (
    <section className="py-8 md:py-16 bg-white relative overflow-hidden">
      {/* Decorative Background Blob (Left side) */}
      <div className="absolute top-1/3 -left-[200px] w-[600px] h-[600px] bg-[#E5EDFB] rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-[32px] font-bold text-[#1E293B] mb-3">Latest Articles</h2>
          <p className="text-[13px] md:text-[16px] text-[#64748B] max-w-2xl mx-auto">
            Tips, guides, and insights to help you navigate your study abroad journey.
          </p>
        </div>

        {isLoading ? (
          <LoadingScreen
            label="Loading articles"
            sublabel="Fetching latest posts"
            className="py-10"
          />
        ) : (
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory -mx-4 px-4 scroll-px-4 md:mx-0 md:px-0 md:scroll-px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {latestPosts.map((post: any) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group min-w-[280px] w-[85vw] sm:w-[320px] md:min-w-0 md:w-auto shrink-0 snap-start">
                <article className="group/card bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-[360px] md:h-[400px] border border-gray-200 w-full">
                  {/* Image Section */}
                  <div className="relative h-[180px] w-full overflow-hidden shrink-0">
                    <img
                      src={post.cover_image || "/placeholder-blog.jpg"}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {post.category && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-[#2F4F97] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col flex-1 p-5 md:p-6">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.date || post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    <h3 className="text-[#1E293B] font-extrabold text-[15px] md:text-[17px] leading-snug group-hover/card:text-[#2F4F97] transition-colors line-clamp-3 mb-4">
                      {post.title}
                    </h3>

                    {/* Footer of Card */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[#2F4F97]">
                      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest group-hover/card:tracking-[0.15em] transition-all duration-300">
                        Read Article
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#EEF4FF] flex items-center justify-center group-hover/card:bg-[#2F4F97] group-hover/card:text-white transition-colors duration-300 shrink-0 shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            {/* Trailing spacer to guarantee edge padding */}
            <div className="w-4 shrink-0 md:hidden" aria-hidden="true"></div>
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F4F97]"
          >
            View All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}