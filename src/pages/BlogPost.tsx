import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPost() {
  const { id } = useParams();
  const { data: blogPosts = [], isLoading } = useTableData("blogs");

  const post = blogPosts.find((p: any) => p.id === id);

  const formatContent = (content: string) => {
    return content.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">{block.replace("## ", "")}</h2>;
      if (block.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">{block.replace("### ", "")}</h3>;
      if (block.match(/^\d\./)) {
        const lines = block.split("\n").filter(Boolean);
        return <ol key={i} className="space-y-1.5 my-4 list-decimal list-inside">{lines.map((line, j) => <li key={j} className="text-muted-foreground leading-relaxed">{line.replace(/^\d+\.\s*/, "")}</li>)}</ol>;
      }
      return <p key={i} className="text-muted-foreground leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <LoadingScreen label="Loading article" sublabel="Getting the full post" className="flex-1" />
        <PublicFooter />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Article Not Found</h1>
            <Link to="/blog"><Button>Browse All Articles</Button></Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const related = blogPosts.filter((p: any) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-16 w-full">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{post.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.read_time}</span>
        </div>
        {post.cover_image && (
          <div className="rounded-sm overflow-hidden mb-10">
            <img src={post.cover_image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
          </div>
        )}
        <div className="prose-like">{formatContent(post.content || "")}</div>
      </article>

      {related.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {related.map((r: any) => (
                <Link key={r.id} to={`/blog/${r.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="h-40 overflow-hidden">
                      {r.cover_image && <img src={r.cover_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-xs mb-2">{r.category}</Badge>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">{r.title}</h3>
                      <span className="text-xs font-semibold text-[#ffa300] flex items-center gap-1 mt-2">Read More <ArrowRight className="h-3 w-3" /></span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <PublicFooter />
    </div>
  );
}
