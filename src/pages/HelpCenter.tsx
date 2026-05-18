import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle, Search, MessageCircle, GraduationCap, FileText, CreditCard, Globe } from "lucide-react";
import { useState } from "react";

const categories = [
  {
    title: "Admissions",
    icon: GraduationCap,
    faqs: [
      { q: "What are the general admission requirements?", a: "Requirements vary by university and programme. Generally, you'll need academic transcripts, English proficiency test scores (IELTS/TOEFL), and a valid passport. Some programmes may require additional documents like a portfolio or entrance exam." },
      { q: "How long does the admission process take?", a: "Typically 2-6 weeks from application submission to receiving an offer letter. Some universities offer rolling admissions with faster turnaround times." },
      { q: "Can I apply to multiple universities at once?", a: "Yes! We recommend applying to 2-3 universities to increase your chances. Our counselors can help you create a balanced application strategy." },
      { q: "What is the minimum GPA required?", a: "Most programmes require a minimum GPA of 2.5-3.0 on a 4.0 scale. Competitive programmes like Medicine may require 3.5+." },
    ],
  },
  {
    title: "Visas",
    icon: FileText,
    faqs: [
      { q: "How do I apply for a student visa?", a: "After receiving your offer letter, your university will typically initiate the visa process. Visit our Visa Guide page for country-specific step-by-step instructions." },
      { q: "How long does visa processing take?", a: "Processing times vary: Malaysia (4-8 weeks), UK (3-8 weeks), Australia (4-6 weeks), Canada (4-12 weeks)." },
      { q: "Can I work while studying?", a: "Most countries allow part-time work during term and full-time during breaks. Malaysia allows 20 hrs/week, UK allows 20 hrs/week, Australia allows 48 hrs/fortnight." },
    ],
  },
  {
    title: "Payments & Fees",
    icon: CreditCard,
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept bank transfers, credit/debit cards, and various online payment platforms. Some universities also accept installment plans." },
      { q: "Are there any hidden fees?", a: "No. We are transparent about all costs. Our service fee is included in the consultation, and university fees are as published on their official websites." },
      { q: "Can I get a refund if my visa is rejected?", a: "Refund policies vary by university. Most offer partial refunds for visa rejections. We recommend purchasing visa rejection insurance." },
    ],
  },
  {
    title: "Living Abroad",
    icon: Globe,
    faqs: [
      { q: "How do I find accommodation?", a: "We offer accommodation assistance as part of our services. Visit our Housing page to browse verified student properties near your university." },
      { q: "Is Malaysia safe for international students?", a: "Yes, Malaysia is one of the safest countries in Southeast Asia for students. University campuses have 24/7 security, and major cities have low crime rates." },
      { q: "What's the cost of living like?", a: "Malaysia is very affordable. A student can live comfortably on $500-800/month including rent." },
    ],
  },
];

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    faqs: cat.faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.faqs.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">
        <section className="intro-surface py-16">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-[#ffa300]" />
            <h1 className="text-4xl font-extrabold mb-3">Help Center</h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">Find answers to common questions about admissions, visas, payments, and student life.</p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search for answers..." className="pl-10 bg-background text-foreground" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <Card key={cat.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <cat.icon className="h-5 w-5 text-[#ffa300]" />
                    {cat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {cat.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`${cat.title}-${i}`}>
                        <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredCategories.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No results found. Try a different search term.</p>
          )}
        </div>
      </main>

      {/* Sticky Contact Footer */}
      <div className="sticky bottom-0 bg-background border-t py-4 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Can't find your answer?</p>
          <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" onClick={() => setLeadOpen(true)}>
            <MessageCircle className="h-4 w-4 mr-2" /> Contact Support
          </Button>
        </div>
      </div>

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        source="help_center_contact_support"
      />

      <PublicFooter />
    </div>
  );
}
