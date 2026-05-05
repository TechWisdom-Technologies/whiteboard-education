import { useState } from "react";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";
import { universities, courses } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, GraduationCap, Trophy, CheckCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const qualifications = ["High School Diploma", "Diploma", "Bachelor's Degree", "Master's Degree"];
const englishTests = ["IELTS", "TOEFL"];

interface WizardData {
  qualification: string;
  gpa: string;
  englishTest: string;
  englishScore: string;
  budget: number[];
}

function getChance(gpa: number, score: number, uniRanking: number): "High" | "Medium" | "Low" {
  const combined = gpa * 10 + score * 5 - uniRanking * 0.05;
  if (combined > 90) return "High";
  if (combined > 60) return "Medium";
  return "Low";
}

const chanceColors = {
  High: "bg-success/10 text-success border-success/20",
  Medium: "bg-[#ffa300]/10 text-[#ffa300] border-[#ffa300]/20",
  Low: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function EligibilityWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    qualification: "",
    gpa: "",
    englishTest: "",
    englishScore: "",
    budget: [20000],
  });
  const totalSteps = 4;

  const canNext = () => {
    if (step === 1) return !!data.qualification;
    if (step === 2) return !!data.gpa && Number(data.gpa) > 0;
    if (step === 3) return !!data.englishTest && !!data.englishScore;
    return true;
  };

  const filteredResults = () => {
    const budget = data.budget[0];
    const gpa = parseFloat(data.gpa) || 0;
    const score = parseFloat(data.englishScore) || 0;

    let degreeLevels: string[] = [];
    if (data.qualification === "High School Diploma") degreeLevels = ["Diploma", "Bachelor"];
    else if (data.qualification === "Diploma") degreeLevels = ["Bachelor"];
    else if (data.qualification === "Bachelor's Degree") degreeLevels = ["Master"];
    else degreeLevels = ["PhD", "Master"];

    const matchedCourses = courses.filter(
      (c) => degreeLevels.includes(c.degree_level) && c.tuition_fee <= budget
    );

    const uniIds = [...new Set(matchedCourses.map((c) => c.university_id))];
    return uniIds
      .map((uid) => {
        const uni = universities.find((u) => u.id === uid)!;
        const uniCourses = matchedCourses.filter((c) => c.university_id === uid);
        const chance = getChance(gpa, score, uni.ranking);
        return { uni, courses: uniCourses, chance };
      })
      .sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.chance] - order[b.chance];
      });
  };

  const showResults = step === 5;

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1 bg-muted/30">
        <div className="intro-surface py-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 text-[#ffa300]" />
          <h1 className="text-3xl font-extrabold mb-2">University Match & Eligibility Test</h1>
          <p className="text-primary-foreground/70">Answer a few questions and we'll find the best universities for you</p>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-2xl">
          {!showResults && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>
          )}

          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>What is your highest qualification?</CardTitle></CardHeader>
              <CardContent>
                <Select value={data.qualification} onValueChange={(v) => setData({ ...data, qualification: v })}>
                  <SelectTrigger><SelectValue placeholder="Select qualification..." /></SelectTrigger>
                  <SelectContent>
                    {qualifications.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>What is your GPA / Academic Percentage?</CardTitle></CardHeader>
              <CardContent>
                <Label>Enter GPA (out of 4.0) or percentage</Label>
                <Input type="number" step="0.1" min="0" max="100" placeholder="e.g. 3.5" value={data.gpa} onChange={(e) => setData({ ...data, gpa: e.target.value })} className="mt-2" />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>Do you have an English Proficiency Test?</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Type</Label>
                  <Select value={data.englishTest} onValueChange={(v) => setData({ ...data, englishTest: v })}>
                    <SelectTrigger><SelectValue placeholder="Select test..." /></SelectTrigger>
                    <SelectContent>
                      {englishTests.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Score</Label>
                  <Input type="number" step="0.5" placeholder={data.englishTest === "TOEFL" ? "e.g. 100" : "e.g. 7.0"} value={data.englishScore} onChange={(e) => setData({ ...data, englishScore: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader><CardTitle>What is your budget per year? (USD)</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-[#ffa300] text-center mb-6">${data.budget[0].toLocaleString()}</div>
                <Slider value={data.budget} onValueChange={(v) => setData({ ...data, budget: v })} min={5000} max={50000} step={1000} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>$5,000</span><span>$50,000</span>
                </div>
              </CardContent>
            </Card>
          )}

          {showResults && (
            <div>
              <h2 className="text-2xl font-extrabold mb-6 text-center">Your Results</h2>
              {filteredResults().length === 0 ? (
                <Card><CardContent className="p-10 text-center text-muted-foreground">No matching universities found. Try adjusting your criteria.</CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {filteredResults().map(({ uni, courses: matchedCourses, chance }) => {
                    return (
                      <Card key={uni.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Link to={`/university/${uni.id}`} className="font-bold text-lg hover:text-[#ffa300] transition-colors">{uni.name}</Link>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5" /> {uni.city}, Malaysia
                                <Trophy className="h-3.5 w-3.5 ml-2" /> #{uni.ranking}
                              </div>
                            </div>
                            <Badge variant="outline" className={chanceColors[chance]}>
                              <CheckCircle className="h-3 w-3 mr-1" /> {chance} Chance
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-1.5">
                            {matchedCourses.slice(0, 3).map((c) => (
                              <div key={c.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-sm px-3 py-2">
                                <span>{c.title} <Badge variant="outline" className="ml-2 text-xs">{c.degree_level}</Badge></span>
                                <span className="font-semibold text-[#ffa300]">${c.tuition_fee.toLocaleString()}/yr</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              <div className="text-center mt-8">
                <Button variant="outline" onClick={() => { setStep(1); setData({ qualification: "", gpa: "", englishTest: "", englishScore: "", budget: [20000] }); }}>
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {!showResults && (
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90">
                {step === totalSteps ? "See Results" : "Next"} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
