import { ArrowRight } from "lucide-react";


const services = [
  {
    image: "/images/services/consultation.png",
    title: "Free consultations",
    description: "Choose the perfect courses and universities in Malaysia according to your interest, eligibility and budget.",
    link: "/eligibility"
  },
  {
    image: "/images/services/admission.png",
    title: "University admission & visa",
    description: "Submit all necessary documents to complete the university's admission procedures as well as visa application.",
    link: "/contact"
  },
  {
    image: "/images/services/accommodation.png",
    title: "Preparing accommodation",
    description: "Cost-saving for students to arrange accommodation before arriving. We send a variety of options for you to choose.",
    link: "/housing"
  },
  {
    image: "/images/services/airport.png",
    title: "Airport pickup",
    description: "We have a team that will pick you up from the airport and drive you to the selected accommodation.",
    link: "/pre-departure"
  },
];

export function ServicesGrid() {
  return (
    <section className="py-16 md:py-24 bg-[#F8FAFC] relative overflow-hidden">
      {/* Decorative Background Blob (Right side) */}
      <div className="absolute top-0 right-0 w-[600px] h-full bg-[#E5EDFB] rounded-l-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-[32px] font-bold text-[#1E293B] mb-3">
            How we can help you?
          </h2>
          <p className="text-[#64748B] text-[13px] md:text-[14px]">
            Whiteboard Education provides comprehensive end-to-end support for your journey in Malaysia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {services.map((s, i) => (
            <div key={s.title} className="bg-white rounded-2xl shadow-sm border border-gray-50/50 p-5 pt-8 md:p-6 md:pt-10 relative flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:gap-5 group hover:shadow-md transition-shadow">
              {/* Overlapping Number Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2F4F97] text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                {i + 1}
              </div>

              {/* Icon Image */}
              <div className="w-16 h-16 md:w-12 md:h-12 lg:w-14 lg:h-14 shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <img src={s.image} alt={s.title} className="w-full h-full object-contain" />
              </div>

              {/* Text Content */}
              <div>
                <h3 className="font-bold text-[14px] lg:text-[13px] xl:text-[14px] mb-1.5 text-[#1E293B] leading-tight">
                  {s.title}
                </h3>
                <p className="text-[12px] lg:text-[10px] xl:text-[11px] text-[#64748B] leading-snug text-justify">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
