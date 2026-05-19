import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Clock, CheckCircle, FileSearch, GraduationCap, Loader2,
  ArrowRight, FileCheck, Send, Mail, Plane, BookOpen, PauseCircle, XCircle, ChevronRight, ChevronLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Malaysia student visa journey — aligned statuses
const statusConfig: Record<string, { label: string; color: string; icon: any; bgCard: string }> = {
  document_review:    { label: "Document Review",    color: "bg-gray-100 text-gray-600",           icon: FileSearch,  bgCard: "border-gray-200" },
  documents_verified: { label: "Docs Verified",      color: "bg-blue-500/10 text-blue-600",        icon: FileCheck,   bgCard: "border-blue-200" },
  university_applied: { label: "University Applied",  color: "bg-indigo-500/10 text-indigo-600",    icon: Send,        bgCard: "border-indigo-200" },
  offer_letter:       { label: "Offer Letter",       color: "bg-purple-500/10 text-purple-600",    icon: Mail,        bgCard: "border-purple-200" },
  emgs_processing:    { label: "EMGS Processing",    color: "bg-[#ffa300]/10 text-[#ffa300]",      icon: Clock,       bgCard: "border-[#ffa300]/30" },
  visa_approved:      { label: "Visa Approved",      color: "bg-emerald-500/10 text-emerald-600",  icon: CheckCircle, bgCard: "border-emerald-200" },
  travel_ready:       { label: "Travel Ready",       color: "bg-teal-500/10 text-teal-600",        icon: Plane,       bgCard: "border-teal-200" },
  enrolled:           { label: "Enrolled",           color: "bg-green-600/10 text-green-700",      icon: GraduationCap, bgCard: "border-green-200" },
  rejected:           { label: "Rejected",           color: "bg-red-500/10 text-red-600",          icon: XCircle,     bgCard: "border-red-200" },
  on_hold:            { label: "On Hold",            color: "bg-amber-500/10 text-amber-600",      icon: PauseCircle, bgCard: "border-amber-200" },
};

const pipelineOrder = [
  "document_review", "documents_verified", "university_applied", "offer_letter",
  "emgs_processing", "visa_approved", "travel_ready", "enrolled"
];

interface Student {
  id: string;
  full_name: string;
  status: string;
  target_university: string;
  target_course: string;
  degree_level: string;
  created_at: string;
}

const PAGE_SIZE = 5;

export default function PartnerOverview() {
  const { session, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentPage, setRecentPage] = useState(0);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?select=id,full_name,status,target_university,target_course,degree_level,created_at&partner_id=eq.${user?.id}&order=created_at.desc`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        if (res.ok) setStudents(await res.json());
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [session]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#ffa300]" /></div>;

  const total = students.length;
  const inReview = students.filter(s => s.status === "document_review").length;
  const inProgress = students.filter(s => ["documents_verified", "university_applied", "offer_letter", "emgs_processing", "visa_approved", "travel_ready"].includes(s.status)).length;
  const enrolled = students.filter(s => s.status === "enrolled").length;
  const rejected = students.filter(s => s.status === "rejected").length;

  const kpis = [
    { label: "Total Students",  value: total,      icon: Users,         accent: "text-[#ffa300]", bg: "bg-[#ffa300]/10" },
    { label: "In Review",       value: inReview,    icon: FileSearch,    accent: "text-blue-600",  bg: "bg-blue-500/10" },
    { label: "In Progress",     value: inProgress,  icon: Clock,         accent: "text-indigo-600", bg: "bg-indigo-500/10" },
    { label: "Enrolled",        value: enrolled,    icon: GraduationCap, accent: "text-green-600", bg: "bg-green-500/10" },
  ];

  // Pipeline counts
  const pipelineCounts = pipelineOrder.map(status => ({
    status,
    ...statusConfig[status],
    count: students.filter(s => s.status === status).length,
  }));

  // Recent paginated
  const recentSlice = students.slice(recentPage * PAGE_SIZE, (recentPage + 1) * PAGE_SIZE);
  const totalRecentPages = Math.ceil(students.length / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#181d29]">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Track your students' application progress through the Malaysian visa journey</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((m, i) => (
          <Card key={m.label} className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-sm flex items-center justify-center ${m.bg} ${m.accent}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                <p className="text-xl font-extrabold text-[#181d29]">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Pipeline — Horizontal Flow */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-[#ffa300]" />
            Application Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No students added yet. Go to Students tab to add your first student.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pipelineCounts.map((p) => {
                const Icon = p.icon;
                const active = p.count > 0;
                return (
                  <div
                    key={p.status}
                    className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-sm transition-colors ${p.bgCard} ${active ? "bg-white" : "bg-gray-50/60 opacity-50"}`}
                  >
                    <div className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 ${p.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-extrabold text-[#181d29] leading-none">{p.count}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-tight truncate">{p.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Rejected / On Hold summary */}
          {(rejected > 0 || students.filter(s => s.status === "on_hold").length > 0) && (
            <div className="flex gap-4 mt-3 pt-3 border-t">
              {rejected > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-[10px] font-bold">{rejected} Rejected</Badge>
                </div>
              )}
              {students.filter(s => s.status === "on_hold").length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 text-[10px] font-bold">{students.filter(s => s.status === "on_hold").length} On Hold</Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Students */}
      {students.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#ffa300]" />
              Recent Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {recentSlice.map(s => {
                const st = statusConfig[s.status] || { label: s.status, color: "bg-muted text-muted-foreground" };
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 px-2 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#181d29] truncate">{s.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.target_university || "No university"} · {s.target_course || "No course"} · {s.degree_level}</p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${st.color}`}>
                      {st.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
            {totalRecentPages > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-[11px] text-muted-foreground">Page {recentPage + 1} of {totalRecentPages}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" disabled={recentPage === 0} onClick={() => setRecentPage(p => p - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" disabled={recentPage >= totalRecentPages - 1} onClick={() => setRecentPage(p => p + 1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
