import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { countries } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Banknote, Stethoscope, Building2, CheckCircle2, Plane } from "lucide-react";
import { useState } from "react";

const visaSteps: Record<string, { title: string; desc: string; icon: React.ElementType; duration: string }[]> = {
  Malaysia: [
    { title: "Receive Offer Letter", desc: "Get your official offer letter from the university. This is your first document for the visa application.", icon: FileText, duration: "1-2 weeks" },
    { title: "Pay Visa Application Fee", desc: "Submit the EMGS (Education Malaysia Global Services) visa application fee through the university.", icon: Banknote, duration: "1-3 days" },
    { title: "Medical Examination", desc: "Complete a medical exam at an approved panel clinic in your home country.", icon: Stethoscope, duration: "1 week" },
    { title: "EMGS Processing", desc: "Your university submits your application to EMGS. Track your status online.", icon: Building2, duration: "4-8 weeks" },
    { title: "Visa Approval Letter (VAL)", desc: "Once approved, receive your VAL. Use this to get your Single Entry Visa (SEV) from the Malaysian embassy.", icon: CheckCircle2, duration: "1-2 weeks" },
    { title: "Fly to Malaysia", desc: "Arrive in Malaysia and complete your student pass endorsement within 7 days.", icon: Plane, duration: "—" },
  ],
  "United Kingdom": [
    { title: "Receive CAS Number", desc: "Your university issues a Confirmation of Acceptance for Studies (CAS) number.", icon: FileText, duration: "1-2 weeks" },
    { title: "Financial Proof", desc: "Show you can cover tuition + living costs (£1,334/month London, £1,023 elsewhere) for 28 days.", icon: Banknote, duration: "28 days" },
    { title: "TB Test", desc: "Get a tuberculosis test from an approved clinic if required for your nationality.", icon: Stethoscope, duration: "1 week" },
    { title: "Submit Online Application", desc: "Apply for a Student Visa (formerly Tier 4) on the UK government portal.", icon: Building2, duration: "1 day" },
    { title: "Biometrics Appointment", desc: "Visit a visa application centre for fingerprints and photograph.", icon: CheckCircle2, duration: "3-8 weeks" },
    { title: "Travel to the UK", desc: "You can arrive up to 1 month before your course starts.", icon: Plane, duration: "—" },
  ],
  Australia: [
    { title: "Receive CoE", desc: "Obtain your Confirmation of Enrolment (CoE) from the university after accepting the offer.", icon: FileText, duration: "1-2 weeks" },
    { title: "Genuine Temporary Entrant", desc: "Prepare a GTE statement explaining your intent to study temporarily in Australia.", icon: Banknote, duration: "—" },
    { title: "Health Examination", desc: "Complete a health examination through a Bupa Medical Visa Services panel physician.", icon: Stethoscope, duration: "1-2 weeks" },
    { title: "Submit Visa Application (500)", desc: "Apply online through ImmiAccount for a Student Visa (subclass 500).", icon: Building2, duration: "1 day" },
    { title: "Visa Decision", desc: "Processing time varies by nationality. Most applicants receive a decision within 4-6 weeks.", icon: CheckCircle2, duration: "4-6 weeks" },
    { title: "Fly to Australia", desc: "Arrive up to 90 days before your course start date.", icon: Plane, duration: "—" },
  ],
  Canada: [
    { title: "Receive Letter of Acceptance", desc: "Get your acceptance from a Designated Learning Institution (DLI).", icon: FileText, duration: "1-4 weeks" },
    { title: "Financial Proof", desc: "Show you have CAD $20,635 + first year tuition available.", icon: Banknote, duration: "—" },
    { title: "Medical Exam", desc: "Complete an immigration medical exam with a panel physician if required.", icon: Stethoscope, duration: "1-2 weeks" },
    { title: "Submit Study Permit Application", desc: "Apply online via IRCC portal. Include biometrics fee.", icon: Building2, duration: "1 day" },
    { title: "Biometrics & Decision", desc: "Provide biometrics at a local VAC and await processing.", icon: CheckCircle2, duration: "4-12 weeks" },
    { title: "Travel to Canada", desc: "Bring your port of entry letter and CoE to obtain your study permit upon arrival.", icon: Plane, duration: "—" },
  ],
};

export default function VisaGuide() {
  const [selected, setSelected] = useState("Malaysia");
  const steps = visaSteps[selected] || [];

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">
        <section className="intro-surface py-16">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-[#ffa300]" />
            <h1 className="text-4xl font-extrabold mb-3">Interactive Visa Guide</h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Follow our step-by-step visa tracker for your destination country.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-center mb-10">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-full max-w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.flag_icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vertical Stepper */}
          <div className="max-w-2xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                {/* Line */}
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-[#ffa300]/10 flex items-center justify-center border-2 border-[#ffa300]">
                    <step.icon className="h-5 w-5 text-[#ffa300]" />
                  </div>
                  {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                </div>
                {/* Content */}
                <Card className="mb-4 flex-1">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm">Step {i + 1}: {step.title}</h3>
                      <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
