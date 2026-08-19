import React from "react";
import { AccountManagerSection } from "@/components/admin/PartnerContentSections";

export default function AdminPartnerAccountManagers() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-[#1E293B]">Account Manager Profiles</h1>
        <p className="text-sm text-muted-foreground">
          Manage the Account Managers displayed on the partner portal dashboard.
        </p>
      </div>

      <AccountManagerSection />
    </div>
  );
}
