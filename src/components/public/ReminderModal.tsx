import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universityName: string;
  intakeLabel: string;
  deadlineDate: string;
}

export function ReminderModal({ open, onOpenChange, universityName, intakeLabel, deadlineDate }: ReminderModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("leads" as any).insert({
      full_name: form.full_name,
      email: form.email,
      interested_university: universityName,
      interested_course: `${intakeLabel} reminder (${deadlineDate})`,
      source: "intake_calendar_set_reminder",
      status: "new",
    });

    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    toast.success("Reminder request submitted! We'll notify you.");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSuccess(false);
      setForm({ full_name: "", email: "" });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-sm bg-[#ffa300]/15 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[#ffa300]" />
            </div>
            <DialogTitle className="text-xl">Reminder Requested!</DialogTitle>
            <p className="text-muted-foreground text-sm">Thanks! We captured your lead and our team will follow up for the <strong>{universityName}</strong> {intakeLabel} deadline.</p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-[#ffa300]" /> Set Deadline Reminder</DialogTitle>
              <DialogDescription>Share your name and email for {universityName} - {intakeLabel} intake (deadline: {deadlineDate}).</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="rem-name">Your Name *</Label>
                <Input id="rem-name" placeholder="Your name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rem-email">Email *</Label>
                <Input id="rem-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required maxLength={255} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 h-11 font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                Submit Reminder Request
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
