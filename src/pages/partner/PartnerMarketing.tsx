import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Copy, FileText, Image, BookOpen, Link2 } from "lucide-react";
import { toast } from "sonner";

const marketingAssets = [
  { id: 1, title: "2026 Malaysia Study Guide", type: "PDF", size: "4.2 MB", icon: FileText, color: "text-destructive bg-destructive/10" },
  { id: 2, title: "Social Media Banners Pack", type: "ZIP", size: "18 MB", icon: Image, color: "text-[#ffa300] bg-[#ffa300]/10" },
  { id: 3, title: "University Prospectuses Bundle", type: "PDF", size: "32 MB", icon: BookOpen, color: "text-primary bg-primary/10" },
  { id: 4, title: "Partner Co-Branding Kit", type: "ZIP", size: "8.5 MB", icon: Image, color: "text-success bg-success/10" },
  { id: 5, title: "Email Templates Collection", type: "ZIP", size: "1.2 MB", icon: FileText, color: "text-warning bg-warning/10" },
  { id: 6, title: "Student Testimonial Videos", type: "ZIP", size: "120 MB", icon: BookOpen, color: "text-[#ffa300] bg-[#ffa300]/10" },
];

const REFERRAL_LINK = "https://your-uni.com/apply?ref=AGENCY123";

export default function PartnerMarketing() {
  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    toast.success("Copied to clipboard!", { description: "Your referral link has been copied." });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold">Marketing & Resource Hub</h1>
        <p className="text-muted-foreground text-sm">Download marketing materials and track your referral link</p>
      </div>

      {/* Referral Link */}
      <Card className="border-[#ffa300]/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-[#ffa300]" />
            <h3 className="font-bold">Your Unique Referral Link</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Share this link to track organic leads from your network. All students who apply through this link will be automatically attributed to your agency.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input value={REFERRAL_LINK} readOnly className="flex-1 font-mono text-sm bg-muted/50" />
            <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 gap-1.5 w-full sm:w-auto" onClick={copyLink}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-sm">
              <p className="text-lg font-extrabold">247</p>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-sm">
              <p className="text-lg font-extrabold">38</p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-sm">
              <p className="text-lg font-extrabold">15.4%</p>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloadable Assets */}
      <div>
        <h2 className="text-lg font-bold mb-4">Downloadable Assets</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketingAssets.map((asset, i) => (
            <Card key={asset.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-sm flex items-center justify-center ${asset.color}`}>
                    <asset.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">{asset.type}</Badge>
                </div>
                <h3 className="font-bold text-sm mb-1">{asset.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{asset.size}</p>
                <Button variant="outline" size="sm" className="w-full gap-1.5 group-hover:bg-[#ffa300]/10 group-hover:text-[#ffa300] group-hover:border-[#ffa300]/30 transition-colors" onClick={() => toast.success(`${asset.title} downloaded!`)}>
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
