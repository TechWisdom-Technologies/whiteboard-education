import { useState } from "react";
import { Video, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VideoExpertWidgetProps {
  bannerVisible?: boolean;
}

export function VideoExpertWidget({ bannerVisible = false }: VideoExpertWidgetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const bottomClass = bannerVisible ? "bottom-20" : "bottom-6";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("leads").insert({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        source: "expert_call_widget",
        status: "new",
        interested_course: formData.message || null,
      });
      if (error) throw error;
      toast.success("Request Submitted!", { description: "Our expert will contact you within 24 hours." });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setOpen(false);
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed ${bottomClass} left-6 z-40 group transition-all duration-300`}
        >
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden border-2 border-[#ffa300] rounded-full group-hover:scale-110 transition-transform">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                alt="Expert counselor"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-[#ffa300] rounded-full flex items-center justify-center animate-pulse-soft">
              <Video className="h-2.5 w-2.5 text-[#181d29]" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#181d29] text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              Ask an Expert
            </div>
          </div>
        </button>
      )}

      {open && (
        <div className={`fixed ${bottomClass} left-6 z-40 animate-scale-in`}>
          <Card className="w-80 border border-[#cacdd4]" style={{ borderRadius: "5px" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#ffa300]" />
                  Book a 1-on-1 Call
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Get free expert advice via Zoom</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input placeholder="Your name" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                <Input type="email" placeholder="Email address" required value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                <Input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                <Textarea placeholder="What would you like to discuss?" className="min-h-[60px]" value={formData.message} onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} />
                <Button type="submit" className="w-full font-bold" style={{ backgroundColor: "#ffa300", color: "#181d29", borderRadius: "5px" }} disabled={loading}>
                  <Calendar className="h-4 w-4 mr-2" /> {loading ? "Submitting..." : "Request a Call"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
