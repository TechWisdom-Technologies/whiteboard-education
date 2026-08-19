import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Printer,
  Download,
  Save,
  Building2,
  User,
  Globe,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PartnerChatWidget } from "@/components/admin/PartnerChatWidget";
import { getStatusLabel } from "@/config/statusFlow";
import { format } from "date-fns";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-green-600/10 text-green-700 border-green-600/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const appStatusColors: Record<string, string> = {
  document_upload: "bg-gray-100 text-gray-600",
  document_review: "bg-gray-100 text-gray-600",
  document_verification: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  university_selection: "bg-indigo-500/10 text-indigo-600",
  university_application: "bg-indigo-500/10 text-indigo-600",
  application_pending: "bg-purple-500/10 text-purple-600",
  university_accepted: "bg-emerald-500/10 text-emerald-600",
  offer_letter_signed: "bg-emerald-500/10 text-emerald-600",
  offer_letter_received_conditional: "bg-purple-500/10 text-purple-600",
  offer_letter_received_unconditional: "bg-purple-500/10 text-purple-600",
  emgs_application_submitted: "bg-[#2F4F97]/10 text-[#2F4F97]",
  emgs_fee_paid: "bg-[#2F4F97]/10 text-[#2F4F97]",
  pre_medical_clearance: "bg-[#2F4F97]/10 text-[#2F4F97]",
  emgs_approval_pending: "bg-[#2F4F97]/10 text-[#2F4F97]",
  val_issued: "bg-teal-500/10 text-teal-600",
  sev_application: "bg-teal-500/10 text-teal-600",
  sev_received: "bg-green-600/10 text-green-700",
  rejected: "bg-destructive/10 text-destructive",
  on_hold: "bg-amber-500/10 text-amber-600",
};

interface PartnerRegistration {
  id: string;
  user_id: string | null;
  agency_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string | null;
  country: string;
  annual_students: number | null;
  status: string;
  created_at: string;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const isEmpty = value === null || value === undefined || value === "" || (typeof value === "number" && value === 0);
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <span className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-sm ${isEmpty ? "text-muted-foreground italic" : "text-[#1E293B] font-medium"}`}>
        {isEmpty ? "Not Provided" : value}
      </span>
    </div>
  );
}

export default function AdminPartnerProfile() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [partner, setPartner] = useState<PartnerRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [savingStatus, setSavingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("pending");
  const [defaultTab] = useState("profile");

  const [applications, setApplications] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!partnerId || !session) return;
    fetchPartnerData();
  }, [partnerId, session]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("partner_registrations")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("Partner not found");

      setPartner(data as unknown as PartnerRegistration);
      setCurrentStatus(data.status);

      if (data.user_id) {
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("id, full_name, wbe_student_id, email")
          .eq("partner_id", data.user_id);
          
        if (!studentsError && studentsData && studentsData.length > 0) {
          const sMap: Record<string, any> = {};
          studentsData.forEach(s => sMap[s.id] = s);
          setStudentsMap(sMap);
          
          const sIds = studentsData.map(s => s.id);
          const { data: appsData, error: appsError } = await supabase
            .from("student_applications" as any)
            .select("*, universities(name), courses(title, intake_months)")
            .in("student_id", sIds)
            .order("created_at", { ascending: false });
            
          if (!appsError && appsData) {
            setApplications(appsData);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load partner profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/admin/partners");

  const handlePrint = () => {
    if (!partner) return;
    const originalTitle = document.title;
    document.title = `${partner.agency_name}_${partner.contact_first_name}_Registration`;
    window.print();
    document.title = originalTitle;
  };

  const handleSaveStatus = async () => {
    if (!partner || !session) return;
    setSavingStatus(true);
    try {
      const { error: updateError } = await supabase
        .from("partner_registrations")
        .update({
          status: currentStatus,
        })
        .eq("id", partner.id);

      if (updateError) throw updateError;

      if (currentStatus === "approved" && partner.user_id) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({ user_id: partner.user_id, role: "partner" }, { onConflict: "user_id,role" });
        if (roleError) throw roleError;
        
        await fetch(`${SUPABASE_URL}/rest/v1/partner_notifications`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            partner_id: partner.user_id,
            title: "Account Approved",
            message: "Your partner registration has been approved. You now have full access to the B2B portal.",
            type: "system"
          })
        }).catch(console.error);
      }

      toast.success("Partner status updated successfully");
      setPartner({ ...partner, status: currentStatus });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) return <LoadingScreen fullScreen />;

  if (error || !partner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <User className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-[12px] font-normal">{error || "Partner not found"}</h2>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const registeredDate = new Date(partner.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #partner-profile-print, #partner-profile-print * { visibility: visible; }
          #partner-profile-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="partner-profile-print" className="space-y-6 animate-fade-in pb-12">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print mb-2">
          <div className="flex items-center text-[#1E293B] font-semibold text-lg">
             <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 mr-2"><ArrowLeft className="h-4 w-4" /></Button>
             Agency Profile
          </div>
        </div>

        {/* Main Grid: Left (Agency Info + Tabs) | Right (Chat Widget) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Main Left Column (9 cols on XL) */}
          <div className="xl:col-span-9 space-y-6 min-w-0">

            {/* Global Agency Info Card / Brief Info Box */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 w-full">
                
                {/* 1st Column: Image with uniform rounded corners */}
                <div className="shrink-0">
                  <div
                    className="bg-slate-100 flex items-center justify-center text-[#1E293B] border border-slate-200 rounded-lg shadow-sm"
                    style={{ width: "35mm", height: "42mm" }}
                  >
                    <Building2 className="h-10 w-10 text-[#1E293B]/60" />
                  </div>
                </div>
                
                {/* 2nd Column: Comprehensive info in theme slate */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-3 sm:space-y-4">
                  
                  {/* Name + Status */}
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1E293B] truncate">
                      {partner.agency_name}
                    </h2>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[partner.status] || "bg-gray-100 text-gray-500"}`}>
                      {partner.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Info Grid in Theme Slate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 sm:gap-y-3.5 text-xs text-[#1E293B] font-medium pt-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="w-3.5 h-3.5 text-[#1E293B] shrink-0" />
                      <span className="truncate">
                        {partner.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-3.5 h-3.5 text-[#1E293B] shrink-0" />
                      <span className="truncate">
                        {partner.contact_first_name} {partner.contact_last_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#1E293B] shrink-0" />
                      <span className="truncate" title={partner.email}>
                        {partner.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-[#1E293B] shrink-0" />
                      <span className="truncate">
                        {partner.phone || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#1E293B] shrink-0" />
                      <span className="truncate">
                        {registeredDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 font-medium border-slate-200 text-xs" onClick={handlePrint}>
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Save PDF
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 font-medium border-slate-200 text-xs" onClick={handlePrint}>
                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                        Print
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select value={currentStatus} onValueChange={setCurrentStatus}>
                        <SelectTrigger className="h-8 w-[140px] text-xs font-medium bg-white border-slate-200">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                          <SelectItem value="approved" className="text-xs">Approved</SelectItem>
                          <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs font-medium bg-[#1E293B] text-white hover:bg-[#0f172a]"
                        onClick={handleSaveStatus}
                        disabled={savingStatus || (currentStatus === partner.status)}
                      >
                        {savingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                        Save
                      </Button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
            
            <Tabs defaultValue={defaultTab} className="w-full space-y-6">
              <TabsList className="flex w-full h-12 bg-transparent p-0 no-print gap-8 rounded-none justify-start border-b border-transparent">
                <TabsTrigger value="profile" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E293B] data-[state=active]:text-[#1E293B] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">
                  1. Profile
                </TabsTrigger>
                <TabsTrigger value="applications" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#1E293B] data-[state=active]:text-[#1E293B] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">
                  2. Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card className="print:border-none print:shadow-none border border-gray-200 shadow-sm">
                  <CardContent className="p-6 sm:p-7 print:p-0 space-y-6">
                    
                    {/* Profile Card Header */}
                    <div className="bg-[#1E293B] p-4 sm:p-5 rounded-lg text-white no-print">
                      <h3 className="text-base font-bold text-white">Agency Profile</h3>
                      <p className="text-xs text-slate-300 mt-0.5">General, operational, and contact information</p>
                    </div>

                    {/* ── Section 1: Agency Information ──────────────── */}
                    <div>
                      <div className="flex items-center gap-2.5 pb-4">
                        <Building2 className="h-4 w-4 text-[#1E293B]" />
                        <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                          Agency Information
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <InfoRow label="Agency Name" value={partner.agency_name} />
                        <InfoRow label="Country of Operation" value={partner.country} />
                        <InfoRow label="Annual Students Volume" value={partner.annual_students} />
                      </div>
                    </div>

                    {/* ── Section 2: Contact Details ──────────────── */}
                    <div className="border-t border-border/30 pt-5 print:border-none">
                      <div className="flex items-center gap-2.5 pb-4">
                        <User className="h-4 w-4 text-[#1E293B]" />
                        <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                          Contact Person
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <InfoRow label="First Name" value={partner.contact_first_name} />
                        <InfoRow label="Last Name" value={partner.contact_last_name} />
                        <InfoRow label="Email" value={partner.email} />
                        <InfoRow label="Phone" value={partner.phone} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6 mt-0">
                <Card className="border border-gray-200 shadow-sm">
                  {applications.length === 0 ? (
                    <CardContent className="p-12 text-center text-muted-foreground text-sm">
                      No applications submitted by this partner yet.
                    </CardContent>
                  ) : (
                    <CardContent className="p-0">
                      <div className="rounded-xl overflow-x-auto">
                        <Table>
                          <TableHeader className="[&_tr]:bg-[#1E293B] [&_tr:hover]:bg-[#1E293B] [&_th]:text-white">
                            <TableRow>
                              <TableHead className="whitespace-nowrap font-medium text-xs">App ID</TableHead>
                              <TableHead className="font-medium text-xs">Date</TableHead>
                              <TableHead className="font-medium text-xs">Student</TableHead>
                              <TableHead className="font-medium text-xs">University</TableHead>
                              <TableHead className="font-medium text-xs">Course</TableHead>
                              <TableHead className="font-medium text-xs">Intake</TableHead>
                              <TableHead className="font-medium text-xs">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications.map((app) => {
                              const student = studentsMap[app.student_id];
                              const universityName = app.universities?.name;
                              const course = app.courses;
                              const badgeClass = appStatusColors[app.status] || "bg-gray-100 text-gray-800";

                              return (
                                <TableRow 
                                  key={app.id} 
                                  className="hover:bg-gray-50/80 cursor-pointer border-b border-gray-100 transition-colors"
                                  onClick={() => {
                                    if (student) {
                                      navigate(`/admin/students/${student.wbe_student_id || student.id}?tab=applications`);
                                    }
                                  }}
                                >
                                  <TableCell className="font-mono text-xs font-semibold text-[#1E293B] whitespace-nowrap">
                                    {app.wbe_application_id || app.application_code}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                    {format(new Date(app.created_at), "MMM dd, yyyy")}
                                  </TableCell>
                                  <TableCell className="text-sm font-normal text-gray-800 break-words whitespace-normal leading-tight">
                                    {student?.full_name || "—"}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                    {universityName || "—"}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                    {course?.title || "—"}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                    {course?.intake_months?.[0] || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${badgeClass} hover:${badgeClass} border-transparent whitespace-nowrap text-[11px] px-2 py-0.5`}>
                                      {getStatusLabel(app.status)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

          </div>

          {/* Right Column: Chat & Discussion Widget (3 cols on XL) */}
          <div className="xl:col-span-3 xl:sticky xl:top-[76px] xl:self-start w-full no-print">
            <PartnerChatWidget
              partnerId={partner.id}
              partnerName={partner.agency_name}
              session={session}
              user={user}
            />
          </div>

        </div>
      </div>
    </>
  );
}
