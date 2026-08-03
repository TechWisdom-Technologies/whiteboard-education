import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera, Building2, Mail, Phone, Globe, Users, Loader2,
  User, Lock, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, XCircle, Pencil, X, Plus, Trash2,
  Upload, FileCheck, FileText, ExternalLink, ClipboardList, Sparkles, Check, AlertCircle, Award, Save
} from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface PartnerData {
  agency_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  annual_students: number;
  status: string;
  nid_document_url?: string;
  trade_license_url?: string;
  certificate_urls?: any[];
  admin_notes?: string;
}

interface UserProfile {
  display_name: string;
  avatar_url: string;
}

type PasswordStep = "idle" | "sending" | "code_sent" | "verifying" | "verified" | "updating";

export default function PartnerProfile() {
  const { user, session, resetPassword, verifyResetOtp, updatePassword } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ display_name: "", avatar_url: "" });

  // Password change state
  const [pwStep, setPwStep] = useState<PasswordStep>("idle");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditingAgency, setIsEditingAgency] = useState(false);
  const [savingAgency, setSavingAgency] = useState(false);
  const [editAgencyData, setEditAgencyData] = useState<PartnerData | null>(null);

  const [docUploading, setDocUploading] = useState<Record<string, boolean>>({});
  const docInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [customDocs, setCustomDocs] = useState<{name: string, url: string}[]>([]);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [isUploadingCustom, setIsUploadingCustom] = useState(false);
  const customFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session || !user) return;
    const fetchData = async () => {
      try {
        const localAvatar = localStorage.getItem(`partner_avatar_${user.id}`);
        if (localAvatar) {
          setProfile(prev => ({ ...prev, avatar_url: localAvatar }));
        }

        const { data: partnerData } = await supabase
          .from("partner_registrations")
          .select("agency_name, contact_person, email, phone, country, annual_students, status, nid_document_url, trade_license_url, certificate_urls, admin_notes")
          .eq("user_id", user.id)
          .maybeSingle();
        if (partnerData) {
          setPartner(partnerData as unknown as PartnerData);
          if (partnerData.certificate_urls) {
            const parsed = (partnerData.certificate_urls as any[]).map(item => 
              typeof item === 'string' ? { name: 'Additional Document', url: item } : item
            );
            setCustomDocs(parsed);
          }
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile({
            display_name: profileData.display_name || "",
            avatar_url: profileData.avatar_url || localAvatar || "",
          });
          if (profileData.avatar_url) {
            localStorage.setItem(`partner_avatar_${user.id}`, profileData.avatar_url);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [session, user]);

  useEffect(() => {
    if (!loading && location.hash === "#admin-notes-section") {
      setTimeout(() => {
        const el = document.getElementById("admin-notes-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-[#2F4F97]", "ring-offset-2", "transition-all", "duration-1000");
          setTimeout(() => el.classList.remove("ring-2", "ring-[#2F4F97]", "ring-offset-2"), 3000);
        }
      }, 300);
    }
  }, [loading, location.hash]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File too large. Max 2MB."); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("partner-documents").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("partner-documents").getPublicUrl(path);
      const avatarUrl = urlData.publicUrl + `?t=${Date.now()}`;
      
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          { user_id: user.id, avatar_url: avatarUrl, display_name: profile.display_name || "" },
          { onConflict: "user_id" }
        );

      if (upsertErr) console.error("Profile upsert error:", upsertErr);

      localStorage.setItem(`partner_avatar_${user.id}`, avatarUrl);
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      window.dispatchEvent(new Event("profile-updated"));
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    }
    setUploading(false);
  };

  const startEditingAgency = () => {
    if (partner) setEditAgencyData({ ...partner });
    setIsEditingAgency(true);
  };

  const handleSaveAgency = async () => {
    if (!user || !editAgencyData) return;
    setSavingAgency(true);
    try {
      const { error } = await supabase.from("partner_registrations").update({
        agency_name: editAgencyData.agency_name,
        contact_person: editAgencyData.contact_person,
        phone: editAgencyData.phone,
        country: editAgencyData.country,
        annual_students: editAgencyData.annual_students
      }).eq("user_id", user.id);
      
      if (error) throw error;
      setPartner(editAgencyData);
      toast.success("Agency details updated successfully!");
      setIsEditingAgency(false);
    } catch {
      toast.error("Failed to update agency details.");
    }
    setSavingAgency(false);
  };

  const handleUploadDoc = async (field: string, file: File) => {
    if (!user || !partner) return;
    setDocUploading(prev => ({ ...prev, [field]: true }));
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${field}_${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from("partner-documents")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("partner-documents")
        .getPublicUrl(path);

      const { error: dbError } = await supabase
        .from("partner_registrations")
        .update({ [field]: publicUrl })
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      setPartner(prev => prev ? { ...prev, [field]: publicUrl } : prev);
      toast.success("Document uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setDocUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleUploadCustomDoc = async (file: File) => {
    if (!newDocName.trim() || !user) {
      toast.error("Please enter a document name");
      return;
    }
    setIsUploadingCustom(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/custom_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("partner-documents").upload(path, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from("partner-documents").getPublicUrl(path);
      const updatedDocs = [...customDocs, { name: newDocName, url: publicUrl }];
      
      const { error: dbError } = await supabase.from("partner_registrations").update({ certificate_urls: updatedDocs }).eq("user_id", user.id);
      if (dbError) throw dbError;
      
      setCustomDocs(updatedDocs);
      setIsAddingDoc(false);
      setNewDocName("");
      toast.success("Document uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setIsUploadingCustom(false);
    }
  };

  const handleDeleteCustomDoc = async (index: number) => {
    if (!user) return;
    const updated = customDocs.filter((_, i) => i !== index);
    try {
      const { error } = await supabase.from("partner_registrations").update({ certificate_urls: updated }).eq("user_id", user.id);
      if (error) throw error;
      setCustomDocs(updated);
      toast.success("Document removed");
    } catch (err: any) {
      toast.error("Failed to remove document");
    }
  };

  // ─── Password Change Flow ───
  const handleSendCode = async () => {
    if (!user?.email) return;
    setPwStep("sending");
    const result = await resetPassword(user.email);
    if (result.success) {
      setPwStep("code_sent");
      toast.success("An 8-digit code has been sent to your email.");
    } else {
      toast.error(result.error || "Failed to send code.");
      setPwStep("idle");
    }
  };

  const handleVerifyCode = async () => {
    if (!user?.email || otpCode.length < 8) {
      toast.error("Please enter the 8-digit code.");
      return;
    }
    setPwStep("verifying");
    const result = await verifyResetOtp(user.email, otpCode);
    if (result.success) {
      setPwStep("verified");
      toast.success("Code verified! You can now set your new password.");
    } else {
      toast.error(result.error || "Invalid code. Please try again.");
      setPwStep("code_sent");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setPwStep("updating");
    const result = await updatePassword(newPassword);
    if (result.success) {
      toast.success("Password updated successfully!");
      setPwStep("idle");
      setOtpCode(""); setNewPassword(""); setConfirmPassword("");
    } else {
      toast.error(result.error || "Failed to update password.");
      setPwStep("verified");
    }
  };

  const resetPwFlow = () => {
    setPwStep("idle"); setOtpCode(""); setNewPassword(""); setConfirmPassword("");
  };

  if (loading) return <LoadingScreen fullScreen />;

  const initials = (partner?.agency_name || partner?.contact_person || user?.email || "PA")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const inputCls = "h-11 text-sm bg-slate-50/80 border-slate-200 rounded-xl focus:bg-white focus:border-[#2F4F97] focus:ring-2 focus:ring-[#2F4F97]/20 transition-all shadow-none font-medium text-slate-800";

  const mainDocs = [
    { field: "nid_document_url", label: "National ID / Passport", description: "Government issued personal ID or passport copy" },
    { field: "trade_license_url", label: "Trade License", description: "Official institutional registration & trade license" },
  ] as const;

  return (
    <div className="animate-fade-in pb-12 w-full max-w-none mx-auto px-4 sm:px-6 mt-6">
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        
        {/* 1. Header: Logo & Basic Info */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border border-slate-200 shadow-sm bg-white">
              <AvatarImage src={profile.avatar_url} className="object-cover w-full h-full" />
              <AvatarFallback className="text-3xl font-bold bg-[#2F4F97]/10 text-[#2F4F97]">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Change Logo"
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white gap-1.5"
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
              <span className="text-[10px] font-semibold tracking-wide uppercase">Change</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                  {partner?.agency_name || "Partner Agency"}
                </h1>
                {partner?.contact_person && (
                  <p className="text-slate-500 text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <User className="h-4 w-4 shrink-0 text-slate-400" /> {partner.contact_person}
                  </p>
                )}
              </div>
              {partner && (
                <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold rounded-full uppercase border shadow-sm flex items-center gap-1.5 shrink-0 mx-auto sm:mx-0 w-fit ${
                  partner.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  partner.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${
                    partner.status === "approved" ? "bg-emerald-500" :
                    partner.status === "rejected" ? "bg-rose-500" : "bg-amber-500"
                  }`} />
                  {partner.status} Partner
                </Badge>
              )}
            </div>
            
            {partner && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-2">
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {partner.email}</span>
                {partner.phone && <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {partner.phone}</span>}
                {partner.country && <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400"/> {partner.country}</span>}
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="agency" className="w-full">
          <div className="px-6 sm:px-8 border-b border-slate-100 bg-slate-50/30">
            <TabsList className="bg-transparent p-0 h-auto gap-6 flex-wrap justify-start">
              <TabsTrigger 
                value="agency" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] rounded-none border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-none"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Agency Details
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] rounded-none border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-none"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Important Documents
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] rounded-none border-b-2 border-transparent px-1 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-none"
              >
                <Lock className="w-4 h-4 mr-2" />
                Security & Password
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 sm:p-8">
            <TabsContent value="agency" className="mt-0 outline-none space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Agency Information</h3>
                </div>
                {isEditingAgency ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAgency(false)} className="h-8 px-3 text-xs font-semibold">Cancel</Button>
                    <Button size="sm" onClick={handleSaveAgency} disabled={savingAgency} className="h-8 px-4 text-xs font-semibold shadow-sm">
                      {savingAgency ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditingAgency} className="h-8 px-3.5 text-xs font-semibold text-slate-600">
                    <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#2F4F97]" /> Edit
                  </Button>
                )}
              </div>

              {isEditingAgency && editAgencyData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100 animate-fade-in">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">Agency Name</Label>
                    <Input value={editAgencyData.agency_name} onChange={e => setEditAgencyData({...editAgencyData, agency_name: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">Contact Person</Label>
                    <Input value={editAgencyData.contact_person} onChange={e => setEditAgencyData({...editAgencyData, contact_person: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Fixed</span>
                    </Label>
                    <Input value={editAgencyData.email} disabled className="h-10 text-sm bg-slate-100 border-slate-200 rounded-lg cursor-not-allowed text-slate-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">Phone Number</Label>
                    <Input value={editAgencyData.phone || ""} onChange={e => setEditAgencyData({...editAgencyData, phone: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">Country</Label>
                    <Input value={editAgencyData.country || ""} onChange={e => setEditAgencyData({...editAgencyData, country: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">Annual Students</Label>
                    <Input type="number" value={editAgencyData.annual_students || ""} onChange={e => setEditAgencyData({...editAgencyData, annual_students: parseInt(e.target.value) || 0})} className={inputCls} />
                  </div>
                </div>
              ) : partner ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoTile icon={Building2} label="Agency Name" value={partner.agency_name} />
                  <InfoTile icon={User} label="Contact Person" value={partner.contact_person} />
                  <InfoTile icon={Mail} label="Email Address" value={partner.email} />
                  <InfoTile icon={Phone} label="Phone Number" value={partner.phone || "N/A"} />
                  <InfoTile icon={Globe} label="Country" value={partner.country || "N/A"} />
                  <InfoTile icon={Users} label="Annual Students" value={String(partner.annual_students || 0)} />
                </div>
              ) : null}

              {partner?.admin_notes && partner.status !== "approved" && !isEditingAgency && (
                <div id="admin-notes-section" className="mt-4 rounded-xl bg-amber-50 border border-amber-200/60 p-4 max-w-3xl">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Admin Feedback & Notes</span>
                  </div>
                  <p className="text-xs text-amber-900/80 whitespace-pre-wrap leading-relaxed pl-5 border-l-2 border-amber-300">
                    {partner.admin_notes}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-0 outline-none space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97]">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Important Documents</h3>
                </div>
                {!isAddingDoc && (
                   <Button variant="outline" size="sm" onClick={() => setIsAddingDoc(true)} className="h-8 text-xs font-semibold">
                     <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Document
                   </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
                {mainDocs.map((doc) => {
                  const url = partner ? (partner as any)[doc.field] as string | undefined : undefined;
                  const isUploading = docUploading[doc.field];
                  return (
                    <div key={doc.field} className={`p-5 rounded-xl border flex flex-col justify-between ${
                        url ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50/50 border-slate-200 border-dashed"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            {url ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <FileText className="h-4 w-4 text-slate-400" />}
                            {doc.label}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{doc.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          url ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {url ? "Verified" : "Missing"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#2F4F97] transition-all">
                            <ExternalLink className="h-3.5 w-3.5" /> View
                          </a>
                        )}
                        <input type="file" className="hidden" ref={(el) => { docInputRefs.current[doc.field] = el; }} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadDoc(doc.field, file);
                            e.target.value = "";
                          }}
                        />
                        <Button type="button" variant={url ? "outline" : "default"} disabled={isUploading} onClick={() => docInputRefs.current[doc.field]?.click()} className={`flex-1 rounded-lg text-xs font-bold h-9 px-3`}>
                          {isUploading ? (
                            <> <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Uploading </>
                          ) : (
                            <> <Upload className="h-3.5 w-3.5 mr-1.5" /> {url ? "Update" : "Upload"} </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {customDocs.map((doc, idx) => (
                    <div key={`custom-${idx}`} className="p-5 rounded-xl border flex flex-col justify-between bg-emerald-50/30 border-emerald-100">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            {doc.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">Additional provided document</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 bg-emerald-500/10 text-emerald-700 border-emerald-200">
                          Verified
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#2F4F97] transition-all">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                        <Button type="button" variant="outline" onClick={() => handleDeleteCustomDoc(idx)} className="h-9 px-3 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                ))}
              </div>

              {isAddingDoc && (
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 mt-4 max-w-4xl animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 w-full space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Document Name</Label>
                      <Input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="e.g. Bank Statement" className="h-10 text-sm bg-white" />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                       <input type="file" className="hidden" ref={customFileInputRef} onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) handleUploadCustomDoc(file);
                         e.target.value = "";
                       }} />
                       <Button variant="outline" onClick={() => setIsAddingDoc(false)} className="h-10 text-xs font-semibold">Cancel</Button>
                       <Button onClick={() => {
                          if (!newDocName.trim()) { toast.error("Enter document name"); return; }
                          customFileInputRef.current?.click();
                       }} disabled={isUploadingCustom} className="h-10 px-4 text-xs font-semibold">
                         {isUploadingCustom ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Uploading</> : <><Upload className="h-3.5 w-3.5 mr-1.5" /> Select & Upload</>}
                       </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="security" className="mt-0 outline-none space-y-6">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97]">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Account Security</h3>
              </div>
              
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 max-w-2xl">
                {pwStep === "idle" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                      <p className="text-xs sm:text-sm leading-relaxed">
                        Your account uses email verification (OTP) for password updates to ensure maximum security.
                      </p>
                    </div>
                    <Button onClick={handleSendCode} variant="outline" className="w-full sm:w-auto shrink-0 gap-2 font-bold text-xs h-9 rounded-lg shadow-sm">
                      <KeyRound className="h-3.5 w-3.5 text-[#2F4F97] group-hover:text-white" /> Update Password
                    </Button>
                  </div>
                )}

                {pwStep === "sending" && (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500 font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2F4F97]" /> Sending code to your email...
                  </div>
                )}

                {pwStep === "code_sent" && (
                  <div className="space-y-4 animate-fade-in max-w-sm">
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 leading-relaxed font-medium">
                      An 8-digit code has been sent to <span className="font-bold">{user?.email}</span>.
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Verification Code</Label>
                      <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="• • • • • • • •" className="h-10 tracking-[0.25em] text-center font-bold text-base bg-white border-slate-200 rounded-lg text-slate-800" maxLength={8} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button onClick={handleVerifyCode} disabled={otpCode.length < 8} className="flex-1 font-bold text-xs h-9 rounded-lg">Verify</Button>
                      <Button variant="ghost" onClick={resetPwFlow} className="font-semibold text-xs h-9 px-4 rounded-lg">Cancel</Button>
                    </div>
                  </div>
                )}

                {pwStep === "verifying" && (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500 font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2F4F97]" /> Verifying code...
                  </div>
                )}

                {pwStep === "verified" && (
                  <div className="space-y-4 animate-fade-in max-w-sm">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Code verified! Set new password.
                    </div>
                    <div className="space-y-2.5">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase">New Password</Label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 chars" className="h-9 text-xs bg-white border-slate-200 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase">Confirm Password</Label>
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-type password" className="h-9 text-xs bg-white border-slate-200 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleUpdatePassword} disabled={newPassword.length < 6} className="flex-1 font-bold text-xs h-9 rounded-lg">Update</Button>
                      <Button variant="ghost" onClick={resetPwFlow} className="font-semibold text-xs h-9 px-4 rounded-lg">Cancel</Button>
                    </div>
                  </div>
                )}

                {pwStep === "updating" && (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500 font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Updating password...
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

      </Card>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-slate-100 bg-white flex items-start gap-3 shadow-2xs">
      <div className="p-2 rounded-lg bg-[#2F4F97]/5 text-[#2F4F97] shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

