import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface LeadBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export function LeadBanner({ onVisibilityChange }: LeadBannerProps) {
  const [visible, setVisible] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const dismissed = sessionStorage.getItem("lead-banner-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setVisible(true);
        onVisibilityChange?.(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setVisible(false);
    onVisibilityChange?.(false);
    sessionStorage.setItem("lead-banner-dismissed", "true");
  };

  const handleDownload = () => {
    if (!email) return;
    toast.success("Check your inbox!", { description: "The guide has been sent to your email." });
    setEmailOpen(false);
    dismiss();
    setEmail("");
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-[#181d29] text-white border-t border-[#515768]/30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">📘</span>
              <p className="text-sm font-medium">
                Get the <strong>Ultimate 2026 Guide to Studying in Malaysia</strong> - free!
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" className="gap-1.5" style={{ backgroundColor: "#ffa300", color: "#181d29", borderRadius: "5px" }} onClick={() => setEmailOpen(true)}>
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white h-8 w-8" onClick={dismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Download Free Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Enter your email and we'll send you the complete 2026 Study in Malaysia guide.</p>
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button className="w-full hover:opacity-90" style={{ backgroundColor: "#ffa300", color: "#181d29" }} onClick={handleDownload} disabled={!email}>
              Send Me the Guide <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
