import { useState, useEffect } from "react";
import { intakeDeadlines, universities } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell } from "lucide-react";
import { ReminderModal } from "@/components/public/ReminderModal";

function getDaysLeft(deadline: string): number {
  const now = new Date();
  const d = new Date(deadline);
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getUrgencyClass(days: number): string {
  if (days <= 14) return "bg-destructive/10 text-destructive border-destructive/20";
  if (days <= 60) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

const semesterColors: Record<string, string> = {
  Fall: "bg-[#ffa300]/10 text-[#ffa300]",
  Spring: "bg-success/10 text-success",
  Summer: "bg-warning/10 text-warning",
};

export function IntakeCalendar() {
  const [, setTick] = useState(0);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const sorted = [...intakeDeadlines].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const handleReminder = (deadline: typeof intakeDeadlines[0]) => {
    const uni = universities.find((u) => u.id === deadline.university_id);
    setSelectedDeadline({
      universityName: uni?.name || "University",
      intakeLabel: deadline.intake,
      deadlineDate: new Date(deadline.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    });
    setReminderOpen(true);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge className="bg-[#ffa300]/10 text-[#ffa300] mb-3"><Calendar className="h-3 w-3 mr-1" /> Upcoming Deadlines</Badge>
          <h2 className="text-3xl font-extrabold mb-2">Intake & Application Deadlines</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Don't miss your chance - apply before these deadlines close</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((d, i) => {
            const uni = universities.find((u) => u.id === d.university_id);
            const days = getDaysLeft(d.deadline);
            return (
              <Card key={d.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className={semesterColors[d.semester]}>{d.semester}</Badge>
                    <Badge variant="outline" className={getUrgencyClass(days)}>
                      <Clock className="h-3 w-3 mr-1" />
                      {days === 0 ? "Today!" : `${days} days left`}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{uni?.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{d.intake} Intake</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Deadline: {new Date(d.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 hover:bg-[#ffa300]/10 hover:text-[#ffa300] hover:border-[#ffa300]/30 transition-colors" onClick={() => handleReminder(d)}>
                    <Bell className="h-3.5 w-3.5" /> Set Reminder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedDeadline && (
        <ReminderModal
          open={reminderOpen}
          onOpenChange={setReminderOpen}
          universityName={selectedDeadline.universityName}
          intakeLabel={selectedDeadline.intakeLabel}
          deadlineDate={selectedDeadline.deadlineDate}
        />
      )}
    </section>
  );
}
