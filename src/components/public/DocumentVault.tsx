import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

const documents = [
  { name: "Passport Copy", status: "uploaded", file: "passport_scan.pdf" },
  { name: "Academic Transcripts", status: "uploaded", file: "transcripts.pdf" },
  { name: "Statement of Purpose", status: "pending", file: null },
  { name: "English Test Results", status: "pending", file: null },
  { name: "Recommendation Letters", status: "pending", file: null },
  { name: "Financial Statement", status: "pending", file: null },
];

const statusConfig = {
  uploaded: { icon: CheckCircle, label: "Uploaded", className: "bg-success/10 text-success border-success/20" },
  pending: { icon: Clock, label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
};

export function DocumentVault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#ffa300]" /> Document Vault</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const config = statusConfig[doc.status as keyof typeof statusConfig];
            const Icon = config.icon;
            return (
              <div key={doc.name} className="border border-dashed rounded-sm p-4 hover:border-[#ffa300]/50 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{doc.name}</span>
                  </div>
                  <Badge variant="outline" className={config.className}>
                    <Icon className="h-3 w-3 mr-1" /> {config.label}
                  </Badge>
                </div>
                {doc.status === "pending" ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground/50 group-hover:text-[#ffa300] transition-colors">
                    <Upload className="h-5 w-5 mr-2" />
                    <span className="text-sm">Drag & drop or click to upload</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{doc.file}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
