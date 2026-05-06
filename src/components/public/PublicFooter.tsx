import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, MessageCircle, BookOpen, MapPin, Sparkles, Calendar, Calculator, RefreshCw, Award, FileText, Zap, LogIn, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SupportFaqWidget } from "@/components/public/SupportFaqWidget";

interface PublicFooterProps {
  bannerVisible?: boolean;
}

export function PublicFooter({ bannerVisible = false }: PublicFooterProps) {
  const bottomClass = bannerVisible ? "bottom-20" : "bottom-6";
  return (
    <>
      <footer style={{ backgroundColor: "#181d29" }} className="text-white">
        <div className="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 bg-[#ffa300]/15 rounded-sm flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-[#ffa300]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Whiteboard</span>
                <span className="text-[12px] font-bold text-[#ffa300] uppercase block" style={{ fontFamily: "'Poppins', sans-serif", textAlign: 'justify', textAlignLast: 'justify' as any }}>Education</span>
              </div>
            </div>
            <p className="text-sm" style={{ color: "#a2a6b0" }}>
              Expert guidance for international students seeking quality education in Malaysia.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-sm border flex items-center justify-center hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors" style={{ borderColor: "#515768" }}><Facebook className="h-4 w-4" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-sm border flex items-center justify-center hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors" style={{ borderColor: "#515768" }}><Twitter className="h-4 w-4" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-sm border flex items-center justify-center hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors" style={{ borderColor: "#515768" }}><Instagram className="h-4 w-4" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-sm border flex items-center justify-center hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors" style={{ borderColor: "#515768" }}><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-base" style={{ fontFamily: "Poppins, sans-serif" }}>Quick Links</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#a2a6b0" }}>
              <li><Link to="/universities" className="hover:text-[#ffa300] transition-colors">Universities</Link></li>
              <li><Link to="/courses" className="hover:text-[#ffa300] transition-colors">Courses</Link></li>
              <li><Link to="/language-centers" className="hover:text-[#ffa300] transition-colors">Language Centers</Link></li>
              <li><Link to="/destinations/malaysia" className="hover:text-[#ffa300] transition-colors">Study in Malaysia</Link></li>
              <li><Link to="/eligibility" className="hover:text-[#ffa300] transition-colors">Eligibility Test</Link></li>
              <li><Link to="/events" className="hover:text-[#ffa300] transition-colors">Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-base" style={{ fontFamily: "Poppins, sans-serif" }}>Tools & Resources</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#a2a6b0" }}>
              <li><Link to="/tools/calculator" className="hover:text-[#ffa300] transition-colors">Cost Calculator</Link></li>
              <li><Link to="/tools/gpa-converter" className="hover:text-[#ffa300] transition-colors">GPA Converter</Link></li>
              <li><Link to="/scholarships" className="hover:text-[#ffa300] transition-colors">Scholarships</Link></li>
              <li><Link to="/visa-guide" className="hover:text-[#ffa300] transition-colors">Visa Guide</Link></li>
              <li><Link to="/partner" className="hover:text-[#ffa300] transition-colors">For Agencies</Link></li>
              <li><Link to="/login" className="hover:text-[#ffa300] transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-base" style={{ fontFamily: "Poppins, sans-serif" }}>Contact Us</h4>
            <div className="space-y-3 text-sm" style={{ color: "#a2a6b0" }}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#ffa300]" />
                <span>info@Whiteboard Education.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#ffa300]" />
                <span>+60 12-345 6789</span>
              </div>
              <p className="text-xs mt-3" style={{ color: "#777777" }}>The team typically replies in a few minutes.</p>
            </div>
          </div>
        </div>
        <div className="border-t py-5 text-center text-sm" style={{ borderColor: "#515768", color: "#777777" }}>
          <p>© 2026 Whiteboard Education. All rights reserved.</p>
          <p className="mt-1">Developed by TechWisdom Technologies</p>
        </div>
      </footer>

      <SupportFaqWidget bannerVisible={bannerVisible} />

      {/* WhatsApp Floating Widget — matching reference green circle */}
      <a
        href="https://wa.me/60123456789"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed ${bannerVisible ? 'bottom-[76px]' : 'bottom-[20px]'} right-2 xl:right-3 z-40 h-9 w-9 rounded-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md`}
        style={{ backgroundColor: "#25d366", color: "#ffffff" }}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </>
  );
}
