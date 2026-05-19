import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Handshake, Users, Globe, CheckCircle2, ArrowRight, ShieldCheck, Zap, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";

const stepImages = ["/images/partner-step1.png", "/images/partner-step2.png", "/images/partner-step3.png", "/images/partner-step4.png"];
const benefitImages = ["/images/benefit-market.png", "/images/benefit-manager.png", "/images/benefit-trusted.png", "/images/benefit-fast.png"];

const benefits = [
  { icon: Globe, title: "Malaysia Market Access", desc: "Tap into Malaysia's booming international education sector through our established university partnerships across the country." },
  { icon: Users, title: "Dedicated Account Manager", desc: "Every partner agency is assigned a dedicated relationship manager to assist with student cases and documentation." },
  { icon: ShieldCheck, title: "Trusted & Compliant", desc: "We handle all Malaysian regulatory requirements, visa processing, and institutional compliance on behalf of your students." },
  { icon: Zap, title: "Fast Application Processing", desc: "Our streamlined processes ensure average turnaround of 5 business days from submission to university acknowledgement." },
];

const registrationSteps = [
  { step: "01", title: "Submit Your Application", desc: "Provide your agency profile, representative details, and upload required verification documents." },
  { step: "02", title: "Verification & Review", desc: "Our compliance team reviews your credentials, operational history, and student handling capacity." },
  { step: "03", title: "Account Activation", desc: "Once approved, you receive partner dashboard access with full student management and tracking tools." },
  { step: "04", title: "Start Referring Students", desc: "Submit student applications, upload documents, and track every stage from offer letter to enrollment." },
];

const platformFeatures = [
  { title: "Student Application Management", desc: "Create and manage unlimited student profiles with intake preferences and target Malaysian universities." },
  { title: "Document Upload & Tracking", desc: "Upload passports, transcripts, IELTS scores, and financial statements with real-time status visibility." },
  { title: "Live Status Updates", desc: "Receive timely notifications for document review, offer letters, visa progress, and enrollment milestones." },
  { title: "Marketing & Sales Support", desc: "Access ready-to-share brochures, program guides, and promotional materials to attract Malaysia-bound students." },
  { title: "Dedicated Partner Assistance", desc: "Get operational support for escalations, documentation checks, and process optimization from our team." },
  { title: "Transparent Reporting", desc: "Track all referred students, successful placements, and partnership performance from a single dashboard." },
];

const faqs = [
  { q: "Who can become a Whiteboard Education partner?", a: "Any registered education consultancy or agency operating outside Malaysia that has students interested in studying in Malaysia can apply for partnership." },
  { q: "How long does the approval process take?", a: "Most applications are reviewed within 2–5 business days. Complete documentation speeds up the process." },
  { q: "What universities do you work with?", a: "We have direct partnerships with 50+ Malaysian universities, including top-ranked public and private institutions." },
  { q: "How does the referral process work?", a: "Once approved, you submit student profiles through your partner dashboard. We handle admissions, visa, accommodation, and airport pickup on your behalf." },
];

export default function B2BLanding() {

  return (
    <div className="min-h-screen bg-white">
      <MegaMenu />
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-[#f8f9fb] to-white min-h-screen pt-0 pb-10 overflow-hidden flex flex-col">
          {/* Premium gradient overlay background */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
            {/* Primary radial gradient - warm amber glow from top-right */}
            <div className="absolute -top-1/4 -right-1/4 w-[70%] h-[70%] rounded-full bg-[#ffa300]/[0.08] blur-[100px]" />
            {/* Secondary radial gradient - navy depth from bottom-left */}
            <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-[#181d29]/[0.06] blur-[80px]" />
            {/* Tertiary accent - subtle amber center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-[#ffa300]/[0.04] blur-[60px]" />
            {/* Dot grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, #181d29 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            />
            {/* Diagonal decorative lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                  <line x1="0" y1="0" x2="0" y2="60" stroke="#181d29" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-lines)" />
            </svg>
          </div>

          <div className="container relative z-20 mx-auto px-4 flex-1 flex items-center justify-center">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-white shadow-sm border border-gray-100 rounded-sm">
                <Handshake className="h-3.5 w-3.5 text-[#ffa300]" />
                <span className="text-xs font-bold text-[#181d29] tracking-tight">Malaysia's Leading Education Partnership Network</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold mb-5 leading-[1.15] text-[#181d29] tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                <span className="block mb-1">Your Students Want</span>
                <span className="inline-block bg-[#ffa300] text-[#181d29] px-3 py-0.5 rounded-sm mb-1 shadow-sm">To Study in Malaysia?</span>
                <span className="block">We Make It Happen.</span>
              </h1>
              <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                We partner with international agencies worldwide to place their students into top Malaysian universities - handling admissions, visa, accommodation, and everything in between.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/partner/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#ffa300] text-[#181d29] hover:bg-[#e08e00] font-semibold text-sm rounded-md h-11 px-6 group shadow-lg shadow-[#ffa300]/20 transition-all hover:shadow-[#ffa300]/40 hover:-translate-y-0.5">
                    Register as a partner <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-[#181d29] text-[#181d29] font-semibold text-sm rounded-md h-11 px-6 transition-all hover:-translate-y-0.5">
                    Login as partner
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner - 4 boxes in a single row with watermark background images only */}
        <section className="py-16 bg-white relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffa300]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2">Why Partner With Whiteboard?</h2>
              <p className="text-[#515768] max-w-2xl mx-auto text-sm">We are Malaysia's on-the-ground education experts. You handle your market - we handle Malaysia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <div key={b.title} className="text-center group flex flex-col items-center">
                  {/* Big vector icon at the top */}
                  <div className="w-32 h-32 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img src={benefitImages[i]} alt={b.title} className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-semibold text-base mb-3 text-[#181d29]" style={{ fontFamily: "Poppins, sans-serif" }}>{b.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[#515768] max-w-xs">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How The Partnership Works - cards with vector images */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">How The Partnership Works</h2>
              <p className="text-sm text-[#515768] max-w-2xl mx-auto">A simple, transparent process from registration to successful student placement.</p>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-0.5 bg-[#ffa300]/15 z-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {registrationSteps.map((s, i) => (
                  <div key={s.step} className="relative z-10 group">
                    <div className="bg-white rounded-sm border border-[#e5e7eb] overflow-hidden hover:shadow-lg hover:border-[#ffa300]/30 transition-all duration-300">
                      <div className="relative h-44 bg-[#f8f9fb] flex items-center justify-center overflow-hidden">
                        <img src={stepImages[i]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3">
                          <div className="relative inline-block">
                            <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-[#ffa300] rounded-sm" />
                            <div className="relative w-7 h-7 bg-[#181d29] text-white flex items-center justify-center font-bold text-xs rounded-sm z-10">{s.step}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-[15px] text-[#181d29] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{s.title}</h3>
                        <p className="text-[13px] text-[#515768] leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features - dark CTA section like PreFooterCTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80" alt="Team collaboration" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 z-0 bg-[#181d29]/90 mix-blend-multiply" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#181d29]/95 via-[#181d29]/80 to-transparent" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#ffa300]/20 to-transparent mix-blend-overlay z-0 pointer-events-none" />
          <div className="container relative z-10 mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-[#ffa300]/20 border border-[#ffa300]/30 text-[#ffa300] mb-6 backdrop-blur-sm">
                <HeadphonesIcon className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">Partner Dashboard</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">What You Get Access To</h2>
              <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">Manage your entire student referral pipeline from one powerful, intuitive dashboard.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-[#ffa300] flex-shrink-0" />
                    <h3 className="font-semibold text-white text-[15px]" style={{ fontFamily: "Poppins, sans-serif" }}>{f.title}</h3>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-relaxed pl-8">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ - Accordion */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#181d29] mb-2">Frequently Asked Questions</h2>
              <p className="text-sm text-[#515768] max-w-2xl mx-auto">Everything you need to know about partnering with Whiteboard Education.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-[#e5e7eb] rounded-sm mb-3 px-5 data-[state=open]:border-[#ffa300]/40 transition-colors">
                  <AccordionTrigger className="text-[15px] font-semibold text-[#181d29] hover:no-underline py-5" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-[#515768] leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA - matches PreFooterCTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=80" alt="Business handshake" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 z-0 bg-[#181d29]/90 mix-blend-multiply" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm bg-[#ffa300]/20 border border-[#ffa300]/30 text-[#ffa300] mb-6 backdrop-blur-sm">
                <Handshake className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">Become a Partner Today</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2 leading-tight">
                Ready to Expand Your <br /><span className="text-[#ffa300]">Malaysia Education Portfolio?</span>
              </h2>
              <p className="text-sm text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">Join our growing network of international agencies and start placing students into Malaysia's top universities.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/partner/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#ffa300] text-[#181d29] hover:bg-[#e08e00] font-semibold text-sm rounded-md h-11 px-6 group shadow-lg shadow-[#ffa300]/20 transition-all hover:shadow-[#ffa300]/40 hover:-translate-y-0.5">
                    Register as a partner <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white hover:text-[#181d29] font-semibold text-sm rounded-md h-11 px-6 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                    Login as partner
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

