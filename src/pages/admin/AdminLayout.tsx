import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
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



  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full dashboard-theme">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-[60px] flex items-center bg-[#2F4F97] text-white px-4 sm:px-6 gap-3 sticky top-0 z-10 justify-between shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end flex-1 sm:flex-none">
              <div className="flex items-center gap-4">
                <AdminNotificationCenter />
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                      <span className="text-[14px] font-medium text-white hover:text-gray-200 transition-colors">
                        Hello, {profile?.display_name || "Admin"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-white/80" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{profile?.display_name || "Admin"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">Role: Admin</p>
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
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-[#F8FAFC] min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
