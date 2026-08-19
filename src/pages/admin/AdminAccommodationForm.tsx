import { useState, useEffect } from "react";
import { useTableData, useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface AdminAccommodationFormProps {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AdminAccommodationForm({ initialData, onCancel, onSuccess }: AdminAccommodationFormProps) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("accommodations");
  const updateRow = useUpdateRow("accommodations");
  const { data: universities } = useTableData("universities", { orderBy: "name" });

  const [form, setForm] = useState({
    name: "",
    city: "",
    property_type: "Residential",
    type: "Apartment",
    price_per_month: 0,
    description: "",
    image_url: "",
    latitude: 0,
    longitude: 0,
    unit_types: [] as string[],
    room_types: [] as string[],
    travel_distance: "",
    amenities: [] as string[],
    contact_phone: "",
    contact_email: "",
    near_university_ids: [] as string[],
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        city: initialData.city || "",
        property_type: initialData.property_type || "Residential",
        type: initialData.type || "Apartment",
        price_per_month: initialData.price_per_month || 0,
        description: initialData.description || "",
        image_url: initialData.image_url || "",
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        unit_types: initialData.unit_types || [],
        room_types: initialData.room_types || [],
        travel_distance: initialData.travel_distance || "",
        amenities: initialData.amenities || [],
        contact_phone: initialData.contact_phone || "",
        contact_email: initialData.contact_email || "",
        near_university_ids: initialData.near_university_ids || [],
      });
    }
  }, [initialData]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `accommodations/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("universities").upload(filename, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("universities").getPublicUrl(filename);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Name is required");
    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Accommodation updated");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Accommodation created");
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
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-[#1E293B]">
            {isEditing ? "Edit Accommodation" : "Add New Accommodation"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? "Update Accommodation" : "Save Accommodation"}</Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Image Upload */}
            <div className="space-y-3 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Accommodation Image</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors h-[200px] flex items-center justify-center overflow-hidden">
                {form.image_url ? (
                  <div className="relative inline-block w-full h-full">
                    <img src={form.image_url} alt="Image" className="w-full h-full object-cover rounded-md" />
                    <button onClick={() => setForm({ ...form, image_url: "" })} className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-primary">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">High-res JPG/PNG</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} disabled={isUploading} />
                  </label>
                )}
                {isUploading && <p className="text-xs text-primary mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Student Village" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">City</Label>
              <Input value={form.city} onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} placeholder="e.g. Cyberjaya" />
            </div>

            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Property Type</Label>
              <select className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700" value={form.property_type} onChange={(e) => setForm(prev => ({ ...prev, property_type: e.target.value }))}>
                {["Residential", "Commercial", "Mixed-Use", "Student Housing"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Accommodation Type</Label>
              <select className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700" value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}>
                {["Apartment", "Hostel", "Condominium", "Studio", "Shared House", "Dormitory"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Price Per Month (MYR)</Label>
              <Input type="number" value={form.price_per_month} onChange={(e) => setForm(prev => ({ ...prev, price_per_month: Number(e.target.value) }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Travel Distance</Label>
              <Input value={form.travel_distance} onChange={(e) => setForm(prev => ({ ...prev, travel_distance: e.target.value }))} placeholder="e.g. 5 min walk" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Contact Phone</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm(prev => ({ ...prev, contact_phone: e.target.value }))} placeholder="+60..." />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Contact Email</Label>
              <Input value={form.contact_email} onChange={(e) => setForm(prev => ({ ...prev, contact_email: e.target.value }))} placeholder="email@example.com" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Latitude</Label>
              <Input type="number" step="0.0001" value={form.latitude} onChange={(e) => setForm(prev => ({ ...prev, latitude: Number(e.target.value) }))} />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Longitude</Label>
              <Input type="number" step="0.0001" value={form.longitude} onChange={(e) => setForm(prev => ({ ...prev, longitude: Number(e.target.value) }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Amenities (comma separated)</Label>
              <Input value={form.amenities.join(", ")} onChange={(e) => setForm(prev => ({ ...prev, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="WiFi, Gym, Pool, Laundry" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Unit Types (comma separated)</Label>
              <Input value={form.unit_types.join(", ")} onChange={(e) => setForm(prev => ({ ...prev, unit_types: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="Single, Double, Twin" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Room Types (comma separated)</Label>
              <Input value={form.room_types.join(", ")} onChange={(e) => setForm(prev => ({ ...prev, room_types: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="En-suite, Shared Bathroom" />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Nearby Universities</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-xl max-h-48 overflow-y-auto">
                {universities?.map((u: any) => (
                  <label key={u.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm cursor-pointer hover:bg-blue-50 transition-colors">
                    <input type="checkbox" checked={form.near_university_ids.includes(u.id)} onChange={(e) => {
                      if (e.target.checked) setForm(prev => ({ ...prev, near_university_ids: [...prev.near_university_ids, u.id] }));
                      else setForm(prev => ({ ...prev, near_university_ids: prev.near_university_ids.filter(id => id !== u.id) }));
                    }} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-[13px] font-medium text-gray-700">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Description</Label>
              <div className="border rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[200px]">
                <ReactQuill theme="snow" value={form.description} onChange={(val) => setForm(prev => ({ ...prev, description: val }))} className="bg-white text-gray-900 rounded-xl" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
