import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, UserCircle, PlaySquare } from "lucide-react";
import AdminEvents from "./AdminEvents";
import { AccountManagerSection, TutorialsSection } from "@/components/admin/PartnerContentSections";

export default function AdminPartnerContent() {
  const [activeTab, setActiveTab] = useState("webinars");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-[#1E293B]">Partner Portal Content</h1>
        <p className="text-sm text-muted-foreground">
          Manage the three main interactive sections displayed on every partner's portal dashboard: Upcoming Webinars, Account Managers, and Platform Tutorials. You can insert, update, or delete records in real time.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-12 inline-flex gap-1">
          <TabsTrigger 
            value="webinars" 
            className="rounded-lg px-4 py-2 text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#2F4F97] data-[state=active]:shadow-sm flex items-center gap-2 transition-all"
          >
            <Calendar className="h-4 w-4" />
            Upcoming Webinars & Events
          </TabsTrigger>
          <TabsTrigger 
            value="account-manager" 
            className="rounded-lg px-4 py-2 text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#2F4F97] data-[state=active]:shadow-sm flex items-center gap-2 transition-all"
          >
            <UserCircle className="h-4 w-4" />
            Account Manager Profiles
          </TabsTrigger>
          <TabsTrigger 
            value="tutorials" 
            className="rounded-lg px-4 py-2 text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#2F4F97] data-[state=active]:shadow-sm flex items-center gap-2 transition-all"
          >
            <PlaySquare className="h-4 w-4" />
            Platform Tutorials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webinars" className="mt-0 space-y-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-[13px] text-blue-900 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2F4F97] shrink-0" />
            <span>Webinars and events added here appear under <strong>Upcoming Webinars</strong> on the partner portal dashboard. Use the table below to insert, update, or delete records.</span>
          </div>
          <AdminEvents />
        </TabsContent>

        <TabsContent value="account-manager" className="mt-0">
          <AccountManagerSection />
        </TabsContent>

        <TabsContent value="tutorials" className="mt-0">
          <TutorialsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
