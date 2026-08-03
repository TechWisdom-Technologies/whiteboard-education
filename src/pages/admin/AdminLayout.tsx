import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout() {
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path.includes("/admin/universities")) return "Universities";
    if (path.includes("/admin/courses")) return "Courses";
    if (path.includes("/admin/accommodations")) return "Accommodations";
    if (path.includes("/admin/language-centers")) return "Language Centers";
    if (path.includes("/admin/blogs")) return "Blog Posts";
    if (path.includes("/admin/partners")) return "B2B Partners";
    if (path.includes("/admin/students")) return "Students";
    if (path.includes("/admin/leads")) return "Leads";
    if (path.includes("/admin/settings")) return "Settings";
    return "Admin Panel";
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-[60px] flex items-center border-b border-gray-200/60 px-4 sm:px-6 gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 justify-between shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-extrabold text-[16px] text-gray-800 tracking-tight">
                {getPageTitle()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end flex-1 sm:flex-none">
              <div className="flex items-center gap-4">
                <AdminNotificationCenter />
                <div className="flex items-center gap-3">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-[13px] font-bold text-gray-800 leading-tight">
                      {profile?.display_name || (hasRole("admin") ? "Administrator" : "User")}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate max-w-[160px] font-medium leading-tight">
                      {user?.email}
                    </span>
                  </div>
                  <Avatar className="h-9 w-9 ring-2 ring-gray-100 transition-transform hover:scale-105 cursor-pointer shadow-sm rounded-full overflow-hidden shrink-0">
                    <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" className="object-cover w-full h-full rounded-full" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold rounded-full">
                      {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-[#F8FAFC] overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
