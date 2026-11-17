import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
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
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onCancel} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {isEditing ? "Edit Partner Document" : "Upload Partner Document"}
          </h1>
          <p className="text-sm text-muted-foreground">
            This document will be displayed in the partner portal's Documents section.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* File Upload Zone */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-800">
            Upload Document File <span className="text-red-500">*</span>
          </Label>
          
          <div className="border-2 border-dashed border-slate-200 hover:border-[#2F4F97]/40 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              id="doc-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.zip"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#2F4F97]" />
                <p className="text-sm font-medium text-slate-700">Uploading document to storage...</p>
              </div>
            ) : form.file_url ? (
              <div className="flex flex-col items-center justify-center py-2 gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-md">{form.title || "File Ready"}</p>
                  <p className="text-xs text-muted-foreground">
                    Format: {form.file_type.toUpperCase()} · Size: {form.file_size} MB
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label
                    htmlFor="doc-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2F4F97] bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                  >
                    Replace File
                  </label>
                  <a
                    href={form.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Test Preview
                  </a>
                </div>
              </div>
            ) : (
              <label htmlFor="doc-upload" className="flex flex-col items-center justify-center py-4 cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 text-[#2F4F97] flex items-center justify-center mb-2 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to browse or drop file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, Word, Excel, Images, and ZIP archives (up to 50MB)
                </p>
              </label>
            )}
          </div>
        </div>

        {/* Or direct File URL */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Or paste direct File URL (if hosted elsewhere):
          </Label>
          <Input
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value })}
            placeholder="https://..."
            className="text-xs font-mono"
          />
        </div>

        {/* Document Title */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-800">
            Document Title / Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 2026 Malaysia University Admissions & Study Guide"
            className="text-sm"
          />
        </div>

        {/* File Type & File Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">File Type</Label>
            <Select
              value={form.file_type}
              onValueChange={(val) => setForm({ ...form, file_type: val })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">File Size (in MB)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.file_size}
              onChange={(e) => setForm({ ...form, file_size: parseFloat(e.target.value) || 0.1 })}
              className="text-sm"
              placeholder="e.g. 4.2"
            />
          </div>
        </div>

        {/* Optional Description */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-800">
            Description <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief info or instructions regarding this document..."
            rows={3}
            className="text-sm"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
          />
          <span className="text-sm font-medium text-slate-700">
            {form.is_active ? "Visible to partners on portal" : "Hidden / Inactive"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} disabled={saving || uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-[#2F4F97] hover:bg-[#243d78] text-white flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isEditing ? "Save Changes" : "Save Document"}
          </Button>
        </div>
      </div>
    </div>
  );
}

