import { useState, useEffect } from "react";
import { useTableData, useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
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

export default function AdminEventForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("events");
  const updateRow = useUpdateRow("events");
  const { data: universities } = useTableData("universities", { orderBy: "name" });

  const [form, setForm] = useState({
    title: "",
    type: "Webinar",
    date: "",
    time: "",
    meeting_link: "",
    description: "",
    spots_left: 0,
    university_ids: [] as string[],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        type: initialData.type || "Webinar",
        date: initialData.date || "",
        time: initialData.time || "",
        meeting_link: initialData.meeting_link || "",
        description: initialData.description || "",
        spots_left: initialData.spots_left || 0,
        university_ids: Array.isArray(initialData.university_ids) ? initialData.university_ids : [],
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!form.title) return toast.error("Title is required");
    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Event updated");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Event created");
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
          <h2 className="text-lg font-semibold text-[#1E293B]">{isEditing ? "Edit Event" : "Add New Event"}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? "Update Event" : "Save Event"}</Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Open Day — Spring 2026" />
            </div>

            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Event Type</Label>
              <select className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700" value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}>
                {["Open Day", "Workshop", "Webinar", "Info Session"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Spots Left</Label>
              <Input type="number" value={form.spots_left} onChange={(e) => setForm(prev => ({ ...prev, spots_left: Number(e.target.value) }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Time</Label>
              <Input value={form.time} onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))} placeholder="e.g. 10:00 AM" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Meeting Link</Label>
              <Input value={form.meeting_link} onChange={(e) => setForm(prev => ({ ...prev, meeting_link: e.target.value }))} placeholder="https://meet.google.com/... or https://zoom.us/j/..." />
              <p className="text-[11px] text-muted-foreground">Zoom or Google Meet link for online events.</p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Linked Universities</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-xl max-h-48 overflow-y-auto">
                {universities?.map((u: any) => (
                  <label key={u.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                    <input type="checkbox" checked={form.university_ids.includes(u.id)} onChange={(e) => {
                      if (e.target.checked) setForm(prev => ({ ...prev, university_ids: [...prev.university_ids, u.id] }));
                      else setForm(prev => ({ ...prev, university_ids: prev.university_ids.filter(id => id !== u.id) }));
                    }} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-[13px] font-medium text-gray-700">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the event..." rows={5} className="bg-gray-50 rounded-xl resize-y" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
