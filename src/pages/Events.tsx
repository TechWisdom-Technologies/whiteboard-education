import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MegaMenu } from "@/components/public/MegaMenu";
import { PublicFooter } from "@/components/public/PublicFooter";

import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Calendar, Clock, Users, Video, BookOpen, Presentation } from "lucide-react";

const typeIcons: Record<string, typeof Video> = {
  "Open Day": Video,
  Workshop: BookOpen,
  Webinar: Presentation,
  "Info Session": Users,
};

export default function Events() {
  const { data: events = [], isLoading } = useTableData("events");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <section className="intro-surface py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">Events</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Upcoming Events</h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">Open days, workshops, webinars, and more.</p>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-10">
        {isLoading ? (
          <LoadingScreen label="Loading events" sublabel="Checking upcoming sessions" className="py-12" />
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No events yet. Add some from the admin panel!</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev: any) => {
              const Icon = typeIcons[ev.type] || Calendar;
              return (
                <Card key={ev.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-[#ffa300]" />
                      <Badge variant="outline">{ev.type}</Badge>
                    </div>
                    <h3 className="font-bold">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ev.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{ev.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
                    </div>
                    {ev.spots_left > 0 && <p className="text-xs text-[#ffa300] font-semibold">{ev.spots_left} spots left</p>}
                    <Button size="sm" className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" onClick={() => navigate("/contact")}>Register</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>



      <PublicFooter />
    </div>
  );
}
