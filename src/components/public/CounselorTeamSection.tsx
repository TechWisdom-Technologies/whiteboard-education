import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const team = [
  { name: "Sarah Johnson", role: "Senior Education Consultant", image: "https://i.pravatar.cc/300?u=sarah" },
  { name: "David Chen", role: "Visa Compliance Expert", image: "https://i.pravatar.cc/300?u=david" },
  { name: "Amina Al-Farsi", role: "Student Housing Coordinator", image: "https://i.pravatar.cc/300?u=amina" },
  { name: "Michael Wong", role: "Admissions Specialist", image: "https://i.pravatar.cc/300?u=michael" },
];

export function CounselorTeamSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-[#181d29] mb-4 tracking-tight">Meet Our Experts</h2>
            <p className="text-lg text-gray-600">
              Our dedicated team of professionals is here to guide you through every step of your international education journey.
            </p>
          </div>
          <Button variant="outline" className="rounded-sm border-[#181d29] text-[#181d29] hover:bg-[#181d29] hover:text-white group">
            View All Team <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((m) => (
            <div key={m.name} className="group">
              <div className="relative mb-6 overflow-hidden rounded-sm aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-500">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="flex gap-3">
                    <button className="h-10 w-10 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#ffa300] transition-colors">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="h-10 w-10 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#ffa300] transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#181d29] group-hover:text-[#ffa300] transition-colors">{m.name}</h3>
              <p className="text-sm text-gray-500 font-medium">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
