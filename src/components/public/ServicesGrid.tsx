import { MessageSquare, FileCheck, Home, Plane, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: MessageSquare, title: "Free consultations", description: "Whiteboard Education Counsellors provides free consultation on how to choose the perfect courses and universities in Malaysia according to your interest, eligibility and budget.", link: "/eligibility" },
  { icon: FileCheck, title: "University admission & visa", description: "After you decide on the university and course, Whiteboard Education Counsellors will submit all necessary documents to complete the university's admission procedures as well as visa application.", link: "/visa-guide" },
  { icon: Home, title: "Preparing accommodation", description: "It is indeed cost-saving for students to arrange accommodation before arriving in Malaysia. That is why Whiteboard Education Counsellors will send variety of accommodation options for you to choose.", link: "/housing" },
  { icon: Plane, title: "Airport pickup", description: "We ensure a smooth and stress-free arrival. We have a team that will pick you up from the airport and drive you to the selected accommodation.", link: "/pre-departure" },
];

export function ServicesGrid() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", color: "#181d29" }}
          >
            How we can help you?
          </h2>
          <div className="w-16 h-1 bg-[#ffa300] mx-auto rounded-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => (
            <Link key={s.title} to={s.link}>
              <div
                className="group text-center animate-fade-in"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div
                  className="mx-auto mb-5 h-16 w-16 rounded-sm flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "#fef1da" }}
                >
                  <s.icon className="h-7 w-7 text-[#ffa300]" />
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
    </section>
  );
}
