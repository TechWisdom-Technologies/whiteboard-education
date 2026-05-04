import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plane, FileText, Shirt, Banknote, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";

const sections = [
  {
    title: "Documents",
    icon: FileText,
    items: [
      "Passport (valid 18+ months)",
      "University offer letter",
      "Visa approval letter",
      "Flight tickets",
      "Medical report",
      "Passport-sized photos (10 copies)",
      "Academic transcripts (certified)",
      "Insurance certificate",
    ],
  },
  {
    title: "Packing",
    icon: Shirt,
    items: [
      "Weather-appropriate clothing",
      "Formal wear (1-2 sets)",
      "Power adapter/converter",
      "Laptop & charger",
      "Toiletries (travel-size)",
      "Medications (with prescription)",
      "Bedding (if not provided)",
      "Small first-aid kit",
    ],
  },
  {
    title: "Finance",
    icon: Banknote,
    items: [
      "Open local bank account info",
      "Carry some local currency",
      "International debit/credit card",
      "Budget spreadsheet ready",
      "Scholarship disbursement confirmed",
      "Emergency fund accessible",
    ],
  },
];

export default function PreDeparture() {
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = Math.round((checked.size / totalItems) * 100);

  useEffect(() => {
    if (progress === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [progress]);

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">
        <section className="intro-surface py-16">
          <div className="container mx-auto px-4 text-center">
            <Plane className="h-12 w-12 mx-auto mb-4 text-[#ffa300]" />
            <h1 className="text-4xl font-extrabold mb-3">Pre-Departure Checklist</h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Track everything you need before your flight. Complete all items to be 100% ready!</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* Progress */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Your Progress</span>
                <span className="text-2xl font-extrabold text-[#ffa300]">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">{checked.size} of {totalItems} items completed</p>
            </CardContent>
          </Card>

          {/* Confetti */}
          {showConfetti && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="text-center animate-scale-in">
                <PartyPopper className="h-20 w-20 text-[#ffa300] mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-primary">You're All Set! 🎉</h2>
                <p className="text-muted-foreground mt-2">Have a safe and exciting journey!</p>
              </div>
            </div>
          )}

          {/* Checklist Sections */}
          <div className="space-y-6">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <section.icon className="h-5 w-5 text-[#ffa300]" />
                    {section.title}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {section.items.filter((i) => checked.has(i)).length}/{section.items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox checked={checked.has(item)} onCheckedChange={() => toggle(item)} />
                      <span className={`text-sm transition-colors ${checked.has(item) ? "line-through text-muted-foreground" : "group-hover:text-primary"}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
