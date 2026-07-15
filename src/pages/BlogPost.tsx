import { useParams, Link } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { GlobalBreadcrumbs } from "@/components/public/GlobalBreadcrumbs";
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
      if (block.startsWith("## ")) return <h2 key={i} className="text-2xl font-semibold text-black mt-10 mb-4">{block.replace("## ", "")}</h2>;
      if (block.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-black mt-8 mb-3">{block.replace("### ", "")}</h3>;
      if (block.match(/^\d\./)) {
        const lines = block.split("\n").filter(Boolean);
        return (
          <ol key={i} className="space-y-2 my-6 list-decimal list-inside text-black text-[14px] md:text-[16px] text-justify">
            {lines.map((line, j) => <li key={j} className="leading-relaxed pl-2">{line.replace(/^\d+\.\s*/, "")}</li>)}
          </ol>
        );
      }
      return <p key={i} className="text-black text-[14px] md:text-[16px] text-justify leading-relaxed my-6" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong class='text-black font-semibold'>$1</strong>") }} />;
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
            <h1 className="text-2xl font-semibold text-[#1E293B]">Article Not Found</h1>
            <Link to="/blog">
              <Button style={{ backgroundColor: "#2F4F97", color: "#1E293B" }} className="font-semibold border border-[#2F4F97]">Browse All Articles</Button>
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
      <MegaMenu hideBreadcrumbs />
      
      {/* Article Header & Hero Image Overlay */}
      <div className="relative w-full min-h-[320px] md:min-h-[400px] md:h-[50vh] flex flex-col justify-end bg-[#1E293B]">
        {post.cover_image && (
          <div className="absolute inset-0">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#1E293B]/60 to-[#1E293B]/30" />
          </div>
        )}
        
        <div className="absolute top-0 left-0 w-full z-20">
          <GlobalBreadcrumbs theme="transparent" />
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-8 md:pb-16">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
            {post.category && (
              <span className="bg-[#2F4F97] text-white text-[10px] md:text-[11px] font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl capitalize">
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-sm font-medium text-white/90">
              <Calendar className="h-2.5 w-2.5 md:h-4 md:w-4" />
              {(() => {
                const createdDateStr = post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
                const updatedDateStr = post.date ? new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
                
                if (updatedDateStr && createdDateStr && updatedDateStr !== createdDateStr) {
                  return `Updated ${updatedDateStr}`;
                }
                return updatedDateStr || createdDateStr || "Unknown Date";
              })()}
            </span>
            <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-sm font-medium text-white/90">
              <Clock className="h-2.5 w-2.5 md:h-4 md:w-4" />
              {post.read_time || "5 min read"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-[1.3] mb-5 md:mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
              <img src="/favicon.png" alt="Whiteboard Education Logo" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Whiteboard Education</p>
              <p className="text-xs text-white/70">Official Publisher</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Article Content */}
          <article className="py-12 md:py-16">
            <div className="prose-like max-w-none">
              {/<[a-z][\s\S]*>/i.test(post.content || "") ? (
                <div 
                  className="rich-text-content text-black text-[14px] md:text-[16px] text-justify leading-relaxed" 
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
          <div className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1E293B] mb-10 text-center">
              Keep Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((r: any) => (
                <Link key={r.id} to={`/blog/${r.id}`} className="group">
                  <article className="group/card bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-[360px] md:h-[400px] border border-gray-200">
                    {/* Image Section */}
                    <div className="relative h-[180px] w-full overflow-hidden shrink-0">
                      <img
                        src={r.cover_image || "/placeholder-blog.jpg"}
                        alt={r.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {r.category && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-white/95 backdrop-blur-md text-[#2F4F97] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            {r.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col flex-1 p-5 md:p-6">
                      <div className="flex items-center gap-1.5 text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(r.date || r.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      <h3 className="text-[#1E293B] font-extrabold text-[15px] md:text-[17px] leading-snug group-hover/card:text-[#2F4F97] transition-colors line-clamp-3 mb-4">
                        {r.title}
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
            </div>
          </div>
        </section>
      )}
      
      <PublicFooter />
    </div>
  );
}
