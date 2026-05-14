import { Calendar, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function PreFooterCTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80"
          alt="Students collaborating"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlays for readability and branding */}
      <div className="absolute inset-0 z-0 bg-[#181d29]/90 mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#181d29]/95 via-[#181d29]/80 to-transparent" />

      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#ffa300]/20 to-transparent mix-blend-overlay z-0 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-[#ffa300]/20 border border-[#ffa300]/30 text-[#ffa300] mb-6 backdrop-blur-sm">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">Intakes are open for 2026</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2 leading-tight">
            Ready to Start Your Malaysian <br />
            <span className="text-[#ffa300]">Academic Adventure?</span>
          </h2>
          
          <p className="text-sm text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Get personalized guidance from our experts and secure your place at a world-class university today. We handle the paperwork, you focus on your future.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#ffa300] text-[#181d29] hover:bg-[#e08e00] font-semibold text-sm rounded-md h-11 px-6 group shadow-lg shadow-[#ffa300]/20 transition-all hover:shadow-[#ffa300]/40 hover:-translate-y-0.5">
                Book Free Consultation
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/universities" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white hover:text-[#181d29] font-semibold text-sm rounded-md h-11 px-6 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                <GraduationCap className="mr-2 h-4 w-4" />
                Explore Universities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
