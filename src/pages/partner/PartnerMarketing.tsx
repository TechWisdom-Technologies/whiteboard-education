import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  File,
  Search,
  ExternalLink,
  Loader2,
  FolderDown,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PartnerDoc {
  id: string | number;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | string;
  description?: string;
  created_at?: string;
}

const DEFAULT_DOCS: PartnerDoc[] = [
  {
    id: "seed-1",
    title: "2026 Malaysia University Admissions & Study Guide",
    file_type: "pdf",
    file_size: 4.2,
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Complete guide on university intakes, tuition fees, and admission requirements.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "seed-2",
    title: "Partner Commission Structure & Intake Deadlines",
    file_type: "excel",
    file_size: 1.85,
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Detailed partner payout tiers and application deadlines across all institutions.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "seed-3",
    title: "Student Visa Application Checklist (EMGS Guidelines)",
    file_type: "word",
    file_size: 2.1,
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    description: "Mandatory document checklist for student pass clearance in Malaysia.",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "seed-4",
    title: "Whiteboard Education Official Partner Branding Pack",
    file_type: "image",
    file_size: 8.5,
    file_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
    description: "High-resolution logos, banners, and co-branding templates for agencies.",
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
];

export default function PartnerMarketing() {
  const [documents, setDocuments] = useState<PartnerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PartnerDoc | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from as any)("partner_documents")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setDocuments(data);
      } else {
        // Fallback to default documents
        setDocuments(DEFAULT_DOCS);
      }
    } catch {
      setDocuments(DEFAULT_DOCS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getFileIcon = (fileType: string) => {
    const t = (fileType || "").toLowerCase();
    if (t === "pdf") {
      return (
        <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (t === "excel" || t === "csv" || t === "spreadsheet") {
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
      );
    }
    if (t === "word" || t === "doc" || t === "docx") {
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-700">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (t === "image" || t === "png" || t === "jpg" || t === "jpeg") {
      return (
        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
          <ImageIcon className="w-5 h-5" />
        </div>
      );
    }
    if (t === "zip" || t === "rar" || t === "archive") {
      return (
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
          <FileArchive className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
        <File className="w-5 h-5" />
      </div>
    );
  };

  const getBadgeStyle = (fileType: string) => {
    const t = (fileType || "").toLowerCase();
    if (t === "pdf") return "bg-rose-50 text-rose-700 border-rose-200";
    if (t === "excel") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (t === "word") return "bg-blue-50 text-blue-700 border-blue-200";
    if (t === "image") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (t === "zip") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const handleDownload = (doc: PartnerDoc) => {
    if (!doc.file_url) {
      return toast.error("File URL is not available");
    }
    toast.success(`Downloading ${doc.title}...`);
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.target = "_blank";
    link.download = doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in p-2 sm:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Documents</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Official partner resources, university brochures, visa guides, and commission files
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="pl-9 h-10 bg-white border-slate-200 text-xs rounded-xl focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 focus:caret-[#2F4F97]"
          />
        </div>
      </div>

      {/* Documents Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#2F4F97]" />
            <p className="text-sm font-medium">Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <FolderDown className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No documents found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try adjusting your search keywords." : "No documents are available at the moment."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary border-b border-primary/20">
                <TableRow className="hover:bg-primary border-none">
                  <TableHead className="w-[45%] text-xs font-semibold text-white uppercase tracking-wider pl-6 py-3.5">
                    Document
                  </TableHead>
                  <TableHead className="w-[15%] text-xs font-semibold text-white uppercase tracking-wider py-3.5">
                    Type
                  </TableHead>
                  <TableHead className="w-[15%] text-xs font-semibold text-white uppercase tracking-wider py-3.5">
                    File Size
                  </TableHead>
                  <TableHead className="w-[25%] text-xs font-semibold text-white uppercase tracking-wider text-right pr-6 py-3.5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Document Name & Icon */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3.5">
                        {getFileIcon(doc.file_type)}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1E293B] group-hover:text-[#2F4F97] transition-colors truncate">
                            {doc.title}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* File Type Badge */}
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 ${getBadgeStyle(
                          doc.file_type
                        )}`}
                      >
                        {doc.file_type || "File"}
                      </Badge>
                    </TableCell>

                    {/* File Size in MB */}
                    <TableCell className="py-4">
                      <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                        {typeof doc.file_size === "number" ? doc.file_size.toFixed(2) : doc.file_size} MB
                      </span>
                    </TableCell>

                    {/* Action Buttons: Preview & Download */}
                    <TableCell className="text-right pr-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewDoc(doc)}
                          className="h-8 px-3 text-xs font-medium text-slate-700 hover:text-[#2F4F97] hover:bg-blue-50 border-slate-200 gap-1.5 transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Preview
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="h-8 px-3 text-xs font-medium bg-[#2F4F97] hover:bg-[#243d78] text-white gap-1.5 shadow-xs transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={`text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(
                  previewDoc?.file_type || ""
                )}`}
              >
                {previewDoc?.file_type || "File"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Size: {previewDoc?.file_size} MB
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-[#1E293B]">
              {previewDoc?.title}
            </DialogTitle>
          </DialogHeader>

          {/* Preview Container */}
          <div className="flex-1 min-h-[300px] max-h-[500px] overflow-auto my-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-3">
            {previewDoc?.file_type?.toLowerCase() === "image" ? (
              <img
                src={previewDoc.file_url}
                alt={previewDoc.title}
                className="max-h-[460px] max-w-full object-contain rounded-lg shadow-xs"
              />
            ) : previewDoc?.file_type?.toLowerCase() === "pdf" ? (
              <iframe
                src={previewDoc.file_url}
                title={previewDoc.title}
                className="w-full h-[460px] rounded-lg border-0 bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-3 text-[#2F4F97]">
                  {previewDoc ? getFileIcon(previewDoc.file_type) : <File className="w-8 h-8" />}
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">{previewDoc?.title}</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Direct inline preview is not supported for this file format in your browser. You can open or download the file to inspect it.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc?.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2F4F97] hover:bg-[#243d78] rounded-lg transition-colors"
                  >
                    Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-between items-center gap-2 pt-2 border-t border-slate-100">
            <a
              href={previewDoc?.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#2F4F97] font-medium"
            >
              Open in external window <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDoc(null)}
                className="text-xs"
              >
                Close
              </Button>
              {previewDoc && (
                <Button
                  size="sm"
                  onClick={() => handleDownload(previewDoc)}
                  className="bg-[#2F4F97] hover:bg-[#243d78] text-white text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
