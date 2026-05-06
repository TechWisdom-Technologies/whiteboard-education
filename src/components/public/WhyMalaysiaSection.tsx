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
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="mb-6 tracking-tight">Why Study in Malaysia?</h2>
          <p className="subheadline max-w-3xl mx-auto">
            Discover why thousands of international students choose Malaysia as their preferred study destination every year.
          </p>
        </div>

        <div className="space-y-32">
          {points.map((p, i) => (
            <div key={p.title} className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}>
              <div className="flex-1 relative">
                <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-2xl relative z-10">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                {/* Decorative background element */}
                <div className={`absolute -inset-4 rounded-sm z-0 ${i % 2 === 0 ? 'bg-[#ffa300]/10 -rotate-2' : 'bg-[#181d29]/5 rotate-2'}`} />
              </div>

              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#ffa300]/10 text-[#ffa300] text-sm font-bold uppercase tracking-wider">
                  Reason 0{i + 1}
                </div>
                <h3 className="">{p.title}</h3>
                <p className="">
                  {p.desc}
                </p>
                <ul className="space-y-4">
                  {p.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#ffa300]" />
                      <span className="font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
