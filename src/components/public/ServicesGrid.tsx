import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: "https://cdn-icons-png.flaticon.com/512/1995/1995539.png", // Handshake/Consultation
    title: "Free consultations",
    description: "Choose the perfect courses and universities in Malaysia according to your interest, eligibility and budget.",
    link: "/eligibility"
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Document/Admission
    title: "University admission & visa",
    description: "Submit all necessary documents to complete the university's admission procedures as well as visa application.",
    link: "/visa-guide"
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/619/619153.png", // Accommodation/House
    title: "Preparing accommodation",
    description: "Cost-saving for students to arrange accommodation before arriving. We send a variety of options for you to choose.",
    link: "/housing"
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/754/754848.png", // Airport Pickup
    title: "Airport pickup",
    description: "We have a team that will pick you up from the airport and drive you to the selected accommodation.",
    link: "/pre-departure"
  },
];

export function ServicesGrid() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Organic Background Blob */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffa300]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2">
            How we can help you?
          </h2>
          <p className="text-[#515768] max-w-2xl mx-auto text-sm">
            Whiteboard Education provides comprehensive end-to-end support for your journey in Malaysia.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Process Line - Aligned to middle of numbers */}
          <div className="hidden lg:flex absolute top-[144px] left-1/2 -translate-x-1/2 w-[75%] h-0.5 bg-[#181d29]/10 items-center justify-between pointer-events-none z-0">
            <div className="w-2 h-2 rounded-full bg-[#181d29]/30 -ml-1" />
            <ArrowRight className="w-4 h-4 text-[#181d29]/30 -mr-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {services.map((s, i) => (
              <Link key={s.title} to={s.link} className="relative group">
                <div className="text-center">
                  {/* Step Icon */}
                  <div className="mx-auto mb-8 h-24 w-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <img src={s.icon} alt={s.title} className="w-full h-full object-contain" />
                  </div>

                  {/* Step Number with Shadow/Offset */}
                  <div className="relative inline-block mb-8 lg:mb-12">
                    {/* Offset background */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ffa300] rounded-sm" />
                    {/* Number box */}
                    <div className="relative w-8 h-8 bg-[#181d29] text-white flex items-center justify-center font-bold text-sm rounded-sm z-10 border border-[#181d29]">
                      {i + 1}
                    </div>
                  </div>

                  <h3
                    className="font-bold text-lg mb-3 group-hover:text-[#ffa300] transition-colors"
                    style={{ fontFamily: "Poppins, sans-serif", color: "#181d29" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#515768", fontFamily: "Poppins, sans-serif" }}
                  >
                    {s.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
