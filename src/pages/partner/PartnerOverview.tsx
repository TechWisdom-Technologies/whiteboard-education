import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatarUrl } from "@/lib/secureStorage";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Bell,
  Banknote,
  Clock,
  CreditCard,
  Info,
  CheckCircle2,
  ArrowRight,
  Megaphone
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function PartnerOverview() {
  const { session, user, partnerStatus } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const handleFeatureClick = (targetPath: string) => {
    if (partnerStatus === "pending") {
      toast.info("Account Pending Administrator Approval", {
        description: "This feature will unlock once your agency registration is verified by Whiteboard Education."
      });
      return;
    }
    navigate(targetPath);
  };

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
  const [notices, setNotices] = useState<any[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

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
    if (!user?.id) return;
    
    async function fetchData() {
      try {
        const token = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token;
        const headers = {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`
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
        } else if (user?.email) {
          // Fallback fetch by email if partner registration wasn't linked by user_id
          const emailRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?email=eq.${encodeURIComponent(user.email)}&select=*`, { headers })
            .then(res => res.ok ? res.json() : [])
            .catch(() => []);
          if (emailRes && emailRes.length > 0) {
            setPartnerInfo(emailRes[0]);
          }
        }

        const localAvatar = localStorage.getItem(`partner_avatar_${user?.id}`) || "";
        const rawAvatar = (profileRes && profileRes.length > 0)
          ? (profileRes[0].avatar_url || "")
          : localAvatar;
        const resolvedAvatar = rawAvatar ? await resolveAvatarUrl(rawAvatar, user?.id) : "";

        if (profileRes && profileRes.length > 0) {
          setProfile({
            display_name: profileRes[0].display_name || "",
            avatar_url: resolvedAvatar || "",
          });
          if (profileRes[0].avatar_url) {
            localStorage.setItem(`partner_avatar_${user?.id}`, profileRes[0].avatar_url);
          } else {
            localStorage.removeItem(`partner_avatar_${user?.id}`);
          }
        } else if (resolvedAvatar) {
          setProfile(prev => ({ ...prev, avatar_url: resolvedAvatar }));
        } else {
          setProfile(prev => ({ ...prev, avatar_url: "" }));
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

        // Fetch assigned account manager for this partner agency
        const currentPartner = partnerRes && partnerRes.length > 0 ? partnerRes[0] : null;
        if (currentPartner?.account_manager_id) {
          try {
            const { data: amData, error: amError } = await (supabase.from as any)('account_managers')
              .select('*')
              .eq('id', currentPartner.account_manager_id)
              .maybeSingle();

            if (!amError && amData) {
              setAccountManager(amData);
            } else {
              setAccountManager(null);
            }
          } catch {
            setAccountManager(null);
          }
        } else {
          // If no specific manager is assigned yet, fallback to null (unassigned)
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

        // Fetch Admin Updates & Notices from partner_notices table
        try {
          const { data: noticesData, error: noticesErr } = await (supabase.from as any)('partner_notices')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!noticesErr && noticesData && noticesData.length > 0) {
            setNotices(noticesData);
          } else {
            // Seed default notices fallback so the UI displays announcements immediately
            setNotices([
              {
                id: "seed-1",
                title: "Special 20% - 30% Merit Scholarship for Fall Intake",
                category: "Offer",
                content: "Selected partner universities in Malaysia are offering exclusive merit scholarships of up to 20% to 30% on tuition fees for students applying for Fall 2026 undergraduate & postgraduate business and engineering programs. Check university requirement guidelines for eligibility.",
                created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              },
              {
                id: "seed-2",
                title: "EMGS Visa Approval Turnaround Times",
                category: "Crucial Update",
                content: "Please note that the Education Malaysia Global Services (EMGS) is currently processing student visa applications within 14-21 business days. Ensure all student academic transcripts, passport scans, and medical questionnaires are submitted early to avoid intake delays.",
                created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
              },
              {
                id: "seed-3",
                title: "New University Partner: Asia Pacific University (APU)",
                category: "Notice",
                content: "We are thrilled to welcome Asia Pacific University of Technology & Innovation (APU) to our partner portfolio. All Computing, Artificial Intelligence, and Software Engineering programs are now open for direct partner applications.",
                created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
              },
            ]);
          }
        } catch {
          setNotices([]);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.id]);

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

  const getFullName = () => {
    const fromParts = `${partnerInfo?.contact_first_name || ''} ${partnerInfo?.contact_last_name || ''}`.trim();
    if (fromParts) return fromParts;
    if (partnerInfo?.contact_person?.trim()) return partnerInfo.contact_person.trim();
    if (profile?.display_name?.trim()) return profile.display_name.trim();
    if (user?.user_metadata?.full_name?.trim()) return user.user_metadata.full_name.trim();
    if (user?.user_metadata?.name?.trim()) return user.user_metadata.name.trim();
    if (partnerInfo?.agency_name?.trim()) return partnerInfo.agency_name.trim();
    return 'Partner';
  };

  const getLastName = () => {
    if (partnerInfo?.contact_last_name) return partnerInfo.contact_last_name;
    if (partnerInfo?.contact_first_name) return partnerInfo.contact_first_name;
    return 'Partner';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in text-[#1E293B]">

      {/* Pending Approval Notice Banner */}
      {partnerStatus === "pending" && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-xs animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/15 rounded-xl text-amber-700 mt-0.5 shrink-0">
                <Clock className="w-6 h-6 animate-pulse text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-950">
                    Partner Account Under Review
                  </h3>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] uppercase font-bold tracking-wider">
                    Pending Verification
                  </Badge>
                </div>
                <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                  Welcome to Whiteboard Education! Your agency registration has been submitted and is currently being verified by our admissions team. 
                  During this review period, you can complete and update your agency profile. Full recruitment and admissions tools (student submissions, course search, and applications) will unlock immediately upon administrator approval.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/partner-dashboard/profile")}
              className="bg-[#2F4F97] hover:bg-[#1d3363] text-white text-xs font-semibold px-4 h-9 shadow-sm shrink-0"
            >
              Complete Profile →
            </Button>
          </div>
        </div>
      )}

      {/* Greeting and Clock Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col lg:flex-row justify-between items-center bg-gradient-to-r from-blue-50 to-white gap-6 lg:gap-0">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-[#1E293B]">Welcome, {getFullName()}!</h2>
          <p className="text-slate-500 mt-1">Check your students and applications latest update</p>
        </div>
        
        <div className="flex flex-row items-center gap-6 sm:gap-10 text-center lg:text-right mt-2 lg:mt-0">
          
          {/* Bangladesh Time */}
          <div className="flex flex-col items-end">
            <span className="text-base sm:text-lg font-extrabold text-theme uppercase tracking-wide mb-1">Bangladesh</span>
            <p className="text-xl sm:text-2xl font-bold text-theme whitespace-nowrap drop-shadow-sm font-mono tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(() => {
                const d = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
                const h = d.getHours() % 12 || 12;
                const m = String(d.getMinutes()).padStart(2, '0');
                const s = String(d.getSeconds()).padStart(2, '0');
                const ap = d.getHours() >= 12 ? 'PM' : 'AM';
                return <>{String(h).padStart(2, '0')}:{m}:{s} {ap}</>;
              })()}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider mt-1">
              {currentTime.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-slate-200" />

          {/* Malaysia Time */}
          <div className="flex flex-col items-end">
            <span className="text-base sm:text-lg font-extrabold text-[#002B7F] uppercase tracking-wide mb-1">Malaysia</span>
            <p className="text-xl sm:text-2xl font-bold text-[#002B7F] whitespace-nowrap drop-shadow-sm font-mono tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(() => {
                const d = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
                const h = d.getHours() % 12 || 12;
                const m = String(d.getMinutes()).padStart(2, '0');
                const s = String(d.getSeconds()).padStart(2, '0');
                const ap = d.getHours() >= 12 ? 'PM' : 'AM';
                return <>{String(h).padStart(2, '0')}:{m}:{s} {ap}</>;
              })()}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider mt-1">
              {currentTime.toLocaleDateString('en-US', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

        </div>
      </div>

      {/* Dynamic Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 0: Total Students */}
        <div 
          onClick={() => handleFeatureClick(`/partner-dashboard/students?status=${card0Filter}`)}
          className="bg-white border border-[#2F4F97]/25 hover:border-[#2F4F97] shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group min-w-0"
        >
          <div 
            className="bg-[#2F4F97] px-2.5 py-1.5 flex items-center justify-between border-b border-[#2F4F97] min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <Select value={card0Filter} onValueChange={setCard0Filter} modal={false}>
              <SelectTrigger className="w-full h-8 bg-transparent border-0 text-white font-semibold text-xs shadow-none px-0 rounded-none focus:ring-0 focus:outline-none flex items-center justify-between [&>svg]:text-white [&>svg]:opacity-90 cursor-pointer [&>span]:truncate">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all" className="text-xs">All Students</SelectItem>
                {statusPhases[0].steps.map(step => (
                  <SelectItem key={step.id} value={step.id} className="text-xs">{step.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-white">
            <p className="text-2xl sm:text-3xl font-bold text-[#2F4F97] tracking-tight">{getCard0Count()}</p>
          </div>
        </div>

        {/* Card 1: Total Applications */}
        <div 
          onClick={() => handleFeatureClick(`/partner-dashboard/applications?status=${card1Filter}`)}
          className="bg-white border border-[#2F4F97]/25 hover:border-[#2F4F97] shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group min-w-0"
        >
          <div 
            className="bg-[#2F4F97] px-2.5 py-1.5 flex items-center justify-between border-b border-[#2F4F97] min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <Select value={card1Filter} onValueChange={setCard1Filter} modal={false}>
              <SelectTrigger className="w-full h-8 bg-transparent border-0 text-white font-semibold text-xs shadow-none px-0 rounded-none focus:ring-0 focus:outline-none flex items-center justify-between [&>svg]:text-white [&>svg]:opacity-90 cursor-pointer [&>span]:truncate">
                <SelectValue placeholder="All Applications" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all" className="text-xs">All Applications</SelectItem>
                {statusPhases[0].steps.filter(s => s.id !== 'new').map(step => (
                  <SelectItem key={step.id} value={step.id} className="text-xs">{step.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-white">
            <p className="text-2xl sm:text-3xl font-bold text-[#2F4F97] tracking-tight">{getCard1Count()}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => handleFeatureClick(`/partner-dashboard/applications?status=${card2Filter}`)}
          className="bg-white border border-[#2F4F97]/25 hover:border-[#2F4F97] shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group min-w-0"
        >
          <div 
            className="bg-[#2F4F97] px-2.5 py-1.5 flex items-center justify-between border-b border-[#2F4F97] min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <Select value={card2Filter} onValueChange={setCard2Filter} modal={false}>
              <SelectTrigger className="w-full h-8 bg-transparent border-0 text-white font-semibold text-xs shadow-none px-0 rounded-none focus:ring-0 focus:outline-none flex items-center justify-between [&>svg]:text-white [&>svg]:opacity-90 cursor-pointer [&>span]:truncate">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="offer_letter_received_conditional" className="text-xs">Offer Letter Received (Conditional)</SelectItem>
                <SelectItem value="offer_letter_received_unconditional" className="text-xs">Offer Letter Received (Unconditional)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-white">
            <p className="text-2xl sm:text-3xl font-bold text-[#2F4F97] tracking-tight">{getCard2Count()}</p>
          </div>
        </div>

        {/* Card 3: Visa Applications */}
        <div 
          onClick={() => handleFeatureClick(`/partner-dashboard/applications?status=${card3Filter}`)}
          className="bg-white border border-[#2F4F97]/25 hover:border-[#2F4F97] shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group min-w-0"
        >
          <div 
            className="bg-[#2F4F97] px-2.5 py-1.5 flex items-center justify-between border-b border-[#2F4F97] min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <Select value={card3Filter} onValueChange={setCard3Filter} modal={false}>
              <SelectTrigger className="w-full h-8 bg-transparent border-0 text-white font-semibold text-xs shadow-none px-0 rounded-none focus:ring-0 focus:outline-none flex items-center justify-between [&>svg]:text-white [&>svg]:opacity-90 cursor-pointer [&>span]:truncate">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ready_for_visa_application" className="text-xs">Ready for Visa</SelectItem>
                <SelectItem value="emgs_approval_pending" className="text-xs">EMGS Pending</SelectItem>
                <SelectItem value="rejected_by_visa_office" className="text-xs">Rejected by Visa Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-white">
            <p className="text-2xl sm:text-3xl font-bold text-[#2F4F97] tracking-tight">{getCard3Count()}</p>
          </div>
        </div>

        {/* Card 4: Rejected by University */}
        <div 
          onClick={() => handleFeatureClick(`/partner-dashboard/applications?status=${card4Filter}`)}
          className="bg-white border border-[#2F4F97]/25 hover:border-[#2F4F97] shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group min-w-0"
        >
          <div 
            className="bg-[#2F4F97] px-2.5 py-1.5 flex items-center justify-between border-b border-[#2F4F97] min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <Select value={card4Filter} onValueChange={setCard4Filter} modal={false}>
              <SelectTrigger className="w-full h-8 bg-transparent border-0 text-white font-semibold text-xs shadow-none px-0 rounded-none focus:ring-0 focus:outline-none flex items-center justify-between [&>svg]:text-white [&>svg]:opacity-90 cursor-pointer [&>span]:truncate">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="rejected_by_university" className="text-xs">Rejected by University</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-white">
            <p className="text-2xl sm:text-3xl font-bold text-[#2F4F97] tracking-tight">{getCard4Count()}</p>
          </div>
        </div>

        {/* Card 5: Rejected by Visa */}
        <div 
          onClick={() => handleFeatureClick(`/partner-dashboard/applications?status=${card5Filter}`)}
          className="bg-white border border-[#2F4F97]/25 hover:border-[#2F4F97] shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group min-w-0"
        >
          <div 
            className="bg-[#2F4F97] px-2.5 py-1.5 flex items-center justify-between border-b border-[#2F4F97] min-w-0" 
            onClick={(e) => e.stopPropagation()}
          >
            <Select value={card5Filter} onValueChange={setCard5Filter} modal={false}>
              <SelectTrigger className="w-full h-8 bg-transparent border-0 text-white font-semibold text-xs shadow-none px-0 rounded-none focus:ring-0 focus:outline-none flex items-center justify-between [&>svg]:text-white [&>svg]:opacity-90 cursor-pointer [&>span]:truncate">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="rejected_by_visa_office" className="text-xs">Rejected by Visa Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-white">
            <p className="text-2xl sm:text-3xl font-bold text-[#2F4F97] tracking-tight">{getCard5Count()}</p>
          </div>
        </div>
      </div>

      {/* Row 1: Recent Updates & Notices (2 cols) | Upcoming Webinars (3rd col) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recent Updates & Notices (2 columns) */}
        <Card className="md:col-span-2 bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-[#2F4F97] flex items-center gap-2 uppercase tracking-wider font-bold">
              <Megaphone className="w-4 h-4" />
              Recent Updates & Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            {notices.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {notices.map((notice: any) => {
                  const d = notice.created_at ? new Date(notice.created_at) : null;
                  const day = d ? d.getDate() : "--";
                  const month = d ? d.toLocaleDateString("en-US", { month: "short" }) : "";

                  return (
                    <div
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 transition-all cursor-pointer shadow-2xs hover:shadow-xs w-full group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Date badge: Big day number up, Month below */}
                        <div className="flex flex-col items-center justify-center min-w-[46px] h-12 rounded-lg bg-white text-[#2F4F97] shadow-2xs shrink-0 select-none px-2 py-0.5">
                          <span className="text-lg sm:text-xl font-bold leading-none text-[#2F4F97]">
                            {day}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[#2F4F97]/80 leading-tight mt-0.5">
                            {month}
                          </span>
                        </div>

                        {/* Title and snippet */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1E293B] truncate group-hover:text-[#2F4F97] transition-colors">
                            {notice.title}
                          </p>
                          {notice.content && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {notice.content}
                            </p>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-[#2F4F97]/40 group-hover:text-[#2F4F97] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2F4F97] mb-2">
                  <Megaphone className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#1E293B]">No notices published yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                  Offers, scholarship updates, and crucial university notices from Whiteboard admin will be posted here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Webinars (3rd column) */}
        <Card className="md:col-span-1 bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm text-[#2F4F97] flex items-center gap-2 uppercase tracking-wider font-bold">
              <Calendar className="w-4 h-4" />
              Upcoming Webinars
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-grow">
            {webinars.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {webinars.map((w: any) => {
                  const pubD = w.created_at ? new Date(w.created_at) : (w.date ? new Date(w.date) : null);
                  const pubDay = pubD ? pubD.getDate() : "--";
                  const pubMonth = pubD ? pubD.toLocaleDateString("en-US", { month: "short" }) : "";

                  let eventD: Date | null = null;
                  if (w.date) {
                    if (String(w.date).includes("T")) {
                      eventD = new Date(w.date);
                    } else {
                      const [y, m, dayNum] = String(w.date).split("-").map(Number);
                      eventD = new Date(y, (m || 1) - 1, dayNum || 1);
                    }
                  }
                  const eventDateStr = eventD ? eventD.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
                  const eventDayName = eventD ? eventD.toLocaleDateString("en-US", { weekday: "short" }) : "";

                  return (
                    <div
                      key={w.id}
                      className="flex flex-col gap-2.5 p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 transition-all shadow-2xs hover:shadow-xs group"
                    >
                      {/* 3 columns: 1. Publishing Date | 2. Title | 3. Date & Time */}
                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full">
                        {/* 1st column: Publishing Date */}
                        <div className="flex flex-col items-center justify-center min-w-[46px] h-12 rounded-lg bg-white text-[#2F4F97] shadow-2xs shrink-0 select-none px-2 py-0.5">
                          <span className="text-lg sm:text-xl font-bold leading-none text-[#2F4F97]">
                            {pubDay}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[#2F4F97]/80 leading-tight mt-0.5">
                            {pubMonth}
                          </span>
                        </div>

                        {/* 2nd column: Title */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1E293B] group-hover:text-[#2F4F97] transition-colors line-clamp-2" title={w.title}>
                            {w.title}
                          </p>
                        </div>

                        {/* 3rd column: Date & Time */}
                        <div className="flex flex-col items-end justify-center shrink-0 text-right">
                          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            {eventDateStr}{eventDayName ? ` (${eventDayName})` : ""}
                          </span>
                          {w.time && (
                            <span className="text-[11px] font-medium text-[#2F4F97] whitespace-nowrap mt-0.5">
                              {w.time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Below: Button covering the whole width with NO icon */}
                      {w.meeting_link ? (
                        <a
                          href={w.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center py-2 px-3 text-xs font-semibold text-white bg-[#2F4F97] hover:bg-[#243d78] rounded-lg transition-colors shadow-2xs"
                        >
                          Join Webinar
                        </a>
                      ) : (
                        <div className="w-full py-2 px-3 text-center text-xs font-medium text-slate-400 bg-white/70 rounded-lg">
                          Link TBA
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2F4F97] mb-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#1E293B]">No upcoming webinars</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                  Upcoming training sessions and university webinars will be listed here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Row 2 (Below): 1st column -> Account Manager | 2nd column -> Platform Tutorials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1st column: Account Manager */}
        <Card className="md:col-span-1 bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm text-[#2F4F97] flex items-center gap-2 uppercase tracking-wider font-bold">
              <User className="w-4 h-4" />
              Account Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-grow overflow-hidden">
            {(() => {
              const amList = Array.isArray(accountManager)
                ? accountManager
                : accountManager?.name
                ? [accountManager]
                : [];

              if (amList.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#2F4F97] mb-2.5">
                      <User className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#1E293B]">Account Manager Unassigned</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Your dedicated partner account manager will be assigned to your agency shortly.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {amList.map((am: any, idx: number) => (
                    <div
                      key={am.id || idx}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 transition-all shadow-2xs group"
                    >
                      {/* Column 1: Rounded square profile image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-white shadow-2xs border border-blue-100/80 flex items-center justify-center">
                        {am.photo_url ? (
                          <img
                            src={am.photo_url}
                            alt={am.name || "Account Manager"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#2F4F97]/10 text-[#2F4F97] font-bold text-2xl">
                            {am.name?.charAt(0) || "A"}
                          </div>
                        )}
                      </div>

                      {/* Column 2: Name, Designation, Email, Phone */}
                      <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
                        <h3 className="text-sm sm:text-base font-bold text-[#1E293B] truncate group-hover:text-[#2F4F97] transition-colors">
                          {am.name || "N/A"}
                        </h3>
                        <p className="text-xs font-semibold text-[#2F4F97] truncate">
                          {am.title || "Account Manager"}
                        </p>
                        {am.email && (
                          <a
                            href={`mailto:${am.email}`}
                            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#2F4F97] transition-colors truncate mt-0.5"
                            title={am.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                            <span className="truncate">{am.email}</span>
                          </a>
                        )}
                        {am.phone && (
                          <a
                            href={`tel:${am.phone}`}
                            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#2F4F97] transition-colors truncate"
                            title={am.phone}
                          >
                            <Phone className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                            <span className="truncate">{am.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Platform Tutorials */}
        <Card className="md:col-span-2 bg-white border-[#2F4F97]/10 shadow-sm flex flex-col h-full">
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

      {/* Notice Detail Dialog Popup */}
      <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1.5">
              {selectedNotice?.created_at && (
                <span className="text-xs font-semibold text-[#2F4F97] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Published: {new Date(selectedNotice.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-[#1E293B] leading-snug">
              {selectedNotice?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border-y border-slate-100 my-2 max-h-[360px] overflow-y-auto pr-1">
            {selectedNotice?.content}
          </div>

          <DialogFooter className="flex flex-row justify-between items-center gap-2 sm:gap-0 pt-1">
            {selectedNotice?.link_url ? (
              <a
                href={selectedNotice.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2F4F97] hover:bg-[#243d78] rounded-md px-3.5 py-2 transition-colors"
              >
                Learn More <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : <div />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedNotice(null)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
