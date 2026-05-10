import { LayoutDashboard, GraduationCap, BookOpen, Home, Users, Settings, Award, Languages, FileText, Calendar, UserCheck, Target, LogOut } from "lucide-react";
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
  { title: "Accommodations", url: "/admin/accommodations", icon: Home },
  { title: "Scholarships", url: "/admin/scholarships", icon: Award },
  { title: "Language Centers", url: "/admin/language-centers", icon: Languages },
  { title: "Blog Posts", url: "/admin/blogs", icon: FileText },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "B2B Partners", url: "/admin/partners", icon: Users },
  { title: "Students", url: "/admin/students", icon: UserCheck },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
      {/* Sidebar Header containing logo & email */}
      <div className="border-b border-sidebar-border/50 py-4 px-4 bg-sidebar-background flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-lg font-extrabold">
              <span className="text-sidebar-primary-foreground">Your</span>
              <span className="text-sidebar-primary">Uni</span>
              <span className="text-sidebar-foreground/50 text-xs ml-2 font-normal">Admin</span>
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="text-[11px] text-sidebar-foreground/70 truncate w-full" title={user?.email || ""}>
            {user?.email} {hasRole("admin") && <span className="text-sidebar-primary font-semibold">(Admin)</span>}
          </div>
        )}
      </div>

      {/* Sidebar Content containing shifted-down menu items */}
      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup className="pt-6"> {/* Shifted menu down by pt-6 */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`relative hover:bg-sidebar-accent/40 transition-colors py-1.5 flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}
                      activeClassName="bg-transparent text-sidebar-primary font-semibold"
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[2px] bg-sidebar-primary rounded-r-sm" />
                          )}
                          {!collapsed && <span className="text-[13px] font-medium">{item.title}</span>}
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  className={`relative hover:bg-sidebar-accent/40 transition-colors py-1.5 text-red-500 hover:text-red-600 bg-transparent w-full flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
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
