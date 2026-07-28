import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Loader2, 
  Video, 
  PlaySquare,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface AccountManager {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
}

export function AccountManagerSection() {
  const [managers, setManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from as any)('platform_settings')
        .select('*')
        .eq('key', 'account_manager')
        .maybeSingle();

      if (data?.value) {
        let val = data.value;
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch (e) {}
        }
        if (Array.isArray(val)) {
          setManagers(val);
        } else if (typeof val === 'object' && val !== null && (val.name || val.email)) {
          setManagers([{ id: val.id || 'default-1', ...val }]);
        } else {
          setManagers([]);
        }
      } else {
        setManagers([]);
      }
    } catch (err) {
      console.error("Error fetching account managers:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveList = async (newList: AccountManager[]) => {
    setSaving(true);
    try {
      const { error } = await (supabase.from as any)('platform_settings')
        .upsert({
          key: 'account_manager',
          value: newList,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setManagers(newList);
      toast.success("Account Managers updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", title: "", email: "", phone: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (manager: AccountManager) => {
    setEditingId(manager.id);
    setFormData({
      name: manager.name || "",
      title: manager.title || "",
      email: manager.email || "",
      phone: manager.phone || ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }

    let newList: AccountManager[];
    if (editingId) {
      newList = managers.map(m => m.id === editingId ? { ...m, ...formData } : m);
    } else {
      const newManager: AccountManager = {
        id: Date.now().toString(),
        ...formData
      };
      newList = [...managers, newManager];
    }

    await saveList(newList);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this account manager contact?")) return;
    const newList = managers.filter(m => m.id !== id);
    await saveList(newList);
  };

  return (
    <Card className="border-sidebar-border shadow-sm animate-fade-in">
      <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1E293B]">
            <UserCircle className="h-5 w-5 text-[#2F4F97]" />
            Account Managers
          </CardTitle>
          <CardDescription className="mt-1">
            Manage account manager contacts displayed to partners on their dashboard. You can insert, update, or delete profiles.
          </CardDescription>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white gap-1.5 h-9 text-[13px]">
          <Plus className="h-4 w-4" /> Add Manager
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-slate-50/50">
            <UserCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-[14px] font-medium text-slate-700">No Account Managers Added</p>
            <p className="text-[12px] text-muted-foreground mt-1 max-w-sm mx-auto">
              Partners currently see "Account manager unassigned" on their portal. Add a contact profile to display here.
            </p>
            <Button onClick={handleOpenAdd} variant="outline" className="mt-4 border-[#2F4F97] text-[#2F4F97] hover:bg-[#2F4F97]/5">
              <Plus className="h-4 w-4 mr-1.5" /> Add First Manager
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {managers.map((m) => (
              <div key={m.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-start justify-between gap-4 hover:border-[#2F4F97]/40 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] font-bold text-base shrink-0">
                    {m.name ? m.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#1E293B] truncate">{m.name || "Unnamed Manager"}</p>
                    <p className="text-[12px] font-medium text-[#2F4F97] mt-0.5 truncate">{m.title || "Partner Relations"}</p>
                    <div className="space-y-1 mt-2.5">
                      {m.email && (
                        <p className="flex items-center gap-2 text-[12px] text-muted-foreground truncate">
                          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {m.email}
                        </p>
                      )}
                      {m.phone && (
                        <p className="flex items-center gap-2 text-[12px] text-muted-foreground truncate">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {m.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(m)} className="h-8 w-8 text-slate-600 hover:text-[#2F4F97] hover:bg-slate-100">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Account Manager" : "Add Account Manager"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Sarah Jenkins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title / Role</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Senior Partner Relations Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="sarah@whiteboard.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. +60 12-345 6789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface Tutorial {
  id?: string;
  title: string;
  description?: string;
  youtube_url: string;
  video_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export function TutorialsSection() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const { data } = await (supabase.from as any)('platform_tutorials')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setTutorials(data);
    } catch (err) {
      console.error("Error fetching tutorials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      youtube_url: "",
      sort_order: tutorials.length,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (tut: Tutorial) => {
    setEditingId(tut.id || null);
    setFormData({
      title: tut.title || "",
      description: tut.description || "",
      youtube_url: tut.youtube_url || tut.video_url || "",
      sort_order: tut.sort_order || 0,
      is_active: tut.is_active ?? true
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.youtube_url) {
      toast.error("Title and Video URL are required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await (supabase.from as any)('platform_tutorials')
          .update({
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtube_url,
            video_url: formData.youtube_url,
            sort_order: Number(formData.sort_order) || 0,
            is_active: formData.is_active
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Tutorial updated successfully!");
      } else {
        const { error } = await (supabase.from as any)('platform_tutorials')
          .insert({
            title: formData.title,
            description: formData.description,
            youtube_url: formData.youtube_url,
            video_url: formData.youtube_url,
            sort_order: tutorials.length,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success("Tutorial added successfully!");
      }

      await fetchTutorials();
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error("Error saving tutorial: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tutorial video?")) return;
    try {
      const { error } = await (supabase.from as any)('platform_tutorials').delete().eq('id', id);
      if (error) throw error;
      setTutorials(prev => prev.filter(t => t.id !== id));
      toast.success("Tutorial deleted successfully");
    } catch (err: any) {
      toast.error("Error deleting tutorial: " + (err.message || "Unknown error"));
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase.from as any)('platform_tutorials')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setTutorials(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
      toast.success(!currentStatus ? "Tutorial activated" : "Tutorial deactivated");
    } catch (err: any) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <Card className="border-sidebar-border shadow-sm animate-fade-in">
      <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1E293B]">
            <PlaySquare className="h-5 w-5 text-[#2F4F97]" />
            Platform Tutorials
          </CardTitle>
          <CardDescription className="mt-1">
            Manage tutorial videos shown on the partner dashboard. You can insert, update, delete, or reorder videos.
          </CardDescription>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white gap-1.5 h-9 text-[13px]">
          <Plus className="h-4 w-4" /> Add Tutorial
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tutorials.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-slate-50/50">
            <Video className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-[14px] font-medium text-slate-700">No Tutorial Videos Added</p>
            <p className="text-[12px] text-muted-foreground mt-1 max-w-sm mx-auto">
              Add YouTube video links to guide partners on how to use the portal effectively.
            </p>
            <Button onClick={handleOpenAdd} variant="outline" className="mt-4 border-[#2F4F97] text-[#2F4F97] hover:bg-[#2F4F97]/5">
              <Plus className="h-4 w-4 mr-1.5" /> Add First Tutorial
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tutorials.map((t) => (
              <div key={t.id} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${t.is_active ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-lg bg-[#2F4F97]/10 flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5 text-[#2F4F97]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-[#1E293B] truncate">{t.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate mt-0.5">{t.youtube_url || t.video_url}</p>
                    {t.description && <p className="text-[11px] text-slate-500 truncate mt-1">{t.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(t.id!, t.is_active ?? true)}
                    className={`h-8 text-[12px] ${t.is_active ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                  >
                    {t.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(t)} className="h-8 w-8 text-slate-600 hover:text-[#2F4F97] hover:bg-slate-100">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id!)} className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Tutorial Video" : "Add Tutorial Video"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="title">Tutorial Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. How to Submit Student Applications"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">YouTube Video URL *</Label>
              <Input
                id="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData(p => ({ ...p, youtube_url: e.target.value }))}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Input
                id="desc"
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief summary of what this video covers"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort">Sort Order</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-[#2F4F97] focus:ring-[#2F4F97]"
                />
                <Label htmlFor="active" className="text-sm font-medium cursor-pointer">Active / Visible</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Tutorial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
