import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useTableData } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPost() {
  const { id } = useParams();
  const { data: blogPosts = [], isLoading } = useTableData("blogs");

  const post = blogPosts.find((p: any) => p.id === id);

  const formatContent = (content: string) => {
    return content.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) return <h2 key={i} className="text-2xl font-semibold text-black mt-10 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>{block.replace("## ", "")}</h2>;
      if (block.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-black mt-8 mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>{block.replace("### ", "")}</h3>;
      if (block.match(/^\d\./)) {
        const lines = block.split("\n").filter(Boolean);
        return (
          <ol key={i} className="space-y-2 my-6 list-decimal list-inside text-black text-[16px] text-justify">
            {lines.map((line, j) => <li key={j} className="leading-relaxed pl-2">{line.replace(/^\d+\.\s*/, "")}</li>)}
          </ol>
        );
      }
      return <p key={i} className="text-black text-[16px] text-justify leading-relaxed my-6" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong class='text-black font-semibold'>$1</strong>") }} />;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
        <MegaMenu />
        <LoadingScreen label="Loading article" sublabel="Getting the full post" className="flex-1" />
        <PublicFooter />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
        <MegaMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-[#999999] mx-auto" />
            <h1 className="text-2xl font-semibold text-[#181d29]" style={{ fontFamily: "Poppins, sans-serif" }}>Article Not Found</h1>
            <Link to="/blog">
              <Button style={{ backgroundColor: "#ffa300", color: "#181d29" }} className="font-semibold border border-[#ffa300]">Browse All Articles</Button>
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const related = blogPosts.filter((p: any) => p.id !== post.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <MegaMenu />
      
      {/* Article Header & Hero Image Overlay */}
      <div className="relative w-full min-h-[500px] md:h-[65vh] flex flex-col justify-end bg-[#181d29]">
        {post.cover_image && (
          <div className="absolute inset-0">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/95 via-[#181d29]/60 to-[#181d29]/30" />
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 pb-12 md:pb-16 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ffa300] hover:text-[#e59200] transition-colors mb-6 uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" /> Back to Insights
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {post.category && (
              <span className="bg-[#ffa300] text-[#181d29] text-[11px] font-semibold px-3 py-1.5 rounded-sm uppercase tracking-wider">
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
              <Calendar className="h-4 w-4" />
              {new Date(post.date || post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
              <Clock className="h-4 w-4" />
              {post.read_time || "5 min read"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-[1.3] mb-8" style={{ fontFamily: "Poppins, sans-serif" }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <User className="h-5 w-5 text-white/80" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{post.author || "Guest Author"}</p>
              <p className="text-xs text-white/70">Content Contributor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Article Content */}
          <article className="py-12 md:py-16">
            <div className="prose-like max-w-none">
              {/<[a-z][\s\S]*>/i.test(post.content || "") ? (
                <div 
                  className="rich-text-content text-black text-[16px] text-justify leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              ) : (
                formatContent(post.content || "")
              )}
            </div>
          </article>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="bg-[#f7f8fa] py-20 border-t border-gray-200/60">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-10 text-center" style={{ fontFamily: "Poppins, sans-serif" }}>
              Keep Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((r: any) => (
                <Link key={r.id} to={`/blog/${r.id}`} className="group">
                  <article className="relative rounded-md overflow-hidden aspect-square md:aspect-[4/5] group/card shadow-sm hover:shadow-xl transition-all duration-300">
                    <img
                      src={r.cover_image || "/placeholder-blog.jpg"}
                      alt={r.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/95 via-[#181d29]/40 to-[#181d29]/20 transition-opacity duration-300" />

                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                      {r.category ? (
                        <span className="bg-[#ffa300] text-[#181d29] text-[10px] font-semibold px-2 py-1 rounded-sm uppercase tracking-wider shadow-sm">
                          {r.category}
                        </span>
                      ) : (
                        <div />
                      )}
                      <span className="text-white/90 text-[10px] font-medium flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2 py-1 rounded-sm border border-white/10 shadow-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(r.date || r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col gap-3">
                      <h3 className="text-white font-semibold text-[15px] md:text-base leading-snug group-hover/card:text-[#ffa300] transition-colors shadow-sm line-clamp-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {r.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[#ffa300] text-xs font-semibold uppercase tracking-wider opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
                        Read Article <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </article>
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
