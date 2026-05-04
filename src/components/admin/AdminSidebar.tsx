import { LayoutDashboard, GraduationCap, BookOpen, Home, Users, Settings, Award, Languages, FileText, Calendar, UserCheck, Globe, Target } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Countries", url: "/admin/countries", icon: Globe },
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
  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-4">
            {!collapsed && (
              <span className="text-lg font-extrabold">
                <span className="text-sidebar-primary-foreground">Your</span>
                <span className="text-sidebar-primary">Uni</span>
                <span className="text-sidebar-foreground/50 text-xs ml-2 font-normal">Admin</span>
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="relative hover:bg-sidebar-accent/40 transition-colors" 
                      activeClassName="bg-sidebar-accent/80 text-sidebar-primary font-semibold border-l-4 border-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
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
