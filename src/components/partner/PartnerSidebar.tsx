import { 
  LayoutDashboard, Users, UserCircle, Bell, Layers,
  LogOut, FileText, Search, CreditCard, BookOpen, Home, ChevronDown, ChevronRight, FolderDown, ExternalLink 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/partner-dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/partner-dashboard/students", icon: Users },
  { title: "Applications", url: "/partner-dashboard/applications", icon: FileText },
  { title: "Search Programs", url: "/partner-dashboard/search-programs", icon: Search },
  { title: "Documents", url: "/partner-dashboard/marketing", icon: FolderDown },
  { title: "Notifications", url: "/partner-dashboard/notifications", icon: Bell },
  { title: "My Profile", url: "/partner-dashboard/profile", icon: UserCircle },
];

const alliedSubItems = [
  { title: "Flywire Payment", icon: CreditCard },
  { title: "Whiteboard Test Preparation", icon: BookOpen },
  { title: "Accommodation", icon: Home },
];

export function PartnerSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadCount, setUnreadCount] = useState(0);
  const [alliedOpen, setAlliedOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const loadAvatar = async () => {
    if (!user) return;
    const localAvatar = localStorage.getItem(`partner_avatar_${user.id}`);
    if (localAvatar) setAvatarUrl(localAvatar);

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
      localStorage.setItem(`partner_avatar_${user.id}`, data.avatar_url);
    }
  };

  useEffect(() => {
    loadAvatar();
    const handleUpdate = () => loadAvatar();
    window.addEventListener("profile-updated", handleUpdate);

    if (!user) return;
    const channel = supabase
      .channel(`partner-sidebar-avatar-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => loadAvatar()
      )
      .subscribe();

    return () => {
      window.removeEventListener("profile-updated", handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { count } = await supabase
      .from("partner_notifications")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", user.id)
      .neq("read", true);

    setUnreadCount(count || 0);
  };

  useEffect(() => {
    loadUnreadCount();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`partner-sidebar-unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_notifications", filter: `partner_id=eq.${user.id}` },
        () => loadUnreadCount()
      )
      .subscribe();

    const pollTimer = window.setInterval(loadUnreadCount, 15000);

    return () => {
      window.clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-[#2d1b4e] bg-[#1a0f2e]">
      {/* Sidebar Header containing centered logo covering 65-70% width */}
      <div className="border-b border-[#2d1b4e] px-3 bg-[#1a0f2e] flex flex-col items-center justify-center gap-1 flex-shrink-0 h-[60px]">
        <div className="flex items-center justify-center w-full">
          {avatarUrl ? (
            collapsed ? (
              <img 
                src={avatarUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain shrink-0 mx-auto" 
              />
            ) : (
              <img 
                src={avatarUrl} 
                alt="Logo" 
                className="w-[70%] max-h-12 object-contain shrink-0 mx-auto" 
              />
            )
          ) : (
            collapsed ? (
              <img src="/icon-white.jpg" alt="W Icon" className="h-8 w-8 object-contain shrink-0 mx-auto" />
            ) : (
              <img src="/logo-white.png" alt="Whiteboard Education" className="w-[70%] max-h-12 object-contain shrink-0 mx-auto" />
            )
          )}
        </div>
      </div>

      {/* Sidebar Content containing shifted-down menu items */}
      <SidebarContent className="bg-[#1a0f2e]">
        <SidebarGroup className="pt-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/partner-dashboard"}
                      className={`relative hover:bg-[#2d1b4e] transition-colors py-1.5 flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}
                      activeClassName="bg-transparent text-white font-bold"
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[3px] bg-white rounded-r-sm" />
                          )}
                          {!collapsed && (
                            <div className="flex items-center gap-2">
                              <span className={`text-[13px] ${isActive ? "text-white font-bold" : "text-[#d1bfe8] font-medium"}`}>{item.title}</span>
                              {item.title === "Notifications" && unreadCount > 0 && (
                                <span className="h-[16px] min-w-[16px] px-1 rounded-xl bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              )}
                            </div>
                          )}
                          <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-[#a38cbd]"}`} strokeWidth={isActive ? 2.5 : 2} />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Allied Services Dropdown Menu Item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setAlliedOpen(!alliedOpen)}
                  className={`relative hover:bg-[#2d1b4e] transition-colors py-1.5 flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}
                >
                  {!collapsed && (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#d1bfe8] font-medium">Allied Services</span>
                      {alliedOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-[#a38cbd]" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-[#a38cbd]" />
                      )}
                    </div>
                  )}
                  <Layers className="h-4 w-4 flex-shrink-0 text-[#a38cbd]" strokeWidth={2} />
                </SidebarMenuButton>

                {/* Sub-menu options when expanded */}
                {!collapsed && alliedOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-1 bg-[#150b26]/50 rounded-lg my-1">
                    {alliedSubItems.map((subItem) => (
                      <div
                        key={subItem.title}
                        className="flex items-center justify-between px-2 py-1.5 text-[#d1bfe8] hover:text-white hover:bg-[#2d1b4e]/70 rounded cursor-pointer transition-colors text-[12px]"
                      >
                        <span className="font-normal text-[12px] truncate">{subItem.title}</span>
                        <subItem.icon className="h-3.5 w-3.5 flex-shrink-0 text-[#a38cbd]" />
                      </div>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>

              {/* Divider */}
              <div className="my-2 mx-2 border-t border-[#2d1b4e]" />

              {/* Go to Website link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.open("/", "_blank")}
                  className={`relative hover:bg-[#2d1b4e] transition-colors py-1.5 text-[#a38cbd] hover:text-[#d1bfe8] bg-transparent w-full flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
                >
                  {!collapsed && <span className="text-[13px] font-medium">Go to Website</span>}
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sign Out */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  className={`relative hover:bg-[#2d1b4e] transition-colors py-1.5 text-red-400 hover:text-red-300 bg-transparent w-full flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
                >
                  {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
