import { useState } from "react";
import { ambassadors } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, Send, MapPin, GraduationCap } from "lucide-react";

interface ChatMessage {
  from: "user" | "ambassador";
  text: string;
}

export function AmbassadorChat() {
  const [open, setOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<typeof ambassadors[0] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const selectAmbassador = (amb: typeof ambassadors[0]) => {
    setSelectedAmbassador(amb);
    setMessages([
      { from: "ambassador", text: `Hey! I'm ${amb.name} 👋 ${amb.bio} Feel free to ask me anything!` },
    ]);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "ambassador", text: "That's a great question! From my experience, I'd highly recommend reaching out to the admissions office directly. I can also share more about my personal experience if you'd like! 😊" },
    ]);
    setInput("");
  };

  const backToList = () => {
    setSelectedAmbassador(null);
    setMessages([]);
  };

  return (
    <>
      {/* Floating Avatar Group */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="fixed bottom-6 right-24 z-50 flex items-center gap-2 bg-primary text-primary-foreground shadow-lg rounded-full pl-2 pr-4 py-2 hover:shadow-xl transition-all hover:scale-105 group">
            <div className="flex -space-x-2">
              {ambassadors.slice(0, 3).map((a) => (
                <img key={a.id} src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full border-2 border-primary object-cover" />
              ))}
            </div>
            <span className="text-xs font-semibold">Chat with Students</span>
          </button>
        </SheetTrigger>

        <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              {selectedAmbassador && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={backToList}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <SheetTitle className="text-primary-foreground text-base">
                  {selectedAmbassador ? selectedAmbassador.name : "Student Ambassadors"}
                </SheetTitle>
                {selectedAmbassador && (
                  <p className="text-xs text-primary-foreground/70">{selectedAmbassador.university}</p>
                )}
                {!selectedAmbassador && (
                  <p className="text-xs text-primary-foreground/70">Chat with real students at our partner universities</p>
                )}
              </div>
            </div>
          </SheetHeader>

          {!selectedAmbassador ? (
            /* Ambassador List */
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ambassadors.map((amb, i) => (
                <button
                  key={amb.id}
                  onClick={() => selectAmbassador(amb)}
                  className="w-full text-left p-4 rounded-md border hover:border-[#ffa300]/50 hover:shadow-md transition-all duration-200 animate-fade-in flex items-start gap-3"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <img src={amb.avatar} alt={amb.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{amb.name}</span>
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" /> {amb.country}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-3 w-3" /> {amb.course} • {amb.university}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-[80%] rounded-md px-4 py-2.5 text-sm ${
                      msg.from === "user"
                        ? "bg-[#ffa300] text-[#181d29] rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Icebreakers */}
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedAmbassador.icebreakers.map((q) => (
                    <Button key={q} variant="outline" size="sm" className="flex-shrink-0 text-xs hover:bg-[#ffa300]/10 hover:text-[#ffa300] hover:border-[#ffa300]/30 transition-colors" onClick={() => sendMessage(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  className="flex-1"
                />
                <Button size="icon" className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" onClick={() => sendMessage(input)} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
