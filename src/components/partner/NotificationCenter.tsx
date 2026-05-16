import { useEffect, useMemo, useState } from "react";
import { Bell, CheckSquare, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface PartnerNotification {
  id: string;
  student_id: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const typeStyles = {
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  info: "bg-secondary/10 border-secondary/20",
};

const dotStyles = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-secondary",
};

export function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PartnerNotification[]>([]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("partner_notifications")
      .select("id, student_id, title, message, type, read, created_at")
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    if (data) {
      setItems(data as PartnerNotification[]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`partner-bell-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_notifications", filter: `partner_id=eq.${user.id}` },
        () => loadNotifications()
      )
      .subscribe();

    const pollTimer = window.setInterval(loadNotifications, 15000);

    return () => {
      window.clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = items.filter((n) => !n.read).length;
  const sortedItems = useMemo(() => items.slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)), [items]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("partner_notifications")
      .update({ read: true })
      .eq("partner_id", user.id)
      .eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    await supabase
      .from("partner_notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("partner_id", user.id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markOneUnread = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    await supabase
      .from("partner_notifications")
      .update({ read: false })
      .eq("id", id)
      .eq("partner_id", user.id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
  };

  const handleNotificationClick = async (notification: PartnerNotification) => {
    if (!notification.read) {
      await markOneRead(notification.id);
    }

    setOpen(false);
    if (notification.student_id) {
      navigate(`/partner-dashboard/students?studentId=${notification.student_id}`);
      return;
    }

    navigate("/partner-dashboard/notifications");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-sm bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center min-w-[18px] h-[18px] animate-scale-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between pr-8">
            <SheetTitle className="text-base font-semibold">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-secondary h-auto py-1" onClick={markAllRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {sortedItems.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
          )}
          {sortedItems.map((n, i) => (
            <div
              key={n.id}
              className={`px-3 py-2.5 border-b last:border-0 hover:bg-muted/40 transition-colors animate-fade-in ${!n.read ? "bg-muted/20" : "opacity-90"}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-2 w-2 rounded-sm mt-1.5 flex-shrink-0 ${dotStyles[n.type as keyof typeof dotStyles] || dotStyles.info}`} />
                
                <button
                  className="flex-1 text-left min-w-0 pr-2"
                  onClick={() => handleNotificationClick(n)}
                >
                  <p className={`text-[13px] leading-snug mb-0.5 ${n.read ? "text-gray-700 font-semibold" : "text-black font-bold"}`}>{n.title}</p>
                  <p className={`text-[12px] leading-snug line-clamp-2 ${n.read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                    {n.message}
                  </p>
                  <p className={`text-[10px] mt-1.5 ${n.read ? "text-gray-500" : "text-gray-700 font-medium"}`}>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </button>

                <div className="flex-shrink-0 pt-0.5">
                  {n.read ? (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={(e) => markOneUnread(n.id, e)} title="Mark as unread">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => markOneRead(n.id, e)} title="Mark as read">
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t shrink-0">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setOpen(false);
              navigate("/partner-dashboard/notifications");
            }}
          >
            View all notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
