import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";
import { NotificationCenter } from "@/components/partner/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";

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


  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex flex-col w-full dashboard-theme">
        <header className="h-[60px] flex items-center bg-[#2F4F97] sticky top-0 z-30 w-full text-white shadow-sm">
          <div className="w-[16rem] flex items-center justify-center bg-transparent h-full flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Logo" className="w-[70%] max-h-12 object-contain shrink-0 mx-auto" />
            ) : (
              <img src="/logo.png" alt="Whiteboard Education" className="w-[70%] max-h-12 object-contain shrink-0 mx-auto" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between px-3 sm:px-4 min-w-0 h-full">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            </div>
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end flex-1 sm:flex-none">
              <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                      <span className="text-[14px] font-medium text-white hover:text-gray-200 transition-colors">
                        Hello, {displayName || "Partner"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-white/80" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{displayName || "Partner"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">Role: Partner</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => supabase.auth.signOut()} className="text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 w-full relative">
          <PartnerSidebar />
          <main className="flex-1 p-3 sm:p-6 bg-muted/20 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
