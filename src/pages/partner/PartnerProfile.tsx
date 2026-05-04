import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Save, Building2, Mail, Phone, Globe, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface PartnerProfile {
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

export default function PartnerProfile() {
  const { user, session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ display_name: "", avatar_url: "" });

  useEffect(() => {
    if (!session || !user) return;
    const fetchData = async () => {
      try {
        // Fetch partner registration
        const { data: partnerData } = await supabase
          .from("partner_registrations")
          .select("agency_name, contact_person, email, phone, country, annual_students, status")
          .eq("user_id", user.id)
          .single();
        if (partnerData) setPartner(partnerData);

        // Fetch user profile
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Max 2MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

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
    setSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({ display_name: profile.display_name })
        .eq("user_id", user.id);
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (profile.display_name || user?.email || "P")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold">My Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account and agency details</p>
      </div>

      {/* Avatar & Name Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl font-bold bg-[#ffa300]/10 text-[#ffa300]">{initials}</AvatarFallback>
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
            <div className="flex-1 space-y-3 w-full">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.display_name}
                  onChange={e => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agency Details */}
      {partner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#ffa300]" />
              Agency Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Building2} label="Agency Name" value={partner.agency_name} />
              <InfoRow icon={Users} label="Contact Person" value={partner.contact_person} />
              <InfoRow icon={Mail} label="Email" value={partner.email} />
              <InfoRow icon={Phone} label="Phone" value={partner.phone || "Not provided"} />
              <InfoRow icon={Globe} label="Country" value={partner.country} />
              <InfoRow icon={Users} label="Annual Students" value={String(partner.annual_students || 0)} />
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                <Badge variant="outline" className={
                  partner.status === "approved" ? "bg-green-500/10 text-green-600" :
                  partner.status === "rejected" ? "bg-destructive/10 text-destructive" :
                  "bg-warning/10 text-warning"
                }>
                  {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
