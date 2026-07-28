import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image, BookOpen } from "lucide-react";
import { toast } from "sonner";

const marketingAssets = [
  { id: 1, title: "2026 Malaysia Study Guide", type: "PDF", size: "4.2 MB", icon: FileText, color: "text-destructive bg-destructive/10" },
  { id: 2, title: "Social Media Banners Pack", type: "ZIP", size: "18 MB", icon: Image, color: "text-[#2F4F97] bg-[#2F4F97]/10" },
  { id: 3, title: "University Prospectuses Bundle", type: "PDF", size: "32 MB", icon: BookOpen, color: "text-primary bg-primary/10" },
  { id: 4, title: "Partner Co-Branding Kit", type: "ZIP", size: "8.5 MB", icon: Image, color: "text-success bg-success/10" },
  { id: 5, title: "Email Templates Collection", type: "ZIP", size: "1.2 MB", icon: FileText, color: "text-warning bg-warning/10" },
  { id: 6, title: "Student Testimonial Videos", type: "ZIP", size: "120 MB", icon: BookOpen, color: "text-[#2F4F97] bg-[#2F4F97]/10" },
];

export default function PartnerMarketing() {

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Downloadable Assets */}
      <div>
        <h2 className="text-[12px] font-normal mb-4">Downloadable Assets</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketingAssets.map((asset, i) => (
            <Card key={asset.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${asset.color}`}>
                    <asset.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[12px]">{asset.type}</Badge>
                </div>
                <h3 className="font-normal text-[12px] mb-1">{asset.title}</h3>
                <p className="text-[12px] text-muted-foreground mb-4">{asset.size}</p>
                <Button variant="outline" size="sm" className="w-full gap-1.5 group-hover:bg-[#2F4F97]/10 group-hover:text-[#2F4F97] group-hover:border-[#2F4F97]/30 transition-colors" onClick={() => toast.success(`${asset.title} downloaded!`)}>
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
