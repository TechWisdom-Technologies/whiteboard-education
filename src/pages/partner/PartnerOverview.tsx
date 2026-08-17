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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusPhases } from "@/config/statusFlow";
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
  const [applicationsList, setApplicationsList] = useState<any[]>([]);

  // Card dropdown states
  const [card0Filter, setCard0Filter] = useState("all");
  const [card1Filter, setCard1Filter] = useState("all");
  const [card2Filter, setCard2Filter] = useState("offer_letter_received_conditional");
  const [card3Filter, setCard3Filter] = useState("ready_for_visa_application");
  const [card4Filter, setCard4Filter] = useState("rejected_by_university");
  const [card5Filter, setCard5Filter] = useState("rejected_by_visa_office");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
            .order("date", { ascending: true });
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
            const { data, count } = await (supabase.from as any)("student_applications")
              .select("id, status, student_id", { count: 'exact' })
              .in("student_id", studentIds);
            setApplicationsCount(count || 0);
            if (data) setApplicationsList(data);
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

  // Dynamic Card Counts
  const getCard0Count = () => {
    if (card0Filter === "all") return studentsData.length;
    return studentsData.filter(s => s.status === card0Filter).length;
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

  // Utilities
  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const getLastName = () => {
    if (partnerInfo?.contact_last_name) return partnerInfo.contact_last_name;
    if (partnerInfo?.contact_first_name) return partnerInfo.contact_first_name;
    return 'Partner';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in text-[#1E293B]">

      {/* Greeting and Clock Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col lg:flex-row justify-between items-center bg-gradient-to-r from-blue-50 to-white gap-6 lg:gap-0">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-[#1E293B]">Good {getTimeOfDay()}, {getLastName()}!</h2>
          <p className="text-slate-500 mt-1">Check your students and applications latest update</p>
        </div>
        
        <div className="flex flex-row items-center gap-6 sm:gap-10 text-center lg:text-right mt-2 lg:mt-0">
          
          {/* Bangladesh Time */}
          <div className="flex flex-col items-end">
            <span className="text-[11px] sm:text-xs font-bold text-theme uppercase tracking-widest mb-1">Bangladesh</span>
            <p className="text-3xl sm:text-4xl font-semibold text-theme whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(() => {
                const d = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
                const h = d.getHours() % 12 || 12;
                const m = String(d.getMinutes()).padStart(2, '0');
                const s = String(d.getSeconds()).padStart(2, '0');
                const ap = d.getHours() >= 12 ? 'PM' : 'AM';
                return <>{String(h).padStart(2, '0')}:{m}:{s} {ap}</>;
              })()}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-theme tracking-wider mt-1">
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

      {/* Dynamic Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 0: Total Students */}
        <div 
          onClick={() => navigate(`/partner-dashboard/students?status=${card0Filter}`)}
          className="bg-white border-2 border-theme shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <Select value={card0Filter} onValueChange={setCard0Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Students</SelectItem>
                {statusPhases[0].steps.map(step => (
                  <SelectItem key={step.id} value={step.id} className="text-xs">{step.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-theme">{getCard0Count()}</p>
        </div>

        {/* Card 1: Total Applications */}
        <div 
          onClick={() => navigate(`/partner-dashboard/applications?status=${card1Filter}`)}
          className="bg-white border-2 border-theme shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <Select value={card1Filter} onValueChange={setCard1Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Applications</SelectItem>
                {statusPhases[0].steps.filter(s => s.id !== 'new').map(step => (
                  <SelectItem key={step.id} value={step.id} className="text-xs">{step.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-theme">{getCard1Count()}</p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => navigate(`/partner-dashboard/applications?status=${card2Filter}`)}
          className="bg-white border-2 border-theme shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <Select value={card2Filter} onValueChange={setCard2Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offer_letter_received_conditional" className="text-xs">Conditional</SelectItem>
                <SelectItem value="offer_letter_received_unconditional" className="text-xs">Unconditional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-theme">{getCard2Count()}</p>
        </div>

        {/* Card 3: Visa Applications */}
        <div 
          onClick={() => navigate(`/partner-dashboard/applications?status=${card3Filter}`)}
          className="bg-white border-2 border-theme shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <Select value={card3Filter} onValueChange={setCard3Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ready_for_visa_application" className="text-xs">Ready for Visa</SelectItem>
                <SelectItem value="emgs_approval_pending" className="text-xs">EMGS Pending</SelectItem>
                <SelectItem value="rejected_by_visa_office" className="text-xs">Rejected by Visa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-theme">{getCard3Count()}</p>
        </div>

        {/* Card 4: Rejected by University */}
        <div 
          onClick={() => navigate(`/partner-dashboard/applications?status=${card4Filter}`)}
          className="bg-white border-2 border-theme shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <Select value={card4Filter} onValueChange={setCard4Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rejected_by_university" className="text-xs">Rejected by University</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-theme">{getCard4Count()}</p>
        </div>

        {/* Card 5: Rejected by Visa */}
        <div 
          onClick={() => navigate(`/partner-dashboard/applications?status=${card5Filter}`)}
          className="bg-white border-2 border-theme shadow-sm rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow relative group flex flex-col justify-between"
        >
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <Select value={card5Filter} onValueChange={setCard5Filter}>
              <SelectTrigger className="h-8 w-full text-xs border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rejected_by_visa_office" className="text-xs">Rejected by Visa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-4xl font-bold text-theme">{getCard5Count()}</p>
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
          <CardContent className="pt-4">
            {webinars.length > 0 ? (
              <div className="space-y-4 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
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
          <CardContent className="pt-4 flex-grow overflow-hidden">
            {Array.isArray(accountManager) && accountManager.length > 0 ? (
              <div className="space-y-6 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
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
          <CardContent className="pt-4 flex-grow overflow-hidden">
            {tutorials.length > 0 ? (
              <div className="space-y-4 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
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
