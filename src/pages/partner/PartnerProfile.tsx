import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera, Building2, Mail, Phone, Globe, Users, Loader2,
  User, Lock, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, XCircle, Pencil, X,
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
  certificate_urls?: string[];
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
        if (partnerData) setPartner(partnerData as unknown as PartnerData);

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
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* ────────── Top Hero Banner ────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#2F4F97] to-[#1a0f2e] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-white/10">
        {/* Decorative background glows */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-purple-500/15 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar with Camera Upload Overlay */}
          <div className="relative group shrink-0">
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-white/15 shadow-2xl overflow-hidden bg-[#1E293B]">
              <AvatarImage src={profile.avatar_url} className="object-cover w-full h-full" />
              <AvatarFallback className="text-2xl sm:text-3xl font-extrabold bg-[#2F4F97] text-white">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Change Profile Photo"
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white gap-1.5 backdrop-blur-xs"
            >
              {uploading ? <Loader2 className="h-7 w-7 animate-spin text-blue-400" /> : <Camera className="h-7 w-7 text-white" />}
              <span className="text-[11px] font-semibold tracking-wide uppercase">Change Photo</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* Banner Title & Quick Pills */}
          <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                    {partner?.agency_name || "Partner Agency"}
                  </h1>
                </div>
                {partner?.contact_person && (
                  <p className="text-blue-200 text-sm sm:text-base font-semibold flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <User className="h-4 w-4 text-blue-300 shrink-0" />
                    {partner.contact_person}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              {partner && (
                <div className="flex items-center justify-center sm:justify-end shrink-0">
                  <Badge className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider border shadow-sm flex items-center gap-2 ${
                    partner.status === "approved" ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/40" :
                    partner.status === "rejected" ? "bg-rose-500/25 text-rose-200 border-rose-400/40" :
                    "bg-amber-500/25 text-amber-200 border-amber-400/40"
                  }`}>
                    <span className={`w-2 h-2 rounded-full inline-block animate-pulse ${
                      partner.status === "approved" ? "bg-emerald-400" :
                      partner.status === "rejected" ? "bg-rose-400" : "bg-amber-400"
                    }`} />
                    {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)} Partner
                  </Badge>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            {partner && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5 pt-2">
                {partner.country && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 font-medium backdrop-blur-xs">
                    <Globe className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                    <span>{partner.country}</span>
                  </div>
                )}
                {partner.email && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 font-medium backdrop-blur-xs">
                    <Mail className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                    <span>{partner.email}</span>
                  </div>
                )}
                {partner.phone && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 font-medium backdrop-blur-xs">
                    <Phone className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                    <span>{partner.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 font-medium backdrop-blur-xs">
                  <Users className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                  <span>{partner.annual_students || 0} Annual Students</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────── Main 2-Column Content Grid ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Agency Details & Documents (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Agency Details Card */}
          {partner && (
            <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 sm:p-8 pb-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-800">
                      Agency Registration Details
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Your institutional information and verified registration data
                    </CardDescription>
                  </div>
                </div>

                {isEditingAgency ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAgency(false)} className="rounded-xl h-9 px-3 text-xs font-semibold">
                      <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveAgency} disabled={savingAgency} className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs">
                      {savingAgency ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditingAgency} className="rounded-xl h-9 px-3.5 text-xs font-semibold border-slate-200 hover:bg-slate-100 text-slate-700 shrink-0">
                    <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#2F4F97]" /> Edit Details
                  </Button>
                )}
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                {isEditingAgency && editAgencyData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Agency Name</Label>
                      <Input value={editAgencyData.agency_name} onChange={e => setEditAgencyData({...editAgencyData, agency_name: e.target.value})} className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Person</Label>
                      <Input value={editAgencyData.contact_person} onChange={e => setEditAgencyData({...editAgencyData, contact_person: e.target.value})} className={inputCls} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                        <span>Email Address</span>
                        <span className="text-[10px] text-amber-600 font-normal bg-amber-50 px-2 py-0.5 rounded">Cannot be changed</span>
                      </Label>
                      <Input value={editAgencyData.email} disabled className="h-11 text-sm bg-slate-100 border-slate-200 rounded-xl cursor-not-allowed text-slate-500 font-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</Label>
                      <Input value={editAgencyData.phone || ""} onChange={e => setEditAgencyData({...editAgencyData, phone: e.target.value})} className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Country</Label>
                      <Input value={editAgencyData.country || ""} onChange={e => setEditAgencyData({...editAgencyData, country: e.target.value})} className={inputCls} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Annual Students Volume</Label>
                      <Input type="number" value={editAgencyData.annual_students || ""} onChange={e => setEditAgencyData({...editAgencyData, annual_students: parseInt(e.target.value) || 0})} className={inputCls} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoTile icon={Building2} label="Agency Name" value={partner.agency_name} highlight />
                      <InfoTile icon={User} label="Contact Person" value={partner.contact_person} />
                      <InfoTile icon={Mail} label="Email Address" value={partner.email} />
                      <InfoTile icon={Phone} label="Phone Number" value={partner.phone || "Not provided"} />
                      <InfoTile icon={Globe} label="Country" value={partner.country || "Not provided"} />
                      <InfoTile icon={Users} label="Annual Students" value={String(partner.annual_students || 0)} />
                    </div>

                    {/* Admin Notes Section if any */}
                    {partner.admin_notes && partner.status !== "approved" && (
                      <div id="admin-notes-section" className="mt-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 p-5 shadow-xs transition-all">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span>Admin Feedback & Review Notes</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-900/90 whitespace-pre-wrap leading-relaxed pl-6 border-l-2 border-amber-300">
                          {partner.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Agency Documents Card */}
          {partner && (
            <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 sm:p-8 pb-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] shrink-0">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-800">
                      Compliance & Registration Documents
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Upload or update your official identification and trade license
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {mainDocs.map((doc) => {
                    const url = (partner as any)[doc.field] as string | undefined;
                    const isUploading = docUploading[doc.field];
                    return (
                      <div
                        key={doc.field}
                        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                          url
                            ? "bg-emerald-50/25 border-emerald-200/80 shadow-2xs hover:shadow-md"
                            : "bg-slate-50/60 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className={`p-3 rounded-2xl shrink-0 ${url ? "bg-emerald-100 text-emerald-600" : "bg-slate-200/70 text-slate-500"}`}>
                            {url ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                          </div>
                          <Badge variant="outline" className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            url ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : "bg-slate-500/10 text-slate-600 border-slate-200"
                          }`}>
                            {url ? "Verified Doc" : "Pending Upload"}
                          </Badge>
                        </div>
                        
                        <div className="mb-5">
                          <h4 className="text-sm font-bold text-slate-800 mb-1">{doc.label}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{doc.description}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100/80 mt-auto">
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#2F4F97] transition-all shadow-2xs"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Preview
                            </a>
                          )}

                          <input
                            type="file"
                            className="hidden"
                            ref={(el) => { docInputRefs.current[doc.field] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc(doc.field, file);
                              e.target.value = "";
                            }}
                          />
                          <Button
                            type="button"
                            variant={url ? "outline" : "default"}
                            disabled={isUploading}
                            onClick={() => docInputRefs.current[doc.field]?.click()}
                            className={`flex-1 rounded-xl text-xs font-bold h-9 shadow-2xs ${
                              url ? "border-slate-200 hover:bg-slate-50 text-slate-700" : "bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white"
                            }`}
                          >
                            {isUploading ? (
                              <> <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Uploading... </>
                            ) : (
                              <> <Upload className="h-3.5 w-3.5 mr-1.5" /> {url ? "Replace File" : "Upload File"} </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Security & Password (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          {/* Security & Password Card */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Security & Authentication</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Manage account password & safety</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {pwStep === "idle" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>Your account is protected with email verification OTP for password updates.</span>
                  </div>
                  <Button onClick={handleSendCode} variant="outline" className="w-full text-slate-800 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus:text-slate-900 active:text-slate-900 gap-2 font-bold text-sm h-11 rounded-xl shadow-2xs">
                    <KeyRound className="h-4 w-4 text-[#2F4F97]" />
                    Change Account Password
                  </Button>
                </div>
              )}

              {pwStep === "sending" && (
                <div className="flex flex-col items-center justify-center py-6 gap-3 text-sm text-slate-500 font-medium">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2F4F97]" />
                  <span>Sending verification code to your email...</span>
                </div>
              )}

              {pwStep === "code_sent" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                    An 8-digit verification code has been sent to <span className="font-bold">{user?.email}</span>. Check your inbox.
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verification Code</Label>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="• • • • • • • •"
                      className="h-12 tracking-[0.25em] text-center font-bold text-lg bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#2F4F97] text-slate-800"
                      maxLength={8}
                    />
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    <Button onClick={handleVerifyCode} disabled={otpCode.length < 8} className="flex-1 bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white font-bold text-sm h-11 rounded-xl">
                      Verify Code
                    </Button>
                    <Button variant="ghost" onClick={resetPwFlow} className="text-slate-500 hover:text-slate-700 focus:text-slate-700 active:text-slate-700 font-semibold text-sm h-11 px-4 rounded-xl hover:bg-slate-100">Cancel</Button>
                  </div>
                </div>
              )}

              {pwStep === "verifying" && (
                <div className="flex flex-col items-center justify-center py-6 gap-3 text-sm text-slate-500 font-medium">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2F4F97]" />
                  <span>Verifying security code...</span>
                </div>
              )}

              {pwStep === "verified" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Code verified! Please set your new password below.</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirm Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <Button onClick={handleUpdatePassword} disabled={newPassword.length < 6} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11 rounded-xl shadow-sm">
                      Update Password
                    </Button>
                    <Button variant="ghost" onClick={resetPwFlow} className="text-slate-500 font-semibold text-sm h-11 px-4 rounded-xl hover:bg-slate-100">Cancel</Button>
                  </div>
                </div>
              )}

              {pwStep === "updating" && (
                <div className="flex flex-col items-center justify-center py-6 gap-3 text-sm text-slate-500 font-medium">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span>Updating your password...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
      highlight 
        ? "bg-[#2F4F97]/5 border-[#2F4F97]/20 hover:border-[#2F4F97]/30" 
        : "bg-slate-50/70 border-slate-100 hover:border-slate-200/80 hover:bg-slate-50"
    }`}>
      <div className={`p-2.5 rounded-xl shadow-2xs border shrink-0 mt-0.5 ${
        highlight ? "bg-[#2F4F97] text-white border-[#2F4F97]" : "bg-white text-[#2F4F97] border-slate-100"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

