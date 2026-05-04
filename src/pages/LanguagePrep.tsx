import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const packages = [
  {
    name: "Starter",
    price: 99,
    period: "one-time",
    features: ["5 practice tests", "Basic vocabulary builder", "Email support", "Score prediction tool"],
    popular: false,
  },
  {
    name: "Pro",
    price: 249,
    period: "3 months",
    features: ["Unlimited practice tests", "1-on-1 tutoring (4 sessions)", "Writing correction (10 essays)", "Score prediction tool", "Speaking mock tests", "Priority support"],
    popular: true,
  },
  {
    name: "Premium",
    price: 499,
    period: "6 months",
    features: ["Everything in Pro", "1-on-1 tutoring (12 sessions)", "Unlimited writing corrections", "Guaranteed band improvement", "Dedicated study planner", "University application review"],
    popular: false,
  },
];

export default function LanguagePrep() {
  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">
        {/* Hero */}
        <section className="intro-surface py-20">
          <div className="container mx-auto px-4 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-[#ffa300]" />
            <h1 className="text-4xl font-extrabold mb-3">IELTS & TOEFL Preparation</h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">Get the score you need with expert tutoring and unlimited practice tests.</p>
            <Button size="lg" className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90">
              <Zap className="h-4 w-4 mr-2" /> Take a Free Mock Test
            </Button>
          </div>
        </section>

        {/* Stats */}
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Students Trained", value: "5,000+" },
              { label: "Avg Score Improvement", value: "+1.5 Band" },
              { label: "Pass Rate", value: "96%" },
              { label: "Expert Tutors", value: "25+" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5 text-center">
                  <p className="text-2xl font-extrabold text-[#ffa300]">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-extrabold text-center mb-10">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.name} className={`relative ${pkg.popular ? "border-[#ffa300] shadow-lg scale-105" : ""}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-[#181d29]"><Star className="h-3 w-3 mr-1" />Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{pkg.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-extrabold">${pkg.price}</span>
                    <span className="text-sm text-muted-foreground">/{pkg.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pkg.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <Button className={`w-full mt-4 ${pkg.popular ? "bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" : ""}`} variant={pkg.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-[#ffa300]/10 py-12">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-xl font-bold mb-3">Not sure about your current level?</h3>
            <p className="text-muted-foreground mb-6">Take our free 15-minute diagnostic test and get an estimated IELTS band score.</p>
            <Button size="lg" className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90">Take Free Mock Test</Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
