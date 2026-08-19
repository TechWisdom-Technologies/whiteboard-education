import React from "react";
import AdminEvents from "./AdminEvents";
import { Calendar } from "lucide-react";

export default function AdminPartnerWebinars() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Upcoming Webinars & Events</h1>
        <p className="text-sm text-muted-foreground">
          Webinars and events added here appear under <strong>Upcoming Webinars</strong> on the partner portal dashboard.
        </p>
      </div>
      <AdminEvents />
    </div>
  );
}
