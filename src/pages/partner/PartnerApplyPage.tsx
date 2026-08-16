import { useState, useEffect, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Users,
  Loader2,
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  Banknote,
  Mail,
  Phone,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toast } from "sonner";
import { getStatusLabel } from "@/config/statusFlow";
import { format } from "date-fns";

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
  intake_month?: string | null;
  created_at: string;
  passport_photo_url?: string | null;
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

const statusFilterMap: Record<string, string[]> = {
  received_at_wb: ["document_upload", "document_review", "document_verification"],
  in_progress: ["university_selection", "university_application"],
  on_hold_intake: ["on_hold"],
  on_hold_wb: ["on_hold"],
  on_hold_uni: ["on_hold"],
  submitted: ["application_pending"],
  offer: ["university_accepted", "offer_letter_signed"],
  emgs: ["emgs_application_submitted", "emgs_fee_paid", "pre_medical_clearance", "emgs_approval_pending"],
  visa: ["val_issued", "sev_application", "sev_received"],
  rejected: ["rejected"],
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
  const [contactPerson, setContactPerson] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [applying, setApplying] = useState(false);

  // Filter States (Intake, Year, Status, Search) - Date range filter removed
  const [nameFilter, setNameFilter] = useState("");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [appliedFilters, setAppliedFilters] = useState({
    nameFilter: "",
    intakeFilter: "all",
    yearFilter: "all",
    statusFilter: "all",
  });

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

        if (res.ok) {
          const studentData = await res.json();
          setStudents(studentData || []);
        }

        // Fetch partner contact person
        const partnerRes = await fetch(
          `${SUPABASE_URL}/rest/v1/partner_registrations?select=contact_person&user_id=eq.${user.id}&limit=1`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
        );
        if (partnerRes.ok) {
          const pData = await partnerRes.json();
          if (pData.length > 0) setContactPerson(pData[0].contact_person);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
  }, [user, session, courseId]);

  const handleSearch = () => {
    setAppliedFilters({ nameFilter, intakeFilter, yearFilter, statusFilter });
  };

  const handleReset = () => {
    setNameFilter("");
    setIntakeFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
    setAppliedFilters({
      nameFilter: "",
      intakeFilter: "all",
      yearFilter: "all",
      statusFilter: "all",
    });
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Keyword search across: name, created by, wb id, email, phone, status
      if (appliedFilters.nameFilter && appliedFilters.nameFilter.trim() !== "") {
        const q = appliedFilters.nameFilter.toLowerCase().trim();
        const nameMatch = s.full_name?.toLowerCase().includes(q);
        const createdByStr = (contactPerson || "Mr. Khondoker Fazle Rahman").toLowerCase();
        const createdByMatch = createdByStr.includes(q);
        const wbIdStr = s.wb_student_id ? `wb-${s.wb_student_id}` : (s.id || "");
        const wbIdMatch = wbIdStr.toLowerCase().includes(q) || String(s.wb_student_id || "").toLowerCase().includes(q);
        const emailMatch = s.email?.toLowerCase().includes(q);
        const phoneMatch = s.phone?.toLowerCase().includes(q);
        const statusLabel = getStatusLabel(s.status).toLowerCase();
        const statusRaw = (s.status || "").toLowerCase();
        const isSubmitted = s.status !== "document_upload" && s.status !== "document_review" && s.status !== "document_verification";
        const displayLabel = (isSubmitted ? "1 app. submitted app. submitted submitted" : "app. incomplete incomplete").toLowerCase();
        const statusMatch = statusLabel.includes(q) || statusRaw.includes(q) || displayLabel.includes(q);

        if (!nameMatch && !createdByMatch && !wbIdMatch && !emailMatch && !phoneMatch && !statusMatch) {
          return false;
        }
      }

      // Intake filter
      if (appliedFilters.intakeFilter && appliedFilters.intakeFilter !== "all" && s.intake_month !== appliedFilters.intakeFilter) return false;

      // Year filter
      if (appliedFilters.yearFilter && appliedFilters.yearFilter !== "all" && new Date(s.created_at).getFullYear().toString() !== appliedFilters.yearFilter) return false;

      // Status filter
      if (appliedFilters.statusFilter && appliedFilters.statusFilter !== "all") {
        const statuses = statusFilterMap[appliedFilters.statusFilter];
        if (statuses && !statuses.includes(s.status)) return false;
      }

      return true;
    });
  }, [students, appliedFilters, contactPerson]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId((prev) => (prev === id ? null : id));
    setIsConfirming(false);
  };

  const handleConfirmApplication = async () => {
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Supabase Insert Error:", errorData);
        toast.error(`Error: ${errorData.message || errorData.details || "Failed to submit application"}`);
        return;
      }

      const student = students.find((s) => s.id === selectedStudentId);
      toast.success(`Application ${appCode} confirmed successfully!`, {
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
            <h1 className="text-2xl font-bold text-black">Apply for Student</h1>
            <p className="text-sm text-black mt-0.5">
              Select a student from existing student list
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left (Students Table) -> Right (Selected Program & Application Card) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column (8 cols): Students Table with Filters */}
        <div className="xl:col-span-8 space-y-4">
          {/* Filter Bar (Date range removed) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Intake Filter */}
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-black">Intake</label>
                <Select value={intakeFilter} onValueChange={setIntakeFilter}>
                  <SelectTrigger className="h-8 text-xs border-gray-200 text-black">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.substring(0, 3)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-1.5 flex-1 min-w-[100px]">
                <label className="text-xs font-medium text-black">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="h-8 text-xs border-gray-200 text-black">
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

              {/* Status Filter */}
              <div className="space-y-1.5 flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-black">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs border-gray-200 text-black">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="submitted">App. Submitted</SelectItem>
                    <SelectItem value="in_progress">App. Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5 flex-[1.8] min-w-[220px]">
                <label className="text-xs font-medium text-black">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search name, ID, email, phone, created by, status"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-8 h-8 text-xs border-gray-200 text-black"
                  />
                  {nameFilter && (
                    <button
                      onClick={() => setNameFilter("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-1 min-w-[170px]">
                <Button
                  onClick={handleSearch}
                  className="w-full gap-2 bg-[#2F4F97] hover:bg-white text-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97] transition-colors h-8 text-xs font-normal"
                >
                  <Search className="h-3.5 w-3.5" /> Search
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full gap-2 border-gray-300 h-8 text-xs font-normal">
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-white">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30 text-[#2F4F97]" />
                <p className="text-xs font-medium text-gray-700">No students found</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Try adjusting your filters.</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-8">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#2F4F97]">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="w-[45px] text-center text-white font-semibold text-xs uppercase"></TableHead>
                      <TableHead className="whitespace-nowrap min-w-[80px] text-xs font-semibold text-white uppercase">
                        WB ID
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[100px] text-xs font-semibold text-white uppercase">
                        Created By
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[100px] text-xs font-semibold text-white uppercase">
                        Created on
                      </TableHead>
                      <TableHead className="min-w-[120px] text-xs font-semibold text-white uppercase">
                        Student Name
                      </TableHead>
                      <TableHead className="min-w-[120px] text-xs font-semibold text-white uppercase">
                        Email
                      </TableHead>
                      <TableHead className="min-w-[120px] text-xs font-semibold text-white uppercase">
                        Phone Number
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[100px] text-xs font-semibold text-white uppercase">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((s) => {
                      const isSelected = selectedStudentId === s.id;
                      const isSubmitted = s.status !== "document_upload" && s.status !== "document_review" && s.status !== "document_verification";
                      const displayLabel = isSubmitted ? "1 App. Submitted" : "App. Incomplete";
                      const stClass = isSubmitted
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-orange-50 text-orange-600 border-orange-200";

                      return (
                        <TableRow
                          key={s.id}
                          className={`cursor-pointer border-b border-gray-100 transition-all ${
                            isSelected
                              ? "bg-[#2F4F97]/10 hover:bg-[#2F4F97]/15 font-medium border-l-4 border-l-[#2F4F97]"
                              : "hover:bg-gray-50/80"
                          }`}
                          onClick={() => handleSelectStudent(s.id)}
                        >
                          {/* Radio Selector */}
                          <TableCell className="text-center py-3 pl-4 pr-1" onClick={(e) => { e.stopPropagation(); handleSelectStudent(s.id); }}>
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? "border-[#2F4F97] bg-[#2F4F97]" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </TableCell>

                          {/* WB ID */}
                          <TableCell className="text-xs font-mono py-3 whitespace-nowrap text-gray-900">
                            {s.wb_student_id ? `WB-${s.wb_student_id}` : "—"}
                          </TableCell>

                          {/* Created By */}
                          <TableCell className="text-xs text-black py-3 whitespace-nowrap">
                            {contactPerson || "Mr. Khondoker Fazle Rahman"}
                          </TableCell>

                          {/* Created on */}
                          <TableCell className="text-xs text-black py-3 whitespace-nowrap">
                            {s.created_at ? format(new Date(s.created_at), "MMM dd, yyyy") : "—"}
                          </TableCell>

                          {/* Student Name */}
                          <TableCell className="text-xs font-semibold text-black py-3 uppercase">
                            {s.full_name}
                          </TableCell>

                          {/* Email */}
                          <TableCell className="text-xs text-black py-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{s.email || "—"}</span>
                            </div>
                          </TableCell>

                          {/* Phone */}
                          <TableCell className="text-xs text-black py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                              <span>{s.phone || "—"}</span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-3 whitespace-nowrap">
                            <Badge variant="outline" className={`font-normal rounded-md px-2 py-0.5 text-[11px] ${stClass}`}>
                              {displayLabel}
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

        {/* Right Column (4 cols): Selected Program & Dynamic Application Card */}
        <div className="xl:col-span-4 space-y-4 xl:sticky xl:top-6">
          {/* Unified Selected Course & Application Card */}
          <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
            {/* Header: Green Background with white rounded check mark */}
            <div className="bg-emerald-600 p-3.5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" /> Selected Course
              </p>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* University Logo -> Course Name -> University Name -> Location -> Specs */}
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-14 shrink-0 flex items-center justify-center">
                  {logoSrc ? (
                    <img src={logoSrc} alt={university?.name || "logo"} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-[18px] font-normal text-black leading-snug break-words">
                    {course.title}
                  </h3>
                  <p className="text-sm font-semibold italic text-black">
                    {university?.name || "—"}
                  </p>
                  <p className="text-sm text-black">
                    {university?.city || "Malaysia"}
                  </p>

                  {/* Specs list: Labels left-aligned, values right-aligned (No top border) */}
                  <div className="space-y-2 text-xs pt-3">
                    {course.degree_level && (
                      <div className="flex items-center justify-between">
                        <span className="text-black font-medium">Degree Level:</span>
                        <span className="font-normal text-black">{course.degree_level}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-black font-medium">Tuition Fees:</span>
                      <span className="font-normal text-black">
                        {course.tuition_fee != null ? `MYR ${course.tuition_fee.toLocaleString()}/yr` : "Contact WB"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-black font-medium">Duration:</span>
                      <span className="font-normal text-black">{course.duration || "N/A"}</span>
                    </div>

                    {course.intake_months && course.intake_months.length > 0 && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-black font-medium shrink-0">Available Intakes:</span>
                        <span className="font-normal text-black text-right">
                          {(course.intake_months as string[]).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Extension: Appears smoothly when a student is selected */}
              {selectedStudent && (
                <div className="pt-2 space-y-3 animate-fade-in">
                  {/* Applying for title with green text background */}
                  <div className="text-center">
                    <span className="inline-block bg-emerald-600 text-white px-3 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
                      Applying for
                    </span>
                  </div>

                  {/* Student Avatar + Name */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-14 shrink-0 bg-blue-50/80 border border-blue-100 rounded-xl overflow-hidden p-1 flex items-center justify-center text-[#2F4F97] font-bold text-base">
                      {selectedStudent.passport_photo_url ? (
                        <img
                          src={selectedStudent.passport_photo_url}
                          alt={selectedStudent.full_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : selectedStudent.full_name ? (
                        selectedStudent.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      ) : (
                        <Users className="h-6 w-6 text-[#2F4F97]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-[18px] font-normal text-black leading-snug uppercase break-words">
                        {selectedStudent.full_name}
                      </h4>

                      {/* Student Specs list: Labels left-aligned, values right-aligned (normal font) */}
                      <div className="space-y-2 text-xs pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-black font-medium">Student WB ID:</span>
                          <span className="font-normal text-black font-mono">
                            {selectedStudent.wb_student_id ? `WB-${selectedStudent.wb_student_id}` : "WB-NEW"}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <span className="text-black font-medium shrink-0">Email:</span>
                          <span className="font-normal text-black break-all text-right">
                            {selectedStudent.email}
                          </span>
                        </div>

                        {selectedStudent.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-black font-medium">Phone:</span>
                            <span className="font-normal text-black">
                              {selectedStudent.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Apply/Confirm (Green) & Cancel/Back (Red) */}
                  <div className="pt-2">
                    {isConfirming ? (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>Click 'Confirm Application' button for Final submission</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleConfirmApplication}
                            disabled={applying}
                            className="group flex-1 h-9 gap-2 bg-emerald-600 hover:bg-white text-white hover:text-emerald-600 border border-emerald-600 hover:border-emerald-600 hover:[&_svg]:!text-emerald-600 font-normal text-xs rounded-lg shadow-sm transition-all"
                          >
                            {applying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white group-hover:!text-emerald-600" />
                                Confirming Application…
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 shrink-0 text-white group-hover:!text-emerald-600 transition-colors" />
                                Confirm Application
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setIsConfirming(false)}
                            disabled={applying}
                            className="group flex-1 h-9 gap-2 bg-rose-600 hover:bg-white text-white hover:text-rose-600 border border-rose-600 hover:border-rose-600 hover:[&_svg]:!text-rose-600 font-normal text-xs rounded-lg shadow-sm transition-all"
                          >
                            <ArrowLeft className="h-4 w-4 shrink-0 text-white group-hover:!text-rose-600 transition-colors" />
                            Back
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setIsConfirming(true)}
                          className="group flex-1 h-9 gap-2 bg-emerald-600 hover:bg-white text-white hover:text-emerald-600 border border-emerald-600 hover:border-emerald-600 hover:[&_svg]:!text-emerald-600 font-normal text-xs rounded-lg shadow-sm transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-white group-hover:!text-emerald-600 transition-colors" />
                          Apply Now
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedStudentId(null);
                            setIsConfirming(false);
                          }}
                          className="group flex-1 h-9 gap-2 bg-rose-600 hover:bg-white text-white hover:text-rose-600 border border-rose-600 hover:border-rose-600 hover:[&_svg]:!text-rose-600 font-normal text-xs rounded-lg shadow-sm transition-all"
                        >
                          <X className="h-4 w-4 shrink-0 text-white group-hover:!text-rose-600 transition-colors" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
