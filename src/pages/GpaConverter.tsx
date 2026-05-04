import { useState } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ArrowRight } from "lucide-react";

const scales = [
  { label: "US 4.0 Scale", value: "us", max: 4.0 },
  { label: "UK Percentage (0-100)", value: "uk", max: 100 },
  { label: "Australian 7.0 Scale", value: "au", max: 7.0 },
  { label: "Indian 10.0 Scale", value: "in", max: 10.0 },
];

function convertToMalaysian4(value: number, fromScale: string): number | null {
  if (fromScale === "us") return Math.min(value, 4.0);
  if (fromScale === "uk") return Math.min((value / 100) * 4.0, 4.0);
  if (fromScale === "au") return Math.min((value / 7.0) * 4.0, 4.0);
  if (fromScale === "in") return Math.min((value / 10.0) * 4.0, 4.0);
  return null;
}

export default function GpaConverter() {
  const [fromScale, setFromScale] = useState("us");
  const [gpa, setGpa] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const handleConvert = () => {
    const num = parseFloat(gpa);
    if (isNaN(num)) return;
    setResult(convertToMalaysian4(num, fromScale));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MegaMenu />

      <section className="intro-surface py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-[#ffa300]/15 text-[#181d29] mb-3">
                <RefreshCw className="h-3 w-3 mr-1" /> Free Tool
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2">GPA Converter</h1>
              <p className="text-primary-foreground/80 max-w-md">Convert your GPA to the Malaysian 4.0 scale used by universities.</p>
            </div>

            <div className="rounded-md overflow-hidden border border-primary-foreground/20 shadow-xl bg-primary-foreground/5">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1100&h=700&fit=crop"
                alt="Student reviewing grades"
                className="w-full h-56 md:h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-lg">

          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your Grading System</label>
                <Select value={fromScale} onValueChange={setFromScale}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {scales.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Your GPA / Score</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.5"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                />
              </div>
              <Button className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" onClick={handleConvert}>
                Convert <ArrowRight className="h-4 w-4 ml-1" />
              </Button>

              {result !== null && (
                <div className="text-center p-6 bg-muted/50 rounded-md animate-fade-in">
                  <p className="text-sm text-muted-foreground mb-1">Malaysian 4.0 Scale Equivalent</p>
                  <p className="text-4xl font-extrabold text-[#ffa300]">{result.toFixed(2)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="flex-1" />
      <PublicFooter />
    </div>
  );
}
