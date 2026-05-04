import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, ArrowRight } from "lucide-react";

export function BlogSection() {
  const { data: blogPosts = [], isLoading } = useTableData("blogs");
  const latestPosts = useMemo(
    () => [...blogPosts].sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()).slice(0, 4),
    [blogPosts],
  );

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "#181d29" }}>Latest Articles</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Stay updated with tips, guides, and news for international students
        </p>
        {isLoading ? (
          <LoadingScreen label="Loading articles" sublabel="Fetching latest posts" className="py-10" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestPosts.map((post: any) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <Card className="overflow-hidden hover:border-[#ffa300] transition-all cursor-pointer h-full" style={{ borderRadius: "5px" }}>
                  <div className="h-40 overflow-hidden">
                    {post.cover_image && (
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="text-xs mb-2">{post.category}</Badge>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{new Date(post.date || post.created_at).toLocaleDateString()}
                      </p>
                      <span className="text-xs font-semibold text-[#ffa300] flex items-center gap-1">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/blog">
            <span className="text-sm font-semibold text-[#ffa300] hover:underline inline-flex items-center gap-1">
              View All Articles <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}