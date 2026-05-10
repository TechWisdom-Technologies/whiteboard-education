import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Users, Clock, UserCheck, FileText, Globe, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  universities: number;
  courses: number;
  partners: number;
  pendingPartners: number;
  students: number;
  enrolledStudents: number;
  blogs: number;
  countries: number;
}

interface RecentStudent {
  id: string;
  full_name: string;
  status: string;
  target_university: string;
  created_at: string;
}

interface RecentPartner {
  id: string;
  agency_name: string;
  contact_person: string;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  document_review: { label: "Doc Review", color: "bg-muted text-muted-foreground" },
  documents_verified: { label: "Verified", color: "bg-blue-500/10 text-blue-600" },
  applied: { label: "Applied", color: "bg-secondary/10 text-secondary" },
  offer_received: { label: "Offer", color: "bg-warning/10 text-warning" },
  visa_processing: { label: "Visa", color: "bg-primary/10 text-primary" },
  visa_approved: { label: "Visa ✓", color: "bg-green-500/10 text-green-600" },
  enrolled: { label: "Enrolled", color: "bg-green-600/10 text-green-700" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" },
};

export default function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [recentPartners, setRecentPartners] = useState<RecentPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const fetchAll = async () => {
      try {
        const [uniRes, courseRes, partnerRes, studentRes, blogRes, countryRes] = await Promise.all([
          supabase.from("universities").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("partner_registrations").select("id, status", { count: "exact" }),
          supabase.from("students").select("id, full_name, status, target_university, created_at"),
          supabase.from("blogs").select("id", { count: "exact", head: true }),
          supabase.from("countries").select("id", { count: "exact", head: true }),
        ]);

        const allPartners = partnerRes.data || [];
        const allStudents = studentRes.data || [];

        setStats({
          universities: uniRes.count || 0,
          courses: courseRes.count || 0,
          partners: allPartners.length,
          pendingPartners: allPartners.filter(p => p.status === "pending").length,
          students: allStudents.length,
          enrolledStudents: allStudents.filter(s => s.status === "enrolled").length,
          blogs: blogRes.count || 0,
          countries: countryRes.count || 0,
        });

        setRecentStudents(
          allStudents
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        );

        // Fetch recent partners
        const { data: rpData } = await supabase
          .from("partner_registrations")
          .select("id, agency_name, contact_person, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentPartners(rpData || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchAll();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const metrics = [
    { label: "Universities", value: stats.universities, icon: GraduationCap, color: "text-secondary" },
    { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-green-600" },
    { label: "Partners", value: stats.partners, icon: Users, color: "text-primary" },
    { label: "Pending Partners", value: stats.pendingPartners, icon: Clock, color: "text-warning" },
    { label: "Total Students", value: stats.students, icon: UserCheck, color: "text-secondary" },
    { label: "Enrolled", value: stats.enrolledStudents, icon: TrendingUp, color: "text-green-600" },
    { label: "Blog Posts", value: stats.blogs, icon: FileText, color: "text-primary" },
    { label: "Countries", value: stats.countries, icon: Globe, color: "text-warning" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={m.label} className="hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-sm bg-muted flex items-center justify-center ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-extrabold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Student Applications</CardTitle></CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No students yet</p>
            ) : (
              <div className="space-y-3">
                {recentStudents.map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.target_university || "No university"}</p>
                    </div>
                    <Badge variant="outline" className={statusLabels[s.status]?.color || ""}>
                      {statusLabels[s.status]?.label || s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Partners */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Partner Registrations</CardTitle></CardHeader>
          <CardContent>
            {recentPartners.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No partners yet</p>
            ) : (
              <div className="space-y-3">
                {recentPartners.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{p.agency_name}</p>
                      <p className="text-xs text-muted-foreground">{p.contact_person}</p>
                    </div>
                    <Badge variant="outline" className={
                      p.status === "approved" ? "bg-green-500/10 text-green-600" :
                      p.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }>
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
