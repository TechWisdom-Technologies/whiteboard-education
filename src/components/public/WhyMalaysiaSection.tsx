import { CheckCircle2 } from "lucide-react";

export function WhyMalaysiaSection() {
  const points = [
    {
      title: "World-Class Education",
      desc: "Malaysia offers a high standard of education, with several of its universities ranked among the top 100 in the world. You can earn a globally recognized degree while experiencing a diverse academic environment.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
      benefits: [
        "Home to top-ranked global universities",
        "Partnerships with UK, Australian, and US institutions",
        "Modern campus facilities and high-tech research labs"
      ]
    },
    {
      title: "Affordable Living & Tuition",
      desc: "One of the biggest advantages of studying in Malaysia is the high quality of life at a low cost. Tuition fees and living expenses are significantly lower than in the UK, US, or Australia, without compromising on quality.",
      image: "https://images.unsplash.com/photo-1713532796652-abbfe89a3193",
      benefits: [
        "Low cost of living compared to Western countries",
        "Affordable high-quality student accommodation",
        "Generous scholarships and financial aid options"
      ]
    },
    {
      title: "Multicultural Environment",
      desc: "Experience the true essence of 'Truly Asia'. Malaysia is a melting pot of cultures, offering international students a safe, harmonious, and welcoming environment to live and study in.",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
      benefits: [
        "English is widely spoken across the country",
        "Rich cultural diversity and international festivals",
        "Safe and politically stable environment for students"
      ]
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Blob (Left side) */}
      <div className="absolute top-1/4 -left-[200px] w-[600px] h-[600px] bg-[#E5EDFB] rounded-full blur-[120px] opacity-60 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-[32px] font-bold text-[#1E293B] mb-3">Why Study in Malaysia?</h2>
          <p className="text-[13px] md:text-[14px] text-[#1E293B] max-w-2xl mx-auto">
            Discover why thousands of international students choose Malaysia as their preferred study destination every year.
          </p>
        </div>

        <div className="space-y-20 md:space-y-32">
          {points.map((p, i) => {
            const isReversed = i % 2 === 1;
            return (
              <div key={p.title} className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-4 lg:gap-6`}>
                
                {/* Image Area - Bigger, signature curved corner */}
                <div className="w-full lg:w-[45%] flex justify-center">
                  <div className="relative w-full group">
                    {/* Soft Glowing Aura Background Effect */}
                    <div className="absolute inset-0 bg-[#2F4F97]/20 blur-[60px] rounded-full scale-75 opacity-50 -z-10 transition-all duration-700 group-hover:scale-90 group-hover:opacity-80" />

                    <div className={`relative w-full aspect-[16/10] overflow-hidden bg-white shadow-lg rounded-2xl ${isReversed ? 'rounded-br-[80px] md:rounded-br-[120px]' : 'rounded-bl-[80px] md:rounded-bl-[120px]'}`}>
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10" 
                      />
                    </div>
                  </div>
                </div>

                {/* Content Area - Wider, tighter line height */}
                <div className="w-full lg:w-[55%] space-y-4 lg:px-6">
                  <h3 className="text-2xl md:text-[28px] font-bold text-[#1E293B] mb-2">{p.title}</h3>
                  <p className="text-[14px] md:text-[15px] text-[#1E293B] text-justify leading-[1.6]">
                    {p.desc}
                  </p>
                  
                  {/* Kept the benefits list but styled compactly */}
                  <ul className="space-y-2.5 pt-2 text-[14px]">
                    {p.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-3 text-[#1E293B]">
                        <CheckCircle2 className="h-5 w-5 text-[#1E293B] flex-shrink-0 mt-0.5" />
                        <span className="leading-[1.5]">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
