import { CheckCircle2 } from "lucide-react";

export function WhyMalaysiaSection() {
  const points = [
    {
      title: "World-Class Education",
      desc: "Malaysia is home to many prestigious international branch campuses and highly-ranked local universities.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Affordable Living & Tuition",
      desc: "Quality education at a fraction of the cost compared to the UK, USA, or Australia.",
      image: "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Multicultural Environment",
      desc: "Experience a diverse society that is welcoming to international students from all over the world.",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-[#181d29] mb-6 tracking-tight">Why Study in Malaysia?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                <h3 className="text-3xl md:text-4xl font-bold text-[#181d29]">{p.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {p.desc}
                </p>
                <ul className="space-y-4">
                  {[1, 2, 3].map((_, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#ffa300]" />
                      <span className="font-medium">Key benefit point {j + 1} about this category</span>
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
