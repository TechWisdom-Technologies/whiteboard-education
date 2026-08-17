import { useState, useEffect } from "react";
import { useTableData, useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface AdminUniversityFormProps {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AdminUniversityForm({ initialData, onCancel, onSuccess }: AdminUniversityFormProps) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("universities");
  const updateRow = useUpdateRow("universities");
  const { data: countries } = useTableData("countries", { orderBy: "name" });

  const [form, setForm] = useState({
    name: "",
    city: "",
    country_id: "",
    description: "",
    about_text: "",
    logo_url: "",
    hero_image: "",
    faqs: [] as any[],
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        city: initialData.city || "",
        country_id: initialData.country_id || "",
        description: initialData.description || "",
        about_text: initialData.about_text || "",
        logo_url: initialData.logo_url || "",
        hero_image: initialData.hero_image || "",
        faqs: Array.isArray(initialData.faqs) ? initialData.faqs : [],
      });
    }
  }, [initialData]);

  const handleUpload = async (file: File, type: "logo" | "hero") => {
    try {
      if (type === "logo") setIsUploadingLogo(true);
      else setIsUploadingHero(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `universities/${fileName}`;

      // Using partner-documents bucket as a general fallback
      const { error: uploadError } = await supabase.storage
        .from('partner-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('partner-documents')
        .getPublicUrl(filePath);

      if (type === "logo") {
        setForm(prev => ({ ...prev, logo_url: data.publicUrl }));
      } else {
        setForm(prev => ({ ...prev, hero_image: data.publicUrl }));
      }
      
      toast.success(`${type === 'logo' ? 'Logo' : 'Hero Image'} uploaded successfully`);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      if (type === "logo") setIsUploadingLogo(false);
      else setIsUploadingHero(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.country_id) {
      toast.error("Please fill in the required fields (Name and Country)");
      return;
    }

    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("University updated successfully");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("University created successfully");
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
            {isEditing ? "Edit University" : "Add New University"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[#2F4F97] hover:bg-[#1E3A75]">
            {isEditing ? "Update University" : "Save University"}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">University Name *</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="e.g. Multimedia University (MMU)" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Country *</Label>
              <select
                className="w-full rounded-xl border border-input bg-background px-3 h-10 text-sm"
                value={form.country_id}
                onChange={(e) => setForm({ ...form, country_id: e.target.value })}
              >
                <option value="">Select Country...</option>
                {countries?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">City</Label>
              <Input 
                value={form.city} 
                onChange={(e) => setForm({ ...form, city: e.target.value })} 
                placeholder="e.g. Cyberjaya" 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Short Description</Label>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="A brief 1-2 sentence description..." 
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Media & Images */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">University Logo</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                {form.logo_url ? (
                  <div className="relative inline-block">
                    <img src={form.logo_url} alt="Logo" className="h-24 object-contain" />
                    <button 
                      onClick={() => setForm({ ...form, logo_url: "" })}
                      className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-[#2F4F97]">Click to upload logo</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files && handleUpload(e.target.files[0], "logo")}
                      disabled={isUploadingLogo}
                    />
                  </label>
                )}
                {isUploadingLogo && <p className="text-xs text-[#2F4F97] mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

            {/* Hero Image Upload */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Campus Hero Image</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                {form.hero_image ? (
                  <div className="relative inline-block w-full">
                    <img src={form.hero_image} alt="Hero" className="w-full h-32 object-cover rounded-md" />
                    <button 
                      onClick={() => setForm({ ...form, hero_image: "" })}
                      className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-[#2F4F97]">Click to upload hero image</span>
                    <span className="text-xs text-muted-foreground">High-res JPG/PNG up to 5MB</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files && handleUpload(e.target.files[0], "hero")}
                      disabled={isUploadingHero}
                    />
                  </label>
                )}
                {isUploadingHero && <p className="text-xs text-[#2F4F97] mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Content */}
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Detailed Content</h3>
          
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold text-gray-700">About (Detailed Profile)</Label>
            <div className="bg-white rounded-xl [&_.ql-container]:min-h-[250px] [&_.ql-editor]:text-sm">
              <ReactQuill 
                theme="snow" 
                value={form.about_text} 
                onChange={(val) => setForm({ ...form, about_text: val })}
                className="bg-white text-gray-900 rounded-xl"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">Write a compelling profile about the university. Use formatting, lists, and headers.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
