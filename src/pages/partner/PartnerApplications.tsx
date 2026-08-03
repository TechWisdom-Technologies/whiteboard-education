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
  wb_student_id: string;
  email: string;
}

interface Application {
  id: string;
  student_id: string;
  university_id: string | null;
  course_id: string | null;
  application_code: string;
  status: string;
  emgs_application_number: string | null;
  emgs_status_percentage: number | null;
  admin_notes: string | null;
  created_at: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [universities, setUniversities] = useState<Record<string, University>>({});
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [partnerName, setPartnerName] = useState<string>("Unknown Partner");

  // Filter states
  const [wbStudentId, setWbStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [programName, setProgramName] = useState("");
  const [appCode, setAppCode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [intake, setIntake] = useState("all");
  const [year, setYear] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    if (!user || !session) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` };

        // Fetch partner details
        const partnerRes = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=contact_person&user_id=eq.${user.id}&limit=1`, { headers });
        if (partnerRes.ok) {
          const partnerData = await partnerRes.json();
          if (partnerData.length > 0) {
            setPartnerName(partnerData[0].contact_person);
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
          `${SUPABASE_URL}/rest/v1/student_applications?select=*&student_id=in.(${studentIds.join(",")})&order=created_at.desc`,
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

        const { data: univsData } = await supabase
          .from("universities")
          .select("id, name");

        const univsMap = (univsData || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, University>);
        setUniversities(univsMap);

        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title, intake_months");

        const coursesMap = (coursesData || []).reduce((acc, c) => {
          acc[c.id] = { ...c, intake_months: c.intake_months as string[] | null };
          return acc;
        }, {} as Record<string, Course>);
        setCourses(coursesMap);
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
      const course = app.course_id ? courses[app.course_id] : null;

      if (appCode && !app.application_code.toLowerCase().includes(appCode.toLowerCase())) return false;
      if (wbStudentId && student && !student.wb_student_id.toLowerCase().includes(wbStudentId.toLowerCase())) return false;
      if (studentName && student && !student.full_name.toLowerCase().includes(studentName.toLowerCase())) return false;
      if (programName && course && !course.title.toLowerCase().includes(programName.toLowerCase())) return false;

      if (dateFrom && new Date(app.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(app.created_at) > new Date(dateTo + 'T23:59:59')) return false;

      if (intake !== "all" && course && course.intake_months) {
        if (!course.intake_months.includes(intake)) return false;
      }

      if (year !== "all") {
        const appYear = new Date(app.created_at).getFullYear().toString();
        if (appYear !== year) return false;
      }

      if (statusFilter !== "all") {
        const s = app.status;
        switch (statusFilter) {
          case "received_wb":
            if (!['document_upload', 'document_review', 'document_verification'].includes(s)) return false;
            break;
          case "in_progress":
            if (!['university_selection', 'university_application'].includes(s)) return false;
            break;
          case "on_hold":
            if (s !== 'on_hold') return false;
            break;
          case "submitted":
            if (s !== 'application_pending') return false;
            break;
          case "get_offer":
            if (!['university_accepted', 'offer_letter_signed'].includes(s)) return false;
            break;
          case "emgs_pending":
            if (!['emgs_application_submitted', 'emgs_fee_paid', 'pre_medical_clearance', 'emgs_approval_pending'].includes(s)) return false;
            break;
          case "visa_ready":
            if (!['val_issued', 'sev_application', 'sev_received'].includes(s)) return false;
            break;
          case "rejected":
            if (s !== 'rejected') return false;
            break;
        }
      }

      return true;
    });
  }, [applications, students, courses, appCode, wbStudentId, studentName, programName, dateFrom, dateTo, intake, statusFilter, year]);

  const handleReset = () => {
    setWbStudentId("");
    setStudentName("");
    setProgramName("");
    setAppCode("");
    setDateFrom("");
    setDateTo("");
    setIntake("all");
    setYear("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = wbStudentId || studentName || programName || appCode || dateFrom || dateTo || intake !== "all" || year !== "all" || statusFilter !== "all";

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-fade-in space-y-0 min-w-0 w-full">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Applications</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 gap-2 text-sm border-gray-300 text-gray-600"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-[#2F4F97] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {[wbStudentId, studentName, programName, appCode, dateFrom, dateTo, intake !== "all", year !== "all", statusFilter !== "all"].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => navigate('/partner-dashboard/search-programs')}
            className="h-9 gap-2 bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white text-sm"
          >
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>
      </div>

      {/* Top Horizontal Filters */}
      {sidebarOpen && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 mb-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-sm font-semibold text-[#1E293B]">Filters</span>
            {hasActiveFilters && (
              <button onClick={handleReset} className="text-xs text-[#2F4F97] hover:underline flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            {/* App Code */}
            <div className="space-y-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-gray-500">App ID</label>
              <Input
                placeholder="e.g. APP-123"
                value={appCode}
                onChange={(e) => setAppCode(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>

            {/* WB Student ID */}
            <div className="space-y-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-gray-500">WB ID</label>
              <Input
                placeholder="Search WB ID"
                value={wbStudentId}
                onChange={(e) => setWbStudentId(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>

            {/* Student Name */}
            <div className="space-y-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-gray-500">Name</label>
              <Input
                placeholder="Search name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>

            {/* Program Name */}
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-xs font-medium text-gray-500">Program</label>
              <Input
                placeholder="Search program"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="h-8 text-xs border-gray-200"
              />
            </div>

            {/* Intake */}
            <div className="space-y-1.5 xl:col-span-1">
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
            <div className="space-y-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-gray-500">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-gray-500">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="received_wb">Received</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="get_offer">Offer</SelectItem>
                  <SelectItem value="emgs_pending">EMGS</SelectItem>
                  <SelectItem value="visa_ready">Visa</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="w-full min-w-0">
          <Card className="w-full border border-gray-200 shadow-sm overflow-hidden">
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
                    className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white gap-2"
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
              <CardContent className="p-0 w-full overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="text-xs font-semibold text-gray-500 whitespace-nowrap w-[100px]">App ID</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 whitespace-nowrap w-[90px]">WB ID</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 whitespace-nowrap w-[100px]">Created On</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 min-w-[120px]">Student Name</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 min-w-[140px]">University</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 min-w-[140px]">Program</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 whitespace-nowrap w-[80px]">Intake</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 min-w-[100px]">Created By</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 whitespace-nowrap w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => {
                        const student = students[app.student_id];
                        const university = app.university_id ? universities[app.university_id] : null;
                        const course = app.course_id ? courses[app.course_id] : null;
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
                              {app.application_code}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                              {student?.wb_student_id || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                              {format(new Date(app.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-gray-800 break-words whitespace-normal leading-tight">
                              {student?.full_name || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 break-words whitespace-normal leading-tight">
                              {university?.name || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 break-words whitespace-normal leading-tight">
                              {course?.title || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                              {course?.intake_months && course.intake_months.length > 0
                                ? course.intake_months[0]
                                : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 break-words whitespace-normal leading-tight">
                              {partnerName}
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
        </div>
    </div>
  );
}
