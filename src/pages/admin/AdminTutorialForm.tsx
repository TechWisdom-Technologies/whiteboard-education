import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AdminTutorialForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("platform_tutorials");
  const updateRow = useUpdateRow("platform_tutorials");

  const [form, setForm] = useState({
    title: "",
    description: "",
    youtube_url: "",
    video_url: "",
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        youtube_url: initialData.youtube_url || "",
        video_url: initialData.video_url || "",
        sort_order: initialData.sort_order || 0,
        is_active: initialData.is_active !== false,
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!form.title) return toast.error("Title is required");
    if (!form.youtube_url) return toast.error("YouTube URL is required");
    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Tutorial updated");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Tutorial created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full max-w-5xl mx-auto my-6">
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onCancel}><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold text-[#1E293B]">{isEditing ? "Edit Tutorial" : "Add New Tutorial"}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? "Update Tutorial" : "Save Tutorial"}</Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. How to use the partner dashboard" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">YouTube URL *</Label>
              <Input value={form.youtube_url} onChange={(e) => setForm(prev => ({ ...prev, youtube_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
              <p className="text-[11px] text-muted-foreground">The video will be embedded on the partner dashboard.</p>
            </div>

            {/* YouTube Preview */}
            {form.youtube_url && (
              <div className="md:col-span-2">
                <Label className="text-[13px] font-semibold text-gray-700 mb-3 block">Preview</Label>
                <div className="aspect-video rounded-xl overflow-hidden border bg-gray-100">
                  <iframe
                    src={form.youtube_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Direct Video URL (Optional)</Label>
              <Input value={form.video_url} onChange={(e) => setForm(prev => ({ ...prev, video_url: e.target.value }))} placeholder="https://example.com/video.mp4" />
              <p className="text-[11px] text-muted-foreground">Alternative direct video link, if applicable.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))} />
              <p className="text-[11px] text-muted-foreground">Lower numbers appear first.</p>
            </div>

            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Status</Label>
              <select className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700" value={form.is_active ? "true" : "false"} onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.value === "true" }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe what this tutorial covers..." rows={4} className="bg-gray-50 rounded-xl resize-y" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
