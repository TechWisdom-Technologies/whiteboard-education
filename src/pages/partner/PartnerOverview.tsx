import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Briefcase,
  Globe,
  Users,
  Building2,
  FileText,
  Search,
  ExternalLink,
  Video
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function PartnerOverview() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string }>({ display_name: "", avatar_url: "" });
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [accountManager, setAccountManager] = useState<any>(null);
  const [tutorials, setTutorials] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !session) return;
    
    async function fetchData() {
      try {
        const headers = {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session?.access_token}`
        };

        // Fetch partner & students & profile
        const fetchPartner = fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?user_id=eq.${user?.id}&select=*`, { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => []);
        
        const fetchStudents = fetch(`${SUPABASE_URL}/rest/v1/students?partner_id=eq.${user?.id}&select=*`, { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => []);

        const fetchProfile = fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user?.id}&select=display_name,avatar_url`, { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => []);

        const [partnerRes, studentsRes, profileRes] = await Promise.all([
          fetchPartner,
          fetchStudents,
          fetchProfile
        ]);

        if (partnerRes && partnerRes.length > 0) {
          setPartnerInfo(partnerRes[0]);
        }

        const localAvatar = localStorage.getItem(`partner_avatar_${user?.id}`) || "";
        if (profileRes && profileRes.length > 0) {
          setProfile({
            display_name: profileRes[0].display_name || "",
            avatar_url: profileRes[0].avatar_url || localAvatar || "",
          });
        } else if (localAvatar) {
          setProfile(prev => ({ ...prev, avatar_url: localAvatar }));
        }

        const students = Array.isArray(studentsRes) ? studentsRes : [];
        setStudentsData(students);

        // Fetch events via supabase client safely
        try {
          const { data: eventsData } = await supabase
            .from("events")
            .select("id, title, date, time, description, meeting_link")
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

        // Fetch courses count
        try {
          const { count } = await supabase
            .from("courses")
            .select("*", { count: 'exact', head: true });
          setCoursesCount(count || 0);
        } catch (err) { console.error(err); }

        // Fetch applications count
        if (students.length > 0) {
          const studentIds = students.map((s: any) => s.id);
          try {
            const { count } = await (supabase.from as any)("student_applications")
              .select("*", { count: 'exact', head: true })
              .in("student_id", studentIds);
            setApplicationsCount(count || 0);
          } catch (err) { console.error(err); }
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
              try { val = JSON.parse(val); } catch (e) { console.error(e); }
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
            .order('sort_order', { ascending: true });

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

  // Utilities
  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#1E293B]">

            <div className="bg-white border-[#2F4F97]/10 shadow-sm rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          <div className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl group" onClick={() => navigate('/partner-dashboard/students')}>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-[#2F4F97]" />
            </div>
            <p className="text-3xl font-bold text-[#2F4F97]">{totalStudentsCount}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">Total Students</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl group" onClick={() => navigate('/partner-dashboard/applications')}>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-[#2F4F97]">{applicationsCount}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">Applications</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl group" onClick={() => navigate('/partner-dashboard/search-programs')}>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-[#2F4F97]">{coursesCount}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">Search Programs</p>
          </div>

        </div>
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
                {webinars.map((w: any) => {
                  const d = w.date ? new Date(w.date) : null;
                  const dayName = d ? d.toLocaleDateString(undefined, { weekday: 'long' }) : '';
                  const dateStr = d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                    <div key={w.id} className="flex flex-col gap-1.5 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                      <p className="text-sm font-semibold text-[#1E293B] truncate" title={w.title}>{w.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-[#2F4F97]" />
                        <span>{dayName}{dayName && dateStr ? ', ' : ''}{dateStr}</span>
                        {w.time && <span className="font-medium text-[#2F4F97]">· {w.time}</span>}
                      </div>
                      {w.meeting_link && (
                        <a
                          href={w.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-white bg-[#2F4F97] hover:bg-[#243d78] rounded-md px-3 py-1.5 transition-colors w-fit"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Webinar
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
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
            {Array.isArray(accountManager) && accountManager.length > 0 ? (
              <div className="space-y-6">
                {accountManager.map((am: any, idx: number) => (
                  <div key={idx} className={idx > 0 ? "pt-4 border-t border-slate-100 space-y-4" : "space-y-4"}>
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 rounded-full shrink-0 border-2 border-[#2F4F97]/20">
                        <AvatarImage src={am.photo_url || ""} alt={am.name} className="object-cover" />
                        <AvatarFallback className="bg-[#2F4F97]/10 text-[#2F4F97] font-bold text-base">
                          {am.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-[#1E293B]">{am.name || 'N/A'}</p>
                        <p className="text-xs text-[#2F4F97] font-medium">{am.title || 'Account Manager'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {am.email && (
                        <a href={`mailto:${am.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2F4F97] transition-colors">
                          <Mail className="w-4 h-4" />
                          {am.email}
                        </a>
                      )}
                      {am.phone && (
                        <a href={`tel:${am.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2F4F97] transition-colors">
                          <Phone className="w-4 h-4" />
                          {am.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(accountManager) && accountManager?.name ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 rounded-full shrink-0 border-2 border-[#2F4F97]/20">
                    <AvatarImage src={accountManager.photo_url || ""} alt={accountManager.name} className="object-cover" />
                    <AvatarFallback className="bg-[#2F4F97]/10 text-[#2F4F97] font-bold text-base">
                      {accountManager.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">{accountManager.name || 'N/A'}</p>
                    <p className="text-xs text-[#2F4F97] font-medium">{accountManager.title || 'Account Manager'}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {accountManager.email && (
                    <a href={`mailto:${accountManager.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2F4F97] transition-colors">
                      <Mail className="w-4 h-4" />
                      {accountManager.email}
                    </a>
                  )}
                  {accountManager.phone && (
                    <a href={`tel:${accountManager.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2F4F97] transition-colors">
                      <Phone className="w-4 h-4" />
                      {accountManager.phone}
                    </a>
                  )}
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
                  const videoUrl = tut.video_url || tut.youtube_url || tut.url || '';
                  const videoId = extractYoutubeId(videoUrl);
                  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                  return (
                    <a 
                      key={tut.id} 
                      href={videoUrl}
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
