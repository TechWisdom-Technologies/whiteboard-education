import { useState } from "react";
import { resources } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  checklist: "bg-[#2F4F97]/10 text-[#2F4F97]",
  guide: "bg-[#F8FAFC] text-[#1E293B]",
  ebook: "bg-[#1E293B]/10 text-[#1E293B]",
};

export function ResourcesSection() {
  const [downloadItem, setDownloadItem] = useState<typeof resources[0] | null>(null);
  const [email, setEmail] = useState("");

  const handleDownload = () => {
    if (!email) return;
    toast.success("Sent!", { description: `"${downloadItem?.title}" has been sent to ${email}.` });
    setDownloadItem(null);
    setEmail("");
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge className="bg-[#2F4F97]/10 text-[#2F4F97] mb-3"><FileText className="h-3 w-3 mr-1" /> Free Resources</Badge>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Poppins', sans-serif", color: "#1E293B" }}>Downloadable Guides & Checklists</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Get expert-curated resources to help you prepare for your study abroad journey</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((r, i) => (
            <Card key={r.id} className="group hover:border-[#2F4F97] transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 100}ms`, borderRadius: "5px" }}>
              <CardContent className="p-6 text-center">
                <span className="text-4xl block mb-4">{r.icon}</span>
                <Badge variant="outline" className={`${typeColors[r.type]} mb-3`}>{r.type}</Badge>
                <h3 className="font-bold text-sm mb-2">{r.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{r.description}</p>
                <Button variant="outline" className="w-full gap-1.5 group-hover:bg-[#2F4F97]/10 group-hover:text-[#2F4F97] group-hover:border-[#2F4F97]/30 transition-colors" onClick={() => setDownloadItem(r)}>
                  <Download className="h-3.5 w-3.5" /> Download Free
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!downloadItem} onOpenChange={(o) => !o && setDownloadItem(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Get Your Free Resource</DialogTitle>
            </DialogHeader>
            {downloadItem && (
              <div className="space-y-4 pt-2">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-2">{downloadItem.icon}</span>
                  <p className="font-bold text-sm">{downloadItem.title}</p>
                </div>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button className="w-full text-white hover:opacity-90" style={{ backgroundColor: "#2F4F97", color: "#1E293B" }} onClick={handleDownload} disabled={!email}>
                  Send to My Email <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
