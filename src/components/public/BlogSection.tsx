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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Latest Articles</h2>
          <p className="text-sm text-[#515768] max-w-2xl mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {latestPosts.map((post: any) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <article className="relative rounded-md overflow-hidden aspect-square group/card shadow-sm hover:shadow-md transition-shadow">
                  {/* Image */}
                  <img
                    src={post.cover_image || "/placeholder-blog.jpg"}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/90 via-[#181d29]/20 to-[#181d29]/40 transition-opacity duration-300" />

                  {/* Top Meta (Category & Date) */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    {post.category ? (
                      <span className="bg-[#ffa300] text-white text-[9px] font-normal px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
                        {post.category}
                      </span>
                    ) : (
                      <div />
                    )}
                    <span className="text-white/90 text-[9px] font-normal flex items-center gap-1 backdrop-blur-md bg-black/30 px-1.5 py-0.5 rounded-sm border border-white/10 shadow-sm">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(post.date || post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Bottom Title */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-white font-medium uppercase text-[13px] md:text-sm leading-snug group-hover/card:text-[#ffa300] transition-colors shadow-sm">
                      {post.title}
                      <ArrowRight className="inline-block w-4 h-4 ml-1.5 opacity-0 -translate-x-2 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:translate-x-0" />
                    </h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffa300]"
          >
            View All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}