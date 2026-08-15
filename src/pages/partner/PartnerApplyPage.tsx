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
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toast } from "sonner";

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
  document_upload: "bg-gray-100 text-gray-600",
  document_review: "bg-gray-100 text-gray-600",
  document_verification: "bg-blue-500/10 text-blue-600",
  university_selection: "bg-indigo-500/10 text-indigo-600",
  university_application: "bg-indigo-500/10 text-indigo-600",
  application_pending: "bg-purple-500/10 text-purple-600",
  university_accepted: "bg-emerald-500/10 text-emerald-600",
  offer_letter_signed: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  on_hold: "bg-amber-500/10 text-amber-600",
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

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    document_upload: "Doc Upload",
    document_review: "Doc Review",
    document_verification: "Doc Verification",
    university_selection: "Uni Selection",
    university_application: "Uni Applied",
    application_pending: "App Pending",
    university_accepted: "Offer Received",
    offer_letter_signed: "Offer Signed",
    rejected: "Rejected",
    on_hold: "On Hold",
  };
  return map[status] || status;
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

        // Fetch partner's students using explicit token (mirroring PartnerStudents)
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?select=*&partner_id=eq.${user.id}&order=full_name`,
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
    const q = searchQuery.toLowerCase();
    if (!q) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter(
          (s) =>
            s.full_name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            String(s.wb_student_id || "").toLowerCase().includes(q) ||
            (s.nationality || "").toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, students]);

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student to apply.");
      return;
    }
    if (!course || !user) return;

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
      toast.success(`Application ${appCode} submitted!`, {
        description: `${student?.full_name} → ${course.title}`,
      });

      navigate("/partner-dashboard/applications");
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GraduationCap className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No program selected</h2>
        <p className="text-sm text-gray-500 mb-5">Please go back to Search Programs and select a program first.</p>
        <Button onClick={() => navigate("/partner-dashboard/search-programs")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Go to Search Programs
        </Button>
      </div>
    );
  }

  const logoSrc = university?.logo_url || (university?.name ? UNIVERSITY_LOGOS[university.name] : null);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">

      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2F4F97] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search Programs
      </button>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Apply for Student</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Select a student below to submit an application for this program</p>
      </div>

      {/* ─── Selected Program Card ─── */}
      <div className="bg-gradient-to-br from-[#2F4F97]/5 to-[#2F4F97]/10 border border-[#2F4F97]/20 rounded-2xl p-5">
        <p className="text-xs font-semibold text-[#2F4F97] uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" /> Selected Program
        </p>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-14 shrink-0 bg-white border border-[#2F4F97]/10 rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
            {logoSrc ? (
              <img src={logoSrc} alt={university?.name || "logo"} className="max-w-full max-h-full object-contain" />
            ) : (
              <GraduationCap className="h-6 w-6 text-gray-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-[#1E293B]">{course.title}</h2>
              {course.degree_level && (
                <Badge className="bg-[#2F4F97]/10 text-[#2F4F97] border-transparent text-[10px]">
                  {course.degree_level}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#475569] mb-2">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">{university?.name || "—"}</span>
              {university?.city && <span className="text-gray-400">· {university.city}</span>}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {course.tuition_fee != null && (
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  MYR {course.tuition_fee.toLocaleString()}/yr
                </span>
              )}
              {course.duration && (
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {course.duration}
                </span>
              )}
              {course.intake_months && course.intake_months.length > 0 && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Intakes: {(course.intake_months as string[]).join(" · ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Student Selection ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#2F4F97]" />
              Select Student
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {students.length} student{students.length !== 1 ? "s" : ""} in your roster
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-[#2F4F97]/30 h-8 text-xs"
            onClick={() => navigate("/partner-dashboard/students")}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add New Student
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, WB ID, or nationality…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200"
          />
        </div>

        {/* Students Table */}
        {students.length === 0 ? (
          <Card className="border border-dashed border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">No students yet</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-xs">
                Add a student first before submitting an application.
              </p>
              <Button
                onClick={() => navigate("/partner-dashboard/students")}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Your First Student
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>WB ID</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Degree Level</TableHead>
                    <TableHead>Major</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-sm text-gray-400">
                        No students match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudentId === student.id;
                      const badgeClass = statusColors[student.status] || "bg-gray-100 text-gray-600";

                      return (
                        <TableRow
                          key={student.id}
                          className={`cursor-pointer border-b border-gray-100 transition-colors ${
                            isSelected
                              ? "bg-[#2F4F97]/5 hover:bg-[#2F4F97]/8"
                              : "hover:bg-gray-50/60"
                          }`}
                          onClick={() => setSelectedStudentId(isSelected ? null : student.id)}
                        >
                          {/* Radio-style selector */}
                          <TableCell className="pr-0">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? "border-[#2F4F97] bg-[#2F4F97]" : "border-gray-300"
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-semibold text-[#1E293B]">{student.full_name}</p>
                              <p className="text-xs text-gray-400">{student.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-900 font-mono">
                            {student.wb_student_id ? `WB-${student.wb_student_id}` : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-gray-900">{student.nationality || "—"}</TableCell>
                          <TableCell className="text-xs text-gray-900">{student.degree_level || "—"}</TableCell>
                          <TableCell className="text-xs text-gray-900 max-w-[140px] truncate">{student.major || "—"}</TableCell>
                          <TableCell>
                            <Badge className={`${badgeClass} border-transparent text-[10px] px-2 py-0.5 whitespace-nowrap`}>
                              {getStatusLabel(student.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className={`h-4 w-4 transition-colors ${isSelected ? "text-[#2F4F97]" : "text-gray-300"}`} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* ─── Submit Bar ─── */}
      {students.length > 0 && (
        <div className={`sticky bottom-0 -mx-6 px-6 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all`}>
          <div className="text-sm text-gray-600">
            {selectedStudent ? (
              <span>
                Applying{" "}
                <span className="font-semibold text-[#1E293B]">{selectedStudent.full_name}</span>{" "}
                to{" "}
                <span className="font-semibold text-[#2F4F97]">{course.title}</span>
              </span>
            ) : (
              <span className="text-gray-400 italic">No student selected yet — click a row to select</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/partner-dashboard/search-programs")}
              disabled={applying}
              className="h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={applying || !selectedStudentId}
              className="h-9 gap-2 text-sm min-w-[160px]"
            >
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
