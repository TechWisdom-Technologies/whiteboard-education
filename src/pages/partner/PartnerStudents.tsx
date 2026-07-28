import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, UserPlus, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getStatusLabel } from "@/config/statusFlow";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  passport_number: string;
  nationality: string;
  nid_number: string;
  date_of_birth: string | null;
  gender: string;
  previous_institution: string;
  previous_degree: string;
  major: string;
  gpa: number;
  ielts_score: number;
  language_test_name: string;
  target_university: string;
  target_course: string;
  intake_month: string;
  degree_level: string;
  status: string;
  admin_notes: string;
  passport_photo_url?: string;
  passport_url: string;
  academic_transcript_url: string;
  ielts_certificate_url: string;
  personal_statement_url: string;
  recommendation_letter_url: string;
  other_documents: string[];
  created_at: string;
  wb_student_id?: number;
}

const statusMap: Record<string, { label: string; class: string }> = {
  document_upload: { label: "Document Upload", class: "bg-gray-100 text-gray-600" },
  document_review: { label: "Document Review", class: "bg-gray-100 text-gray-600" },
  document_verification: { label: "Doc Verification", class: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  university_selection: { label: "Uni Selection", class: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" },
  university_application: { label: "Uni Applied", class: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" },
  application_pending: { label: "App Pending", class: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  university_accepted: { label: "Uni Accepted", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  offer_letter_signed: { label: "Offer Signed", class: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30" },
  emgs_application_submitted: { label: "EMGS Submitted", class: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20" },
  emgs_fee_paid: { label: "EMGS Fee Paid", class: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20" },
  pre_medical_clearance: { label: "Pre-Medical", class: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20" },
  emgs_approval_pending: { label: "EMGS Pending", class: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20" },
  val_issued: { label: "VAL Issued", class: "bg-teal-500/10 text-teal-600 border-teal-500/30" },
  sev_application: { label: "SEV Applied", class: "bg-teal-500/10 text-teal-600 border-teal-500/30" },
  sev_received: { label: "SEV Received", class: "bg-green-600/10 text-green-700 border-green-600/30" },
  enrolled: { label: "Enrolled", class: "bg-green-600/10 text-green-700 border-green-600/30" },
  enrolled_completed: { label: "Completed", class: "bg-green-600/10 text-green-700 border-green-600/30" },
  rejected: { label: "Rejected", class: "bg-destructive/10 text-destructive border-destructive/20" },
  on_hold: { label: "On Hold", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

const statusFilterMap: Record<string, string[]> = {
  received_at_wb: ['document_upload', 'document_review', 'document_verification'],
  in_progress: ['university_selection', 'university_application'],
  on_hold_intake: ['on_hold'],
  on_hold_wb: ['on_hold'],
  on_hold_uni: ['on_hold'],
  submitted: ['application_pending'],
  offer: ['university_accepted', 'offer_letter_signed'],
  emgs: ['emgs_application_submitted', 'emgs_fee_paid', 'pre_medical_clearance', 'emgs_approval_pending'],
  visa: ['val_issued', 'sev_application', 'sev_received'],
  rejected: ['rejected'],
};

const emptyForm = {
  full_name: "", email: "", phone: "", passport_number: "", nationality: "",
  nid_number: "", date_of_birth: "", gender: "", previous_institution: "", previous_degree: "",
  major: "", gpa: "", ielts_score: "", language_test_name: "", target_university: "", target_course: "",
  intake_month: "", degree_level: "Bachelor",
};

export default function PartnerStudents() {
  const { session, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [contactPerson, setContactPerson] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const handledStudentParamRef = useRef(false);
  const studentRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // Filter States
  const [wbIdFilter, setWbIdFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  const fetchStudents = async () => {
    if (!session) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/students?select=*&partner_id=eq.${user?.id}&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
      );
      if (res.ok) setStudents(await res.json());

      const partnerRes = await fetch(
        `${SUPABASE_URL}/rest/v1/partner_registrations?select=contact_person&user_id=eq.${user?.id}&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
      );
      if (partnerRes.ok) {
        const pData = await partnerRes.json();
        if (pData.length > 0) setContactPerson(pData[0].contact_person);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [session]);

  useEffect(() => {
    const studentIdFromQuery = searchParams.get("studentId");

    if (!studentIdFromQuery) {
      handledStudentParamRef.current = false;
      return;
    }

    if (handledStudentParamRef.current || students.length === 0) return;

    const studentFromNotification = students.find((student) => student.id === studentIdFromQuery);
    if (!studentFromNotification) return;

    handledStudentParamRef.current = true;
    setNameFilter(""); // Clear filters possibly hiding it?
    setHighlightedStudentId(studentFromNotification.id);

    window.requestAnimationFrame(() => {
      const row = studentRowRefs.current[studentFromNotification.id];
      if (!row) return;
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    window.setTimeout(() => setHighlightedStudentId(null), 2600);

    const params = new URLSearchParams(searchParams);
    params.delete("studentId");
    setSearchParams(params, { replace: true });
  }, [searchParams, students, setSearchParams]);

  const handleAdd = async () => {
    if (!form.full_name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...form,
          partner_id: user?.id,
          gpa: form.gpa ? parseFloat(form.gpa) : 0,
          ielts_score: form.ielts_score ? parseFloat(form.ielts_score) : 0,
          date_of_birth: form.date_of_birth || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Student added successfully!");
      setAddOpen(false);
      setForm(emptyForm);
      fetchStudents();
    } catch (e: any) {
      toast.error(e.message || "Failed to add student");
    } finally { setSubmitting(false); }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(v => v !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) return;
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        let errMsg = "Failed to delete student";
        try { const errData = await res.json(); errMsg = errData.message || errData.details || errMsg; } catch(e) {}
        throw new Error(errMsg);
      }

      toast.success("Student deleted successfully");
      setSelectedIds(prev => prev.filter(v => v !== id));
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student");
    }
  };

  const handleBulkDelete = async () => {
    if (!session || selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} students? This action cannot be undone.`)) return;

    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
        }).then(async res => {
          if (!res.ok) {
            let errMsg = "Failed to delete student";
            try { const errData = await res.json(); errMsg = errData.message || errData.details || errMsg; } catch(e) {}
            throw new Error(errMsg);
          }
        })
      ));

      toast.success(`${selectedIds.length} students deleted successfully`);
      setSelectedIds([]);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete some students");
    }
  };

  const resetFilters = () => {
    setWbIdFilter("");
    setNameFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setCountryFilter("all");
    setIntakeFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
  };

  const filtered = students.filter(s => {
    if (wbIdFilter && !String(s.wb_student_id || s.id).toLowerCase().includes(wbIdFilter.toLowerCase())) return false;
    if (nameFilter && !s.full_name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    
    if (dateFromFilter && new Date(s.created_at) < new Date(dateFromFilter)) return false;
    if (dateToFilter && new Date(s.created_at) > new Date(dateToFilter)) return false;
    
    if (countryFilter && countryFilter !== "all") {
      if (countryFilter === "Malaysia" && !s.nationality?.toLowerCase().includes("malay")) return false;
    }
    
    if (intakeFilter && intakeFilter !== "all" && s.intake_month !== intakeFilter) return false;
    
    if (yearFilter && yearFilter !== "all" && new Date(s.created_at).getFullYear().toString() !== yearFilter) return false;
    
    if (statusFilter && statusFilter !== "all") {
      const statuses = statusFilterMap[statusFilter];
      if (statuses && !statuses.includes(s.status)) return false;
    }
    
    return true;
  });

  if (loading) return <LoadingScreen fullScreen />;

  if (addOpen) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setAddOpen(false)} 
            className="h-8 w-8 rounded-full bg-[#2F4F97]/10 text-[#2F4F97] hover:bg-[#2F4F97]/20 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold text-[#1E293B]">
            Add New Student
          </h2>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6 max-w-4xl">
            <h3 className="font-semibold text-sm text-gray-900 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Full Name *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Email *</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+880..." className="h-9 mt-1" /></div>
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Nationality</Label><Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">NID Number</Label><Input value={form.nid_number} onChange={e => setForm(f => ({ ...f, nid_number: e.target.value }))} placeholder="National ID" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Passport Number</Label><Input value={form.passport_number} onChange={e => setForm(f => ({ ...f, passport_number: e.target.value }))} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} className="h-9 mt-1" /></div>
            </div>

            <h3 className="font-semibold text-sm text-gray-900 border-b pb-2 pt-4">Academic Background</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Degree Name</Label><Input value={form.previous_degree} onChange={e => setForm(f => ({ ...f, previous_degree: e.target.value }))} placeholder="e.g. HSC, Bachelor of Science" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Institution</Label><Input value={form.previous_institution} onChange={e => setForm(f => ({ ...f, previous_institution: e.target.value }))} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Major</Label><Input value={form.major} onChange={e => setForm(f => ({ ...f, major: e.target.value }))} placeholder="e.g. Computer Science" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">GPA / CGPA</Label><Input type="number" step="0.01" value={form.gpa} onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))} className="h-9 mt-1" /></div>
            </div>

            <h3 className="font-semibold text-sm text-gray-900 border-b pb-2 pt-4">Language Proficiency</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Test Name</Label><Input value={form.language_test_name} onChange={e => setForm(f => ({ ...f, language_test_name: e.target.value }))} placeholder="e.g. IELTS, TOEFL, Duolingo" className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Score</Label><Input type="number" step="0.5" value={form.ielts_score} onChange={e => setForm(f => ({ ...f, ielts_score: e.target.value }))} className="h-9 mt-1" /></div>
            </div>

            <h3 className="font-semibold text-sm text-gray-900 border-b pb-2 pt-4">Target Program</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Degree Level</Label>
                <Select value={form.degree_level} onValueChange={v => setForm(f => ({ ...f, degree_level: v }))}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="English Course">English Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Course</Label><Input value={form.target_course} onChange={e => setForm(f => ({ ...f, target_course: e.target.value }))} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">University</Label><Input value={form.target_university} onChange={e => setForm(f => ({ ...f, target_university: e.target.value }))} className="h-9 mt-1" /></div>
              <div>
                <Label className="text-xs">Intake Month</Label>
                <Select value={form.intake_month} onValueChange={v => setForm(f => ({ ...f, intake_month: v }))}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="h-10 px-6">
                Cancel
              </Button>
              <Button className="h-10 px-6 bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white" onClick={handleAdd} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Save Student
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} className="w-full sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button className="bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />Add Student
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-[12px]">WB Student ID</Label>
              <Input placeholder="Enter ID" value={wbIdFilter} onChange={e => setWbIdFilter(e.target.value)} className="h-8 mt-1 text-[12px]" />
            </div>
            <div>
              <Label className="text-[12px]">Student Name</Label>
              <Input placeholder="Enter name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="h-8 mt-1 text-[12px]" />
            </div>
            <div>
              <Label className="text-[12px]">Date Created (From)</Label>
              <Input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="h-8 mt-1 text-[12px]" />
            </div>
            <div>
              <Label className="text-[12px]">Date Created (To)</Label>
              <Input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="h-8 mt-1 text-[12px]" />
            </div>
            <div>
              <Label className="text-[12px]">Country</Label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="h-8 mt-1 text-[12px]"><SelectValue placeholder="All Countries" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Intake</Label>
              <Select value={intakeFilter} onValueChange={setIntakeFilter}>
                <SelectTrigger className="h-8 mt-1 text-[12px]"><SelectValue placeholder="All Intakes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intakes</SelectItem>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-8 mt-1 text-[12px]"><SelectValue placeholder="All Years" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 mt-1 text-[12px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="received_at_wb">Received Application at WB</SelectItem>
                  <SelectItem value="in_progress">Application in Progress</SelectItem>
                  <SelectItem value="on_hold_intake">Application on Hold – Intake yet to open</SelectItem>
                  <SelectItem value="on_hold_wb">Application on Hold – WB team</SelectItem>
                  <SelectItem value="on_hold_uni">Application on Hold – University</SelectItem>
                  <SelectItem value="submitted">Application Submitted</SelectItem>
                  <SelectItem value="offer">Get Offer</SelectItem>
                  <SelectItem value="emgs">EMGS Approval Pending</SelectItem>
                  <SelectItem value="visa">Ready for Visa Application</SelectItem>
                  <SelectItem value="rejected">Rejected by University</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
            <Button size="sm" className="bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-[12px] font-normal">No students found</p>
          <p className="text-[12px]">Try adjusting your filters or add a new student</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-center px-0">
                    <Checkbox 
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>WB ID</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const label = getStatusLabel(s.status);
                  const stClass = statusMap[s.status]?.class || "bg-muted text-muted-foreground";
                  return (
                    <TableRow
                      key={s.id}
                      ref={(row) => {
                        studentRowRefs.current[s.id] = row;
                      }}
                      className={`h-10 hover:bg-muted/50 cursor-pointer transition-colors ${highlightedStudentId === s.id ? "bg-[#2F4F97]/10 ring-1 ring-[#2F4F97]/40" : ""}`}
                      onClick={() => navigate(`/partner-dashboard/students/${s.id}`)}
                    >
                      <TableCell className="text-center px-0 py-1" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedIds.includes(s.id)}
                          onCheckedChange={(c) => handleSelectRow(s.id, c as boolean)}
                        />
                      </TableCell>
                      <TableCell className="py-1">{s.wb_student_id || s.id.substring(0, 8)}</TableCell>
                      <TableCell className="py-1">{contactPerson || "Partner"}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground py-1">
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-normal py-1">{s.full_name}</TableCell>
                      <TableCell className="py-1">{s.email}</TableCell>
                      <TableCell className="py-1">{s.phone}</TableCell>
                      <TableCell className="py-1"><Badge variant="outline" className={stClass}>{label}</Badge></TableCell>
                      <TableCell className="text-right min-w-[80px] py-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-7 w-7 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
      )}
    </div>
  );
}
