import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Clock, UserCheck, FileText, TrendingUp, Loader2, ChevronLeft, ChevronRight, UserPlus, FilePlus, Video, PlayCircle, UserCog, Building2, Library } from "lucide-react";
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
import { statusPhases, getStatusLabel } from "@/config/statusFlow";

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
  wbe_student_id?: string;
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



const partnerStatusColor = (s: string) =>
  s === "approved" ? "bg-green-500/10 text-green-600 border-green-200" :
  s === "rejected" ? "bg-red-500/10 text-red-600 border-red-200" :
  "bg-amber-500/10 text-amber-600 border-amber-200";

const statusTextColors: Record<string, string> = {
  new: "text-gray-600",
  received_application_at_wb: "text-blue-600",
  application_in_progress: "text-indigo-600",
  application_on_hold_intake: "text-amber-600",
  application_on_hold_wb: "text-amber-600",
  application_on_hold_university: "text-amber-600",
  application_submitted: "text-[#1d283a]",
  offer_letter_received_conditional: "text-purple-600",
  offer_letter_received_unconditional: "text-purple-600",
  rejected_by_university: "text-destructive",
  ready_for_visa_application: "text-teal-600",
  emgs_approval_pending: "text-emerald-600",
  rejected_by_visa_office: "text-destructive",
};

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
  const [studentAgencyFilter, setStudentAgencyFilter] = useState("all");
  const [partnerStatusFilter, setPartnerStatusFilter] = useState("all");

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
          supabase.from("students").select("id, wbe_student_id, full_name, status, partner_id, created_at").order("created_at", { ascending: false }),
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

  const handleApprovePartner = async (id: string) => {
    try {
      const { error } = await supabase.from('partner_registrations').update({ status: 'approved' }).eq('id', id);
      if (!error) {
        setAllPartners(allPartners.map(p => p.id === id ? { ...p, status: 'approved' } : p));
        setStats(prev => prev ? { ...prev, pendingPartners: prev.pendingPartners - 1 } : prev);
      }
    } catch (e) {}
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Students */}
        <Card className="flex flex-col h-[450px] overflow-hidden">
          <CardHeader className="px-4 py-3 bg-[#1d283a] shrink-0 flex flex-row items-center justify-between h-[52px]">
            <CardTitle className="text-[13px] flex items-center gap-2 text-white font-medium">
              <UserCheck className="h-4 w-4 text-white" />
              Recent Students
            </CardTitle>
            <div className="w-[120px]">
              <Select value={studentAgencyFilter} onValueChange={setStudentAgencyFilter}>
                <SelectTrigger className="h-7 text-[11px] bg-white text-slate-900 border-0 focus:ring-0">
                  <SelectValue placeholder="All Agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[11px]">All Agencies</SelectItem>
                  {partnerLookup.map(p => (
                    <SelectItem key={p.user_id} value={p.user_id} className="text-[11px]">{p.agency_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 p-0 bg-white">
            {allStudents.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-8">No students yet</p>
            ) : (
              <div className="divide-y">
                {(studentAgencyFilter === 'all' ? allStudents : allStudents.filter(s => s.partner_id === studentAgencyFilter)).slice(0, 50).map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => navigate(`/admin/students/${s.wbe_student_id || s.id}`)}
                    className="flex flex-col gap-1 py-3 px-4 hover:bg-[#1d283a] group cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[#1E293B] group-hover:text-white">
                          {s.full_name} <span className="italic text-[12px] font-normal text-muted-foreground group-hover:text-white/70">({s.wbe_student_id || 'Pending ID'})</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground group-hover:text-white/70 mt-1">
                          <span className="text-[#1E293B] font-medium group-hover:text-white">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'short' })}</span> - {new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className={`text-[13px] font-medium ${statusTextColors[s.status] || "text-[#1E293B]"} group-hover:text-white text-right shrink-0 mt-0.5`}>
                        {getStatusLabel(s.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Partner Agents */}
        <Card className="flex flex-col h-[450px] overflow-hidden">
          <CardHeader className="px-4 py-3 bg-[#1d283a] shrink-0 flex flex-row items-center justify-between h-[52px]">
            <CardTitle className="text-[13px] flex items-center gap-2 text-white font-medium">
              <Users className="h-4 w-4 text-white" />
              Recent Partner Agents
            </CardTitle>
            <div className="w-[120px]">
              <Select value={partnerStatusFilter} onValueChange={setPartnerStatusFilter}>
                <SelectTrigger className="h-7 text-[11px] bg-white text-slate-900 border-0 focus:ring-0">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[11px]">All Status</SelectItem>
                  <SelectItem value="approved" className="text-[11px]">Approved</SelectItem>
                  <SelectItem value="pending" className="text-[11px]">Pending</SelectItem>
                  <SelectItem value="rejected" className="text-[11px]">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 p-0 bg-white">
            {allPartners.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-8">No partners yet</p>
            ) : (
              <div className="divide-y">
                {(partnerStatusFilter === 'all' ? allPartners : allPartners.filter(p => p.status === partnerStatusFilter)).slice(0, 50).map(p => (
                  <div key={p.id} className="flex flex-col gap-2 py-3 px-4 hover:bg-[#1d283a] group transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[#1E293B] group-hover:text-white">Agency: {p.agency_name}</p>
                        <p className="text-[13px] text-muted-foreground group-hover:text-white/70 mt-0.5"><span className="italic">Representative:</span> {p.contact_first_name} {p.contact_last_name}</p>
                        <p className="text-[11px] text-muted-foreground group-hover:text-white/70 mt-1.5">
                          <span className="text-[#1E293B] font-medium group-hover:text-white">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'short' })}</span> - {new Date(p.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[11px] font-medium uppercase tracking-wider group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white ${partnerStatusColor(p.status)}`}>
                          {p.status}
                        </Badge>
                        {p.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApprovePartner(p.id)}
                            className="h-7 text-[11px] px-3 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 group-hover:bg-green-500 group-hover:text-white group-hover:border-green-500"
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="flex flex-col h-[450px] overflow-hidden">
          <CardHeader className="px-4 py-3 bg-[#1d283a] shrink-0 flex flex-row items-center justify-between h-[52px]">
            <CardTitle className="text-[13px] flex items-center gap-2 text-white font-medium">
              <TrendingUp className="h-4 w-4 text-white" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 p-0 bg-white">
            <div className="divide-y">
              <button onClick={() => navigate('/admin/partners?tab=pending')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <UserPlus className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                View pending partners
              </button>
              <button onClick={() => navigate('/admin/students?filter=new')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <FilePlus className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                View new student applications
              </button>
              <button onClick={() => navigate('/admin/partner-content?tab=events&action=new')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <Video className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                Open a webinar
              </button>
              <button onClick={() => navigate('/admin/partner-content?tab=tutorials&action=new')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <PlayCircle className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                Add a platform tutorial
              </button>
              <button onClick={() => navigate('/admin/partner-content?tab=managers&action=new')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <UserCog className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                Add a manager
              </button>
              <button onClick={() => navigate('/admin/universities?action=new')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <Building2 className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                Add a university
              </button>
              <button onClick={() => navigate('/admin/courses?action=new')} className="w-full flex items-center gap-3 text-left px-4 py-3.5 text-[14px] font-medium text-slate-700 hover:bg-[#1d283a] hover:text-white transition-colors group">
                <Library className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                Add new course
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
