import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, RotateCcw } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getStatusLabel } from "@/config/statusFlow";
import { format } from "date-fns";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [universities, setUniversities] = useState<Record<string, University>>({});
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [partnerName, setPartnerName] = useState<string>("Unknown Partner");

  // Filter states
  const [wbStudentId, setWbStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [programName, setProgramName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [country, setCountry] = useState("all");
  const [intake, setIntake] = useState("all");
  const [year, setYear] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    if (!user || !session) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: partnerData } = await supabase
          .from("partner_registrations")
          .select("contact_person")
          .eq("user_id", user.id)
          .limit(1)
          .single();
          
        if (partnerData) {
          setPartnerName(partnerData.contact_person);
        }

        const { data: studentsData } = await supabase
          .from("students")
          .select("*")
          .eq("partner_id", user.id);

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

        const { data: appsData } = await supabase
          .from("student_applications")
          .select("id, student_id, university_id, course_id, application_code, status, emgs_application_number, emgs_status_percentage, admin_notes, created_at")
          .in("student_id", studentIds);

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
          acc[c.id] = c;
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

      if (wbStudentId && student && !student.wb_student_id.toLowerCase().includes(wbStudentId.toLowerCase())) return false;
      if (studentName && student && !student.full_name.toLowerCase().includes(studentName.toLowerCase())) return false;
      if (programName && course && !course.title.toLowerCase().includes(programName.toLowerCase())) return false;
      
      if (dateFrom && new Date(app.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(app.created_at) > new Date(dateTo + 'T23:59:59')) return false;

      if (country !== "all" && country !== "Malaysia") return false; // Hardcoded to Malaysia for now or needs university.country
      
      if (intake !== "all" && course && course.intake_months) {
        if (!course.intake_months.includes(intake)) return false;
      }
      
      if (statusFilter !== "all") {
        const s = app.status;
        switch (statusFilter) {
          case "received_wb":
            if (!['document_upload','document_review','document_verification'].includes(s)) return false;
            break;
          case "in_progress":
            if (!['university_selection','university_application'].includes(s)) return false;
            break;
          case "on_hold":
            if (s !== 'on_hold') return false;
            break;
          case "submitted":
            if (s !== 'application_pending') return false;
            break;
          case "get_offer":
            if (!['university_accepted','offer_letter_signed'].includes(s)) return false;
            break;
          case "emgs_pending":
            if (!['emgs_application_submitted','emgs_fee_paid','pre_medical_clearance','emgs_approval_pending'].includes(s)) return false;
            break;
          case "visa_ready":
            if (!['val_issued','sev_application','sev_received'].includes(s)) return false;
            break;
          case "rejected":
            if (s !== 'rejected') return false;
            break;
        }
      }

      return true;
    });
  }, [applications, students, courses, wbStudentId, studentName, programName, dateFrom, dateTo, country, intake, statusFilter, year]);

  const handleReset = () => {
    setWbStudentId("");
    setStudentName("");
    setProgramName("");
    setDateFrom("");
    setDateTo("");
    setCountry("all");
    setIntake("all");
    setYear("all");
    setStatusFilter("all");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input 
              placeholder="WB Student ID" 
              value={wbStudentId} 
              onChange={(e) => setWbStudentId(e.target.value)} 
            />
            <Input 
              placeholder="Student Name" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)} 
            />
            <Input 
              placeholder="Program Name" 
              value={programName} 
              onChange={(e) => setProgramName(e.target.value)} 
            />
            <Input 
              type="date"
              placeholder="Date Created From" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
            />
            <Input 
              type="date"
              placeholder="Date Created To" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
            />
            
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="Malaysia">Malaysia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={intake} onValueChange={setIntake}>
              <SelectTrigger>
                <SelectValue placeholder="Intake" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intakes</SelectItem>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received_wb">Received Application at WB</SelectItem>
                <SelectItem value="in_progress">Application in Progress</SelectItem>
                <SelectItem value="on_hold">Application on Hold</SelectItem>
                <SelectItem value="submitted">Application Submitted</SelectItem>
                <SelectItem value="get_offer">Get Offer</SelectItem>
                <SelectItem value="emgs_pending">EMGS Approval Pending</SelectItem>
                <SelectItem value="visa_ready">Ready for Visa Application</SelectItem>
                <SelectItem value="rejected">Rejected by University</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WB ID</TableHead>
                  <TableHead>App ID</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Intake</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WBE Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => {
                    const student = students[app.student_id];
                    const university = app.university_id ? universities[app.university_id] : null;
                    const course = app.course_id ? courses[app.course_id] : null;
                    const badgeClass = statusColors[app.status] || "bg-gray-100 text-gray-800";

                    return (
                      <TableRow key={app.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">{student?.wb_student_id || "N/A"}</TableCell>
                        <TableCell>{app.application_code}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(app.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{student?.full_name || "N/A"}</TableCell>
                        <TableCell>{university?.name || "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={course?.title}>
                          {course?.title || "N/A"}
                        </TableCell>
                        <TableCell>
                          {course?.intake_months && course.intake_months.length > 0 
                            ? course.intake_months[0] 
                            : "N/A"}
                        </TableCell>
                        <TableCell>{partnerName}</TableCell>
                        <TableCell>
                          <Badge className={`${badgeClass} hover:${badgeClass} border-transparent whitespace-nowrap`}>
                            {getStatusLabel(app.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.admin_notes || "Unassigned"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
