import { useState, useEffect } from "react";
import { useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Props {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AdminBlogForm({ initialData, onCancel, onSuccess }: Props) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("blogs");
  const updateRow = useUpdateRow("blogs");

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    read_time: "",
    image: "",
    cover_image: "",
  });

  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        author: initialData.author || "",
        category: initialData.category || "",
        read_time: initialData.read_time || "",
        image: initialData.image || "",
        cover_image: initialData.cover_image || "",
      });
    }
  }, [initialData]);

  const handleUpload = async (file: File, type: "thumb" | "cover") => {
    if (!file) return;
    const setter = type === "thumb" ? setIsUploadingThumb : setIsUploadingCover;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `blogs/${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from("universities").upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("universities").getPublicUrl(filename);
      const key = type === "thumb" ? "image" : "cover_image";
      setForm(prev => ({ ...prev, [key]: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    if (!form.title) return toast.error("Title is required");
    try {
      const payload = { ...form, date: new Date().toISOString().split("T")[0] };
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Blog post updated");
      } else {
        await insertRow.mutateAsync(payload);
        toast.success("Blog post created");
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
          <h2 className="text-lg font-semibold text-[#1E293B]">{isEditing ? "Edit Blog Post" : "Add New Blog Post"}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? "Update Post" : "Publish Post"}</Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Thumbnail */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Thumbnail Image</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors h-[180px] flex items-center justify-center">
                {form.image ? (
                  <div className="relative inline-block">
                    <img src={form.image} alt="Thumbnail" className="max-h-24 object-contain" />
                    <button onClick={() => setForm({ ...form, image: "" })} className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-primary">Upload thumbnail</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], "thumb")} disabled={isUploadingThumb} />
                  </label>
                )}
                {isUploadingThumb && <p className="text-xs text-primary mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Cover Image</Label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors h-[180px] flex items-center justify-center overflow-hidden">
                {form.cover_image ? (
                  <div className="relative inline-block w-full h-full">
                    <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover rounded-md" />
                    <button onClick={() => setForm({ ...form, cover_image: "" })} className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-md border hover:bg-red-50"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-primary">Upload cover</span>
                    <span className="text-xs text-muted-foreground">High-res JPG/PNG</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], "cover")} disabled={isUploadingCover} />
                  </label>
                )}
                {isUploadingCover && <p className="text-xs text-primary mt-2 font-medium">Uploading...</p>}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. 10 Tips for Studying Abroad" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Author</Label>
              <Input value={form.author} onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))} placeholder="e.g. John Doe" />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Category</Label>
              <Input value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Study Tips" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Read Time</Label>
              <Input value={form.read_time} onChange={(e) => setForm(prev => ({ ...prev, read_time: e.target.value }))} placeholder="e.g. 5 min read" />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="A brief summary of the blog post..." rows={3} className="bg-gray-50 rounded-xl resize-y" />
            </div>

            <div className="space-y-3 pt-4 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Content</Label>
              <div className="border rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[300px]">
                <ReactQuill theme="snow" value={form.content} onChange={(val) => setForm(prev => ({ ...prev, content: val }))} className="bg-white text-gray-900 rounded-xl" />
              </div>
              <p className="text-[11px] text-muted-foreground">Write your blog post content. Use formatting, headings, lists and images.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
