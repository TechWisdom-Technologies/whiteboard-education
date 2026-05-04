import { Play, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirtualTourSectionProps {
  universityName: string;
}

export function VirtualTourSection({ universityName }: VirtualTourSectionProps) {
  return (
    <section className="bg-foreground text-background py-16 mt-8 rounded-md overflow-hidden mx-4 lg:mx-0">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-extrabold mb-2 text-center">360° Virtual Campus Tour</h2>
        <p className="text-background/60 text-center mb-8 text-sm">Explore {universityName} from anywhere in the world</p>

        <div className="relative max-w-4xl mx-auto rounded-md overflow-hidden cursor-pointer group">
          {/* Video Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/40 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?w=900&h=500&fit=crop')] bg-cover bg-center opacity-30" />

            {/* Play Button */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-[#ffa300]/20 backdrop-blur-sm flex items-center justify-center border-2 border-[#ffa300]/40 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-[#ffa300] ml-1" />
              </div>
              <span className="text-sm font-medium text-background/80">Play 360° Tour</span>
            </div>

            {/* Fullscreen icon */}
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-background/60 hover:text-background">
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
