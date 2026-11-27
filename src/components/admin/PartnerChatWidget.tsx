import { useState, useEffect, useRef } from "react";
import { CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Loader2,
  Shield,
  User,
  CheckCheck,
  Clock,
  MessageSquare,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PartnerChatWidgetProps {
  partnerId: string;
  partnerName: string;
  session: any;
  user: any;
}

export function PartnerChatWidget({ partnerId, partnerName, session, user }: PartnerChatWidgetProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!partnerId) return;

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("partner_notes_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "partner_notes",
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_notes" as any)
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (err: any) {
      console.error("Failed to load chat history:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !session) return;
    setSending(true);

    const adminName = "System Admin";

    try {
      // Insert chat message into partner_notes
      const { error } = await supabase.from("partner_notes" as any).insert({
        partner_id: partnerId,
        content: inputText.trim(),
        admin_name: adminName,
      });

      if (error) throw error;

      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      scrollToBottom();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const parseSender = (admin_name: string) => {
    if (!admin_name) return { role: "admin", agencyName: "" };
    if (admin_name === "System Admin" || admin_name === "Admin") {
      return { role: "admin", agencyName: "" };
    }
    const lower = admin_name.toLowerCase();
    if (lower.includes("partner")) {
      const cleaned = admin_name.replace(/partner:?/i, "").trim();
      return { role: "partner", agencyName: cleaned || partnerName || "Partner Agency" };
    }
    return { role: "admin", agencyName: "" };
  };

  const isOwn = (senderRole: string) => {
    return senderRole === "admin";
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

  const unreadCount = !isMinimized ? 0 : messages.length;

  return (
    <>
      {/* ── Floating Chat Panel (shown when open) ── */}
      {!isMinimized && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[460px] md:w-[500px] lg:w-[540px] h-[640px] max-h-[calc(100vh-130px)] shadow-2xl rounded-2xl overflow-hidden flex flex-col bg-white border border-gray-200 no-print transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Panel Header */}
          <CardHeader
            className="py-3.5 px-5 bg-[#21438c] text-white flex flex-row items-center justify-between space-y-0 shrink-0 select-none shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 inline-block shadow-xs animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  Chat with Partner
                </h3>
                {partnerName && (
                  <p className="text-[11px] text-blue-100/80 truncate max-w-[280px]">
                    Agency: {partnerName}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors focus:outline-none"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          {/* ── Message Stream ── */}
          <CardContent
            ref={chatScrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]/50 custom-scrollbar"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#21438c]" />
                <span className="text-xs">Loading chat history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs font-medium text-gray-500">No messages yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Send a message to start communicating with this partner agency.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
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
                        <div className="flex items-center justify-center my-2.5">
                          <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-200/80 px-3 py-0.5 rounded-full shadow-2xs">
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
                              className="text-[10px] font-semibold h-4.5 px-2 bg-[#1E293B] text-white border-transparent flex items-center gap-1 shadow-2xs"
                            >
                              <Shield className="w-2.5 h-2.5" /> Admin
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-semibold h-4.5 px-2 bg-[#2F4F97] text-white border-transparent flex items-center gap-1 shadow-2xs"
                              >
                                <User className="w-2.5 h-2.5" /> Partner
                              </Badge>
                              {agencyName && (
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">
                                  {agencyName}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs text-[13px] sm:text-sm leading-relaxed break-words whitespace-pre-wrap text-white ${
                            role === "admin"
                              ? `bg-[#1E293B] ${own ? "rounded-br-xs" : "rounded-bl-xs"}`
                              : `bg-[#2F4F97] ${own ? "rounded-br-xs" : "rounded-bl-xs"}`
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Timestamp */}
                        <div
                          className={`flex items-center gap-1 mt-0.5 px-1 text-[11px] text-gray-400 ${
                            own ? "justify-end" : "justify-start"
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatMsgTime(msg.created_at)}</span>
                          {own && <CheckCheck className="w-3.5 h-3.5 text-[#1E293B]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          {/* ── Input Box ── */}
          <div className="p-3.5 bg-white border-t border-gray-100 shrink-0">
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
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message to partner..."
                rows={1}
                className="flex-1 resize-none min-h-[42px] max-h-[100px] text-sm p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 shadow-none transition-none leading-relaxed"
              />
              <Button
                type="submit"
                size="icon"
                disabled={sending || !inputText.trim()}
                className="h-10 w-10 rounded-full text-white shrink-0 shadow-sm transition-all bg-[#21438c] hover:bg-[#193570]"
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
        </div>
      )}

      {/* ── Floating Bubble Button (always visible) ── */}
      <button
        type="button"
        onClick={() => setIsMinimized(!isMinimized)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 no-print bg-[#21438c] hover:bg-[#193570]"
        title={isMinimized ? "Open Chat" : "Close Chat"}
      >
        {isMinimized ? (
          <>
            <MessageSquare className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        ) : (
          <X className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}
