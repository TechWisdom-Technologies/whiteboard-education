import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const NOTICE_CATEGORIES = [
  "Offer",
  "Crucial Update",
  "Notice",
  "Update",
  "Deadline",
];

export default function AdminNoticeForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("partner_notices");
  const updateRow = useUpdateRow("partner_notices");

  const [form, setForm] = useState({
    title: "",
    category: "Update",
    content: "",
    link_url: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        category: initialData.category || "Update",
        content: initialData.content || "",
        link_url: initialData.link_url || "",
        is_active: initialData.is_active !== false,
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      return toast.error("Please enter a notice title");
    }
    if (!form.content.trim()) {
      return toast.error("Please enter the content / details for this notice");
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Notice updated successfully");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Notice published successfully");
      }
      onSuccess();
    } catch (err: any) {
      console.error("Save notice error:", err);
      toast.error(err.message || "Failed to save notice");
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
            {isEditing ? "Edit Notice or Update" : "Publish New Update or Notice"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              isEditing ? "Update Notice" : "Publish Notice"
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">
                Notice / Update Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Special 30% Merit Scholarship Available for Fall Intake"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Category / Type</Label>
              <Select
                value={form.category || undefined}
                onValueChange={(val) => setForm(prev => ({ ...prev, category: val }))}
                modal={false}
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700">
                  <SelectValue placeholder="Select Category..." />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Visibility Status</Label>
              <Select
                value={form.is_active ? "active" : "draft"}
                onValueChange={(val) => setForm(prev => ({ ...prev, is_active: val === "active" }))}
                modal={false}
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Published & Visible</SelectItem>
                  <SelectItem value="draft">Draft / Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">
                Action / Reference Link <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                value={form.link_url}
                onChange={(e) => setForm(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com/scholarship-details or /courses"
              />
              <p className="text-[11px] text-muted-foreground">
                If provided, partners will see a "Learn More" / external link button in the notice dialog.
              </p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold text-gray-700">
                  Notice Details / Message <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">Appears in popup when clicked</span>
              </div>
              <Textarea
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write the full announcement, terms, eligibility, or update details..."
                rows={6}
                className="bg-gray-50 rounded-xl resize-y"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
