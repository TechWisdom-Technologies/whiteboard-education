import { 
  LayoutDashboard, Users, UserCircle, Bell, Layers,
  LogOut, FileText, Search, CreditCard, BookOpen, Home, ChevronDown, ChevronRight, FolderDown, ExternalLink 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
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
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-[#F8FAFC] !top-[60px] !h-[calc(100svh-60px)] z-20">

      <SidebarContent className="bg-[#F8FAFC]">
        <SidebarGroup className={`pt-5 ${collapsed ? "px-1.5" : "px-3"}`}>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const isItemActive =
                  item.url === "/partner-dashboard"
                    ? currentPath === "/partner-dashboard"
                    : currentPath.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/partner-dashboard"}
                      className="block"
                    >
                      <div
                        className={`
                          flex items-center rounded-lg transition-colors duration-150 cursor-pointer
                          ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}
                          ${isItemActive
                            ? "bg-[#2F4F97] text-white"
                            : "text-slate-800 hover:bg-slate-100 hover:text-black"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-5 w-5 flex-shrink-0 ${isItemActive ? "text-white" : "text-slate-600"}`}
                          strokeWidth={isItemActive ? 2.2 : 1.8}
                        />
                        {!collapsed && (
                          <span className={`text-[15px] leading-5 ${isItemActive ? "font-semibold" : "font-medium"}`}>
                            {item.title}
                          </span>
                        )}
                        {!collapsed && item.title === "Notifications" && unreadCount > 0 && (
                          <span
                            className={`ml-auto h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              isItemActive
                                ? "bg-white/90 text-[#2F4F97]"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}

              {/* Allied Services Dropdown */}
              <SidebarMenuItem>
                <div
                  onClick={() => setAlliedOpen(!alliedOpen)}
                  className={`flex items-center rounded-lg text-slate-800 hover:bg-slate-100 hover:text-black transition-colors duration-150 cursor-pointer ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
                >
                  <Layers className="h-5 w-5 flex-shrink-0 text-slate-600" strokeWidth={1.8} />
                  {!collapsed && (
                    <>
                      <span className="text-[15px] leading-5 font-medium">Allied Services</span>
                      {alliedOpen ? (
                        <ChevronDown className="ml-auto h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-500" />
                      )}
                    </>
                  )}
                </div>

                {/* Sub-menu */}
                {!collapsed && alliedOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-200 space-y-0.5">
                    {alliedSubItems.map((subItem) => (
                      <Popover key={subItem.title}>
                        <PopoverTrigger asChild>
                          <div
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-500 hover:text-[#2F4F97] hover:bg-blue-50/70 cursor-pointer transition-colors duration-150"
                          >
                            <subItem.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} />
                            <span className="text-[13px] font-medium">{subItem.title}</span>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent side="right" className="w-auto p-3 text-sm font-medium text-slate-700 bg-white border shadow-sm">
                          Feature coming soon
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>

              {/* Divider */}
              <div className="my-2 border-t border-slate-200" />

              {/* Go to Website */}
              <SidebarMenuItem>
                <div
                  onClick={() => window.open("/", "_blank")}
                  className={`flex items-center rounded-lg text-slate-800 hover:bg-slate-100 hover:text-black transition-colors duration-150 cursor-pointer ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
                >
                  <ExternalLink className="h-5 w-5 flex-shrink-0 text-slate-600" strokeWidth={1.8} />
                  {!collapsed && <span className="text-[15px] leading-5 font-medium">Go to Website</span>}
                </div>
              </SidebarMenuItem>

              {/* Sign Out */}
              <SidebarMenuItem>
                <div
                  onClick={handleSignOut}
                  className={`flex items-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 cursor-pointer ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span className="text-[15px] leading-5 font-medium">Sign Out</span>}
                </div>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
