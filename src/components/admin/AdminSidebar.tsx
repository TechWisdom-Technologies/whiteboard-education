import { LayoutDashboard, GraduationCap, BookOpen, Home, Users, Settings, Languages, FileText, UserCheck, Target, LogOut, PlaySquare, ExternalLink, ChevronDown, ChevronRight, Calendar, UserCircle, Video } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
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
  { title: "Accommodations", url: "/admin/accommodations", icon: Home },
  { title: "Language Centers", url: "/admin/language-centers", icon: Languages },
  { title: "Blog Posts", url: "/admin/blogs", icon: FileText },
  { title: "Leads", url: "/admin/leads", icon: Target },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [partnerContentOpen, setPartnerContentOpen] = useState(false);
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

              {/* Partner Content Dropdown */}
              <SidebarMenuItem>
                <div
                  onClick={() => setPartnerContentOpen(!partnerContentOpen)}
                  className={`flex items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-150 cursor-pointer ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
                >
                  <PlaySquare className="h-5 w-5 flex-shrink-0 text-slate-400" strokeWidth={1.8} />
                  {!collapsed && (
                    <>
                      <span className="text-[15px] leading-5 font-medium">Partner Content</span>
                      {partnerContentOpen ? (
                        <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                      )}
                    </>
                  )}
                </div>

                {/* Sub-menu */}
                {!collapsed && partnerContentOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-slate-700/50 space-y-0.5">
                    {[
                      { title: "Webinars & Events", icon: Calendar, url: "/admin/partner-content/webinars" },
                      { title: "Account Managers", icon: UserCircle, url: "/admin/partner-content/account-managers" },
                      { title: "Platform Tutorials", icon: Video, url: "/admin/partner-content/tutorials" },
                    ].map((subItem) => {
                      const isSubActive = location.pathname === subItem.url;
                      return (
                        <Link
                          key={subItem.title}
                          to={subItem.url}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-150 ${
                            isSubActive ? "bg-white text-[#1d283a] shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <subItem.icon className={`h-4 w-4 flex-shrink-0 ${isSubActive ? "text-[#1d283a]" : ""}`} strokeWidth={isSubActive ? 2.2 : 1.8} />
                          <span className={`text-[13px] ${isSubActive ? "font-semibold" : "font-medium"}`}>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </SidebarMenuItem>

              {/* Divider */}
              <div className="my-2 border-t border-slate-700/50" />

              {/* Go to Website */}
              <SidebarMenuItem>
                <div
                  onClick={() => window.open("/", "_blank")}
                  className={`flex items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-150 cursor-pointer ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}
                >
                  <ExternalLink className="h-5 w-5 flex-shrink-0 text-slate-400" strokeWidth={1.8} />
                  {!collapsed && <span className="text-[15px] leading-5 font-medium">Go to Website</span>}
                </div>
              </SidebarMenuItem>

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
