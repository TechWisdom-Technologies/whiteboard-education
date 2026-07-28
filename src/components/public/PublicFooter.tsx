import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, MessageCircle, MapPin, Mail, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { SupportFaqWidget } from "@/components/public/SupportFaqWidget";

interface PublicFooterProps {
  bannerVisible?: boolean;
}

export function PublicFooter({ bannerVisible = false }: PublicFooterProps) {
  return (
    <>
      <footer className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#2F4F97] to-[#1a0f2e] text-white border-t border-white/10">
        {/* Decorative background glows */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 pt-12 pb-5 relative z-10">
          {/* Upper portion: 5-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-4 gap-y-8 pb-10 border-b border-white/15">
            {/* 1st Column: Logo, Subheadline, Social Icons */}
            <div className="md:col-span-3 space-y-4 pr-0 md:pr-4">
              <div className="flex items-center gap-2.5">
                <img src="/logo-white.png" alt="Whiteboard Education" className="h-9 w-auto object-contain" />
              </div>
              <p className="text-[13.5px] font-normal leading-relaxed text-blue-100/90">
                Expert guidance for international students seeking quality education in Malaysia.
              </p>
              <div className="flex gap-2.5 pt-1">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:border-white hover:text-[#2F4F97] transition-all shadow-sm"><Facebook className="h-3.5 w-3.5" /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:border-white hover:text-[#2F4F97] transition-all shadow-sm"><Twitter className="h-3.5 w-3.5" /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:border-white hover:text-[#2F4F97] transition-all shadow-sm"><Instagram className="h-3.5 w-3.5" /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:border-white hover:text-[#2F4F97] transition-all shadow-sm"><Linkedin className="h-3.5 w-3.5" /></a>
              </div>
            </div>

            {/* 2nd Column: Explore */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 text-[13px] text-blue-100/90 font-medium">
                <li><Link to="/universities" className="hover:text-white hover:underline transition-all">Universities</Link></li>
                <li><Link to="/courses" className="hover:text-white hover:underline transition-all">Courses</Link></li>
                <li><Link to="/language-centers" className="hover:text-white hover:underline transition-all">Language Centers</Link></li>
                <li><Link to="/housing" className="hover:text-white hover:underline transition-all">Housing</Link></li>
              </ul>
            </div>

            {/* 3rd Column: Other Resources */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4">
                Other Resources
              </h4>
              <ul className="space-y-2.5 text-[13px] text-blue-100/90 font-medium">
                <li><Link to="/blog" className="hover:text-white hover:underline transition-all">Blog</Link></li>
                <li><Link to="/eligibility" className="hover:text-white hover:underline transition-all">Eligibility Test</Link></li>
                <li><Link to="/compare" className="hover:text-white hover:underline transition-all">Compare Universities</Link></li>
              </ul>
            </div>

            {/* 4th Column: Legal */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-[13px] text-blue-100/90 font-medium">
                <li><Link to="/help" className="hover:text-white hover:underline transition-all">Privacy Policy</Link></li>
                <li><Link to="/help" className="hover:text-white hover:underline transition-all">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* 5th Column: Connect with Us */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4">
                Connect with Us
              </h4>
              <div className="space-y-2.5 text-[13px] text-blue-100/90 font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
                  <span>Kuala Lumpur, Malaysia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-300 shrink-0" />
                  <span>+60 12-345 6789</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-300 shrink-0" />
                  <span className="break-all">info@whiteboardeducation.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
                  <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower portion: Copyright left, developed by right */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-xs text-blue-200/70 font-normal gap-2">
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
        className={`fixed ${bannerVisible ? 'bottom-[76px]' : 'bottom-[20px]'} right-2 xl:right-3 z-[100] h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md`}
        style={{ backgroundColor: "#25d366", color: "#ffffff" }}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </>
  );
}
