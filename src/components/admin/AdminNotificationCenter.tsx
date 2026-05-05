import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

type AdminNotificationItem = {
  key: string;
  title: string;
  message: string;
  createdAt: string;
  href: string;
  read: boolean;
};

type AdminNotificationRow = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  href: string;
};

type LeadRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

type PartnerRow = {
  id: string;
  agency_name: string | null;
  contact_person: string | null;
  created_at: string;
};

type StudentRow = {
  id: string;
  full_name: string | null;
  target_university: string | null;
  created_at: string;
};

type ReadMap = Record<string, boolean>;

export function AdminNotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [readMap, setReadMap] = useState<ReadMap>({});

  const loadReadMap = useCallback(async () => {
    if (!user) {
      setReadMap({});
      return;
    }

    const { data } = await supabase
      .from("admin_notification_reads")
      .select("notification_key, is_read")
      .eq("admin_user_id", user.id);

    const next: ReadMap = {};
    (data || []).forEach((row: { notification_key: string; is_read: boolean }) => {
      next[row.notification_key] = !!row.is_read;
    });
    setReadMap(next);
  }, [user]);

  useEffect(() => {
    loadReadMap();
  }, [loadReadMap]);

  const loadAdminNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("id, title, message, created_at, href")
      .order("created_at", { ascending: false })
      .limit(30);

    // Preferred: event-based admin notifications table.
    if (!error && data && data.length > 0) {
      const next: AdminNotificationItem[] = (data as AdminNotificationRow[]).map((row) => ({
        key: row.id,
        title: row.title,
        message: row.message,
        createdAt: row.created_at,
        href: row.href,
        read: !!readMap[row.id],
      }));
      setItems(next);
      return;
    }

    // Fallback: derive notifications directly from source tables.
    const [leadRes, partnerRes, studentRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, full_name, email, created_at")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("partner_registrations")
        .select("id, agency_name, contact_person, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("students")
        .select("id, full_name, target_university, created_at")
        .eq("status", "document_review")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const leadItems: AdminNotificationItem[] = ((leadRes.data || []) as LeadRow[]).map((lead) => {
      const key = `lead:${lead.id}`;
      return {
        key,
        title: "New Lead",
        message: `${lead.full_name || lead.email || "Unknown"} submitted an inquiry`,
        createdAt: lead.created_at,
        href: "/admin/leads",
        read: !!readMap[key],
      };
    });

    const partnerItems: AdminNotificationItem[] = ((partnerRes.data || []) as PartnerRow[]).map((partner) => {
      const key = `partner:${partner.id}`;
      return {
        key,
        title: "Partner Approval Pending",
        message: `${partner.agency_name || "Agency"} (${partner.contact_person || "Contact"}) is waiting for approval`,
        createdAt: partner.created_at,
        href: "/admin/partners",
        read: !!readMap[key],
      };
    });

    const studentItems: AdminNotificationItem[] = ((studentRes.data || []) as StudentRow[]).map((student) => {
      const key = `student:${student.id}`;
      return {
        key,
        title: "Student in Document Review",
        message: `${student.full_name || "Student"} (${student.target_university || "No university"}) needs review`,
        createdAt: student.created_at,
        href: "/admin/students",
        read: !!readMap[key],
      };
    });

    const fallback = [...leadItems, ...partnerItems, ...studentItems]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 30);

    setItems(fallback);
  }, [readMap]);

  useEffect(() => {
    loadAdminNotifications();

    const channel = supabase
      .channel("admin-notifications-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, loadAdminNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAdminNotifications]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const persistReadState = async (key: string, isRead: boolean) => {
    if (!user) return;
    await supabase
      .from("admin_notification_reads")
      .upsert(
        { admin_user_id: user.id, notification_key: key, is_read: isRead },
        { onConflict: "admin_user_id,notification_key" }
      );
  };

  const markRead = async (key: string) => {
    await persistReadState(key, true);
    const next = { ...readMap, [key]: true };
    setReadMap(next);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, read: true } : i)));
  };

  const markUnread = async (key: string) => {
    await persistReadState(key, false);
    const next = { ...readMap, [key]: false };
    setReadMap(next);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, read: false } : i)));
  };

  const markAllRead = async () => {
    if (!user) return;
    const rows = items.map((i) => ({ admin_user_id: user.id, notification_key: i.key, is_read: true }));
    if (rows.length > 0) {
      await supabase.from("admin_notification_reads").upsert(rows, { onConflict: "admin_user_id,notification_key" });
    }
    const next: ReadMap = { ...readMap };
    items.forEach((i) => {
      next[i.key] = true;
    });
    setReadMap(next);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  const markAllUnread = async () => {
    if (!user) return;
    const rows = items.map((i) => ({ admin_user_id: user.id, notification_key: i.key, is_read: false }));
    if (rows.length > 0) {
      await supabase.from("admin_notification_reads").upsert(rows, { onConflict: "admin_user_id,notification_key" });
    }
    const next: ReadMap = { ...readMap };
    items.forEach((i) => {
      next[i.key] = false;
    });
    setReadMap(next);
    setItems((prev) => prev.map((i) => ({ ...i, read: false })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-sm bg-destructive px-1 text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Admin Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto py-1 text-xs" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
            {items.length > 0 && unreadCount < items.length && (
              <Button variant="ghost" size="sm" className="h-auto py-1 text-xs" onClick={markAllUnread}>
                Mark all unread
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">No pending notifications.</div>
          ) : (
            items.map((item) => (
              <div key={item.key} className={`px-3 py-3 border-b last:border-0 ${!item.read ? "bg-muted/30" : ""}`}>
                <button
                  className="w-full text-left hover:bg-muted/40 transition-colors rounded-sm p-1"
                  onClick={async () => {
                    await markRead(item.key);
                    navigate(item.href);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Circle className={`h-2.5 w-2.5 mt-1.5 ${item.read ? "fill-muted text-muted" : "fill-primary text-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.read ? "font-medium" : "font-semibold"}`}>{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                </button>
                <div className="mt-1.5 pl-6">
                  {item.read ? (
                    <Button variant="ghost" size="sm" className="h-auto py-1 text-[11px]" onClick={() => markUnread(item.key)}>
                      Mark as unread
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-auto py-1 text-[11px]" onClick={() => markRead(item.key)}>
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
