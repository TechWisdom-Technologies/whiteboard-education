export function UniversityPartnersSection() {
  const partners = [
    "Multimedia University Malaysia (MMU)",
    "UCSI University Malaysia",
    "Taylor's University Malaysia",
    "APU University Malaysia",
    "UNITEN University Malaysia",
    "City University Malaysia",
    "MAHSA University Malaysia",
    "UTP University Malaysia"
  ];

  const LOGOS: Record<string, string> = {
    "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
    "UCSI University Malaysia": "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
    "Taylor's University Malaysia": "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
    "APU University Malaysia": "https://en.your-uni.com/assets/images/university/apu-university.webp",
    "UNITEN University Malaysia": "https://en.your-uni.com/assets/images/university/uniten-university.webp",
    "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
    "MAHSA University Malaysia": "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
    "UTP University Malaysia": "https://en.your-uni.com/assets/images/university/utp-university.webp",
  };

  return (
    <section className="py-20 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Our Partner Institutions</h2>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
          {partners.map((p) => (
            <div key={p} className="h-12 md:h-16 w-32 md:w-48 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src={LOGOS[p]} 
                alt={p} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
