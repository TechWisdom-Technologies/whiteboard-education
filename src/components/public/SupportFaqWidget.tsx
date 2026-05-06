import { useMemo, useState } from "react";
import { Headset, MessageCircleQuestion, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SupportFaqWidgetProps {
  bannerVisible?: boolean;
}

const prebuiltSupportFaqs = [
  {
    q: "How long does admission processing usually take?",
    a: "Most applications are reviewed in 2 to 6 weeks depending on the university and document readiness.",
  },
  {
    q: "Can I apply without IELTS?",
    a: "Some universities accept alternatives or internal placement tests, but this depends on your program and level.",
  },
  {
    q: "What is the average tuition fee in Malaysia?",
    a: "Tuition can range widely by institution and program, but many international students budget roughly RM 18,000 to RM 45,000 per year.",
  },
  {
    q: "Do you help with scholarship guidance?",
    a: "Yes. We shortlist scholarship options based on your profile and help you prepare required documents.",
  },
  {
    q: "Can I work while studying in Malaysia?",
    a: "International students may work part-time under specific visa and institution conditions. We guide you based on your case.",
  },
  {
    q: "What documents are mandatory for application?",
    a: "Usually passport, academic transcripts, certificates, and sometimes English proficiency proof and personal statement.",
  },
  {
    q: "How early should I apply before intake?",
    a: "Applying 3 to 6 months before intake is recommended to avoid delays in offer and visa processing.",
  },
  {
    q: "Do you support transfer students?",
    a: "Yes. We help evaluate credit transfer possibilities and suggest universities with flexible transfer pathways.",
  },
  {
    q: "Can you help with accommodation booking?",
    a: "Yes. We assist with student-friendly options near campus and help compare price, distance, and amenities.",
  },
  {
    q: "What are living costs in Malaysia?",
    a: "Many students budget around RM 1,500 to RM 3,000 monthly depending on city, housing type, and lifestyle.",
  },
  {
    q: "How long does student visa approval take?",
    a: "Visa timelines vary, but many cases complete in 4 to 8 weeks after all requirements are submitted correctly.",
  },
  {
    q: "Can I bring dependents with me?",
    a: "Some categories allow dependents, subject to visa rules and program level. We can verify eligibility for your case.",
  },
  {
    q: "Do you provide pre-departure support?",
    a: "Yes. We provide checklists for travel, immigration, finances, and first-week settlement in Malaysia.",
  },
  {
    q: "Will someone help after I arrive?",
    a: "Yes. Our support team can guide onboarding steps such as registration, accommodation, and local setup.",
  },
  {
    q: "Can I change course or university later?",
    a: "It may be possible depending on university policy and visa conditions. We can explain the safest path before any switch.",
  },
  {
    q: "How do I contact live support quickly?",
    a: "Use the WhatsApp button for direct chat. For general questions, this support widget gives instant answers.",
  },
];

const partnerSupportFaqs = [
  {
    q: "How do I register as an education agency partner?",
    a: "Go to the partnership page, complete the registration form, and upload required documents for review.",
  },
  {
    q: "How long does partner approval usually take?",
    a: "Most partner applications are reviewed in a few business days depending on document completeness.",
  },
  {
    q: "Which documents are required for partner onboarding?",
    a: "Agency details and valid identity or business documents are typically required for verification.",
  },
  {
    q: "Can I submit student leads before full approval?",
    a: "Core partner actions are available after approval. You can prepare internal data in advance.",
  },
  {
    q: "How do I add a new student profile in the dashboard?",
    a: "Open the partner students page, click Add Student, and complete required profile information.",
  },
  {
    q: "Can I upload documents for students later?",
    a: "Yes. Open the student profile and upload or replace required documents any time.",
  },
  {
    q: "How do partner notifications work?",
    a: "You receive status updates and actions in realtime, and each notification can open the related student context.",
  },
  {
    q: "Why is a student application status not changing?",
    a: "Status is updated after processing milestones. Check notes in the student profile for pending requirements.",
  },
  {
    q: "Can I track all my students from one page?",
    a: "Yes. The students table supports search and profile-level tracking in one place.",
  },
  {
    q: "How are commissions calculated?",
    a: "Commission follows the active partnership terms and eligible student progression milestones.",
  },
  {
    q: "How do I access marketing resources?",
    a: "Use the Marketing Hub in the partner dashboard for approved assets and campaign materials.",
  },
  {
    q: "Can multiple counselors use one partner account?",
    a: "Use your internal process to coordinate submissions. For account expansion, contact support.",
  },
  {
    q: "What should I do if student documents are rejected?",
    a: "Review admin notes, upload corrected documents, and resubmit from the student profile.",
  },
  {
    q: "How do I update agency profile details?",
    a: "Open My Profile in the partner dashboard and update your details there.",
  },
  {
    q: "How can I get faster partner support?",
    a: "Use WhatsApp for urgent support and include student email or ID when reporting an issue.",
  },
  {
    q: "Who should I contact for technical issues?",
    a: "Use the support channels and include screenshots plus the exact step where the issue occurred.",
  },
];

export function SupportFaqWidget({ bannerVisible = false }: SupportFaqWidgetProps) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<"student" | "partner">("student");

  const whatsAppBottomPx = bannerVisible ? 76 : 20;
  const supportBottomPx = whatsAppBottomPx + 44;

  const activeFaqs = audience === "student" ? prebuiltSupportFaqs : partnerSupportFaqs;

  const initialOpenQuestion = useMemo(() => activeFaqs[0]?.q ?? "", [activeFaqs]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-2 xl:right-3 z-[60] h-9 w-9 rounded-sm bg-[#181d29] text-white flex items-center justify-center hover:bg-[#181d29]/90 transition-all duration-200 shadow-md"
        style={{ bottom: `${supportBottomPx}px` }}
        aria-label="Open support FAQs"
      >
        <Headset className="h-4 w-4 text-[#ffa300]" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 z-[60] w-[min(22rem,calc(100vw-2rem))] animate-scale-in" style={{ bottom: `${supportBottomPx}px` }}>
      <Card className="border border-[#cacdd4]" style={{ borderRadius: "5px" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircleQuestion className="h-4 w-4 text-[#ffa300]" />
              Support FAQs
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border/80 bg-background"
              onClick={() => setOpen(false)}
              aria-label="Close support FAQ"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-sm bg-muted p-1">
            <button
              type="button"
              onClick={() => setAudience("student")}
              className={`h-8 px-3 rounded-sm text-xs font-semibold transition-colors ${
                audience === "student"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setAudience("partner")}
              className={`h-8 px-3 rounded-sm text-xs font-semibold transition-colors ${
                audience === "partner"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Partner
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Pick a question to instantly view the answer</p>
        </CardHeader>
        <CardContent className="pt-0 max-h-[55vh] overflow-y-auto pr-2">
          <Accordion key={audience} type="single" collapsible defaultValue={initialOpenQuestion} className="w-full">
            {activeFaqs.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-xs py-3 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="pt-3 mt-3 border-t">
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setOpen(false)}>
              Close FAQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
