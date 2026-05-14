import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Top row of universities (10 items) - verified working links
const partnersRow1 = [
  { name: "Multimedia University", logo: "https://en.your-uni.com/assets/images/university/mmu-university.webp" },
  { name: "UCSI University", logo: "https://en.your-uni.com/assets/images/university/ucsi-university.webp" },
  { name: "UTeM", logo: "https://en.your-uni.com/assets/images/university/utem-university.webp" },
  { name: "UNIMY", logo: "https://en.your-uni.com/assets/images/university/university-malaysia-of-computer-science-and-engineering-unimy.webp" },
  { name: "Taylor's University", logo: "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp" },
  { name: "MAHSA University", logo: "https://en.your-uni.com/assets/images/university/mahsa-university.webp" },
  { name: "UTP University", logo: "https://en.your-uni.com/assets/images/university/utp-university.webp" },
  { name: "SEGi University", logo: "https://en.your-uni.com/assets/images/university/segi-university.webp" },
  { name: "Limkokwing University", logo: "https://en.your-uni.com/assets/images/university/limkokwing-university.webp" },
  { name: "IUKL", logo: "https://en.your-uni.com/assets/images/university/iukl-university.webp" },
];

// Bottom row of universities (10 items) - verified working links
const partnersRow2 = [
  { name: "INTI University", logo: "https://en.your-uni.com/assets/images/university/inti-university.webp" },
  { name: "UniKL", logo: "https://en.your-uni.com/assets/images/university/unikl-university.webp" },
  { name: "UTAR", logo: "https://en.your-uni.com/assets/images/university/utar-university.webp" },
  { name: "Nottingham University", logo: "https://en.your-uni.com/assets/images/university/nottingham-university.webp" },
  { name: "Monash University", logo: "https://en.your-uni.com/assets/images/university/monash-university.webp" },
  { name: "IUMW", logo: "https://en.your-uni.com/assets/images/university/iumw-university.webp" },
  { name: "APU University", logo: "https://en.your-uni.com/assets/images/university/apu-university.webp" },
  { name: "UNITEN", logo: "https://en.your-uni.com/assets/images/university/uniten-university.webp" },
  { name: "City University", logo: "https://en.your-uni.com/assets/images/university/city-university.webp" },
  { name: "UTM", logo: "https://en.your-uni.com/assets/images/university/utm-university.webp" },
];

export function UniversityPartnersSection() {
  // Double arrays for seamless marquee
  const row1 = [...partnersRow1, ...partnersRow1];
  const row2 = [...partnersRow2, ...partnersRow2];

  return (
    <section className="py-16 bg-[#f8f9fb]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Our Partner Institutions</h2>
          <p className="text-sm text-[#515768] max-w-2xl mx-auto">
            We work with Malaysia's leading universities to connect you with world-class education opportunities.
          </p>
        </div>

        {/* Marquees wrapped in container for width constraint */}
        <div className="overflow-hidden relative w-full">
          {/* Marquee Row 1 (Right to Left) */}
          <div className="marquee-container mb-8">
            <div className="marquee-track">
              {row1.map((p, i) => (
                <div key={`row1-${p.name}-${i}`} className="partner-logo-card !bg-transparent !border-0 !w-40 !flex-shrink-0 !mx-4">
                  <img 
                    src={p.logo} 
                    alt={p.name} 
                    className="h-12 max-w-full object-contain transition-all duration-300 mix-blend-multiply" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Row 2 (Left to Right) */}
          <div className="marquee-container">
            <div className="marquee-track-reverse">
              {row2.map((p, i) => (
                <div key={`row2-${p.name}-${i}`} className="partner-logo-card !bg-transparent !border-0 !w-40 !flex-shrink-0 !mx-4">
                  <img 
                    src={p.logo} 
                    alt={p.name} 
                    className="h-12 max-w-full object-contain transition-all duration-300 mix-blend-multiply" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          {/* View all link */}
          <Link
            to="/universities"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffa300]"
          >
            View All Universities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
