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

  const sorted = useMemo(() => [...blogPosts].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()), [blogPosts]);
  const featured = sorted[0];
  const rest = sorted.slice(1);
  const totalPages = Math.ceil(rest.length / ITEMS_PER_PAGE);
  const paged = rest.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />
      <div className="intro-surface py-14">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">Student Blog</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Student Life & Study Guides in Malaysia</h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">Tips, guides, and stories from students across Malaysia.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <LoadingScreen label="Loading blog" sublabel="Preparing stories and guides" className="py-16" />
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No blog posts yet. Add some from the admin panel!</div>
        ) : (
          <>
            {featured && (
              <Link to={`/blog/${featured.id}`}>
                <Card className="mb-10 overflow-hidden group hover:shadow-xl transition-all">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-64 md:h-auto bg-muted overflow-hidden">
                      {featured.cover_image && <img src={featured.cover_image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                      <Badge variant="outline" className="w-fit mb-3">{featured.category}</Badge>
                      <h2 className="text-2xl font-bold mb-2">{featured.title}</h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{featured.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.read_time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((post: any) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="h-44 bg-muted overflow-hidden">
                      {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                    </div>
                    <div className="p-5 space-y-3">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <h3 className="font-bold leading-tight line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#ffa300] hover:underline">
                        Read More <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
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
