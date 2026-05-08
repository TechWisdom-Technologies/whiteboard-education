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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PublicFooter } from "@/components/public/PublicFooter";
import { MegaMenu } from "@/components/public/MegaMenu";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <MegaMenu />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#e8e8e8] py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#181d29] mb-6 leading-tight">
                Not sure where to start? <br />
                <span className="text-[#ffa300]">Let's Start Your Journey</span>
              </h1>
              <p className="text-lg text-[#515768] leading-relaxed">
                Have questions about studying abroad, visa requirements, or university admissions? 
                Our expert counselors are here to help you every step of the way.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              
              {/* Contact Form */}
              <div className="bg-white p-8 md:p-10 border border-[#e8e8e8] shadow-sm" style={{ borderRadius: "2px" }}>
                <h2 className="text-2xl font-bold text-[#181d29] mb-8 flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-[#ffa300]" />
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-[#181d29]">Full Name</Label>
                      <Input id="name" placeholder="Enter your full name" required className="h-12 border-[#cacdd4] focus:border-[#ffa300] focus:ring-[#ffa300]/20" style={{ borderRadius: "5px" }} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-[#181d29]">Email Address</Label>
                      <Input id="email" type="email" placeholder="name@example.com" required className="h-12 border-[#cacdd4] focus:border-[#ffa300] focus:ring-[#ffa300]/20" style={{ borderRadius: "5px" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-[#181d29]">Contact Number</Label>
                    <Input id="phone" placeholder="+880 1XXX-XXXXXX" required className="h-12 border-[#cacdd4] focus:border-[#ffa300] focus:ring-[#ffa300]/20" style={{ borderRadius: "5px" }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold text-[#181d29]">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" required className="h-12 border-[#cacdd4] focus:border-[#ffa300] focus:ring-[#ffa300]/20" style={{ borderRadius: "5px" }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-[#181d29]">Message Details</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your study goals..." 
                      className="min-h-[150px] border-[#cacdd4] focus:border-[#ffa300] focus:ring-[#ffa300]/20 leading-relaxed" 
                      style={{ borderRadius: "5px" }}
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-[#181d29] text-white hover:bg-[#181d29]/90 font-bold text-lg rounded-sm transition-all flex items-center justify-center gap-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-sm" />
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Message
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Contact Information Cards */}
              <div className="space-y-8">
                <Card className="border-none shadow-none bg-[#fef1da] overflow-hidden" style={{ borderRadius: "2px" }}>
                  <CardContent className="p-8 md:p-10 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-[#181d29] mb-6 flex items-center gap-3">
                        <Globe className="h-6 w-6 text-[#ffa300]" />
                        Our Main Office
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-white rounded-sm flex items-center justify-center shrink-0 shadow-sm border border-[#ffa300]/20">
                            <MapPin className="h-5 w-5 text-[#ffa300]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#181d29] mb-1">Corporate Address</p>
                            <p className="text-[#515768] leading-relaxed">
                              H# 398 (1st Floor), R# 29, Mohakhali DOHS, <br />
                              Dhaka-1212, Bangladesh
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-white rounded-sm flex items-center justify-center shrink-0 shadow-sm border border-[#ffa300]/20">
                            <Phone className="h-5 w-5 text-[#ffa300]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#181d29] mb-1">Call or WhatsApp</p>
                            <p className="text-[#515768] font-medium">+880 1730589112</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-white rounded-sm flex items-center justify-center shrink-0 shadow-sm border border-[#ffa300]/20">
                            <Mail className="h-5 w-5 text-[#ffa300]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#181d29] mb-1">Email Support</p>
                            <p className="text-[#515768] font-medium">cambry.bd@gmail.com</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-white rounded-sm flex items-center justify-center shrink-0 shadow-sm border border-[#ffa300]/20">
                            <Clock className="h-5 w-5 text-[#ffa300]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#181d29] mb-1">Office Hours</p>
                            <p className="text-[#515768]">Sat - Thu: 10:00 AM - 7:00 PM</p>
                            <p className="text-[#999999] text-xs mt-1">Closed on Fridays</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ffa300]/20">
                      <p className="text-sm font-bold text-[#181d29] mb-4 uppercase tracking-wider">Connect with us</p>
                      <div className="flex items-center gap-4">
                        <SocialIcon icon={Facebook} href="https://facebook.com" />
                        <SocialIcon icon={Instagram} href="https://instagram.com" />
                        <SocialIcon icon={Linkedin} href="https://linkedin.com" />
                        <SocialIcon icon={Youtube} href="https://youtube.com" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats/Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TrustBadge icon={CheckCircle2} label="100% Free Consultation" />
                  <TrustBadge icon={CheckCircle2} label="Expert Counselors" />
                  <TrustBadge icon={CheckCircle2} label="50+ University Partners" />
                  <TrustBadge icon={CheckCircle2} label="98% Visa Success Rate" />
                </div>
              </div>
            </div>
          </div>
        </section>
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
      className="h-10 w-10 bg-white rounded-sm flex items-center justify-center text-[#181d29] hover:bg-[#181d29] hover:text-white transition-all shadow-sm border border-[#ffa300]/20"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="bg-white p-4 border border-[#e8e8e8] flex items-center gap-3 shadow-sm" style={{ borderRadius: "5px" }}>
      <Icon className="h-5 w-5 text-green-500 shrink-0" />
      <span className="text-sm font-semibold text-[#181d29]">{label}</span>
    </div>
  );
}
