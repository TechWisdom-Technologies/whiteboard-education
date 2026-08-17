import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Clock, UserCheck, FileText, TrendingUp, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusPhases } from "@/config/statusFlow";

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
  contact_first_name: string;
  contact_last_name: string;
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
  emgs_processing: { label: "EMGS", color: "bg-[#1d283a]/10 text-[#1d283a]" },
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  // Card Filters
  const [card0Filter, setCard0Filter] = useState("all");
  const [card1Filter, setCard1Filter] = useState("all");
  const [card2Filter, setCard2Filter] = useState("offer_letter_received_unconditional");
  const [card3Filter, setCard3Filter] = useState("ready_for_visa_application");
  const [card4Filter, setCard4Filter] = useState("rejected_by_university");
  const [card5Filter, setCard5Filter] = useState("rejected_by_visa_office");

  const [applicationsList, setApplicationsList] = useState<any[]>([]);

  // Pagination
  const [studentPage, setStudentPage] = useState(0);
  const [partnerPage, setPartnerPage] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    const fetchAll = async () => {
      try {
        const token = session.access_token || SUPABASE_KEY;
        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };

        const [uniRes, courseRes, partnerRes, studentRes, blogRes, partnerLookupRes, appsRes] = await Promise.all([
          supabase.from("universities").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("partner_registrations").select("id, agency_name, contact_first_name, contact_last_name, status, created_at").order("created_at", { ascending: false }),
          supabase.from("students").select("id, full_name, status, partner_id, created_at").order("created_at", { ascending: false }),
          supabase.from("blogs").select("id", { count: "exact", head: true }),
          fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=user_id,agency_name`, { headers }).then(r => r.json()),
          (supabase.from as any)("student_applications").select("id, status"),
        ]);

        const partners = partnerRes.data || [];
        const students = studentRes.data || [];
        setApplicationsList(appsRes.data || []);

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

  if (loading) return <LoadingScreen fullScreen />;

  if (!stats) return null;

  const getPartnerName = (partnerId: string) => {
    const p = partnerLookup.find(pl => pl.user_id === partnerId);
    return p?.agency_name || "Unknown Agency";
  };

  const getCard0Count = () => {
    if (card0Filter === "all") return allStudents.length;
    return allStudents.filter(s => s.partner_id === card0Filter).length;
  };

  const getCard1Count = () => {
    if (card1Filter === "all") return applicationsList.length;
    return applicationsList.filter(a => a.status === card1Filter).length;
  };

  const getCard2Count = () => {
    return applicationsList.filter(a => a.status === card2Filter).length;
  };

  const getCard3Count = () => {
    return applicationsList.filter(a => a.status === card3Filter).length;
  };

  const getCard4Count = () => {
    return applicationsList.filter(a => a.status === card4Filter).length;
  };

  const getCard5Count = () => {
    return applicationsList.filter(a => a.status === card5Filter).length;
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
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in text-[#1E293B]">

      {/* Greeting and Clock Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col lg:flex-row justify-between items-center bg-gradient-to-r from-slate-50 to-white gap-6 lg:gap-0">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-[#1E293B]">Good {getTimeOfDay()}, Admin!</h2>
          <p className="text-slate-500 mt-1">Here is the latest update on the platform</p>
        </div>
        
        <div className="flex flex-row items-center gap-6 sm:gap-10 text-center lg:text-right mt-2 lg:mt-0">
          
          {/* Bangladesh Time */}
          <div className="flex flex-col items-end">
            <span className="text-[11px] sm:text-xs font-bold text-[#1d283a] uppercase tracking-widest mb-1">Bangladesh</span>
            <p className="text-3xl sm:text-4xl font-semibold text-[#1d283a] whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(() => {
                const d = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
                const h = d.getHours() % 12 || 12;
                const m = String(d.getMinutes()).padStart(2, '0');
                const s = String(d.getSeconds()).padStart(2, '0');
                const ap = d.getHours() >= 12 ? 'PM' : 'AM';
                return <>{String(h).padStart(2, '0')}:{m}:{s} {ap}</>;
              })()}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-[#1d283a] tracking-wider mt-1">
              {currentTime.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-slate-200" />

          {/* Malaysia Time */}
          <div className="flex flex-col items-end">
            <span className="text-[11px] sm:text-xs font-bold text-[#CC0000] uppercase tracking-widest mb-1">Malaysia</span>
            <p className="text-3xl sm:text-4xl font-semibold text-[#CC0000] whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(() => {
                const d = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
                const h = d.getHours() % 12 || 12;
                const m = String(d.getMinutes()).padStart(2, '0');
                const s = String(d.getSeconds()).padStart(2, '0');
                const ap = d.getHours() >= 12 ? 'PM' : 'AM';
                return <>{String(h).padStart(2, '0')}:{m}:{s} {ap}</>;
              })()}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-[#CC0000] tracking-wider mt-1">
              {currentTime.toLocaleDateString('en-US', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

        </div>
      </div>

      {/* Dynamic Status Cards (from Partner Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 0: Total Students (Admin sees all, can filter by agency) */}
        <div 
          className="bg-white border-2 border-[#1d283a] shadow-sm rounded-xl p-4 transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4">
            <Select value={card0Filter} onValueChange={setCard0Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50 focus:ring-[#1d283a]/20 focus:border-[#1d283a]/30">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs focus:bg-[#1d283a] focus:text-white">All Students</SelectItem>
                {partnerLookup.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id} className="text-xs focus:bg-[#1d283a] focus:text-white">{p.agency_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-[#1d283a]">{getCard0Count()}</p>
        </div>

        {/* Card 1: Total Applications */}
        <div 
          className="bg-white border-2 border-[#1d283a] shadow-sm rounded-xl p-4 transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4">
            <Select value={card1Filter} onValueChange={setCard1Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50 focus:ring-[#1d283a]/20 focus:border-[#1d283a]/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs focus:bg-[#1d283a] focus:text-white">All Applications</SelectItem>
                {statusPhases[0].steps.filter(s => s.id !== 'new').map(step => (
                  <SelectItem key={step.id} value={step.id} className="text-xs focus:bg-[#1d283a] focus:text-white">{step.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-[#1d283a]">{getCard1Count()}</p>
        </div>

        {/* Card 2 */}
        <div 
          className="bg-white border-2 border-[#1d283a] shadow-sm rounded-xl p-4 transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4">
            <Select value={card2Filter} onValueChange={setCard2Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50 focus:ring-[#1d283a]/20 focus:border-[#1d283a]/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offer_letter_received_conditional" className="text-xs focus:bg-[#1d283a] focus:text-white">Offer Letter Received (Conditional)</SelectItem>
                <SelectItem value="offer_letter_received_unconditional" className="text-xs focus:bg-[#1d283a] focus:text-white">Offer Letter Received (Unconditional)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-[#1d283a]">{getCard2Count()}</p>
        </div>

        {/* Card 3: Visa Applications */}
        <div 
          className="bg-white border-2 border-[#1d283a] shadow-sm rounded-xl p-4 transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4">
            <Select value={card3Filter} onValueChange={setCard3Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50 focus:ring-[#1d283a]/20 focus:border-[#1d283a]/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ready_for_visa_application" className="text-xs focus:bg-[#1d283a] focus:text-white">Ready for Visa</SelectItem>
                <SelectItem value="emgs_approval_pending" className="text-xs focus:bg-[#1d283a] focus:text-white">EMGS Pending</SelectItem>
                <SelectItem value="rejected_by_visa_office" className="text-xs focus:bg-[#1d283a] focus:text-white">Rejected by Visa Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-[#1d283a]">{getCard3Count()}</p>
        </div>

        {/* Card 4: Rejected by University */}
        <div 
          className="bg-white border-2 border-[#1d283a] shadow-sm rounded-xl p-4 transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4">
            <Select value={card4Filter} onValueChange={setCard4Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50 focus:ring-[#1d283a]/20 focus:border-[#1d283a]/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rejected_by_university" className="text-xs focus:bg-[#1d283a] focus:text-white">Rejected by University</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-[#1d283a]">{getCard4Count()}</p>
        </div>

        {/* Card 5: Rejected by Visa */}
        <div 
          className="bg-white border-2 border-[#1d283a] shadow-sm rounded-xl p-4 transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4">
            <Select value={card5Filter} onValueChange={setCard5Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50 focus:ring-[#1d283a]/20 focus:border-[#1d283a]/30">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rejected_by_visa_office" className="text-xs focus:bg-[#1d283a] focus:text-white">Rejected by Visa Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-[#1d283a]">{getCard5Count()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Partners */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[12px] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1d283a]" />
              Recent Partner Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allPartners.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-8">No partners yet</p>
            ) : (
              <>
                <div className="space-y-0.5">
                  {pagedPartners.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 px-2 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-normal text-[#1E293B] truncate">{p.agency_name}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{p.contact_first_name} {p.contact_last_name}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[12px] font-normal uppercase tracking-wider ${partnerStatusColor(p.status)}`}>
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {totalPartnerPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-[12px] text-muted-foreground">
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
            <CardTitle className="text-[12px] flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#1d283a]" />
              Recent Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allStudents.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-8">No students yet</p>
            ) : (
              <>
                <div className="space-y-0.5">
                  {pagedStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 px-2 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-normal text-[#1E293B] truncate">{s.full_name}</p>
                        <p className="text-[12px] text-muted-foreground truncate">Added by {getPartnerName(s.partner_id)}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[12px] font-normal uppercase tracking-wider ${studentStatusLabels[s.status]?.color || "bg-muted text-muted-foreground"}`}>
                        {studentStatusLabels[s.status]?.label || s.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {totalStudentPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-[12px] text-muted-foreground">
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
