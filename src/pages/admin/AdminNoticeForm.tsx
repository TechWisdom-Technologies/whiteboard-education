import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Megaphone } from "lucide-react";
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
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onCancel} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {isEditing ? "Edit Notice or Update" : "Publish New Update or Notice"}
          </h1>
          <p className="text-sm text-muted-foreground">
            This will appear in the "Recent Updates & Notices" section on the partner portal.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-800">
            Notice / Update Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Special 30% Merit Scholarship Available for Fall Intake"
            className="text-sm"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">Category / Type</Label>
            <Select
              value={form.category}
              onValueChange={(val) => setForm({ ...form, category: val })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select category" />
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

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-800">Active Status</Label>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <span className="text-sm font-medium text-slate-700">
                {form.is_active ? "Published & Visible" : "Draft / Hidden"}
              </span>
            </div>
          </div>
        </div>

        {/* Content (Detailed description shown in popup) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-800">
              Notice Details / Message <span className="text-red-500">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">Appears in popup when clicked</span>
          </div>
          <Textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write the full announcement, terms, eligibility, or update details..."
            rows={6}
            className="text-sm leading-relaxed"
          />
        </div>

        {/* Optional Link URL */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-800">
            Action / Reference Link <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            placeholder="https://example.com/scholarship-details or /courses"
            className="text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            If provided, a "Learn More" or external link button will appear in the popup dialog.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2F4F97] hover:bg-[#243d78] text-white flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            {isEditing ? "Save Changes" : "Publish Notice"}
          </Button>
        </div>
      </div>
    </div>
  );
}

