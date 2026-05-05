import { LayoutDashboard, Users, Megaphone, UserCircle, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  const { user } = useAuth();
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

  const isActive = (path: string) =>
    path === "/partner-dashboard"
      ? currentPath === "/partner-dashboard"
      : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Partner Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/partner-dashboard"}
                      className="relative hover:bg-sidebar-accent/40 transition-colors"
                      activeClassName="bg-sidebar-accent/80 text-sidebar-accent-foreground font-semibold border-l-4 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                      {!collapsed && item.title === "Notifications" && unreadCount > 0 && (
                        <span className="ml-auto h-[18px] min-w-[18px] px-1 rounded-sm bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
