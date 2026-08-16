import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Loader2,
  User,
  Shield,
  Clock,
  CheckCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface ChatMessage {
  id?: string;
  student_id: string;
  admin_name: string;
  content: string;
  created_at: string;
}

interface StudentChatWidgetProps {
  student: {
    id: string;
    wb_student_id?: number;
    full_name: string;
    partner_id?: string;
    status?: string;
  };
  session: any;
  user: any;
  mode: "admin" | "partner";
  partner?: any;
}

export function StudentChatWidget({
  student,
  session,
  user,
  mode,
  partner,
}: StudentChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${session?.access_token || SUPABASE_KEY}`,
  };

  // ─── Fetch Messages ────────────────────────────────────────
  const fetchMessages = async (silent = false) => {
    if (!student?.id || !session) return;
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_notes" as any)
        .select("*")
        .eq("student_id", student.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (Array.isArray(data)) {
        setMessages(data as ChatMessage[]);
      }
    } catch (err: any) {
      if (!silent) {
        console.error("Error loading chat messages:", err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!student?.id) return;

    // Realtime channel
    const channelName = `student-chat-${student.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "student_notes",
          filter: `student_id=eq.${student.id}`,
        },
        () => {
          fetchMessages(true);
        }
      )
      .on("broadcast", { event: "new_msg" }, (payload) => {
        if (payload?.payload) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.payload.id);
            if (exists) return prev;
            return [...prev, payload.payload];
          });
        }
      })
      .subscribe();

    // Periodic poll fallback every 8 seconds
    const poll = window.setInterval(() => {
      fetchMessages(true);
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(poll);
    };
  }, [student?.id, session?.access_token]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send Message ───────────────────────────────────────────
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !student || !session || sending) return;

    setSending(true);
    try {
      let adminNameField = "";
      if (mode === "admin") {
        adminNameField = "[Role:Admin]";
      } else {
        const agency = partner?.agency_name || "Partner Agency";
        adminNameField = `[Role:Partner] ${agency}`;
      }

      const newRecord = {
        student_id: student.id,
        admin_name: adminNameField,
        content: text,
      };

      const { data, error } = await supabase
        .from("student_notes" as any)
        .insert(newRecord)
        .select();

      if (error) throw error;

      const savedMsg = data?.[0] || {
        ...newRecord,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setMessages((prev) => [...prev, savedMsg]);
      setInputText("");

      // Broadcast via realtime channel
      supabase.channel(`student-chat-${student.id}`).send({
        type: "broadcast",
        event: "new_msg",
        payload: savedMsg,
      });

      // Send partner notification if admin sent it
      if (mode === "admin" && student.partner_id) {
        try {
          await supabase.from("partner_notifications" as any).insert({
            partner_id: student.partner_id,
            student_id: student.id,
            title: `New message on ${student.full_name}`,
            message: text.length > 90 ? text.slice(0, 90) + "..." : text,
            type: "info",
          });
        } catch (_) {
          // ignore notification error
        }
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to send message";
      if (msg.includes("row-level security")) {
        toast.error("Database RLS policy needed for student_notes. Please run the SQL policy setup in Supabase.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Helper to parse sender role & agency name
  const parseSender = (admin_name: string) => {
    if (!admin_name) return { role: "admin", agencyName: "" };
    if (admin_name.startsWith("[Role:Admin]")) {
      return { role: "admin", agencyName: "" };
    }
    if (admin_name.startsWith("[Role:Partner]")) {
      const agency = admin_name.replace("[Role:Partner]", "").trim();
      return { role: "partner", agencyName: agency || partner?.agency_name || "Partner Agency" };
    }
    const lower = admin_name.toLowerCase();
    if (lower.includes("partner")) {
      const cleaned = admin_name.replace(/partner:?/i, "").trim();
      return { role: "partner", agencyName: cleaned || partner?.agency_name || "Partner Agency" };
    }
    return { role: "admin", agencyName: "" };
  };

  const isOwn = (senderRole: string) => {
    if (mode === "admin") return senderRole === "admin";
    if (mode === "partner") return senderRole === "partner";
    return false;
  };

  const formatMsgTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatMsgDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return "Today";
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-170px)] min-h-[440px] max-h-[calc(100vh-170px)] bg-white">
      {/* ── Chat Header ── */}
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-[#2F4F97] to-[#1E3A6F] text-white flex flex-row items-center justify-between space-y-0 shrink-0 select-none shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 inline-block" />
          <h3 className="text-xs font-semibold text-white tracking-wide">
            {mode === "admin" ? "Chat with Partner" : "Chat With Whiteboard Admin"}
          </h3>
        </div>
      </CardHeader>

      {/* ── Message Stream ── */}
      <CardContent className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC]/50 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#2F4F97]" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 py-8">
            No messages yet
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const { role, agencyName } = parseSender(msg.admin_name);
              const own = isOwn(role);
              const showDate =
                idx === 0 ||
                formatMsgDate(msg.created_at) !==
                  formatMsgDate(messages[idx - 1].created_at);

              return (
                <div key={msg.id || idx} className="space-y-1.5">
                  {showDate && (
                    <div className="flex items-center justify-center my-2">
                      <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                        {formatMsgDate(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      own ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender badge header */}
                    <div
                      className={`flex items-center gap-1.5 mb-1 px-1 ${
                        own ? "justify-end" : "justify-start"
                      }`}
                    >
                      {role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-semibold h-4 px-1.5 bg-[#1E293B] text-white border-transparent flex items-center gap-1 shadow-2xs"
                        >
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-semibold h-4 px-1.5 bg-[#2F4F97] text-white border-transparent flex items-center gap-1 shadow-2xs"
                          >
                            <User className="w-2.5 h-2.5" /> Partner
                          </Badge>
                          {agencyName && (
                            <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[170px]">
                              {agencyName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs leading-relaxed break-words whitespace-pre-wrap text-white ${
                        role === "admin"
                          ? `bg-[#1E293B] ${own ? "rounded-br-xs" : "rounded-bl-xs"}`
                          : `bg-[#2F4F97] ${own ? "rounded-br-xs" : "rounded-bl-xs"}`
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`flex items-center gap-1 mt-0.5 px-1 text-[10px] text-gray-400 ${
                        own ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatMsgTime(msg.created_at)}</span>
                      {own && <CheckCheck className="w-3 h-3 text-[#2F4F97]" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* ── Input Box ── */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none min-h-[38px] max-h-[72px] text-xs p-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 focus:bg-white focus:text-gray-900 focus:caret-gray-900 shadow-none transition-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !inputText.trim()}
            className={`h-9 w-9 rounded-full text-white shrink-0 shadow-sm transition-all ${
              mode === "admin"
                ? "bg-[#1E293B] hover:bg-[#0f172a]"
                : "bg-[#2F4F97] hover:bg-[#243e78]"
            }`}
            title="Send Message"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
