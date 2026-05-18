import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, MessageCircle, MapPin, Mail, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { SupportFaqWidget } from "@/components/public/SupportFaqWidget";

interface PublicFooterProps {
  bannerVisible?: boolean;
}

export function PublicFooter({ bannerVisible = false }: PublicFooterProps) {
  return (
    <>
      <footer style={{ backgroundColor: "#181d29" }} className="text-white border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-6 pt-12 pb-5">
          {/* Upper portion: 5-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-5 gap-y-8 pb-10 border-b border-gray-800/80">
            {/* 1st Column: Logo, Subheadline, Social Icons */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-[#ffa300]/15 rounded-sm flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-[#ffa300]" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[15.5px] font-extrabold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>Whiteboard</span>
                  <span className="text-[12.5px] font-bold text-[#ffa300] uppercase block" style={{ fontFamily: "'Poppins', sans-serif", textAlign: 'justify', textAlignLast: 'justify' as any }}>Education</span>
                </div>
              </div>
              <p className="text-[13.5px] font-light leading-relaxed text-gray-400">
                Expert guidance for international students seeking quality education in Malaysia.
              </p>
              <div className="flex gap-2.5 pt-1">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-sm border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors"><Facebook className="h-3.5 w-3.5" /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-sm border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors"><Twitter className="h-3.5 w-3.5" /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-sm border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors"><Instagram className="h-3.5 w-3.5" /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-sm border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#ffa300] hover:border-[#ffa300] hover:text-[#181d29] transition-colors"><Linkedin className="h-3.5 w-3.5" /></a>
              </div>
            </div>

            {/* 2nd Column: Explore */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                Explore
              </h4>
              <ul className="space-y-2.5 text-[13px] text-gray-400">
                <li><Link to="/universities" className="hover:text-[#ffa300] transition-colors font-normal">Universities</Link></li>
                <li><Link to="/courses" className="hover:text-[#ffa300] transition-colors font-normal">Courses</Link></li>
                <li><Link to="/language-centers" className="hover:text-[#ffa300] transition-colors font-normal">Language Centers</Link></li>
                <li><Link to="/housing" className="hover:text-[#ffa300] transition-colors font-normal">Housing</Link></li>
              </ul>
            </div>

            {/* 3rd Column: Other Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                Other Resources
              </h4>
              <ul className="space-y-2.5 text-[13px] text-gray-400">
                <li><Link to="/blog" className="hover:text-[#ffa300] transition-colors font-normal">Blog</Link></li>
                <li><Link to="/eligibility" className="hover:text-[#ffa300] transition-colors font-normal">Eligibility Test</Link></li>
                <li><Link to="/compare" className="hover:text-[#ffa300] transition-colors font-normal">Compare Universities</Link></li>
              </ul>
            </div>

            {/* 4th Column: Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                Legal
              </h4>
              <ul className="space-y-2.5 text-[13px] text-gray-400">
                <li><Link to="/help" className="hover:text-[#ffa300] transition-colors font-normal">Privacy Policy</Link></li>
                <li><Link to="/help" className="hover:text-[#ffa300] transition-colors font-normal">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* 5th Column: Connect with Us */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white tracking-widest uppercase mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                Connect with Us
              </h4>
              <div className="space-y-2.5 text-[13px] text-gray-400">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#ffa300] shrink-0 mt-0.5" />
                  <span>Kuala Lumpur, Malaysia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#ffa300] shrink-0" />
                  <span>+60 12-345 6789</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#ffa300] shrink-0" />
                  <span>info@whiteboardeducation.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-[#ffa300] shrink-0 mt-0.5" />
                  <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower portion: Copyright left, developed by right */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-xs text-gray-500 font-light gap-2">
            <span>© 2026 Whiteboard Education. All rights reserved.</span>
            <span>Developed by TechWisdom Technologies</span>
          </div>
        </div>
      </footer>

      <SupportFaqWidget bannerVisible={bannerVisible} />

      {/* WhatsApp Floating Widget */}
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
