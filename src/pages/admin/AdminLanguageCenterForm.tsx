import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UploadCloud, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Props {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AdminLanguageCenterForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("language_centers");
  const updateRow = useUpdateRow("language_centers");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    logo_url: "",
    about_image_url: "",
    about_text: "",
    more_info: [] as any[],
    tuition_fees: [] as any[],
    faqs: [] as any[],
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(true);
  const [isFeesOpen, setIsFeesOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(true);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        city: initialData.city || "",
        logo_url: initialData.logo_url || "",
        about_image_url: initialData.about_image_url || "",
        about_text: initialData.about_text || "",
        more_info: Array.isArray(initialData.more_info) ? initialData.more_info : [],
        tuition_fees: Array.isArray(initialData.tuition_fees) ? initialData.tuition_fees : [],
        faqs: Array.isArray(initialData.faqs) ? initialData.faqs : [],
      });
    }
  }, [initialData]);

  const handleUpload = async (file: File, type: "logo" | "about") => {
    if (!file) return;
    const setter = type === "logo" ? setIsUploadingLogo : setIsUploadingAbout;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `language-centers/${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from("universities").upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("universities").getPublicUrl(filename);
      const key = type === "logo" ? "logo_url" : "about_image_url";
      setForm(prev => ({ ...prev, [key]: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Name is required");
    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Language Center updated");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Language Center created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
    }
  };

  const renderCollapsible = (
    title: string,
    isOpen: boolean,
    setOpen: (v: boolean) => void,
    onAdd: () => void,
    addLabel: string,
    children: React.ReactNode
  ) => (
    <div className="space-y-4 md:col-span-2 mt-4">
      <div className="flex items-center justify-between cursor-pointer py-2 hover:bg-gray-50 rounded-md transition-colors" onClick={() => setOpen(!isOpen)}>
        <Label className="text-[13px] font-semibold text-gray-700 cursor-pointer">{title}</Label>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); onAdd(); setOpen(true); }}>
            <Plus className="h-3 w-3 mr-1" /> {addLabel}
          </Button>
          <div className="text-gray-400 p-1">{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
        </div>
      </div>
      {isOpen && children}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full max-w-5xl mx-auto my-6">
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onCancel}><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold text-[#1E293B]">{isEditing ? "Edit Language Center" : "Add New Language Center"}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? "Update" : "Save"}</Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Logo</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors h-[180px] flex items-center justify-center">
                {form.logo_url ? (
                  <div className="relative inline-block">
                    <img src={form.logo_url} alt="Logo" className="max-h-24 object-contain" />
                    <button onClick={() => setForm({ ...form, logo_url: "" })} className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-primary">Click to upload logo</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], "logo")} disabled={isUploadingLogo} />
                  </label>
                )}
                {isUploadingLogo && <p className="text-xs text-primary mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

            {/* About Image Upload */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">About Image</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors h-[180px] flex items-center justify-center overflow-hidden">
                {form.about_image_url ? (
                  <div className="relative inline-block w-full h-full">
                    <img src={form.about_image_url} alt="About" className="w-full h-full object-cover rounded-md" />
                    <button onClick={() => setForm({ ...form, about_image_url: "" })} className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-primary">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">High-res JPG/PNG</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], "about")} disabled={isUploadingAbout} />
                  </label>
                )}
                {isUploadingAbout && <p className="text-xs text-primary mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Center Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. ELC - English Language Company" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="e.g. elc-english" />
              <p className="text-[11px] text-muted-foreground">URL-friendly identifier. Leave blank to auto-generate.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">City</Label>
              <Input value={form.city} onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} placeholder="e.g. Kuala Lumpur" />
            </div>

            <div className="space-y-3 pt-4 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">About Text</Label>
              <div className="border rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[200px]">
                <ReactQuill theme="snow" value={form.about_text} onChange={(val) => setForm(prev => ({ ...prev, about_text: val }))} className="bg-white text-gray-900 rounded-xl" />
              </div>
            </div>

            {/* More Info */}
            {renderCollapsible("More Info Sections", isInfoOpen, setIsInfoOpen, () => setForm(p => ({ ...p, more_info: [...p.more_info, { title: "", description: "" }] })), "Add Section",
              <div className="space-y-4">
                {form.more_info.length === 0 && <p className="text-xs text-muted-foreground italic">No sections added yet.</p>}
                {form.more_info.map((item, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50/50 p-4 rounded-xl border relative group">
                    <div className="flex-1 space-y-3">
                      <Input placeholder="Section Title" value={item.title || ""} onChange={(e) => { const arr = [...form.more_info]; arr[i] = { ...arr[i], title: e.target.value }; setForm({ ...form, more_info: arr }); }} className="bg-white" />
                      <Textarea placeholder="Description..." value={item.description || ""} onChange={(e) => { const arr = [...form.more_info]; arr[i] = { ...arr[i], description: e.target.value }; setForm({ ...form, more_info: arr }); }} rows={2} className="bg-white" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, more_info: p.more_info.filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            {/* Tuition Fees */}
            {renderCollapsible("Tuition Fees", isFeesOpen, setIsFeesOpen, () => setForm(p => ({ ...p, tuition_fees: [...p.tuition_fees, { duration: "", tuition_fee: "", visa: "" }] })), "Add Fee",
              <div className="space-y-4">
                {form.tuition_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No fees added yet.</p>}
                {form.tuition_fees.map((fee, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50/50 p-4 rounded-xl border">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input placeholder="Duration (e.g. 1 month)" value={fee.duration || ""} onChange={(e) => { const arr = [...form.tuition_fees]; arr[i] = { ...arr[i], duration: e.target.value }; setForm({ ...form, tuition_fees: arr }); }} className="bg-white" />
                      <Input placeholder="Fee (e.g. MYR 2,850)" value={fee.tuition_fee || ""} onChange={(e) => { const arr = [...form.tuition_fees]; arr[i] = { ...arr[i], tuition_fee: e.target.value }; setForm({ ...form, tuition_fees: arr }); }} className="bg-white" />
                      <Input placeholder="Visa (e.g. 0 month)" value={fee.visa || ""} onChange={(e) => { const arr = [...form.tuition_fees]; arr[i] = { ...arr[i], visa: e.target.value }; setForm({ ...form, tuition_fees: arr }); }} className="bg-white" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, tuition_fees: p.tuition_fees.filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            {/* FAQs */}
            {renderCollapsible("FAQs", isFaqOpen, setIsFaqOpen, () => setForm(p => ({ ...p, faqs: [...p.faqs, { question: "", answer: "" }] })), "Add FAQ",
              <div className="space-y-4">
                {form.faqs.length === 0 && <p className="text-xs text-muted-foreground italic">No FAQs added yet.</p>}
                {form.faqs.map((faq, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50/50 p-4 rounded-xl border">
                    <div className="flex-1 space-y-3">
                      <Input placeholder="Question" value={faq.question || ""} onChange={(e) => { const arr = [...form.faqs]; arr[i] = { ...arr[i], question: e.target.value }; setForm({ ...form, faqs: arr }); }} className="bg-white" />
                      <Textarea placeholder="Answer..." value={faq.answer || ""} onChange={(e) => { const arr = [...form.faqs]; arr[i] = { ...arr[i], answer: e.target.value }; setForm({ ...form, faqs: arr }); }} rows={2} className="bg-white" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, faqs: p.faqs.filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
