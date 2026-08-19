import React from "react";
import AdminEvents from "./AdminEvents";
import { Calendar } from "lucide-react";

export default function AdminPartnerWebinars() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-[#1E293B]">Upcoming Webinars & Events</h1>
        <p className="text-sm text-muted-foreground">
          Webinars and events added here appear under <strong>Upcoming Webinars</strong> on the partner portal dashboard.
        </p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-[13px] text-blue-900 mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#1d283a] shrink-0" />
        <span>Use the table below to insert, update, or delete records.</span>
      </div>
      <AdminEvents />
    </div>
  );
}
