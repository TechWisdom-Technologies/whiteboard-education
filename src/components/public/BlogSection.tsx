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
        .slice(0, 3),
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post: any) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <article className="blog-card">
                  {/* Image */}
                  {post.cover_image && (
                    <div className="blog-card-img-wrap">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="blog-card-img"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="blog-card-body">
                    {post.category && (
                      <span className="blog-card-tag">{post.category}</span>
                    )}
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>

                    <div className="blog-card-meta">
                      <span className="blog-card-date">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.date || post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="blog-card-read">
                        Read More <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
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