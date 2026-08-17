import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RotateCcw, Plus, SlidersHorizontal, FileText, Calendar, GraduationCap, User, Hash } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getStatusLabel } from "@/config/statusFlow";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Student {
  id: string;
  full_name: string;
  wbe_student_id: string;
  email: string;
}

interface Application {
  id: string;
  student_id: string;
  university_id: string | null;
  course_id: string | null;
  application_code: string;
  wbe_application_id: string;
  status: string;
  emgs_application_number: string | null;
  emgs_status_percentage: number | null;
  admin_notes: string | null;
  created_at: string;
  universities?: { name: string } | null;
  courses?: { title: string; intake_months: string[] | null } | null;
}

interface University {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  intake_months: string[] | null;
}

export default function PartnerApplications() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [universities, setUniversities] = useState<Record<string, University>>({});
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [partnerName, setPartnerName] = useState<string>("Unknown Partner");

  // Filter states
  const [studentName, setStudentName] = useState("");
  const [programName, setProgramName] = useState("");
  const [appCode, setAppCode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [intake, setIntake] = useState("all");
  const [year, setYear] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  const [appliedFilters, setAppliedFilters] = useState({
    studentName: "",
    programName: "",
    appCode: "",
    dateFrom: "",
    dateTo: "",
    intake: "all",
    year: "all",
    statusFilter: searchParams.get("status") || "all"
  });

  useEffect(() => {
    if (!user || !session) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` };

        // Fetch partner details
        const partnerRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=contact_first_name,contact_last_name&user_id=eq.${user.id}&limit=1`, { headers });
        if (partnerRes.ok) {
          const partnerData = await partnerRes.json();
          if (partnerData.length > 0) {
            setPartnerName(`${partnerData[0].contact_first_name || ''} ${partnerData[0].contact_last_name || ''}`.trim());
          }
        }

        // Fetch students
        const studentsRes = await fetch(`${SUPABASE_URL}/rest/v1/students?select=*&partner_id=eq.${user.id}`, { headers });
        let studentsData: Student[] = [];
        if (studentsRes.ok) {
          studentsData = await studentsRes.json();
        }

        if (!studentsData || studentsData.length === 0) {
          setLoading(false);
          return;
        }

        const studentsMap = studentsData.reduce((acc, student) => {
          acc[student.id] = student;
          return acc;
        }, {} as Record<string, Student>);
        setStudents(studentsMap);

        const studentIds = studentsData.map((s) => s.id);

        // Fetch applications
        const appsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/student_applications?select=*,universities(name),courses(title,intake_months)&student_id=in.(${studentIds.join(",")})&order=created_at.desc`,
          { headers }
        );
        
        let appsData: Application[] = [];
        if (appsRes.ok) {
          appsData = await appsRes.json();
        } else {
          const errData = await appsRes.text();
          console.error("Failed to fetch applications:", errData);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load applications. Database error: " + errData.substring(0, 50)
          });
        }

        setApplications(appsData || []);

      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, session]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const student = students[app.student_id];
      const course = app.courses;

      if (appliedFilters.appCode && !app.application_code.toLowerCase().includes(appliedFilters.appCode.toLowerCase())) return false;
      if (appliedFilters.studentName && student && !student.full_name.toLowerCase().includes(appliedFilters.studentName.toLowerCase())) return false;
      if (appliedFilters.programName && course && !course.title.toLowerCase().includes(appliedFilters.programName.toLowerCase())) return false;

      if (appliedFilters.dateFrom && new Date(app.created_at) < new Date(appliedFilters.dateFrom)) return false;
      if (appliedFilters.dateTo && new Date(app.created_at) > new Date(appliedFilters.dateTo + 'T23:59:59')) return false;

      if (appliedFilters.intake !== "all" && course && course.intake_months) {
        if (!course.intake_months.includes(appliedFilters.intake)) return false;
      }

      if (appliedFilters.year !== "all") {
        const appYear = new Date(app.created_at).getFullYear().toString();
        if (appYear !== appliedFilters.year) return false;
      }

      if (appliedFilters.statusFilter !== "all") {
        const s = app.status;
        switch (appliedFilters.statusFilter) {
          case "received_application_at_wb":
            if (s !== 'received_application_at_wb') return false;
            break;
          case "application_in_progress":
            if (s !== 'application_in_progress') return false;
            break;
          case "application_on_hold":
            if (!['application_on_hold_intake', 'application_on_hold_wb', 'application_on_hold_university'].includes(s)) return false;
            break;
          case "application_submitted":
            if (s !== 'application_submitted') return false;
            break;
          case "offer_letter_received_conditional":
            if (s !== 'offer_letter_received_conditional') return false;
            break;
          case "offer_letter_received_unconditional":
            if (s !== 'offer_letter_received_unconditional') return false;
            break;
          case "rejected_by_university":
            if (s !== 'rejected_by_university') return false;
            break;
          case "ready_for_visa_application":
            if (s !== 'ready_for_visa_application') return false;
            break;
          case "emgs_approval_pending":
            if (s !== 'emgs_approval_pending') return false;
            break;
          case "rejected_by_visa_office":
            if (s !== 'rejected_by_visa_office') return false;
            break;
        }
      }

      return true;
    });
  }, [applications, students, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters({ studentName, programName, appCode, dateFrom, dateTo, intake, year, statusFilter });
  };

  const handleReset = () => {
    setStudentName("");
    setProgramName("");
    setAppCode("");
    setDateFrom("");
    setDateTo("");
    setIntake("all");
    setYear("all");
    setStatusFilter("all");
    setAppliedFilters({
      studentName: "", programName: "", appCode: "", dateFrom: "", dateTo: "", intake: "all", year: "all", statusFilter: "all"
    });
  };

  const hasActiveFilters = appliedFilters.studentName || appliedFilters.programName || appliedFilters.appCode || appliedFilters.dateFrom || appliedFilters.dateTo || appliedFilters.intake !== "all" || appliedFilters.year !== "all" || appliedFilters.statusFilter !== "all";

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-fade-in space-y-6 min-w-0">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Applications</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/partner-dashboard/search-programs')}
            className="h-9 gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>
      </div>

      {/* Top Horizontal Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* App Code */}
            <div className="space-y-1.5 flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-gray-500">App ID</label>
              <Input
                placeholder="e.g. APP-123"
                value={appCode}
                onChange={(e) => setAppCode(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>


            {/* Student Name */}
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-500">Name</label>
              <Input
                placeholder="Search name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>

            {/* Program Name */}
            <div className="space-y-1.5 flex-[1.5] min-w-[180px]">
              <label className="text-xs font-medium text-gray-500">Program</label>
              <Input
                placeholder="Search program"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>

            {/* Intake */}
            <div className="space-y-1.5 flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-gray-500">Intake</label>
              <Select value={intake} onValueChange={setIntake}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                    <SelectItem key={m} value={m}>{m.substring(0, 3)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1.5 flex-1 min-w-[100px]">
              <label className="text-xs font-medium text-gray-500">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...Array(10)].map((_, i) => {
                    const y = (2026 + i).toString();
                    return <SelectItem key={y} value={y}>{y}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-medium text-gray-500">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="received_application_at_wb">Received Application at WB</SelectItem>
                  <SelectItem value="application_in_progress">Application in Progress</SelectItem>
                  <SelectItem value="application_on_hold">Application on Hold</SelectItem>
                  <SelectItem value="application_submitted">Application Submitted</SelectItem>
                  <SelectItem value="offer_letter_received_conditional">Offer Letter (Conditional)</SelectItem>
                  <SelectItem value="offer_letter_received_unconditional">Offer Letter (Unconditional)</SelectItem>
                  <SelectItem value="rejected_by_university">Rejected by University</SelectItem>
                  <SelectItem value="ready_for_visa_application">Ready for Visa</SelectItem>
                  <SelectItem value="emgs_approval_pending">EMGS Pending</SelectItem>
                  <SelectItem value="rejected_by_visa_office">Rejected by Visa Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Button onClick={handleSearch} className="w-full gap-2 bg-[#2F4F97] hover:bg-white text-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97] transition-colors"><Search className="h-4 w-4" /> Search</Button>
              <Button variant="outline" onClick={handleReset} className="w-full gap-2 border-gray-300">Clear</Button>
            </div>
          </div>
        </div>

      {/* Applications Table */}
      <div className="min-w-0">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            {filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {hasActiveFilters ? "No matching applications" : "No applications yet"}
                </h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs">
                  {hasActiveFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Start by searching for a program and applying a student to it."}
                </p>
                {!hasActiveFilters && (
                  <Button
                    onClick={() => navigate('/partner-dashboard/search-programs')}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" /> Browse Programs
                  </Button>
                )}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <CardContent className="p-0 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="whitespace-nowrap w-[100px]">App ID</TableHead>
                        <TableHead className="whitespace-nowrap w-[100px]">Date created</TableHead>
                        <TableHead className="min-w-[120px]">Student Name</TableHead>
                        <TableHead className="min-w-[140px]">University</TableHead>
                        <TableHead className="min-w-[140px]">Program</TableHead>
                        <TableHead className="whitespace-nowrap w-[80px]">Intake</TableHead>
                        <TableHead className="whitespace-nowrap w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => {
                        const student = students[app.student_id];
                        const universityName = app.universities?.name;
                        const course = app.courses;
                        const badgeClass = statusColors[app.status] || "bg-gray-100 text-gray-800";

                        return (
                          <TableRow 
                            key={app.id} 
                            className="hover:bg-gray-50/80 cursor-pointer border-b border-gray-100 transition-colors"
                            onClick={() => {
                              if (student) {
                                navigate(`/partner-dashboard/students/${student.id}?tab=applications`);
                              }
                            }}
                          >
                            <TableCell className="font-mono text-xs font-semibold text-[#2F4F97] whitespace-nowrap">
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
              </CardContent>
            )}
          </Card>
        </div>
    </div>
  );
}
