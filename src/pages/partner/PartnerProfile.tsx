import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
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
  User, KeyRound, ShieldCheck, CheckCircle2, Pencil,
  ExternalLink, AlertCircle, Save, Facebook, Linkedin, Instagram, Youtube
} from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface PartnerData {
  agency_name: string;
  agency_email: string;
  agency_phone: string;
  country: string;
  annual_students: number;
  website_url: string;
  facebook_url: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  contact_person: string;
  rep_phone: string;
  rep_email: string;
  status: string;
  admin_notes?: string;
  certificate_urls?: any;
}

interface UserProfile {
  display_name: string;
  avatar_url: string;
}

type PasswordStep = "idle" | "sending" | "code_sent" | "verifying" | "verified" | "updating";

function OtpDigitBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 8 }, (_, i) => value[i] || "");

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange(combined);
    if (index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, 7);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="h-11 w-8 sm:w-9 text-center font-bold text-base bg-white text-rose-600 rounded-xl border border-slate-300 outline-none focus:outline-none focus:bg-white focus:text-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:caret-rose-600 shadow-2xs transition-all select-none"
        />
      ))}
    </div>
  );
}

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
  const [pwError, setPwError] = useState<string | null>(null);

  const [isEditingAgency, setIsEditingAgency] = useState(false);
  const [savingAgency, setSavingAgency] = useState(false);
  const [editAgencyData, setEditAgencyData] = useState<PartnerData | null>(null);

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
          .select("agency_name, contact_person, email, phone, country, annual_students, status, admin_notes, certificate_urls")
          .eq("user_id", user.id)
          .maybeSingle();

        if (partnerData) {
          let extendedMeta: any = {};
          if (partnerData.certificate_urls && typeof partnerData.certificate_urls === 'object' && !Array.isArray(partnerData.certificate_urls)) {
            extendedMeta = partnerData.certificate_urls;
          }
          
          const localExtra = localStorage.getItem(`partner_extra_${user.id}`);
          if (localExtra) {
            try {
              extendedMeta = { ...extendedMeta, ...JSON.parse(localExtra) };
            } catch { /* ignore */ }
          }

          const pData: PartnerData = {
            agency_name: partnerData.agency_name || "",
            agency_email: extendedMeta.agency_email || partnerData.email || "",
            agency_phone: extendedMeta.agency_phone || partnerData.phone || "",
            country: partnerData.country || "",
            annual_students: partnerData.annual_students || 0,
            website_url: extendedMeta.website_url || "",
            facebook_url: extendedMeta.facebook_url || "",
            linkedin_url: extendedMeta.linkedin_url || "",
            instagram_url: extendedMeta.instagram_url || "",
            youtube_url: extendedMeta.youtube_url || "",
            contact_person: partnerData.contact_person || "",
            rep_phone: extendedMeta.rep_phone || partnerData.phone || "",
            rep_email: extendedMeta.rep_email || partnerData.email || "",
            status: partnerData.status || "pending",
            admin_notes: partnerData.admin_notes || "",
            certificate_urls: partnerData.certificate_urls,
          };
          setPartner(pData);
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
      const extendedMeta = {
        ...(typeof editAgencyData.certificate_urls === 'object' && !Array.isArray(editAgencyData.certificate_urls) ? editAgencyData.certificate_urls : {}),
        agency_email: editAgencyData.agency_email,
        agency_phone: editAgencyData.agency_phone,
        website_url: editAgencyData.website_url,
        facebook_url: editAgencyData.facebook_url,
        linkedin_url: editAgencyData.linkedin_url,
        instagram_url: editAgencyData.instagram_url,
        youtube_url: editAgencyData.youtube_url,
        rep_phone: editAgencyData.rep_phone,
        rep_email: editAgencyData.rep_email,
      };

      localStorage.setItem(`partner_extra_${user.id}`, JSON.stringify(extendedMeta));

      const { error } = await supabase.from("partner_registrations").update({
        agency_name: editAgencyData.agency_name,
        contact_person: editAgencyData.contact_person,
        email: editAgencyData.agency_email || editAgencyData.rep_email || partner?.agency_email,
        phone: editAgencyData.agency_phone || editAgencyData.rep_phone || partner?.agency_phone,
        country: editAgencyData.country,
        annual_students: editAgencyData.annual_students,
        certificate_urls: extendedMeta,
      }).eq("user_id", user.id);
      
      if (error) throw error;
      setPartner(editAgencyData);
      window.dispatchEvent(new Event("profile-updated"));
      toast.success("Agency details updated successfully!");
      setIsEditingAgency(false);
    } catch (err: any) {
      toast.error("Failed to update agency details: " + (err.message || "Unknown error"));
    }
    setSavingAgency(false);
  };

  // ─── Password Change Flow ───
  const handleSendCode = async () => {
    if (!user?.email) return;
    setPwError(null);
    setPwStep("sending");
    const result = await resetPassword(user.email);
    if (result.success) {
      setPwStep("code_sent");
      setPwError(null);
    } else {
      setPwStep("idle");
      setPwError(result.error || "Failed to send code. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    setPwError(null);
    if (!user?.email || otpCode.length < 8) {
      setPwError("Please enter the complete 8-digit verification code.");
      return;
    }
    setPwStep("verifying");
    const result = await verifyResetOtp(user.email, otpCode);
    if (result.success) {
      setPwStep("verified");
      setPwError(null);
    } else {
      setPwStep("code_sent");
      const rawErr = result.error || "";
      if (
        rawErr.toLowerCase().includes("token") ||
        rawErr.toLowerCase().includes("invalid") ||
        rawErr.toLowerCase().includes("expired")
      ) {
        setPwError("The verification code has expired or is invalid. Please check your code or request a new one.");
      } else {
        setPwError(rawErr || "Invalid verification code. Please try again.");
      }
    }
  };

  const handleUpdatePassword = async () => {
    setPwError(null);
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match. Please re-enter.");
      return;
    }
    setPwStep("updating");
    const result = await updatePassword(newPassword);
    if (result.success) {
      toast.success("Password updated successfully!");
      setPwStep("idle");
      setOtpCode(""); setNewPassword(""); setConfirmPassword(""); setPwError(null);
    } else {
      setPwStep("verified");
      setPwError(result.error || "Failed to update password. Please try again.");
    }
  };

  const resetPwFlow = () => {
    setPwStep("idle"); setOtpCode(""); setNewPassword(""); setConfirmPassword(""); setPwError(null);
  };

  if (loading) return <LoadingScreen fullScreen />;

  const initials = (partner?.agency_name || partner?.contact_person || user?.email || "PA")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const inputCls = "h-12 text-base bg-white text-black border border-slate-300 rounded-xl px-3.5 focus:bg-white focus:text-black focus:border-[#2F4F97] focus:ring-2 focus:ring-[#2F4F97]/20 focus:caret-black placeholder:text-gray-400 focus:placeholder:text-gray-400 transition-all shadow-none font-normal";

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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                  {partner?.agency_name || "Partner Agency"}
                </h1>
                {partner?.contact_person && (
                  <p className="text-black text-sm font-normal flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <User className="h-4 w-4 shrink-0 text-black" /> {partner.contact_person}
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
                <span className="text-sm text-black font-normal flex items-center gap-1.5"><Mail className="w-4 h-4 text-black"/> {partner.agency_email || partner.rep_email || user?.email}</span>
                {(partner.agency_phone || partner.rep_phone) && <span className="text-sm text-black font-normal flex items-center gap-1.5"><Phone className="w-4 h-4 text-black"/> {partner.agency_phone || partner.rep_phone}</span>}
                {partner.country && <span className="text-sm text-black font-normal flex items-center gap-1.5"><Globe className="w-4 h-4 text-black"/> {partner.country}</span>}
              </div>
            )}
          </div>
        </div>

          <div className="p-6 sm:p-8 space-y-10">
            {/* 1. Agency Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">Agency Information</h3>
                {isEditingAgency ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAgency(false)} className="h-9 px-3.5 text-xs font-semibold">Cancel</Button>
                    <Button size="sm" onClick={handleSaveAgency} disabled={savingAgency} className="h-9 px-4 text-xs font-semibold shadow-sm">
                      {savingAgency ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditingAgency} className="h-9 px-4 text-xs font-semibold text-slate-700">
                    <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#2F4F97]" /> Edit Details
                  </Button>
                )}
              </div>

              {isEditingAgency && editAgencyData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Agency Name</Label>
                    <Input value={editAgencyData.agency_name} onChange={e => setEditAgencyData({...editAgencyData, agency_name: e.target.value})} className={inputCls} placeholder="e.g. Acme Education" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Agency Official Email</Label>
                    <Input value={editAgencyData.agency_email} onChange={e => setEditAgencyData({...editAgencyData, agency_email: e.target.value})} className={inputCls} placeholder="e.g. info@agency.com" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Agency Phone</Label>
                    <Input value={editAgencyData.agency_phone} onChange={e => setEditAgencyData({...editAgencyData, agency_phone: e.target.value})} className={inputCls} placeholder="e.g. +60 12-345 6789" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Country of Operation</Label>
                    <Input value={editAgencyData.country} onChange={e => setEditAgencyData({...editAgencyData, country: e.target.value})} className={inputCls} placeholder="e.g. Malaysia, Bangladesh" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Annual Students</Label>
                    <Input type="number" value={editAgencyData.annual_students || ""} onChange={e => setEditAgencyData({...editAgencyData, annual_students: parseInt(e.target.value) || 0})} className={inputCls} placeholder="e.g. 50" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Website</Label>
                    <Input value={editAgencyData.website_url} onChange={e => setEditAgencyData({...editAgencyData, website_url: e.target.value})} className={inputCls} placeholder="e.g. https://www.agency.com" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Facebook Link</Label>
                    <Input value={editAgencyData.facebook_url} onChange={e => setEditAgencyData({...editAgencyData, facebook_url: e.target.value})} className={inputCls} placeholder="https://facebook.com/youragency" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">LinkedIn Link</Label>
                    <Input value={editAgencyData.linkedin_url} onChange={e => setEditAgencyData({...editAgencyData, linkedin_url: e.target.value})} className={inputCls} placeholder="https://linkedin.com/company/youragency" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Instagram Link</Label>
                    <Input value={editAgencyData.instagram_url} onChange={e => setEditAgencyData({...editAgencyData, instagram_url: e.target.value})} className={inputCls} placeholder="https://instagram.com/youragency" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">YouTube Link</Label>
                    <Input value={editAgencyData.youtube_url} onChange={e => setEditAgencyData({...editAgencyData, youtube_url: e.target.value})} className={inputCls} placeholder="https://youtube.com/@youragency" />
                  </div>
                </div>
              ) : partner ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  <InfoTile icon={Building2} label="Agency Name" value={partner.agency_name} />
                  <InfoTile icon={Mail} label="Agency Official Email" value={partner.agency_email} />
                  <InfoTile icon={Phone} label="Agency Phone" value={partner.agency_phone} />
                  <InfoTile icon={Globe} label="Country of Operation" value={partner.country} />
                  <InfoTile icon={Users} label="Annual Students" value={String(partner.annual_students || 0)} />
                  <InfoTile icon={Globe} label="Website" value={partner.website_url} isLink={!!partner.website_url} />
                  <InfoTile icon={Facebook} label="Facebook" value={partner.facebook_url} isLink={!!partner.facebook_url} />
                  <InfoTile icon={Linkedin} label="LinkedIn" value={partner.linkedin_url} isLink={!!partner.linkedin_url} />
                  <InfoTile icon={Instagram} label="Instagram" value={partner.instagram_url} isLink={!!partner.instagram_url} />
                  <InfoTile icon={Youtube} label="YouTube" value={partner.youtube_url} isLink={!!partner.youtube_url} />
                </div>
              ) : null}
            </div>

            {/* 2. Agency Representative Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black">Agency Representative Information</h3>

              {isEditingAgency && editAgencyData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Contact Person Name</Label>
                    <Input value={editAgencyData.contact_person} onChange={e => setEditAgencyData({...editAgencyData, contact_person: e.target.value})} className={inputCls} placeholder="e.g. John Doe" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Representative Phone</Label>
                    <Input value={editAgencyData.rep_phone} onChange={e => setEditAgencyData({...editAgencyData, rep_phone: e.target.value})} className={inputCls} placeholder="e.g. +60 11-1234 5678" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider">Representative Email</Label>
                    <Input value={editAgencyData.rep_email} onChange={e => setEditAgencyData({...editAgencyData, rep_email: e.target.value})} className={inputCls} placeholder="e.g. contact@agency.com" />
                  </div>
                </div>
              ) : partner ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  <InfoTile icon={User} label="Contact Person Name" value={partner.contact_person} />
                  <InfoTile icon={Phone} label="Phone" value={partner.rep_phone} />
                  <InfoTile icon={Mail} label="Email" value={partner.rep_email} />
                </div>
              ) : null}
            </div>

            {/* 3. Change Password / Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black">Change Password</h3>
              
              <div className="bg-white p-6 sm:p-7 rounded-2xl border-2 border-rose-400 shadow-sm w-full max-w-4xl">
                {pwStep === "idle" && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-black font-normal">
                      <ShieldCheck className="h-8 w-8 text-rose-600 shrink-0" />
                      <p className="text-xs sm:text-sm leading-relaxed text-black font-normal">
                        Your account uses email verification (OTP) for password updates to ensure maximum security.
                      </p>
                    </div>
                    <Button
                      onClick={handleSendCode}
                      variant="outline"
                      className="group w-full sm:w-auto shrink-0 gap-2 font-normal text-xs h-9.5 px-4 rounded-lg shadow-sm border border-rose-300 text-rose-700 bg-white hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                    >
                      <KeyRound className="h-3.5 w-3.5 group-hover:!text-white !text-rose-600" /> Update Password
                    </Button>
                  </div>
                )}

                {pwStep === "sending" && (
                  <div className="flex items-center justify-center py-6 gap-2.5 text-xs text-rose-600 font-normal">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" /> Sending code to your email...
                  </div>
                )}

                {pwStep === "code_sent" && (
                  <div className="space-y-4 animate-fade-in w-full">
                    <p className="text-xs text-rose-600 font-normal leading-relaxed">
                      An 8-digit code has been sent to <span className="font-semibold text-rose-700">{user?.email}</span>.
                    </p>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 pt-1 w-full">
                      <Label className="text-xs sm:text-[13px] font-medium text-rose-600 uppercase shrink-0 whitespace-nowrap">Verification Code</Label>
                      
                      <OtpDigitBoxes value={otpCode} onChange={(val) => { setOtpCode(val); if (pwError) setPwError(null); }} />

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          onClick={handleVerifyCode}
                          disabled={otpCode.length < 8}
                          className="font-normal text-xs h-11 px-4 sm:px-5 rounded-xl bg-rose-600 hover:bg-white text-white hover:text-rose-600 border border-rose-600 transition-all shadow-sm whitespace-nowrap"
                        >
                          Verify
                        </Button>
                        <Button
                          onClick={resetPwFlow}
                          className="font-normal text-xs h-11 px-4 rounded-xl bg-slate-100 hover:bg-white text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-600 transition-all shadow-none whitespace-nowrap"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>

                    {pwError && (
                      <div className="flex items-center gap-2 text-xs text-rose-600 font-medium pt-1 animate-fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                        <span>{pwError}</span>
                      </div>
                    )}
                  </div>
                )}

                {pwStep === "verifying" && (
                  <div className="flex items-center justify-center py-6 gap-2.5 text-xs text-rose-600 font-normal">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" /> Verifying code...
                  </div>
                )}

                {pwStep === "verified" && (
                  <div className="space-y-4 animate-fade-in max-w-xl">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> Code verified! Set your new password.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-[#2F4F97] uppercase">New Password</Label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); if (pwError) setPwError(null); }}
                          placeholder="Min 6 chars"
                          className="flex h-12 w-full text-sm bg-white text-rose-600 border border-slate-300 rounded-xl px-3.5 outline-none focus:outline-none focus:bg-white focus:text-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:caret-rose-600 placeholder:text-gray-400 transition-all font-normal shadow-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-[#2F4F97] uppercase">Confirm Password</Label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); if (pwError) setPwError(null); }}
                          placeholder="Re-type password"
                          className="flex h-12 w-full text-sm bg-white text-rose-600 border border-slate-300 rounded-xl px-3.5 outline-none focus:outline-none focus:bg-white focus:text-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:caret-rose-600 placeholder:text-gray-400 transition-all font-normal shadow-none"
                        />
                      </div>
                    </div>

                    {pwError && (
                      <div className="flex items-center gap-2 text-xs text-rose-600 font-medium pt-1 animate-fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                        <span>{pwError}</span>
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-1">
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={newPassword.length < 6}
                        className="flex-1 font-normal text-xs h-11 rounded-xl bg-rose-600 hover:bg-white text-white hover:text-rose-600 border border-rose-600 transition-all shadow-sm"
                      >
                        Update Password
                      </Button>
                      <Button
                        onClick={resetPwFlow}
                        className="font-normal text-xs h-11 px-4 rounded-xl bg-slate-100 hover:bg-white text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-600 transition-all shadow-none"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {pwStep === "updating" && (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-black font-normal">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" /> Updating password...
                  </div>
                )}
              </div>
            </div>

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
          </div>

      </Card>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, isLink = false }: { icon: any; label: string; value?: string | null; isLink?: boolean }) {
  const isEmpty = !value || value.trim() === "";
  const displayValue = isEmpty ? "Not provided" : value;
  const href = isLink && !isEmpty ? (value.startsWith("http") ? value : `https://${value}`) : undefined;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white flex items-start gap-4 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="p-2.5 rounded-xl bg-[#2F4F97]/5 text-[#2F4F97] shrink-0 mt-0.5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-[13px] font-medium text-[#2F4F97] uppercase tracking-wider mb-1">{label}</p>
        {isLink && href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[16px] sm:text-[17px] font-normal text-[#2F4F97] hover:underline flex items-center gap-1.5 truncate leading-snug"
          >
            <span className="truncate">{displayValue}</span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-70" />
          </a>
        ) : (
          <p className={`text-[16px] sm:text-[17px] font-normal truncate leading-snug ${isEmpty ? "text-black/60 italic" : "text-black"}`}>
            {displayValue}
          </p>
        )}
      </div>
    </div>
  );
}

