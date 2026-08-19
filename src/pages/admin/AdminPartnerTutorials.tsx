import React from "react";
import { TutorialsSection } from "@/components/admin/PartnerContentSections";

export default function AdminPartnerTutorials() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-[#1E293B]">Platform Tutorials</h1>
        <p className="text-sm text-muted-foreground">
          Manage tutorial videos shown on the partner dashboard.
        </p>
      </div>

      <TutorialsSection />
    </div>
  );
}
