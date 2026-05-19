import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Clock, UserCheck, FileText, TrendingUp, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface DashboardStats {
  universities: number;
  courses: number;
  partners: number;
  pendingPartners: number;
  students: number;
  blogs: number;
}

interface RecentStudent {
  id: string;
  full_name: string;
  status: string;
  partner_id: string;
  created_at: string;
}

interface RecentPartner {
  id: string;
  agency_name: string;
  contact_person: string;
  status: string;
  created_at: string;
}

interface PartnerLookup {
  user_id: string;
  agency_name: string;
}

const studentStatusLabels: Record<string, { label: string; color: string }> = {
  document_review: { label: "Doc Review", color: "bg-gray-100 text-gray-600" },
  documents_verified: { label: "Docs Verified", color: "bg-blue-500/10 text-blue-600" },
  university_applied: { label: "Applied", color: "bg-indigo-500/10 text-indigo-600" },
  offer_letter: { label: "Offer Letter", color: "bg-purple-500/10 text-purple-600" },
  emgs_processing: { label: "EMGS", color: "bg-[#ffa300]/10 text-[#ffa300]" },
  visa_approved: { label: "Visa ✓", color: "bg-emerald-500/10 text-emerald-600" },
  travel_ready: { label: "Travel Ready", color: "bg-teal-500/10 text-teal-600" },
  enrolled: { label: "Enrolled", color: "bg-green-600/10 text-green-700" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive" },
  on_hold: { label: "On Hold", color: "bg-amber-500/10 text-amber-600" },
};

const partnerStatusColor = (s: string) =>
  s === "approved" ? "bg-green-500/10 text-green-600 border-green-200" :
  s === "rejected" ? "bg-red-500/10 text-red-600 border-red-200" :
  "bg-amber-500/10 text-amber-600 border-amber-200";

const PAGE_SIZE = 7;

export default function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allStudents, setAllStudents] = useState<RecentStudent[]>([]);
  const [allPartners, setAllPartners] = useState<RecentPartner[]>([]);
  const [partnerLookup, setPartnerLookup] = useState<PartnerLookup[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [studentPage, setStudentPage] = useState(0);
  const [partnerPage, setPartnerPage] = useState(0);

  useEffect(() => {
    if (!session) return;
    const fetchAll = async () => {
      try {
        const token = session.access_token || SUPABASE_KEY;
        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };

        const [uniRes, courseRes, partnerRes, studentRes, blogRes, partnerLookupRes] = await Promise.all([
          supabase.from("universities").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("partner_registrations").select("id, agency_name, contact_person, status, created_at").order("created_at", { ascending: false }),
          supabase.from("students").select("id, full_name, status, partner_id, created_at").order("created_at", { ascending: false }),
          supabase.from("blogs").select("id", { count: "exact", head: true }),
          fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=user_id,agency_name`, { headers }).then(r => r.json()),
        ]);

        const partners = partnerRes.data || [];
        const students = studentRes.data || [];

        setStats({
          universities: uniRes.count || 0,
          courses: courseRes.count || 0,
          partners: partners.length,
          pendingPartners: partners.filter(p => p.status === "pending").length,
          students: students.length,
          blogs: blogRes.count || 0,
        });

        setAllPartners(partners);
        setAllStudents(students);
        setPartnerLookup(partnerLookupRes || []);
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

  const getPartnerName = (partnerId: string) => {
    const p = partnerLookup.find(pl => pl.user_id === partnerId);
    return p?.agency_name || "Unknown Agency";
  };

  const metrics = [
    { label: "Universities", value: stats.universities, icon: GraduationCap, color: "text-secondary" },
    { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-green-600" },
    { label: "Partners", value: stats.partners, icon: Users, color: "text-primary" },
    { label: "Pending Partners", value: stats.pendingPartners, icon: Clock, color: "text-warning" },
    { label: "Total Students", value: stats.students, icon: UserCheck, color: "text-secondary" },
    { label: "Blog Posts", value: stats.blogs, icon: FileText, color: "text-primary" },
  ];

  // Paginated slices
  const pagedPartners = allPartners.slice(partnerPage * PAGE_SIZE, (partnerPage + 1) * PAGE_SIZE);
  const totalPartnerPages = Math.ceil(allPartners.length / PAGE_SIZE);
  const pagedStudents = allStudents.slice(studentPage * PAGE_SIZE, (studentPage + 1) * PAGE_SIZE);
  const totalStudentPages = Math.ceil(allStudents.length / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        {/* Recent Partners */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-[#ffa300]" />
              Recent Partner Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allPartners.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No partners yet</p>
            ) : (
              <>
                <div className="space-y-0.5">
                  {pagedPartners.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 px-2 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#181d29] truncate">{p.agency_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{p.contact_person}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${partnerStatusColor(p.status)}`}>
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {totalPartnerPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-[11px] text-muted-foreground">
                      Page {partnerPage + 1} of {totalPartnerPages}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={partnerPage === 0} onClick={() => setPartnerPage(p => p - 1)}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={partnerPage >= totalPartnerPages - 1} onClick={() => setPartnerPage(p => p + 1)}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#ffa300]" />
              Recent Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No students yet</p>
            ) : (
              <>
                <div className="space-y-0.5">
                  {pagedStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 px-2 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#181d29] truncate">{s.full_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">Added by {getPartnerName(s.partner_id)}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${studentStatusLabels[s.status]?.color || "bg-muted text-muted-foreground"}`}>
                        {studentStatusLabels[s.status]?.label || s.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {totalStudentPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-[11px] text-muted-foreground">
                      Page {studentPage + 1} of {totalStudentPages}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={studentPage === 0} onClick={() => setStudentPage(p => p - 1)}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={studentPage >= totalStudentPages - 1} onClick={() => setStudentPage(p => p + 1)}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
