import { Calendar, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreFooterCTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with geometric overlay */}
      <div className="absolute inset-0 bg-[#181d29]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#ffa300]/10 -skew-x-12 translate-x-1/4" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-white/10 text-[#ffa300] mb-8 animate-pulse">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide">Intakes are open for 2026!</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            Ready to Start Your <span className="text-[#ffa300]">Malaysian</span> Academic Adventure?
          </h2>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get personalized guidance from our experts and secure your place at a world-class university today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-10 bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-bold text-lg rounded-sm group w-full sm:w-auto">
              Book Free Consultation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 border-white/20 text-white hover:bg-white/10 font-bold text-lg rounded-sm w-full sm:w-auto">
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat with an Expert
            </Button>
          </div>
          
          <p className="mt-10 text-sm text-gray-500 italic">
            * Our basic consultation services are always free for international students.
          </p>
        </div>
      </div>
    </section>
  );
}
