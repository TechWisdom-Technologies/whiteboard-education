import { LayoutDashboard, Users, Megaphone, UserCircle, Bell, GraduationCap, LogOut } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/partner-dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/partner-dashboard/students", icon: Users },
  { title: "Marketing Hub", url: "/partner-dashboard/marketing", icon: Megaphone },
  { title: "Notifications", url: "/partner-dashboard/notifications", icon: Bell },
  { title: "My Profile", url: "/partner-dashboard/profile", icon: UserCircle },
];

export function PartnerSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadCount, setUnreadCount] = useState(0);

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
      {/* Sidebar Header containing logo */}
      <div className="border-b border-[#2d1b4e] py-4 px-4 bg-[#1a0f2e] flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          {!collapsed ? (
            <img src="/LOGO-ON-DARK-BG.png" alt="Whiteboard Education" className="h-8 w-auto object-contain" />
          ) : (
            <div
              className="h-8 w-8 bg-[#ffa300] flex items-center justify-center flex-shrink-0"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)" }}
            >
              <GraduationCap className="h-4 w-4 text-[#1a0f2e]" />
            </div>
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
                      activeClassName="bg-transparent text-[#ffa300] font-semibold"
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[2px] bg-[#ffa300] rounded-r-sm" />
                          )}
                          {!collapsed && (
                            <div className="flex items-center gap-2">
                              <span className={`text-[13px] ${isActive ? "text-[#ffa300]" : "text-[#d1bfe8] font-medium"}`}>{item.title}</span>
                              {item.title === "Notifications" && unreadCount > 0 && (
                                <span className="h-[16px] min-w-[16px] px-1 rounded-sm bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              )}
                            </div>
                          )}
                          <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-[#ffa300]" : "text-[#a38cbd]"}`} />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

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
