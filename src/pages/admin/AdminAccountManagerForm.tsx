import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AdminAccountManagerForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("account_managers");
  const updateRow = useUpdateRow("account_managers");

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    photo_url: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        title: initialData.title || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        photo_url: initialData.photo_url || "",
      });
    }
  }, [initialData]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `account-managers/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from("universities").upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("universities").getPublicUrl(filename);
      setForm(prev => ({ ...prev, photo_url: data.publicUrl }));
      toast.success("Photo uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Name is required");
    if (!form.email) return toast.error("Email is required");
    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Account manager updated");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Account manager created");
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
          <h2 className="text-lg font-semibold text-[#1E293B]">{isEditing ? "Edit Account Manager" : "Add Account Manager"}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? "Update" : "Save"}</Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Photo Upload */}
            <div className="space-y-3 md:col-span-2 flex justify-center">
              <div className="space-y-3 w-full max-w-xs">
                <Label className="text-[13px] font-semibold text-gray-700 text-center block">Profile Photo</Label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors h-[200px] flex items-center justify-center">
                  {form.photo_url ? (
                    <div className="relative inline-block">
                      <img src={form.photo_url} alt="Photo" className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" />
                      <button onClick={() => setForm({ ...form, photo_url: "" })} className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      <UploadCloud className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium text-primary">Upload photo</span>
                      <span className="text-xs text-muted-foreground">Square JPG/PNG</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} disabled={isUploading} />
                    </label>
                  )}
                  {isUploading && <p className="text-xs text-primary mt-2 font-medium">Uploading...</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. John Doe" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Job Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Senior Partner Manager" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+1 234 567 8900" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
