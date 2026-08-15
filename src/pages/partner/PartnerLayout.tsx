import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";
import { NotificationCenter } from "@/components/partner/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export default function PartnerLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");

  const loadProfile = async () => {
    if (!user) return;
    const localAvatar = localStorage.getItem(`partner_avatar_${user.id}`);
    if (localAvatar) setAvatarUrl(localAvatar);

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        localStorage.setItem(`partner_avatar_${user.id}`, data.avatar_url);
      }
      if (data.display_name) setDisplayName(data.display_name);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleUpdate = () => loadProfile();
    window.addEventListener("profile-updated", handleUpdate);

    if (!user) return;
    const channel = supabase
      .channel(`partner-layout-profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => loadProfile()
      )
      .subscribe();

    return () => {
      window.removeEventListener("profile-updated", handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/partner-dashboard") return "Dashboard";
    if (path.includes("/partner-dashboard/students")) return "Students";
    if (path.includes("/partner-dashboard/applications")) return "Applications";
    if (path.includes("/partner-dashboard/search-programs")) return "Search Programs";
    if (path.includes("/partner-dashboard/marketing")) return "Documents";
    if (path.includes("/partner-dashboard/notifications")) return "Notifications";
    if (path.includes("/partner-dashboard/profile")) return "My Profile";
    return "Partner Portal";
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <PartnerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-[60px] flex items-center border-b px-3 sm:px-4 gap-2 sm:gap-3 bg-background sticky top-0 z-20 justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-bold text-[15px] text-foreground tracking-tight ml-1">
                {getPageTitle()}
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end flex-1 sm:flex-none">
              <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="flex items-center gap-3">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-[13px] font-bold text-gray-800 leading-tight">
                      {displayName || "Partner"}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate max-w-[160px] font-medium leading-tight">
                      {user?.email}
                    </span>
                  </div>
                  <Avatar className="h-9 w-9 ring-2 ring-gray-100 transition-transform hover:scale-105 cursor-pointer shadow-sm rounded-full overflow-hidden shrink-0">
                    <AvatarImage src={avatarUrl} alt={displayName || user?.email || "Avatar"} className="object-cover w-full h-full rounded-full" />
                    <AvatarFallback className="bg-[#2F4F97]/10 text-[#2F4F97] text-xs font-bold rounded-full">
                      {(displayName || user?.email || "P").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 bg-muted/20 overflow-x-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
