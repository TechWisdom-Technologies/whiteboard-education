import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Info,
  Users,
  UserPlus,
  Loader2,
  CheckCircle2,
  Search,
  ChevronRight,
  Calendar,
  Clock,
  Banknote,
  Mail,
  Phone,
  Check,
  FileText,
  AlertCircle,
  X
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toast } from "sonner";
import { getStatusLabel } from "@/config/statusFlow";

interface Course {
  id: string;
  title: string;
  university_id: string;
  degree_level: string | null;
  duration: string | null;
  tuition_fee: number | null;
  intake_months: string[] | null;
}

interface University {
  id: string;
  name: string;
  city: string | null;
  logo_url: string | null;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  status: string;
  wb_student_id?: string | number | null;
  degree_level: string | null;
  major: string | null;
}

const UNIVERSITY_LOGOS: Record<string, string> = {
  "Multimedia University Malaysia (MMU)": "https://en.your-uni.com/assets/images/university/mmu-university.webp",
  "UCSI University Malaysia": "https://en.your-uni.com/assets/images/university/ucsi-university.webp",
  "Taylor's University Malaysia": "https://en.your-uni.com/assets/images/university/taylor-university-malaysia.webp",
  "APU University Malaysia": "https://en.your-uni.com/assets/images/university/apu-university.webp",
  "UNITEN University Malaysia": "https://en.your-uni.com/assets/images/university/uniten-university.webp",
  "Sunway University": "https://en.your-uni.com/assets/images/university/sunway-university.webp",
  "Management and Science University (MSU)": "https://en.your-uni.com/assets/images/university/msu-university.webp",
  "City University Malaysia": "https://en.your-uni.com/assets/images/university/city-university.webp",
  "MAHSA University Malaysia": "https://en.your-uni.com/assets/images/university/mahsa-university.webp",
  "SEGi University Malaysia": "https://en.your-uni.com/assets/images/university/segi-university.webp",
  "INTI International University Malaysia": "https://en.your-uni.com/assets/images/university/inti-university.webp",
};

const statusColors: Record<string, string> = {
  document_upload: "bg-gray-100 text-gray-600 border-gray-200",
  document_review: "bg-gray-100 text-gray-600 border-gray-200",
  document_verification: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  university_selection: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  university_application: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  application_pending: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  university_accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  offer_letter_signed: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
  emgs_application_submitted: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
  emgs_fee_paid: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
  pre_medical_clearance: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
  emgs_approval_pending: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
  val_issued: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  sev_application: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  sev_received: "bg-green-600/10 text-green-700 border-green-600/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  on_hold: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function generateAppCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "APP-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function PartnerApplyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  const courseId = searchParams.get("courseId");

  const [loadingPage, setLoadingPage] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!user || !session || !courseId) {
      setLoadingPage(false);
      return;
    }

    const fetchData = async () => {
      setLoadingPage(true);
      try {
        // Fetch course
        const { data: courseData } = await supabase
          .from("courses")
          .select("id, title, university_id, degree_level, duration, tuition_fee, intake_months")
          .eq("id", courseId)
          .maybeSingle();

        if (courseData) {
          setCourse(courseData as unknown as Course);

          // Fetch university
          const { data: uniData } = await supabase
            .from("universities")
            .select("id, name, city, logo_url")
            .eq("id", courseData.university_id)
            .maybeSingle();

          if (uniData) setUniversity(uniData);
        }

        // Fetch partner's students
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?select=*&partner_id=eq.${user.id}&order=created_at.desc`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        
        let studentData = [];
        if (res.ok) {
          studentData = await res.json();
        }

        setStudents(studentData || []);
        setFilteredStudents(studentData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
  }, [user, session, courseId]);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter((s) => {
          const nameMatch = s.full_name?.toLowerCase().includes(q);
          const emailMatch = s.email?.toLowerCase().includes(q);
          const phoneMatch = s.phone?.toLowerCase().includes(q);
          const wbIdMatch = String(s.wb_student_id || "").toLowerCase().includes(q) || `wb-${s.wb_student_id}`.toLowerCase().includes(q);
          const nationalityMatch = s.nationality?.toLowerCase().includes(q);
          const majorMatch = s.major?.toLowerCase().includes(q);
          const degreeMatch = s.degree_level?.toLowerCase().includes(q);
          return nameMatch || emailMatch || phoneMatch || wbIdMatch || nationalityMatch || majorMatch || degreeMatch;
        })
      );
    }
  }, [searchQuery, students]);

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student to apply.");
      return;
    }
    if (!course || !user || !session) return;

    setApplying(true);
    try {
      const appCode = generateAppCode();

      const res = await fetch(`${SUPABASE_URL}/rest/v1/student_applications`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          student_id: selectedStudentId,
          university_id: course.university_id || null,
          course_id: course.id,
          application_code: appCode,
          status: "document_upload",
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Supabase Insert Error:", errorData);
        toast.error(`Error: ${errorData.message || errorData.details || "Failed to submit application"}`);
        return;
      }

      const student = students.find((s) => s.id === selectedStudentId);
      toast.success(`Application ${appCode} submitted successfully!`, {
        description: `${student?.full_name} → ${course.title}`,
      });

      navigate(`/partner-dashboard/students/${student?.wb_student_id ? `WB-${student.wb_student_id}` : student?.id}?tab=applications`);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setApplying(false);
    }
  };

  if (loadingPage) return <LoadingScreen />;

  if (!courseId || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <GraduationCap className="h-14 w-14 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Program Selected</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          Please browse the program catalog and select a program first before applying for a student.
        </p>
        <Button onClick={() => navigate("/partner-dashboard/search-programs")} className="gap-2 bg-[#2F4F97] hover:bg-[#233d77]">
          <ArrowLeft className="h-4 w-4" /> Go to Search Programs
        </Button>
      </div>
    );
  }

  const logoSrc = university?.logo_url || (university?.name ? UNIVERSITY_LOGOS[university.name] : null);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="animate-fade-in space-y-6 w-full pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97]/10 -ml-2 mb-2 h-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search Programs
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Apply for Student</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Select a student from your roster to submit an application for this program
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout: Left (Program details & Submit) -> Right (Students Table) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Selected Program Details & Submission Box */}
        <div className="xl:col-span-4 space-y-4 xl:sticky xl:top-6">
          {/* Selected Program Card */}
          <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <div className="bg-[#2F4F97] p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100 flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="h-4 w-4" /> Selected Program
              </p>
              <h3 className="text-base font-bold leading-tight">{course.title}</h3>
              {course.degree_level && (
                <span className="inline-block mt-2 text-[11px] font-medium bg-white/20 px-2 py-0.5 rounded text-white">
                  {course.degree_level}
                </span>
              )}
            </div>

            <CardContent className="p-4 space-y-4">
              {/* University Details */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-12 h-10 shrink-0 bg-white border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  {logoSrc ? (
                    <img src={logoSrc} alt={university?.name || "logo"} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Building2 className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1E293B] truncate">{university?.name || "—"}</p>
                  <p className="text-[11px] text-gray-500 truncate">{university?.city || "Malaysia"}</p>
                </div>
              </div>

              {/* Program Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1 mb-1">
                    <Banknote className="h-3.5 w-3.5 text-[#2F4F97]" /> Tuition Fee
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.tuition_fee != null ? `MYR ${course.tuition_fee.toLocaleString()}/yr` : "Contact WB"}
                  </span>
                </div>

                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1 mb-1">
                    <Clock className="h-3.5 w-3.5 text-[#2F4F97]" /> Duration
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.duration || "N/A"}
                  </span>
                </div>
              </div>

              {/* Intake Months */}
              {course.intake_months && course.intake_months.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-600 uppercase flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#2F4F97]" /> Available Intakes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(course.intake_months as string[]).map((m) => (
                      <Badge
                        key={m}
                        variant="outline"
                        className="bg-blue-50/70 border-blue-200 text-[#2F4F97] text-[11px] font-normal px-2 py-0.5"
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Submission & Action Box */}
          <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-4 space-y-4">
              {selectedStudent ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Ready to Apply
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 uppercase">{selectedStudent.full_name}</p>
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800 font-semibold">
                        {selectedStudent.wb_student_id ? `WB-${selectedStudent.wb_student_id}` : "WB-NEW"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">{selectedStudent.email}</p>
                    {selectedStudent.phone && (
                      <p className="text-[11px] text-gray-500">{selectedStudent.phone}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Submitting will create an official application record under <strong>Document Upload</strong> stage.
                  </p>

                  <Button
                    onClick={handleSubmit}
                    disabled={applying}
                    className="w-full h-10 gap-2 bg-[#2F4F97] hover:bg-[#233d77] text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Application…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
                    <Users className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-gray-700">No Student Selected</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Click any student row on the right table to select them for this application.
                    </p>
                  </div>

                  <Button
                    disabled
                    className="w-full h-10 gap-2 bg-gray-200 text-gray-400 font-semibold text-xs rounded-lg cursor-not-allowed"
                  >
                    Select a Student to Apply
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/partner-dashboard/search-programs")}
                disabled={applying}
                className="w-full h-9 text-xs border-gray-200 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Quick Process Guidelines */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#2F4F97]">
              <Info className="h-4 w-4" /> Application Steps
            </div>
            <ul className="space-y-1.5 text-[11px] text-gray-600 list-disc pl-4 leading-relaxed">
              <li>Select the student from your agency roster.</li>
              <li>Submit application to generate the unique application ID.</li>
              <li>Upload required academic transcripts & certificates in the student profile.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Student Selection Table */}
        <div className="xl:col-span-8 space-y-4">
          <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
            {/* Card Header with Stats and Add Button */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2F4F97]/10 text-[#2F4F97] flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1E293B]">Select Student from Roster</h2>
                  <p className="text-xs text-gray-500">
                    Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-[#2F4F97] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white h-8 text-xs font-semibold rounded-lg transition-colors"
                onClick={() => navigate("/partner-dashboard/students/new")}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register New Student +
              </Button>
            </div>

            {/* Search Input Filter */}
            <div className="p-4 bg-gray-50/60 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, WB ID, email, phone, nationality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs border-gray-200 bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Students Table */}
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-14 h-14 rounded-full bg-[#2F4F97]/10 text-[#2F4F97] flex items-center justify-center mb-4">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-[#1E293B] mb-1">No students in your roster yet</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-sm">
                  Add a student to your agency roster before submitting their university application.
                </p>
                <Button
                  onClick={() => navigate("/partner-dashboard/students/new")}
                  className="gap-2 bg-[#2F4F97] hover:bg-[#233d77] text-xs h-9"
                >
                  <UserPlus className="h-4 w-4" />
                  Register Your First Student
                </Button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-gray-500 px-4">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">No matching students found</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Try searching with a different name, email, or WB ID.</p>
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="text-xs h-8">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="w-[45px] text-center"></TableHead>
                      <TableHead className="min-w-[140px] text-xs font-semibold text-[#2F4F97] uppercase">Student Name</TableHead>
                      <TableHead className="min-w-[90px] text-xs font-semibold text-[#2F4F97] uppercase">WB ID</TableHead>
                      <TableHead className="min-w-[110px] text-xs font-semibold text-[#2F4F97] uppercase">Nationality</TableHead>
                      <TableHead className="min-w-[110px] text-xs font-semibold text-[#2F4F97] uppercase">Degree / Major</TableHead>
                      <TableHead className="min-w-[100px] text-xs font-semibold text-[#2F4F97] uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const isSelected = selectedStudentId === student.id;
                      const badgeClass = statusColors[student.status] || "bg-gray-100 text-gray-600 border-gray-200";

                      return (
                        <TableRow
                          key={student.id}
                          className={`cursor-pointer border-b border-gray-100 transition-all ${
                            isSelected
                              ? "bg-[#2F4F97]/10 hover:bg-[#2F4F97]/15 font-medium border-l-4 border-l-[#2F4F97]"
                              : "hover:bg-gray-50/80"
                          }`}
                          onClick={() => setSelectedStudentId(isSelected ? null : student.id)}
                        >
                          {/* Radio Selector */}
                          <TableCell className="text-center py-3 pl-4 pr-1">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? "border-[#2F4F97] bg-[#2F4F97]" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </TableCell>

                          {/* Student Name & Email */}
                          <TableCell className="py-3">
                            <div>
                              <p className={`text-xs uppercase whitespace-nowrap ${isSelected ? "font-bold text-[#2F4F97]" : "font-semibold text-[#1E293B]"}`}>
                                {student.full_name}
                              </p>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 whitespace-nowrap mt-0.5">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {student.email || "—"}
                              </div>
                            </div>
                          </TableCell>

                          {/* WB ID */}
                          <TableCell className="text-xs font-mono py-3 whitespace-nowrap text-gray-900">
                            {student.wb_student_id ? `WB-${student.wb_student_id}` : "—"}
                          </TableCell>

                          {/* Nationality */}
                          <TableCell className="text-xs text-gray-900 py-3 whitespace-nowrap">
                            {student.nationality || "—"}
                          </TableCell>

                          {/* Degree Level / Major */}
                          <TableCell className="text-xs text-gray-900 py-3">
                            <div className="max-w-[130px] truncate">
                              <p className="font-medium text-gray-800 truncate">{student.degree_level || "—"}</p>
                              <p className="text-[11px] text-gray-500 truncate">{student.major || ""}</p>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-3 whitespace-nowrap">
                            <Badge variant="outline" className={`font-normal rounded-md px-2 py-0.5 text-[11px] ${badgeClass}`}>
                              {getStatusLabel(student.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
