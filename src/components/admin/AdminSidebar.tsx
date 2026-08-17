import { LayoutDashboard, GraduationCap, BookOpen, Home, Users, Settings, Languages, FileText, UserCheck, Target, LogOut, PlaySquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Universities", url: "/admin/universities", icon: GraduationCap },
  { title: "Courses", url: "/admin/courses", icon: BookOpen },
  { title: "B2B Partners", url: "/admin/partners", icon: Users },
  { title: "Students", url: "/admin/students", icon: UserCheck },
  { title: "Partner Content", url: "/admin/partner-content", icon: PlaySquare },
  { title: "Accommodations", url: "/admin/accommodations", icon: Home },
  { title: "Language Centers", url: "/admin/language-centers", icon: Languages },
  { title: "Blog Posts", url: "/admin/blogs", icon: FileText },
  { title: "Leads", url: "/admin/leads", icon: Target },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, signOut } = useAuth();
  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-[#1d283a] bg-[#1d283a] !top-[60px] !h-[calc(100svh-60px)] z-20">
      <SidebarContent className="bg-[#1d283a]">
        <SidebarGroup className={`pt-5 ${collapsed ? "px-1.5" : "px-3"}`}>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const isItemActive =
                  item.url === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="block"
                    >
                      <div
                        className={`
                          flex items-center rounded-lg transition-colors duration-150 cursor-pointer
                          ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}
                          ${isItemActive
                            ? "bg-white text-[#1d283a] shadow-sm"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-5 w-5 flex-shrink-0 ${isItemActive ? "text-[#1d283a]" : "text-slate-400"}`}
                          strokeWidth={isItemActive ? 2.2 : 1.8}
                        />
                        {!collapsed && (
                          <span className={`text-[15px] leading-5 ${isItemActive ? "font-semibold" : "font-medium"}`}>
                            {item.title}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}

              {/* Divider */}
              <div className="my-2 border-t border-slate-700/50" />

              {/* Sign Out */}
              <SidebarMenuItem>
                <div
                  onClick={handleSignOut}
                  className={`flex items-center rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150 cursor-pointer ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
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
