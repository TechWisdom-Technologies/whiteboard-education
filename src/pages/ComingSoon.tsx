import { Link, useLocation } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

export default function ComingSoon() {
  const { pathname } = useLocation();
  const title = pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Page";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />

      <section className="intro-surface py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <Badge className="bg-[#ffa300]/15 text-[#181d29] text-sm px-4 py-1 w-fit">Coming Soon</Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">{title}</h1>
              <p className="text-primary-foreground/80 max-w-md">
                We're building something great. This feature will be available shortly.
              </p>
            </div>

            <div className="rounded-md overflow-hidden border border-primary-foreground/20 shadow-xl bg-primary-foreground/5">
              <img
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&h=700&fit=crop"
                alt="Team building new feature"
                className="w-full h-56 md:h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 flex items-center justify-center py-10">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="h-14 w-14 rounded-md bg-[#ffa300]/10 flex items-center justify-center mx-auto">
            <Construction className="h-7 w-7 text-[#ffa300]" />
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2 mt-4">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
