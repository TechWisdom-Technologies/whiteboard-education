import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, UploadCloud, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const DOCUMENT_TYPES = [
  { value: "pdf", label: "PDF Document" },
  { value: "word", label: "Word Document (.docx, .doc)" },
  { value: "excel", label: "Excel Spreadsheet (.xlsx, .csv)" },
  { value: "image", label: "Image (.png, .jpg, .webp)" },
  { value: "zip", label: "ZIP Archive" },
  { value: "other", label: "Other Document" },
];

export default function AdminDocumentForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("partner_documents");
  const updateRow = useUpdateRow("partner_documents");

  const [form, setForm] = useState({
    title: "",
    file_url: "",
    file_type: "pdf",
    file_size: 1.0,
    description: "",
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        file_url: initialData.file_url || "",
        file_type: initialData.file_type || "pdf",
        file_size: typeof initialData.file_size === "number" ? initialData.file_size : parseFloat(initialData.file_size) || 1.0,
        description: initialData.description || "",
        is_active: initialData.is_active !== false,
      });
    }
  }, [initialData]);

  const detectFileType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
    if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return "image";
    if (["zip", "rar", "7z", "tar"].includes(ext)) return "zip";
    return "other";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guard: max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return toast.error("File size cannot exceed 50 MB");
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const storagePath = `partner-documents/${Date.now()}_${cleanName}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("universities")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("universities")
        .getPublicUrl(storagePath);

      const detectedType = detectFileType(file.name);
      const sizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2)) || 0.1;

      setForm((prev) => ({
        ...prev,
        file_url: data.publicUrl,
        file_type: detectedType,
        file_size: sizeMB,
        title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, ""),
      }));

      toast.success("File uploaded successfully");
    } catch (err: any) {
      console.error("File upload error:", err);
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      return toast.error("Please enter a document title");
    }
    if (!form.file_url.trim()) {
      return toast.error("Please upload a file or provide a document file URL");
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        file_url: form.file_url.trim(),
        file_type: form.file_type,
        file_size: Number(form.file_size) || 1.0,
        description: form.description.trim(),
        is_active: form.is_active,
      };

      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Document updated successfully");
      } else {
        await insertRow.mutateAsync(payload);
        toast.success("Document added successfully");
      }
      onSuccess();
    } catch (err: any) {
      console.error("Save document error:", err);
      toast.error(err.message || "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full max-w-5xl mx-auto my-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-[#1E293B]">
            {isEditing ? "Edit Partner Document" : "Upload New Partner Document"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving || uploading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              isEditing ? "Update Document" : "Upload Document"
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* File Upload Zone */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">
                Document File <span className="text-red-500">*</span>
              </Label>
              
              <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-6 text-center transition-colors bg-slate-50/60">
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.zip"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                    <p className="text-sm font-medium text-slate-700">Uploading document to storage...</p>
                    <p className="text-xs text-muted-foreground">Please wait a moment while the file uploads</p>
                  </div>
                ) : form.file_url ? (
                  <div className="flex flex-col items-center justify-center py-3 gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-lg">{form.title || "File Ready"}</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wider bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded">
                          {form.file_type}
                        </span>
                        <span>•</span>
                        <span>{form.file_size} MB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <label
                        htmlFor="doc-upload"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        Replace File
                      </label>
                      <a
                        href={form.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview File
                      </a>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="doc-upload" className="flex flex-col items-center justify-center py-6 cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center mb-2 transition-colors">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to browse or drag and drop file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF, Word, Excel, Images, and ZIP archives (up to 50MB)
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">
                Document Title / Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. 2026 Malaysia University Admissions & Study Guide"
              />
            </div>

            {/* File Type */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">File Type / Format</Label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700"
                value={form.file_type}
                onChange={(e) => setForm(prev => ({ ...prev, file_type: e.target.value }))}
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Size */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">File Size (in MB)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={form.file_size}
                onChange={(e) => setForm(prev => ({ ...prev, file_size: parseFloat(e.target.value) || 0.1 }))}
                placeholder="e.g. 4.2"
              />
            </div>

            {/* Visibility Status */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Visibility Status</Label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700"
                value={form.is_active ? "active" : "draft"}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.value === "active" }))}
              >
                <option value="active">Published & Visible</option>
                <option value="draft">Draft / Hidden</option>
              </select>
            </div>

            {/* Direct File URL */}
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">
                Direct File URL <span className="text-xs text-muted-foreground font-normal">(Auto-filled or External)</span>
              </Label>
              <Input
                value={form.file_url}
                onChange={(e) => setForm(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://..."
                className="font-mono text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold text-gray-700">
                  Description / Guidance <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <span className="text-xs text-muted-foreground">Displayed alongside the document download</span>
              </div>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief information, guidance notes, or instructions regarding this document..."
                rows={4}
                className="bg-gray-50 rounded-xl resize-y"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
