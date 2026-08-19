import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera, Building2, Mail, Phone, Globe, Loader2,
  User, KeyRound, ShieldCheck, CheckCircle2, Pencil,
  AlertCircle, Save
} from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";

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
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

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
    if (index < 5) {
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
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, 5);
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
          className="h-11 w-10 sm:w-11 text-center font-bold text-base bg-white text-rose-600 rounded-xl border border-slate-300 outline-none focus:outline-none focus:bg-white focus:text-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:caret-rose-600 shadow-2xs transition-all select-none"
        />
      ))}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  const isEmpty = !value || value.trim() === "";
  const displayValue = isEmpty ? "Not provided" : value;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white flex items-start gap-4 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="p-2.5 rounded-xl bg-[#1E293B]/5 text-[#1E293B] shrink-0 mt-0.5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-[13px] font-medium text-[#1E293B] uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-[16px] sm:text-[17px] font-normal truncate leading-snug ${isEmpty ? "text-black/60 italic" : "text-black"}`}>
          {displayValue}
        </p>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { user, session, resetPassword, verifyResetOtp, updatePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ display_name: "", avatar_url: "" });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<UserProfile>({ display_name: "", avatar_url: "" });

  const [isEditingSystem, setIsEditingSystem] = useState(false);
  const [savingSystem, setSavingSystem] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    companyName: "Whiteboard Education",
    contactEmail: "cambry.bd@gmail.com",
    phoneNumber: "+880 1730589112",
  });
  const [editSystemData, setEditSystemData] = useState({ ...systemSettings });

  // Password change state
  const [pwStep, setPwStep] = useState<PasswordStep>("idle");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !user) return;
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .single();
          
        if (profileData) {
          setProfile({
            display_name: profileData.display_name || "",
            avatar_url: profileData.avatar_url || "",
          });
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [session, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File too large. Max 2MB."); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `admin_${user.id}/avatar_${Date.now()}.${ext}`;
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

  const startEditingProfile = () => {
    setEditProfileData({ ...profile });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await supabase.from("profiles").update({ display_name: editProfileData.display_name }).eq("user_id", user.id);
      setProfile(editProfileData);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch {
      toast.error("Failed to update profile.");
    }
    setSavingProfile(false);
  };

  const startEditingSystem = () => {
    setEditSystemData({ ...systemSettings });
    setIsEditingSystem(true);
  };

  const handleSaveSystem = async () => {
    setSavingSystem(true);
    setTimeout(() => {
      setSystemSettings(editSystemData);
      toast.success("System settings updated successfully!");
      setSavingSystem(false);
      setIsEditingSystem(false);
    }, 800);
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
    if (!user?.email || otpCode.length < 6) {
      setPwError("Please enter the complete 6-digit verification code.");
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
      if (rawErr.toLowerCase().includes("token") || rawErr.toLowerCase().includes("invalid") || rawErr.toLowerCase().includes("expired")) {
        setPwError("The verification code has expired or is invalid. Please check your code or request a new one.");
      } else {
        setPwError(rawErr || "Invalid verification code. Please try again.");
      }
    }
  };

  const handleUpdatePassword = async () => {
    setPwError(null);
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters long."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match. Please re-enter."); return; }
    setPwStep("updating");
    const result = await updatePassword(newPassword);
    if (result.success) {
      toast.success("Password updated successfully!");
      setPwStep("idle"); setOtpCode(""); setNewPassword(""); setConfirmPassword(""); setPwError(null);
    } else {
      setPwStep("verified");
      setPwError(result.error || "Failed to update password. Please try again.");
    }
  };

  const resetPwFlow = () => {
    setPwStep("idle"); setOtpCode(""); setNewPassword(""); setConfirmPassword(""); setPwError(null);
  };

  if (loading) return <LoadingScreen fullScreen />;

  const initials = (profile.display_name || user?.email || "A")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const inputCls = "h-12 text-base bg-white text-black border border-slate-300 rounded-xl px-3.5 focus:bg-white focus:text-black focus:border-[#1E293B] focus:ring-2 focus:ring-[#1E293B]/20 focus:caret-black placeholder:text-gray-400 focus:placeholder:text-gray-400 transition-all shadow-none font-normal";

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Profile Setting</h1>
        <p className="text-sm text-muted-foreground">Manage your admin profile, platform settings, and security.</p>
      </div>
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        
        {/* 1. Header: Avatar & Basic Info */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <Avatar className="w-[105px] h-[135px] rounded-lg border border-slate-200 shadow-sm bg-white overflow-hidden p-1">
              <AvatarImage src={profile.avatar_url} className="object-contain w-full h-full rounded-md" />
              <AvatarFallback className="text-3xl font-bold bg-[#1E293B]/10 text-[#1E293B] rounded-md">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Change Avatar"
              className="absolute inset-0 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white gap-1.5"
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
              <span className="text-[10px] font-semibold tracking-wide uppercase">Change</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E293B] mb-3">
                  Whiteboard Education
                </h1>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-[#1E293B] justify-center sm:justify-start">
                    <span className="font-semibold text-[#1E293B]">Admin:</span> {profile.display_name || "System Admin"}
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-[#1E293B] justify-center sm:justify-start">
                    <span className="font-semibold text-[#1E293B]">Admin Email:</span> {user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-[#1E293B] justify-center sm:justify-start">
                    <span className="font-semibold text-[#1E293B]">Phone:</span> {systemSettings.phoneNumber}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-[#1E293B]/10 text-[#1E293B] border-[#1E293B]/30 px-3 py-1 text-xs font-semibold rounded-full uppercase shadow-sm flex items-center gap-1.5 shrink-0 mx-auto sm:mx-0 w-fit">
                <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-10">
          
          {/* 1. Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-black">Admin Profile Information</h3>
              {isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)} className="h-9 px-3.5 text-xs font-semibold">Cancel</Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="h-9 px-4 text-xs font-semibold shadow-sm">
                    {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={startEditingProfile} className="h-9 px-4 text-xs font-semibold text-slate-700">
                  <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#1E293B]" /> Edit Details
                </Button>
              )}
            </div>

            {isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-[13px] font-medium text-[#1E293B] uppercase tracking-wider">Display Name</Label>
                  <Input value={editProfileData.display_name} onChange={e => setEditProfileData({...editProfileData, display_name: e.target.value})} className={inputCls} placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-[13px] font-medium text-gray-400 uppercase tracking-wider">Login Email</Label>
                  <Input value={user?.email || ""} disabled className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
                  <p className="text-[11px] text-gray-500 mt-1">Email cannot be changed here.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <InfoTile icon={User} label="Display Name" value={profile.display_name} />
                <InfoTile icon={Mail} label="Login Email" value={user?.email} />
              </div>
            )}
          </div>

          {/* 2. System Platform Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-black">System Contact Info</h3>
              {isEditingSystem ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSystem(false)} className="h-9 px-3.5 text-xs font-semibold">Cancel</Button>
                  <Button size="sm" onClick={handleSaveSystem} disabled={savingSystem} className="h-9 px-4 text-xs font-semibold shadow-sm">
                    {savingSystem ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={startEditingSystem} className="h-9 px-4 text-xs font-semibold text-slate-700">
                  <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#1E293B]" /> Edit Details
                </Button>
              )}
            </div>

            {isEditingSystem ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-[13px] font-medium text-[#1E293B] uppercase tracking-wider">Company Name</Label>
                  <Input value={editSystemData.companyName} onChange={e => setEditSystemData({...editSystemData, companyName: e.target.value})} className={inputCls} placeholder="e.g. Whiteboard Education" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-[13px] font-medium text-[#1E293B] uppercase tracking-wider">Public Support Email</Label>
                  <Input value={editSystemData.contactEmail} onChange={e => setEditSystemData({...editSystemData, contactEmail: e.target.value})} className={inputCls} placeholder="e.g. support@example.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-[13px] font-medium text-[#1E293B] uppercase tracking-wider">Main Phone Number</Label>
                  <Input value={editSystemData.phoneNumber} onChange={e => setEditSystemData({...editSystemData, phoneNumber: e.target.value})} className={inputCls} placeholder="e.g. +123456789" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <InfoTile icon={Building2} label="Company Name" value={systemSettings.companyName} />
                <InfoTile icon={Mail} label="Public Support Email" value={systemSettings.contactEmail} />
                <InfoTile icon={Phone} label="Main Phone Number" value={systemSettings.phoneNumber} />
              </div>
            )}
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
                    A 6-digit code has been sent to <span className="font-semibold text-rose-700">{user?.email}</span>.
                  </p>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 pt-1 w-full">
                    <Label className="text-xs sm:text-[13px] font-medium text-rose-600 uppercase shrink-0 whitespace-nowrap">Verification Code</Label>
                    
                    <OtpDigitBoxes value={otpCode} onChange={(val) => { setOtpCode(val); if (pwError) setPwError(null); }} />

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={handleVerifyCode}
                        disabled={otpCode.length < 6}
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
                      <Label className="text-xs font-medium text-[#1E293B] uppercase">New Password</Label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); if (pwError) setPwError(null); }}
                        placeholder="Min 6 chars"
                        className="flex h-12 w-full text-sm bg-white text-rose-600 border border-slate-300 rounded-xl px-3.5 outline-none focus:outline-none focus:bg-white focus:text-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 focus:caret-rose-600 placeholder:text-gray-400 transition-all font-normal shadow-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[#1E293B] uppercase">Confirm Password</Label>
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

        </div>
      </Card>
    </div>
  );
}
