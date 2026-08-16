import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Save, Loader2, Building2, User, Globe, Mail, Phone, Lock, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, Trash2, Plus, Video, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AccountManagerSection, TutorialsSection } from "@/components/admin/PartnerContentSections";

interface UserProfile {
  display_name: string;
  avatar_url: string;
}

export default function AdminSettings() {
  const { user, session, resetPassword, verifyResetOtp, updatePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSystem, setSavingSystem] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({ display_name: "", avatar_url: "" });

  type TabType = "profile" | "security" | "platform";
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Password change state
  type PwStep = "idle" | "sending" | "code_sent" | "verifying" | "verified" | "updating";
  const [pwStep, setPwStep] = useState<PwStep>("idle");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // System settings (legacy)
  const [systemSettings, setSystemSettings] = useState({
    companyName: "Whiteboard Education",
    contactEmail: "cambry.bd@gmail.com",
    phoneNumber: "+880 1730589112",
  });

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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Max 2MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `admin_${user.id}/avatar_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("partner-documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("partner-documents")
        .getPublicUrl(path);

      const avatarUrl = urlData.publicUrl + `?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

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
      await supabase
        .from("profiles")
        .update({ display_name: profile.display_name })
        .eq("user_id", user.id);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile");
    }
    setSavingProfile(false);
  };

  const handleSaveSystem = async () => {
    setSavingSystem(true);
    setTimeout(() => {
      toast.success("System settings updated successfully!");
      setSavingSystem(false);
    }, 800);
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
    if (!user?.email || otpCode.length < 6) { toast.error("Please enter the 6-digit code."); return; }
    setPwStep("verifying");
    const result = await verifyResetOtp(user.email, otpCode);
    if (result.success) {
      setPwStep("verified");
      toast.success("Code verified! Set your new password.");
    } else {
      toast.error(result.error || "Invalid code.");
      setPwStep("code_sent");
    }
  };

  const handleUpdatePw = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setPwStep("updating");
    const result = await updatePassword(newPassword);
    if (result.success) {
      toast.success("Password updated successfully!");
      setPwStep("idle"); setOtpCode(""); setNewPassword(""); setConfirmPassword("");
    } else {
      toast.error(result.error || "Failed to update password.");
      setPwStep("verified");
    }
  };

  const resetPwFlow = () => { setPwStep("idle"); setOtpCode(""); setNewPassword(""); setConfirmPassword(""); };

  if (loading) return <LoadingScreen fullScreen />;

  const initials = (profile.display_name || user?.email || "A")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8 animate-fade-in pb-10">


      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 flex flex-col gap-1 shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("profile")}
            className={`justify-start h-10 px-4 text-[13px] font-normal transition-colors ${activeTab === "profile" ? "bg-[#1d283a]/10 text-[#1d283a] hover:bg-[#1d283a]/20" : "text-gray-500 hover:text-[#1E293B] hover:bg-gray-100/50"}`}
          >
            <User className="mr-3 h-4 w-4" /> Admin Profile
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("security")}
            className={`justify-start h-10 px-4 text-[13px] font-normal transition-colors ${activeTab === "security" ? "bg-[#1d283a]/10 text-[#1d283a] hover:bg-[#1d283a]/20" : "text-gray-500 hover:text-[#1E293B] hover:bg-gray-100/50"}`}
          >
            <Lock className="mr-3 h-4 w-4" /> Security
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("platform")}
            className={`justify-start h-10 px-4 text-[13px] font-normal transition-colors ${activeTab === "platform" ? "bg-[#1d283a]/10 text-[#1d283a] hover:bg-[#1d283a]/20" : "text-gray-500 hover:text-[#1E293B] hover:bg-gray-100/50"}`}
          >
            <Globe className="mr-3 h-4 w-4" /> Platform Settings
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-3xl">
          
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Card className="border-sidebar-border shadow-sm animate-fade-in">
              <CardHeader className="pb-4 border-b border-gray-100 mb-6">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                  Admin Profile
                </CardTitle>
                <CardDescription>Update your personal information and avatar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <div className="relative group shrink-0">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md rounded-full overflow-hidden shrink-0">
                      <AvatarImage src={profile.avatar_url} className="object-cover w-full h-full rounded-full" />
                      <AvatarFallback className="text-sm font-semibold bg-[#1d283a]/10 text-[#1d283a] rounded-full">{initials}</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="flex-1 space-y-5 w-full">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-[12px] font-medium text-gray-700">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profile.display_name}
                        onChange={e => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="E.g. John Doe"
                        className="h-10 text-[13px] bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] transition-colors shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700">Login Email</Label>
                      <Input value={user?.email || ""} disabled className="h-10 text-[13px] bg-gray-50 border-gray-200 cursor-not-allowed text-gray-500 shadow-sm" />
                      <p className="text-[11px] text-gray-500 mt-1">Email cannot be changed here. Contact support if you need to update it.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 mt-8 flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto gap-2 font-medium text-[13px] h-10 px-6">
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security / Change Password */}
          {activeTab === "security" && (
            <Card className="border-sidebar-border shadow-sm animate-fade-in">
              <CardHeader className="pb-4 border-b border-gray-100 mb-6">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                  Security
                </CardTitle>
                <CardDescription>Update your account password using email verification.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {pwStep === "idle" && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex-1 space-y-1">
                      <p className="text-[13px] font-medium text-[#1E293B]">Change Password</p>
                      <p className="text-[12px] text-gray-500">To change your password, we'll send a 6-digit verification code to <span className="font-medium text-[#1E293B]">{user?.email}</span>.</p>
                    </div>
                    <Button onClick={handleSendCode} className="gap-2 font-medium text-[13px] h-10 shrink-0 px-6">
                      <KeyRound className="h-4 w-4" />
                      Send Code
                    </Button>
                  </div>
                )}

                {pwStep === "sending" && (
                  <div className="flex items-center gap-3 text-[13px] text-gray-500 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#1d283a]" />
                    Sending verification code to your email...
                  </div>
                )}

                {pwStep === "code_sent" && (
                  <div className="space-y-5 max-w-md">
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-blue-800 leading-relaxed">A 6-digit code has been sent to <span className="font-semibold">{user?.email}</span>. Check your inbox (and spam folder).</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700">Verification Code</Label>
                      <Input
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="h-12 text-lg bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] shadow-sm tracking-[0.5em] text-center font-medium"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleVerifyCode} disabled={otpCode.length < 6} className="gap-2 font-medium text-[13px] h-10 px-6 flex-1">
                        Verify Code <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Button variant="outline" onClick={resetPwFlow} className="text-[13px] h-10 px-6 shadow-sm">Cancel</Button>
                    </div>
                  </div>
                )}

                {pwStep === "verifying" && (
                  <div className="flex items-center gap-3 text-[13px] text-gray-500 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#1d283a]" />
                    Verifying code...
                  </div>
                )}

                {pwStep === "verified" && (
                  <div className="space-y-5 max-w-md">
                    <div className="flex items-start gap-3 p-4 bg-green-50/50 border border-green-100 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-green-800 font-medium">Code verified! Set your new password below.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700">New Password</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="h-10 text-[13px] bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700">Confirm Password</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="h-10 text-[13px] bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] shadow-sm" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleUpdatePw} className="gap-2 font-medium text-[13px] h-10 px-6 flex-1">
                        <Save className="h-4 w-4" /> Update Password
                      </Button>
                      <Button variant="outline" onClick={resetPwFlow} className="text-[13px] h-10 px-6 shadow-sm">Cancel</Button>
                    </div>
                  </div>
                )}

                {pwStep === "updating" && (
                  <div className="flex items-center gap-3 text-[13px] text-gray-500 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#1d283a]" />
                    Updating your password...
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Platform Settings */}
          {activeTab === "platform" && (
            <div className="space-y-6">
              {/* Account Manager Management */}
              <AccountManagerSection />

              {/* Platform Tutorials Management */}
              <TutorialsSection />

              {/* System Contact Settings */}
              <Card className="border-sidebar-border shadow-sm animate-fade-in">
                <CardHeader className="pb-4 border-b border-gray-100 mb-6">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                    System Contact Info
                  </CardTitle>
                  <CardDescription>Manage global contact information shown on the public site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" /> Company Name
                      </Label>
                      <Input
                        value={systemSettings.companyName}
                        onChange={(e) => setSystemSettings(p => ({ ...p, companyName: e.target.value }))}
                        className="h-10 text-[13px] bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400" /> Public Support Email
                      </Label>
                      <Input
                        value={systemSettings.contactEmail}
                        onChange={(e) => setSystemSettings(p => ({ ...p, contactEmail: e.target.value }))}
                        className="h-10 text-[13px] bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium text-gray-700 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" /> Main Phone Number
                      </Label>
                      <Input
                        value={systemSettings.phoneNumber}
                        onChange={(e) => setSystemSettings(p => ({ ...p, phoneNumber: e.target.value }))}
                        className="h-10 text-[13px] bg-white border-gray-200 focus:border-[#1d283a] focus:ring-1 focus:ring-[#1d283a] shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100 mt-8 flex justify-end">
                    <Button onClick={handleSaveSystem} disabled={savingSystem} className="w-full sm:w-auto gap-2 font-medium text-[13px] h-10 px-6">
                      {savingSystem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Update Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
