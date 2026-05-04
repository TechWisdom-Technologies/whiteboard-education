import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

  const markOneRead = async (id: string) => {
    if (!user) return;
    await supabase
      .from("partner_notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("partner_id", user.id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center min-w-[18px] h-[18px] animate-scale-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-secondary h-auto py-1" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {sortedItems.length === 0 && (
            <div className="p-4 text-xs text-muted-foreground">No notifications yet.</div>
          )}
          {sortedItems.map((n, i) => (
            <div
              key={n.id}
              className={`p-3 border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/40 ${!n.read ? "bg-muted/30" : ""} animate-fade-in`}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${dotStyles[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs mb-0.5 ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                  <p className={`text-xs leading-relaxed ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setOpen(false);
              navigate("/partner-dashboard/notifications");
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
