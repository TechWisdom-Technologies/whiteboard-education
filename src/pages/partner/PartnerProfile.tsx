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
  Camera, Save, Building2, Mail, Phone, Globe, Users, Loader2,
  User, Lock, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, XCircle, Pencil, X,
  Upload, FileCheck, FileText, ExternalLink, ClipboardList
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
  const [savingProfile, setSavingProfile] = useState(false);
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
        const { data: partnerData } = await supabase
          .from("partner_registrations")
          .select("agency_name, contact_person, email, phone, country, annual_students, status, nid_document_url, trade_license_url, certificate_urls, admin_notes")
          .eq("user_id", user.id)
          .single();
        if (partnerData) setPartner(partnerData);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .single();
        if (profileData) setProfile({
          display_name: profileData.display_name || "",
          avatar_url: profileData.avatar_url || "",
        });
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
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await supabase.from("profiles").update({ display_name: profile.display_name }).eq("user_id", user.id);
      toast.success("Profile saved successfully!");
    } catch { toast.error("Failed to save profile"); }
    setSavingProfile(false);
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
      toast.success("A 6-digit code has been sent to your email.");
    } else {
      toast.error(result.error || "Failed to send code.");
      setPwStep("idle");
    }
  };

  const handleVerifyCode = async () => {
    if (!user?.email || otpCode.length < 6) {
      toast.error("Please enter the 6-digit code.");
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

  const initials = (profile.display_name || user?.email || "P")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const inputCls = "h-10 text-[12px] bg-gray-50 border-gray-200 focus:bg-white focus:border-[#2F4F97] focus:ring-1 focus:ring-[#2F4F97] transition-colors shadow-none";

  const mainDocs = [
    { field: "nid_document_url", label: "National ID / Passport" },
    { field: "trade_license_url", label: "Trade License" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-[12px] font-normal tracking-tight text-[#1E293B]">My Profile</h1>
        <p className="text-muted-foreground text-[12px] mt-1">Manage your account, agency details, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ────────── Left Column: Account Settings ────────── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-[12px]">
                <User className="h-5 w-5 text-[#2F4F97]" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your personal profile and security.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-[12px] font-normal bg-[#2F4F97]/10 text-[#2F4F97]">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Display Name</Label>
                  <Input
                    value={profile.display_name}
                    onChange={e => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your display name"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Login Email</Label>
                  <Input value={user?.email || ""} disabled className="h-10 text-[12px] bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" />
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full bg-[#1E293B] hover:bg-[#1E293B]/90 text-white gap-2 font-normal text-[12px] h-10 mt-2">
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile
                </Button>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-[#2F4F97]" />
                  <span className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Security</span>
                </div>

                {pwStep === "idle" && (
                  <Button onClick={handleSendCode} variant="outline" className="w-full text-[#1E293B] border-gray-200 hover:bg-gray-50 gap-2 font-normal text-[12px] h-10">
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </Button>
                )}

                {pwStep === "sending" && (
                  <div className="flex items-center gap-3 text-[12px] text-gray-500 justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2F4F97]" />
                    Sending code...
                  </div>
                )}

                {pwStep === "code_sent" && (
                  <div className="space-y-3">
                    <p className="text-[12px] text-gray-500 leading-tight">Code sent to {user?.email}. Check your inbox.</p>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      className={inputCls + " tracking-[0.3em] text-center font-normal text-[12px]"}
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleVerifyCode} disabled={otpCode.length < 6} className="flex-1 bg-[#1E293B] hover:bg-[#1E293B]/90 text-white text-[12px] h-9">
                        Verify
                      </Button>
                      <Button variant="ghost" onClick={resetPwFlow} className="text-gray-500 text-[12px] h-9">Cancel</Button>
                    </div>
                  </div>
                )}

                {pwStep === "verifying" && (
                  <div className="flex items-center gap-3 text-[12px] text-gray-500 justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2F4F97]" />
                    Verifying...
                  </div>
                )}

                {pwStep === "verified" && (
                  <div className="space-y-3">
                    <p className="text-[12px] text-green-600 font-normal leading-tight">Code verified! Set new password.</p>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className={inputCls}
                    />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className={inputCls}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdatePassword} disabled={newPassword.length < 6} className="flex-1 bg-[#1E293B] hover:bg-[#1E293B]/90 text-white text-[12px] h-9">
                        Update
                      </Button>
                      <Button variant="ghost" onClick={resetPwFlow} className="text-gray-500 text-[12px] h-9">Cancel</Button>
                    </div>
                  </div>
                )}
                {pwStep === "updating" && (
                  <div className="flex items-center gap-3 text-[12px] text-gray-500 justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2F4F97]" />
                    Updating...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ────────── Right Column: Agency Info & Docs ────────── */}
        <div className="lg:col-span-2 space-y-6">
        {partner && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4 relative">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[12px]">
                    <Building2 className="h-5 w-5 text-[#2F4F97]" />
                    Agency Details
                  </CardTitle>
                  <CardDescription>Your registered agency information.</CardDescription>
                </div>
                {isEditingAgency ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAgency(false)}>
                      <X className="h-4 w-4 mr-1.5" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveAgency} disabled={savingAgency} className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white font-normal">
                      {savingAgency ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditingAgency}>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingAgency && editAgencyData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Agency Name</Label>
                    <Input value={editAgencyData.agency_name} onChange={e => setEditAgencyData({...editAgencyData, agency_name: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Contact Person</Label>
                    <Input value={editAgencyData.contact_person} onChange={e => setEditAgencyData({...editAgencyData, contact_person: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Email (Cannot be changed)</Label>
                    <Input value={editAgencyData.email} disabled className="h-10 text-[12px] bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Phone</Label>
                    <Input value={editAgencyData.phone || ""} onChange={e => setEditAgencyData({...editAgencyData, phone: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Country</Label>
                    <Input value={editAgencyData.country || ""} onChange={e => setEditAgencyData({...editAgencyData, country: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-normal text-gray-500 uppercase tracking-widest">Annual Students</Label>
                    <Input type="number" value={editAgencyData.annual_students || ""} onChange={e => setEditAgencyData({...editAgencyData, annual_students: parseInt(e.target.value) || 0})} className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InfoRow icon={Building2} label="Agency Name" value={partner.agency_name} />
                  <InfoRow icon={Users} label="Contact Person" value={partner.contact_person} />
                  <InfoRow icon={Mail} label="Email" value={partner.email} />
                  <InfoRow icon={Phone} label="Phone" value={partner.phone || "Not provided"} />
                  <InfoRow icon={Globe} label="Country" value={partner.country || "Not provided"} />
                  <InfoRow icon={Users} label="Annual Students" value={String(partner.annual_students || 0)} />
                  <div className="sm:col-span-2 pt-2 border-t border-gray-100 mt-2">
                    <p className="text-[12px] font-normal text-gray-500 uppercase tracking-widest mb-2">Account Status</p>
                    <Badge variant="outline" className={
                      partner.status === "approved" ? "bg-green-500/10 text-green-600 border-green-200" :
                      partner.status === "rejected" ? "bg-red-500/10 text-red-600 border-red-200" :
                      "bg-amber-500/10 text-amber-600 border-amber-200"
                    }>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {partner.admin_notes && partner.status !== "approved" && (
                    <div id="admin-notes-section" className="sm:col-span-2 pt-4 border-t border-gray-100 mt-2 rounded-2xl transition-all">
                      <p className="text-[12px] font-normal text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <ClipboardList className="h-3.5 w-3.5 text-[#2F4F97]" />
                        Notes from Admin
                      </p>
                      <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 text-[12px] text-gray-700 whitespace-pre-wrap shadow-sm">
                        {partner.admin_notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* ────────── Agency Documents Card ────────── */}
      {partner && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[12px]">
              <FileCheck className="h-5 w-5 text-[#2F4F97]" />
              Agency Documents
            </CardTitle>
            <CardDescription>Manage your compliance and registration documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mainDocs.map((doc) => {
                const url = (partner as any)[doc.field] as string | undefined;
                const isUploading = docUploading[doc.field];
                return (
                  <div
                    key={doc.field}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors text-center relative group ${
                      url
                        ? "bg-green-50/40 border-green-200/60 hover:border-green-300"
                        : "bg-muted/10 border-dashed hover:border-border/80"
                    }`}
                  >
                    {url ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                    ) : (
                      <FileText className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    )}
                    
                    <p className="text-[12px] font-normal leading-tight mb-3 px-1 text-muted-foreground h-6 flex items-center justify-center">
                      {doc.label}
                    </p>

                    <div className="flex items-center gap-2 mt-auto">
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview Document"
                          className="h-7 w-7 rounded-full bg-white border border-border flex items-center justify-center text-[#2F4F97] hover:bg-muted transition-colors shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
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
                      <button
                        type="button"
                        title={url ? "Replace Document" : "Upload Document"}
                        disabled={isUploading}
                        onClick={() => docInputRefs.current[doc.field]?.click()}
                        className={`h-7 w-7 rounded-full bg-white border border-border flex items-center justify-center transition-colors shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {isUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-normal text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-[12px] font-normal text-[#1E293B]">{value}</p>
    </div>
  );
}
