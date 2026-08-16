import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, 
  Send, CheckCircle2, Globe,
  Facebook, Instagram, Linkedin, Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PublicFooter } from "@/components/public/PublicFooter";
import { MegaMenu } from "@/components/public/MegaMenu";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const fullName = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const messageDetails = formData.get("message") as string;

    const fullMessage = subject ? `Subject: ${subject}\n\n${messageDetails}` : messageDetails;

    try {
      const { error } = await supabase.from("leads").insert({
        full_name: fullName,
        email: email,
        phone: phone,
        message: fullMessage,
        source: "contact",
        status: "new"
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We will get back to you shortly.",
      });
      formElement.reset();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MegaMenu />
      <main className="flex-1 pt-6 pb-10 md:pt-8 md:pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          
          {/* Main Split Card */}
          <div className="bg-white rounded-xl overflow-hidden flex flex-col lg:flex-row border border-[#e8e8e8]">
            
            {/* Left Panel - Dark */}
            <div className="w-full lg:w-5/12 bg-[#1E293B] text-white p-8 md:p-12 relative overflow-hidden flex flex-col">
              {/* Background Accents */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#2F4F97] rounded-full opacity-10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-[#2F4F97] rounded-full opacity-10 blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <h1 className="text-3xl font-light mb-4 leading-tight tracking-tight text-white">
                  Not sure where to start? <br />
                  <span className="text-white font-bold">Let's Start Your Journey</span>
                </h1>
                <p className="text-white text-[13.5px] leading-relaxed mb-10 max-w-md font-light">
                  Have questions about studying abroad, visa requirements, or university admissions? 
                  Our expert counselors are here to help you every step of the way.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-xl text-[#2F4F97]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1 tracking-widest uppercase">Corporate Address</p>
                      <p className="text-white text-[13px] leading-relaxed font-light">
                        H# 398 (1st Floor), R# 29, Mohakhali DOHS, <br />
                        Dhaka-1212, Bangladesh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-xl text-[#2F4F97]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1 tracking-widest uppercase">Call or WhatsApp</p>
                      <p className="text-white text-[13px] font-light">+880 1730589112</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-xl text-[#2F4F97]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1 tracking-widest uppercase">Email Support</p>
                      <p className="text-white text-[13px] font-light">cambry.bd@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-xl text-[#2F4F97]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1 tracking-widest uppercase">Office Hours</p>
                      <p className="text-white text-[13px] font-light">Sat - Thu: 10:00 AM - 7:00 PM</p>
                      <p className="text-red-500 text-[11px] mt-0.5 font-semibold tracking-wider uppercase">Closed on Fridays</p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-8">
                    <p className="text-[10px] font-bold text-white mb-4 uppercase tracking-widest">Connect with us</p>
                    <div className="flex items-center gap-3">
                      <SocialIcon icon={Facebook} href="https://facebook.com" />
                      <SocialIcon icon={Instagram} href="https://instagram.com" />
                      <SocialIcon icon={Linkedin} href="https://linkedin.com" />
                      <SocialIcon icon={Youtube} href="https://youtube.com" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-7/12 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-[#1E293B] mb-8 flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5 text-[#2F4F97]" />
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Full Name</Label>
                    <Input name="name" id="name" placeholder="John Doe" required className="h-11 bg-gray-50 border-gray-200 text-[#1E293B] focus:text-[#1E293B] focus:caret-[#2F4F97] focus:placeholder:text-gray-400 focus:bg-white focus:border-[#2F4F97] focus:ring-1 focus:ring-[#2F4F97] text-[13px] rounded-xl transition-colors shadow-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email Address</Label>
                    <Input name="email" id="email" type="email" placeholder="john@example.com" required className="h-11 bg-gray-50 border-gray-200 text-[#1E293B] focus:text-[#1E293B] focus:caret-[#2F4F97] focus:placeholder:text-gray-400 focus:bg-white focus:border-[#2F4F97] focus:ring-1 focus:ring-[#2F4F97] text-[13px] rounded-xl transition-colors shadow-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contact Number</Label>
                    <Input name="phone" id="phone" placeholder="+880 1XXX-XXXXXX" required className="h-11 bg-gray-50 border-gray-200 text-[#1E293B] focus:text-[#1E293B] focus:caret-[#2F4F97] focus:placeholder:text-gray-400 focus:bg-white focus:border-[#2F4F97] focus:ring-1 focus:ring-[#2F4F97] text-[13px] rounded-xl transition-colors shadow-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Subject</Label>
                    <Input name="subject" id="subject" placeholder="How can we help?" required className="h-11 bg-gray-50 border-gray-200 text-[#1E293B] focus:text-[#1E293B] focus:caret-[#2F4F97] focus:placeholder:text-gray-400 focus:bg-white focus:border-[#2F4F97] focus:ring-1 focus:ring-[#2F4F97] text-[13px] rounded-xl transition-colors shadow-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Message Details</Label>
                  <Textarea 
                    name="message"
                    id="message" 
                    placeholder="Tell us more about your study goals..." 
                    className="min-h-[140px] bg-gray-50 border-gray-200 text-[#1E293B] focus:text-[#1E293B] focus:caret-[#2F4F97] focus:placeholder:text-gray-400 focus:bg-white focus:border-[#2F4F97] focus:ring-1 focus:ring-[#2F4F97] text-[13px] leading-relaxed rounded-xl transition-colors resize-y shadow-none"
                    required 
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 font-bold text-[14px] rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-[#1E293B]/30 border-t-[#1E293B] animate-spin rounded-full" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>



        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-[#2F4F97] hover:text-white transition-all border border-white/10 hover:border-[#2F4F97]"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}


