import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreFooterCTA() {
  return (
    <section className="relative py-16 overflow-hidden bg-[#181d29]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#ffa300]/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-[#ffa300] mb-6">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">Intakes are open for 2026</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to Start Your Malaysian Academic Adventure?
          </h2>
          
          <p className="text-sm text-gray-400 mb-8 max-w-2xl mx-auto">
            Get personalized guidance from our experts and secure your place at a world-class university today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <Button size="lg" className="bg-[#ffa300] text-[#181d29] hover:bg-[#e08e00] font-semibold text-sm rounded-sm group w-full sm:w-auto h-12 px-8">
              Book Free Consultation
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
