import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";
import { NotificationCenter } from "@/components/partner/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";

export default function PartnerLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/partner-dashboard") return "Overview";
    if (path.includes("/partner-dashboard/students")) return "Students";
    if (path.includes("/partner-dashboard/marketing")) return "Marketing Hub";
    if (path.includes("/partner-dashboard/notifications")) return "Notifications";
    if (path.includes("/partner-dashboard/profile")) return "My Profile";
    return "Partner Portal";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PartnerSidebar />
        <div className="flex-1 flex flex-col">
          <header className="min-h-14 flex flex-wrap items-center border-b px-3 sm:px-4 py-2 gap-2 sm:gap-3 bg-background justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <span className="font-bold text-[15px] text-foreground tracking-tight ml-1">
                {getPageTitle()}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-muted-foreground truncate max-w-[200px] hidden sm:inline" title={user?.email || ""}>
                {user?.email}
                <span className="text-[#ffa300] font-semibold ml-1">(Partner)</span>
              </span>
              <NotificationCenter />
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
