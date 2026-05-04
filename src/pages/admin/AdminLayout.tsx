import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="min-h-14 flex flex-wrap items-center border-b px-3 sm:px-4 py-2 gap-2 sm:gap-3 bg-background justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 mr-1" />Back to Site
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <AdminNotificationCenter />
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline truncate max-w-[260px]">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
                <LogOut className="h-4 w-4 mr-1" />Sign Out
              </Button>
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
