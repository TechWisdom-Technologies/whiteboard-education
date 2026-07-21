import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout() {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path.includes("/admin/universities")) return "Universities";
    if (path.includes("/admin/courses")) return "Courses";
    if (path.includes("/admin/accommodations")) return "Accommodations";
    if (path.includes("/admin/language-centers")) return "Language Centers";
    if (path.includes("/admin/blogs")) return "Blog Posts";
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
          <header className="min-h-[60px] flex flex-wrap items-center border-b border-gray-200/60 px-4 sm:px-6 py-2 gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10 justify-between shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <SidebarTrigger className="text-gray-500 hover:text-gray-900 transition-colors" />
              <span className="font-extrabold text-[16px] text-gray-800 tracking-tight hidden md:block">
                {getPageTitle()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end flex-1 sm:flex-none">
              <div className="flex items-center gap-4">
                <AdminNotificationCenter />
                <div className="flex items-center gap-3">
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-[13px] font-bold text-gray-800 leading-tight">
                      {hasRole("admin") ? "Administrator" : "User"}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate max-w-[160px] font-medium leading-tight">
                      {user?.email}
                    </span>
                  </div>
                  <Avatar className="h-9 w-9 ring-2 ring-gray-100 transition-transform hover:scale-105 cursor-pointer shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-[#F8FAFC] overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
