import { GraduationCap, BookOpen, Languages, Sparkles, ArrowLeftRight, Home, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function FeaturesSection() {
  const features = [
    {
      image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&h=500&q=80",
      label: "Partner Universities",
      sublabel: "Explore top-ranked institutions across Malaysia.",
      href: "/universities",
      accentColor: "#2F4F97",
    },
    {
      image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&h=500&q=80",
      label: "Courses Available",
      sublabel: "Browse thousands of courses from foundation to postgraduate.",
      href: "/courses",
      accentColor: "#2563eb",
    },
    {
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
      label: "Language Centers",
      sublabel: "Find English & Malay preparation programs.",
      href: "/language-centers",
      accentColor: "#059669",
    },
    {
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
      label: "AI Eligibility Test",
      sublabel: "Instantly check your admission chances using our AI engine.",
      href: "/ai-eligibility",
      accentColor: "#8b5cf6",
    },
    {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      label: "University Comparison",
      sublabel: "Compare fees, rankings, and requirements side-by-side.",
      href: "/compare",
      accentColor: "#f59e0b",
    },
    {
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
      label: "Housing & Accommodation",
      sublabel: "Discover secure and affordable student living options.",
      href: "/housing",
      accentColor: "#ec4899",
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-[32px] font-bold text-[#1E293B] mb-3">
            Discover Our <span className="text-[#2F4F97]">Features</span>
          </h2>
          <p className="text-[#64748B] text-[13px] md:text-[16px] max-w-2xl mx-auto">
            Everything you need to successfully plan, apply, and transition to studying in Malaysia, all in one platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.href}
              className="group bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-gray-100 transition-all duration-300 hover:border-[#2F4F97]/50 flex flex-col h-full overflow-hidden"
            >
              {/* Cover Image */}
              <div className="w-full h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#1E293B]/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img 
                  src={feature.image} 
                  alt={feature.label} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-[#1E293B] text-[17px] mb-2">{feature.label}</h3>
                <p className="text-[#64748B] text-[13px] leading-relaxed mb-6 flex-1">
                  {feature.sublabel}
                </p>

                {/* Action Button */}
                <div className="mt-auto flex items-center text-[13px] font-semibold transition-colors duration-300" style={{ color: feature.accentColor }}>
                  Explore Feature
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
