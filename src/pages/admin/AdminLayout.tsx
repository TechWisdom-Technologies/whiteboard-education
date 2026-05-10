import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";

export default function AdminLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path.includes("/admin/universities")) return "Universities";
    if (path.includes("/admin/courses")) return "Courses";
    if (path.includes("/admin/accommodations")) return "Accommodations";
    if (path.includes("/admin/scholarships")) return "Scholarships";
    if (path.includes("/admin/language-centers")) return "Language Centers";
    if (path.includes("/admin/blogs")) return "Blog Posts";
    if (path.includes("/admin/events")) return "Events";
    if (path.includes("/admin/partners")) return "B2B Partners";
    if (path.includes("/admin/students")) return "Students";
    if (path.includes("/admin/leads")) return "Leads";
    if (path.includes("/admin/settings")) return "Settings";
    return "Admin Panel";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="min-h-14 flex flex-wrap items-center border-b px-3 sm:px-4 py-2 gap-2 sm:gap-3 bg-background justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <span className="font-bold text-[15px] text-foreground tracking-tight ml-1">
                {getPageTitle()}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <AdminNotificationCenter />
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 bg-muted/20 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
