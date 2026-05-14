import { Quote, Star, User } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rafiqul Islam",
    university: "Taylor's University",
    program: "BSc in Computer Science",
    quote:
      "Choosing Whiteboard Education was the best decision I made for my academic career. From the very first consultation, their team guided me through every step — from shortlisting universities to preparing my visa documents. I was worried about the entire process being overwhelming, but they made it incredibly smooth. Now I'm studying at Taylor's University, one of the top-ranked institutions in Malaysia, and I couldn't be happier with the experience. The campus, the faculty, and the multicultural environment have all exceeded my expectations.",
    rating: 5,
  },
  {
    id: 2,
    name: "Fatema Akter",
    university: "UCSI University",
    program: "MBBS",
    quote:
      "I always dreamed of studying medicine abroad, but the costs in countries like the UK or Australia were simply out of reach for my family. Whiteboard Education introduced me to UCSI University in Malaysia, where I'm now pursuing my MBBS at a fraction of the cost. They helped me with everything — from understanding the admission requirements to finding affordable accommodation near campus. Their counselors genuinely care about your future, and that personal touch made all the difference during such a life-changing move.",
    rating: 5,
  },
  {
    id: 3,
    name: "Tanvir Hasan",
    university: "APU University",
    program: "MSc in Data Science",
    quote:
      "After completing my undergraduate degree in Dhaka, I wanted to pursue a master's in data science at a globally recognized university. Whiteboard Education not only helped me find the perfect program at APU but also guided me through the scholarship application process. Thanks to their support, I received a partial scholarship that significantly reduced my tuition fees. The entire journey — from application to arrival in Kuala Lumpur — was stress-free because their team handled every detail with professionalism and care.",
    rating: 5,
  },
  {
    id: 4,
    name: "Nusrat Jahan",
    university: "Multimedia University (MMU)",
    program: "BBA in Marketing",
    quote:
      "My experience with Whiteboard Education was nothing short of amazing. I was confused about which university to choose for my business degree, but their experts provided detailed insights into different institutions. MMU turned out to be the perfect fit for me. They also assisted with my visa application, ensuring all documents were perfectly aligned with the requirements. It's been an incredible journey so far, and I highly recommend their services to any student planning to study in Malaysia.",
    rating: 5,
  },
  {
    id: 5,
    name: "Rakib Uddin",
    university: "Sunway University",
    program: "Diploma in Culinary Arts",
    quote:
      "I wanted to build a career in culinary arts and Malaysia seemed like a great destination due to its rich food culture. Whiteboard Education helped me secure an admission at Sunway University. Their team was very patient, answering all my queries and guiding me through the interview process. Even after I reached Malaysia, they checked in to make sure I was settling in well. Their dedication to student success is truly commendable and I'm grateful for their support.",
    rating: 5,
  },
  {
    id: 6,
    name: "Jannatul Ferdous",
    university: "Monash University Malaysia",
    program: "BEng (Hons) Civil Engineering",
    quote:
      "Getting into Monash University Malaysia was a dream come true, and Whiteboard Education made it possible. The application process for such prestigious universities can be daunting, but their team's meticulous attention to detail ensured my application was flawless. They also provided invaluable advice on living in Malaysia, which made my transition so much easier. I can confidently say that they are the best educational consultants for studying in Malaysia.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  // Double the testimonials for seamless marquee looping
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">What Our Students Say</h2>
          <p className="text-sm text-[#515768] max-w-2xl mx-auto">
            Real experiences from Bangladeshi students who pursued their dreams in Malaysia with our guidance.
          </p>
        </div>

        {/* Marquee Track */}
        <div className="marquee-container">
          <div className="marquee-track">
            {marqueeItems.map((t, index) => (
              <div key={`${t.id}-${index}`} className="testimonial-card">
                {/* Quote icon */}
                <Quote className="h-6 w-6 text-[#ffa300] opacity-30 mb-3 flex-shrink-0" />

                {/* Review text */}
                <p className="testimonial-quote">{t.quote}</p>

                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffa300] text-[#ffa300]" />
                  ))}
                </div>

                {/* Divider */}
                <div className="testimonial-divider" />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#f8f9fb] flex items-center justify-center border border-[#e5e7eb] flex-shrink-0 text-[#181d29]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#181d29]">{t.name}</p>
                    <p className="text-xs text-[#515768]">
                      {t.program} • {t.university}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
