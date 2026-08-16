import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Bell, CheckCheck, CalendarDays, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { formatDistanceToNow, isWithinInterval, startOfDay, endOfDay, parseISO, differenceInHours, format } from "date-fns";

interface Notification {
  id: string;
  partner_id: string;
  student_id: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}


type ReadFilter = "all" | "read" | "unread";

export default function PartnerNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("partner_notifications" as any)
      .select("*")
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setNotifications(data as unknown as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`partner-notifs-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_notifications", filter: `partner_id=eq.${user.id}` },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const pollTimer = window.setInterval(fetchNotifications, 15000);

    return () => {
      window.clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("partner_notifications" as any)
      .update({ read: true } as any)
      .eq("partner_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    if (!user) return;
    await supabase
      .from("partner_notifications" as any)
      .update({ read: true } as any)
      .eq("id", id)
      .eq("partner_id", user.id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markRead(notification.id);
    }

    if (notification.student_id) {
      navigate(`/partner-dashboard/students?studentId=${notification.student_id}`);
      return;
    }

    if (notification.title === "New Update on Registration" || (!notification.student_id && notification.type === "system")) {
      navigate("/partner-dashboard/profile#admin-notes-section");
      return;
    }

    navigate("/partner-dashboard/notifications");
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const hasDateFilter = dateFrom || dateTo;

  // Apply filters
  const filtered = notifications.filter((n) => {
    // Read/unread filter
    if (readFilter === "unread" && n.read) return false;
    if (readFilter === "read" && !n.read) return false;

    // Date range filter
    if (dateFrom || dateTo) {
      const notifDate = parseISO(n.created_at);
      if (dateFrom && dateTo) {
        if (!isWithinInterval(notifDate, { start: startOfDay(parseISO(dateFrom)), end: endOfDay(parseISO(dateTo)) })) return false;
      } else if (dateFrom) {
        if (notifDate < startOfDay(parseISO(dateFrom))) return false;
      } else if (dateTo) {
        if (notifDate > endOfDay(parseISO(dateTo))) return false;
      }
    }

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Read / Unread / All toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
          {(["all", "unread", "read"] as ReadFilter[]).map((val) => (
            <button
              key={val}
              onClick={() => setReadFilter(val)}
              className={`px-4 py-1.5 rounded-md text-[14px] font-medium transition-colors capitalize ${
                readFilter === val
                  ? "bg-[#2F4F97] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {val}
              {val === "unread" && unreadCount > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-[10px] font-bold ${
                  readFilter === "unread" ? "bg-white/90 text-[#2F4F97]" : "bg-red-500 text-white"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Date range filters */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2F4F97]/20 focus:border-[#2F4F97]"
              placeholder="From"
            />
            <span className="text-slate-400 text-[13px]">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-[14px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2F4F97]/20 focus:border-[#2F4F97]"
              placeholder="To"
            />
          </div>
          {hasDateFilter && (
            <button
              onClick={clearDateFilter}
              className="flex items-center gap-1 text-[13px] text-slate-500 hover:text-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear dates
            </button>
          )}
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-[14px] h-9">
            <CheckCheck className="h-4 w-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      {/* Notifications Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="pb-3 px-5 pt-4 bg-[#2F4F97]">
          <CardTitle className="text-[17px] font-semibold text-white">All Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingScreen label="Loading notifications" sublabel="Checking your activity feed" className="py-10" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-25" />
              <p className="text-[16px] font-medium text-slate-500">No notifications found</p>
              <p className="text-[14px] text-slate-400 mt-1">
                {readFilter !== "all" || hasDateFilter
                  ? "Try adjusting your filters"
                  : "Status updates for your students will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
              {filtered.map((n) => {
                const createdDate = new Date(n.created_at);
                const hoursAgo = differenceInHours(new Date(), createdDate);
                const timeDisplay = hoursAgo >= 24
                  ? format(createdDate, "dd MMM yyyy, hh:mm a")
                  : formatDistanceToNow(createdDate, { addSuffix: true });

                return (
                  <div
                    key={n.id}
                    className={`px-5 py-4 flex items-start gap-3.5 transition-colors hover:bg-slate-50 cursor-pointer ${
                      !n.read ? "bg-blue-50/40" : ""
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-[15px] leading-snug mb-1 text-black ${!n.read ? "font-semibold" : "font-medium"}`}>
                            {n.title}
                          </p>
                          <p className="text-[14px] text-slate-700 leading-relaxed italic">{n.message}</p>
                        </div>
                        <span className="text-[13px] text-slate-700 whitespace-nowrap flex-shrink-0 pt-0.5">
                          {timeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
