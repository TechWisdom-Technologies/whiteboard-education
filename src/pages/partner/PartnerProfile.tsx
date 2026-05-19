import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera, Save, Building2, Mail, Phone, Globe, Users, Loader2,
  User, Lock, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";

interface PartnerData {
  agency_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  annual_students: number;
  status: string;
}

interface UserProfile {
  display_name: string;
  avatar_url: string;
}

type PasswordStep = "idle" | "sending" | "code_sent" | "verifying" | "verified" | "updating";

export default function PartnerProfile() {
  const { user, session, resetPassword, verifyResetOtp, updatePassword } = useAuth();
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

  useEffect(() => {
    if (!session || !user) return;
    const fetchData = async () => {
      try {
        const { data: partnerData } = await supabase
          .from("partner_registrations")
          .select("agency_name, contact_person, email, phone, country, annual_students, status")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffa300]" />
      </div>
    );
  }

  const initials = (profile.display_name || user?.email || "P")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const inputCls = "h-10 text-[13px] bg-gray-50 border-gray-200 focus:bg-white focus:border-[#ffa300] focus:ring-1 focus:ring-[#ffa300] transition-colors shadow-none";

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#181d29]">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, agency details, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ────────── Profile Card ────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#ffa300]" />
              Personal Info
            </CardTitle>
            <CardDescription>Update your display name and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group shrink-0">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl font-bold bg-[#ffa300]/10 text-[#ffa300]">{initials}</AvatarFallback>
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
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Display Name</Label>
                  <Input
                    value={profile.display_name}
                    onChange={e => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your display name"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Login Email</Label>
                  <Input value={user?.email || ""} disabled className="h-10 text-[13px] bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Email cannot be changed.</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto bg-[#181d29] hover:bg-[#181d29]/90 text-white gap-2 font-semibold text-[13px] h-10 mt-4">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ────────── Agency Details Card ────────── */}
        {partner && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-[#ffa300]" />
                Agency Details
              </CardTitle>
              <CardDescription>Your registered agency information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow icon={Building2} label="Agency Name" value={partner.agency_name} />
                <InfoRow icon={Users} label="Contact Person" value={partner.contact_person} />
                <InfoRow icon={Mail} label="Email" value={partner.email} />
                <InfoRow icon={Phone} label="Phone" value={partner.phone || "Not provided"} />
                <InfoRow icon={Globe} label="Country" value={partner.country || "Not provided"} />
                <InfoRow icon={Users} label="Annual Students" value={String(partner.annual_students || 0)} />
                <div className="sm:col-span-2 pt-2 border-t border-gray-100 mt-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Account Status</p>
                  <Badge variant="outline" className={
                    partner.status === "approved" ? "bg-green-500/10 text-green-600 border-green-200" :
                    partner.status === "rejected" ? "bg-red-500/10 text-red-600 border-red-200" :
                    "bg-amber-500/10 text-amber-600 border-amber-200"
                  }>
                    {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ────────── Security / Change Password Card ────────── */}
      <Card className="shadow-sm max-w-5xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-[#ffa300]" />
            Security
          </CardTitle>
          <CardDescription>Update your account password using email verification.</CardDescription>
        </CardHeader>
        <CardContent>
          {pwStep === "idle" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">To change your password, we'll send a 6-digit verification code to <span className="font-semibold text-[#181d29]">{user?.email}</span>.</p>
              </div>
              <Button onClick={handleSendCode} className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 gap-2 font-semibold text-[13px] h-10 shrink-0">
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          )}

          {pwStep === "sending" && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#ffa300]" />
              Sending verification code to your email...
            </div>
          )}

          {pwStep === "code_sent" && (
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-sm">
                <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-blue-700">A 6-digit code has been sent to <span className="font-bold">{user?.email}</span>. Check your inbox (and spam folder).</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Verification Code</Label>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className={inputCls + " tracking-[0.3em] text-center font-bold text-lg"}
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleVerifyCode} disabled={otpCode.length < 6} className="bg-[#181d29] hover:bg-[#181d29]/90 text-white gap-2 font-semibold text-[13px] h-10">
                  <ArrowRight className="h-4 w-4" /> Verify Code
                </Button>
                <Button variant="ghost" onClick={resetPwFlow} className="text-gray-500 text-[13px] h-10">Cancel</Button>
              </div>
            </div>
          )}

          {pwStep === "verifying" && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#ffa300]" />
              Verifying code...
            </div>
          )}

          {pwStep === "verified" && (
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-sm">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-green-700 font-medium">Code verified! Set your new password below.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className={inputCls}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleUpdatePassword} className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 gap-2 font-semibold text-[13px] h-10">
                  <Save className="h-4 w-4" /> Update Password
                </Button>
                <Button variant="ghost" onClick={resetPwFlow} className="text-gray-500 text-[13px] h-10">Cancel</Button>
              </div>
            </div>
          )}

          {pwStep === "updating" && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#ffa300]" />
              Updating your password...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm font-medium text-[#181d29]">{value}</p>
    </div>
  );
}
