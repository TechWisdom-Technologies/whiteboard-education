import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle, FileSearch, AlertTriangle, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const statusMap: Record<string, { label: string; color: string }> = {
  document_review: { label: "Document Review", color: "bg-muted text-muted-foreground" },
  documents_verified: { label: "Documents Verified", color: "bg-blue-500/10 text-blue-600" },
  applied: { label: "Applied", color: "bg-[#ffa300]/10 text-[#ffa300]" },
  offer_received: { label: "Offer Received", color: "bg-warning/10 text-warning" },
  visa_processing: { label: "Visa Processing", color: "bg-primary/10 text-primary" },
  visa_approved: { label: "Visa Approved", color: "bg-green-500/10 text-green-600" },
  enrolled: { label: "Enrolled", color: "bg-green-600/10 text-green-700" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" },
};

const pipelineOrder = ["document_review", "documents_verified", "applied", "offer_received", "visa_processing", "visa_approved", "enrolled"];

interface Student {
  id: string;
  full_name: string;
  status: string;
  target_university: string;
  target_course: string;
  degree_level: string;
  created_at: string;
}

export default function PartnerOverview() {
  const { session, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const total = students.length;
  const inReview = students.filter(s => s.status === "document_review").length;
  const inProgress = students.filter(s => ["documents_verified", "applied", "offer_received", "visa_processing"].includes(s.status)).length;
  const enrolled = students.filter(s => s.status === "enrolled").length;
  const rejected = students.filter(s => s.status === "rejected").length;

  const metrics = [
    { label: "Total Students", value: total, icon: Users, color: "text-[#ffa300]" },
    { label: "In Review", value: inReview, icon: FileSearch, color: "text-warning" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-primary" },
    { label: "Enrolled", value: enrolled, icon: GraduationCap, color: "text-green-600" },
  ];

  // Group by status for pipeline view
  const pipeline = pipelineOrder.map(status => ({
    status,
    ...statusMap[status],
    students: students.filter(s => s.status === status),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Track your students' application progress in real-time</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={m.label} className="hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-sm bg-muted flex items-center justify-center ${m.color}`}>
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-extrabold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline View */}
      <Card>
        <CardHeader><CardTitle>Application Pipeline</CardTitle></CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No students added yet. Go to Students tab to add your first student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pipeline.filter(p => p.students.length > 0).map(p => (
                <div key={p.status}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={p.color}>{p.label}</Badge>
                    <span className="text-sm text-muted-foreground font-medium">{p.students.length} student{p.students.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {p.students.map(s => (
                      <div key={s.id} className="p-3 rounded-sm border bg-card hover:bg-muted/30 transition-colors">
                        <p className="font-medium text-sm">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">{s.target_university || "No university"} · {s.target_course || "No course"}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.degree_level} · Added {new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {rejected > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">Rejected</Badge>
                    <span className="text-sm text-muted-foreground font-medium">{rejected} student{rejected > 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.filter(s => s.status === "rejected").map(s => (
                      <div key={s.id} className="p-3 rounded-sm border border-destructive/20 bg-destructive/5">
                        <p className="font-medium text-sm">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">{s.target_university || "No university"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {students.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recently Added Students</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.slice(0, 5).map(s => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.target_university} - {s.target_course}</p>
                  </div>
                  <Badge variant="outline" className={statusMap[s.status]?.color || ""}>
                    {statusMap[s.status]?.label || s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
