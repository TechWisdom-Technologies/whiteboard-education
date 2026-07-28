import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Mail, 
  Phone, 
  Building,
  GraduationCap,
  Calendar,
  PlaySquare,
  Briefcase
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function PartnerOverview() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [emgsData, setEmgsData] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [accountManager, setAccountManager] = useState<any>(null);
  const [tutorials, setTutorials] = useState<any[]>([]);

  // Toggle states
  const [isStudentsExpanded, setIsStudentsExpanded] = useState(true);
  const [isOffersExpanded, setIsOffersExpanded] = useState(true);
  const [isEmgsExpanded, setIsEmgsExpanded] = useState(true);
  const [isVisaExpanded, setIsVisaExpanded] = useState(true);

  useEffect(() => {
    if (!user || !session) return;
    
    async function fetchData() {
      try {
        const headers = {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session?.access_token}`
        };

        // Fetch partner & students
        const fetchPartner = fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?user_id=eq.${user?.id}&select=*`, { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => []);
        
        const fetchStudents = fetch(`${SUPABASE_URL}/rest/v1/students?partner_id=eq.${user?.id}&select=*`, { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => []);

        const [partnerRes, studentsRes] = await Promise.all([
          fetchPartner,
          fetchStudents
        ]);

        if (partnerRes && partnerRes.length > 0) {
          setPartnerInfo(partnerRes[0]);
        }

        const students = Array.isArray(studentsRes) ? studentsRes : [];
        setStudentsData(students);

        // Fetch events via supabase client safely
        try {
          const { data: eventsData } = await supabase
            .from("events")
            .select("id, title, date, time, description")
            .order("date", { ascending: true })
            .limit(3);
          const mappedEvents = (eventsData || []).map((e: any) => ({
            ...e,
            event_date: e.date || new Date().toISOString()
          }));
          setWebinars(mappedEvents);
        } catch {
          setWebinars([]);
        }

        // Fetch EMGS processing if students exist
        if (students.length > 0) {
          const studentIds = students.map((s: any) => s.id);
          try {
            const { data: emgsRes } = await supabase
              .from("student_applications")
              .select("id, emgs_status_percentage, student_id")
              .in("student_id", studentIds);
            setEmgsData((emgsRes || []).filter((app: any) => Number(app.emgs_status_percentage) > 0));
          } catch {
            setEmgsData([]);
          }
        }

        // Fetch platform settings and tutorials with fallbacks
        try {
          const { data: amData } = await (supabase.from as any)('platform_settings')
            .select('*')
            .eq('key', 'account_manager')
            .maybeSingle();

          if (amData?.value) {
            let val = amData.value;
            if (typeof val === 'string') {
              try { val = JSON.parse(val); } catch (e) {}
            }
            setAccountManager(val);
          }
        } catch {
          setAccountManager(null);
        }

        try {
          const { data: tutsData } = await (supabase.from as any)('platform_tutorials')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(2);

          if (tutsData) setTutorials(tutsData);
        } catch {
          setTutorials([]);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, session]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // --- Calculations ---

  // Students Breakdown
  const totalStudentsCount = studentsData.length;
  const wbStatuses = ['document_upload', 'document_review', 'document_verification'];
  const submittedStatuses = ['university_selection', 'university_application', 'application_pending'];
  
  const receivedAtWbCount = studentsData.filter(s => wbStatuses.includes(s.status)).length;
  const onHoldCount = studentsData.filter(s => s.status === 'on_hold').length;
  const submittedCount = studentsData.filter(s => submittedStatuses.includes(s.status)).length;
  const rejectedCount = studentsData.filter(s => s.status === 'rejected').length;

  // Offers Breakdown
  const conditionalCount = studentsData.filter(s => s.status === 'university_accepted').length;
  const unconditionalCount = studentsData.filter(s => s.status === 'offer_letter_signed').length;
  const totalOffersCount = conditionalCount + unconditionalCount;

  // EMGS Breakdown
  let emgs5 = 0, emgs15 = 0, emgs35 = 0, emgs70 = 0;
  emgsData.forEach(item => {
    const p = item.emgs_status_percentage || 0;
    if (p > 0 && p <= 10) emgs5++;
    else if (p > 10 && p <= 20) emgs15++;
    else if (p > 20 && p <= 50) emgs35++;
    else if (p > 50 && p <= 100) emgs70++;
  });

  // Visa Breakdown
  const visaStatuses = ['val_issued', 'sev_application', 'sev_received'];
  const visaTotalCount = studentsData.filter(s => visaStatuses.includes(s.status)).length;
  const visaReceivedCount = studentsData.filter(s => s.status === 'sev_received').length;
  const visaPendingCount = studentsData.filter(s => s.status === 'val_issued').length;

  // Utilities
  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#1E293B]">
      
      {/* Section 1: Partner Details Card */}
      <Card className="bg-white border-[#2F4F97]/10 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-[#2F4F97] flex items-center gap-2">
            <Building className="w-5 h-5" />
            Partner Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#2F4F97]/5 rounded-lg">
                <Building className="w-4 h-4 text-[#2F4F97]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Agency Name</p>
                <p className="text-sm font-semibold">{partnerInfo?.agency_name || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#2F4F97]/5 rounded-lg">
                <User className="w-4 h-4 text-[#2F4F97]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Contact Person</p>
                <p className="text-sm font-semibold">{partnerInfo?.contact_person || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#2F4F97]/5 rounded-lg">
                <Mail className="w-4 h-4 text-[#2F4F97]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold">{partnerInfo?.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#2F4F97]/5 rounded-lg">
                <Phone className="w-4 h-4 text-[#2F4F97]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold">{partnerInfo?.phone || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 2: Total Students Summary */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4" onClick={() => setIsStudentsExpanded(!isStudentsExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2F4F97]" />
                <CardTitle className="text-base text-[#2F4F97]">
                  Total Students – <span className="font-bold underline hover:text-[#1e3a75] transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/partner-dashboard/students'); }}>{totalStudentsCount}</span>
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2F4F97]">
                {isStudentsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {isStudentsExpanded && (
            <CardContent className="pt-0 pb-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/partner-dashboard/students')}>
                  <p className="text-xs text-muted-foreground font-medium">All Applications</p>
                  <p className="text-xl font-bold text-[#2F4F97]">{totalStudentsCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/partner-dashboard/students?status=document_upload')}>
                  <p className="text-xs text-muted-foreground font-medium">Received at WB</p>
                  <p className="text-xl font-bold text-[#2F4F97]">{receivedAtWbCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/partner-dashboard/students?status=university_selection')}>
                  <p className="text-xs text-muted-foreground font-medium">Submitted</p>
                  <p className="text-xl font-bold text-[#2F4F97]">{submittedCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/partner-dashboard/students?status=on_hold')}>
                  <p className="text-xs text-muted-foreground font-medium">On Hold</p>
                  <p className="text-xl font-bold text-amber-600">{onHoldCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors col-span-2" onClick={() => navigate('/partner-dashboard/students?status=rejected')}>
                  <p className="text-xs text-muted-foreground font-medium">Rejected</p>
                  <p className="text-xl font-bold text-red-600">{rejectedCount}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 3: Offers */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4" onClick={() => setIsOffersExpanded(!isOffersExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#2F4F97]" />
                <CardTitle className="text-base text-[#2F4F97]">
                  Offers – <span className="font-bold underline hover:text-[#1e3a75] transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/partner-dashboard/applications'); }}>{totalOffersCount}</span>
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2F4F97]">
                {isOffersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {isOffersExpanded && (
            <CardContent className="pt-0 pb-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => navigate('/partner-dashboard/applications?status=university_accepted')}>
                  <p className="text-xs text-blue-700 font-medium">Conditional</p>
                  <p className="text-2xl font-bold text-[#2F4F97]">{conditionalCount}</p>
                </div>
                <div className="p-3 bg-green-50/50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-50 transition-colors" onClick={() => navigate('/partner-dashboard/applications?status=offer_letter_signed')}>
                  <p className="text-xs text-green-700 font-medium">Unconditional</p>
                  <p className="text-2xl font-bold text-green-700">{unconditionalCount}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 4: EMGS Processing */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4" onClick={() => setIsEmgsExpanded(!isEmgsExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#2F4F97]" />
                <CardTitle className="text-base text-[#2F4F97]">EMGS Processing</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2F4F97]">
                {isEmgsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {isEmgsExpanded && (
            <CardContent className="pt-0 pb-4 border-t border-slate-100">
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-2xl font-bold text-[#2F4F97]">{emgs5}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">5%</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-2xl font-bold text-[#2F4F97]">{emgs15}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">15%</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-2xl font-bold text-[#2F4F97]">{emgs35}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">35%</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-2xl font-bold text-[#2F4F97]">{emgs70}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">70%</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 5: Visa Application */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4" onClick={() => setIsVisaExpanded(!isVisaExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#2F4F97]" />
                <CardTitle className="text-base text-[#2F4F97]">
                  Visa Application – {visaTotalCount}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2F4F97]">
                {isVisaExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {isVisaExpanded && (
            <CardContent className="pt-0 pb-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-muted-foreground font-medium">Visa Received</p>
                  <p className="text-lg font-bold text-green-700">{visaReceivedCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-muted-foreground font-medium">Visa Rejected</p>
                  <p className="text-lg font-bold text-red-600">0</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-muted-foreground font-medium">Deferrals</p>
                  <p className="text-lg font-bold text-amber-600">{onHoldCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-muted-foreground font-medium text-nowrap truncate">Pending From Partner</p>
                  <p className="text-lg font-bold text-[#2F4F97]">{visaPendingCount}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Section 6: Bottom Section (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upcoming Webinars */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm text-[#2F4F97] flex items-center gap-2 uppercase tracking-wider font-bold">
              <Calendar className="w-4 h-4" />
              Upcoming Webinars
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            {webinars.length > 0 ? (
              <div className="space-y-4">
                {webinars.map((w: any) => (
                  <div key={w.id} className="flex flex-col gap-1">
                    <p className="text-sm font-semibold truncate" title={w.title}>{w.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.event_date).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming webinars</p>
            )}
          </CardContent>
        </Card>

        {/* Account Manager */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm text-[#2F4F97] flex items-center gap-2 uppercase tracking-wider font-bold">
              <User className="w-4 h-4" />
              Account Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            {accountManager ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] font-bold">
                    {accountManager.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">{accountManager.name || 'N/A'}</p>
                    <p className="text-xs text-[#2F4F97] font-medium">{accountManager.title || 'Account Manager'}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <a href={`mailto:${accountManager.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2F4F97] transition-colors">
                    <Mail className="w-4 h-4" />
                    {accountManager.email || 'N/A'}
                  </a>
                  <a href={`tel:${accountManager.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2F4F97] transition-colors">
                    <Phone className="w-4 h-4" />
                    {accountManager.phone || 'N/A'}
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Account manager unassigned</p>
            )}
          </CardContent>
        </Card>

        {/* Platform Tutorials */}
        <Card className="bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm text-[#2F4F97] flex items-center gap-2 uppercase tracking-wider font-bold">
              <PlaySquare className="w-4 h-4" />
              Platform Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            {tutorials.length > 0 ? (
              <div className="space-y-4">
                {tutorials.map((tut: any) => {
                  const videoId = extractYoutubeId(tut.video_url);
                  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                  return (
                    <a 
                      key={tut.id} 
                      href={tut.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors"
                    >
                      {thumbUrl ? (
                        <div className="relative w-20 h-14 bg-black rounded overflow-hidden flex-shrink-0">
                          <img src={thumbUrl} alt={tut.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PlaySquare className="w-5 h-5 text-white opacity-70 group-hover:opacity-100" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-14 bg-slate-200 rounded flex items-center justify-center flex-shrink-0">
                          <PlaySquare className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-semibold line-clamp-2 group-hover:text-[#2F4F97] transition-colors">{tut.title}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No tutorials available</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
