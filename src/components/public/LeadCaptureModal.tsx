import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCourse?: string;
  defaultUniversity?: string;
  source?: string;
}

export function LeadCaptureModal({ open, onOpenChange, defaultCourse = "", defaultUniversity = "", source = "website" }: LeadCaptureModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    nationality: "",
    interested_course: defaultCourse,
    interested_university: defaultUniversity,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setLoading(true);
    const leadData = {
      ...form,
      source,
      status: "new",
    };
    const { error } = await supabase.from("leads" as any).insert(leadData);
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Lead insert error:", error);
      return;
    }
    setSuccess(true);
    toast.success("Application submitted! We'll contact you soon.");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSuccess(false);
      setForm({ full_name: "", email: "", phone: "", nationality: "", interested_course: defaultCourse, interested_university: defaultUniversity });
    }, 300);
  };

  const nationalities = ["Bangladeshi", "Indian", "Pakistani", "Nigerian", "Indonesian", "Sri Lankan", "Nepalese", "Vietnamese", "Chinese", "Other"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-[#ffa300]/15 flex items-center justify-center" style={{ borderRadius: "50%" }}>
              <CheckCircle className="h-8 w-8 text-[#ffa300]" />
            </div>
            <DialogTitle className="text-xl">Application Received!</DialogTitle>
            <p className="text-muted-foreground text-sm">Our team will review your details and reach out within 24 hours.</p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Apply Now</DialogTitle>
              <DialogDescription>Fill in your details and our team will get in touch with you.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Full Name *</Label>
                <Input id="lead-name" placeholder="Your full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-email">Email *</Label>
                <Input id="lead-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required maxLength={255} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input id="lead-phone" placeholder="+880..." value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Select value={form.nationality} onValueChange={(v) => setForm((f) => ({ ...f, nationality: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {nationalities.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(defaultCourse || defaultUniversity) && (
                <div className="bg-muted/50 p-3 text-sm text-muted-foreground">
                  {defaultCourse && <p><span className="font-medium text-foreground">Course:</span> {defaultCourse}</p>}
                  {defaultUniversity && <p><span className="font-medium text-foreground">University:</span> {defaultUniversity}</p>}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full h-11 font-bold" style={{ backgroundColor: "#ffa300", color: "#181d29", borderRadius: "5px" }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Application
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
