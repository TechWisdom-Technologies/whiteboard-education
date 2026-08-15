import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Loader2, Trash2, X, Search, Mail, Phone, Link2 } from "lucide-react";
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

export default function PartnerStudents() {
  const { session, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [contactPerson, setContactPerson] = useState<string>("");
  const [loading, setLoading] = useState(true);
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
  const [statusFilter, setStatusFilter] = useState("all");

  const [appliedFilters, setAppliedFilters] = useState({
    wbIdFilter: "all",
    nameFilter: "",
    dateFromFilter: "",
    dateToFilter: "",
    countryFilter: "all",
    intakeFilter: "all",
    yearFilter: "all",
    statusFilter: searchParams.get("status") || "all"
  });

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

  const handleSearch = () => {
    setAppliedFilters({ wbIdFilter, nameFilter, dateFromFilter, dateToFilter, countryFilter, intakeFilter, yearFilter, statusFilter });
  };

  const handleReset = () => {
    setWbIdFilter("all");
    setNameFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setCountryFilter("all");
    setIntakeFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
    setAppliedFilters({
      wbIdFilter: "all", nameFilter: "", dateFromFilter: "", dateToFilter: "", countryFilter: "all", intakeFilter: "all", yearFilter: "all", statusFilter: "all"
    });
  };

  const filtered = students.filter(s => {
    if (appliedFilters.wbIdFilter && appliedFilters.wbIdFilter !== "all" && !String(s.wb_student_id || s.id).toLowerCase().includes(appliedFilters.wbIdFilter.toLowerCase())) return false;
    if (appliedFilters.nameFilter && appliedFilters.nameFilter !== "all" && !s.full_name.toLowerCase().includes(appliedFilters.nameFilter.toLowerCase())) return false;
    
    if (appliedFilters.dateFromFilter && new Date(s.created_at) < new Date(appliedFilters.dateFromFilter)) return false;
    if (appliedFilters.dateToFilter && new Date(s.created_at) > new Date(appliedFilters.dateToFilter)) return false;
    
    if (appliedFilters.countryFilter && appliedFilters.countryFilter !== "all") {
      if (appliedFilters.countryFilter === "Malaysia" && !s.nationality?.toLowerCase().includes("malay")) return false;
    }
    
    if (appliedFilters.intakeFilter && appliedFilters.intakeFilter !== "all" && s.intake_month !== appliedFilters.intakeFilter) return false;
    
    if (appliedFilters.yearFilter && appliedFilters.yearFilter !== "all" && new Date(s.created_at).getFullYear().toString() !== appliedFilters.yearFilter) return false;
    
    if (appliedFilters.statusFilter && appliedFilters.statusFilter !== "all") {
      const statuses = statusFilterMap[appliedFilters.statusFilter];
      if (statuses && !statuses.includes(s.status)) return false;
    }
    
    return true;
  });

  if (loading) return <LoadingScreen fullScreen />;



  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#1E293B] font-semibold text-lg mb-0.5">
            Students
          </h1>
          <p className="text-gray-500 text-xs">Manage your Students and their Profiles</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs h-9">
              <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedIds.length})
            </Button>
          )}

          <Button size="sm" className="text-xs h-9 px-4" onClick={() => navigate('/partner-dashboard/students/new')}>
            Register New Student +
          </Button>
        </div>
      </div>

      {/* Unified Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
           <div className="space-y-1.5 flex-1 min-w-[120px]">
             <label className="text-xs font-medium text-gray-500">Assigned To</label>
             <Select value={wbIdFilter} onValueChange={setWbIdFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent><SelectItem value="all">All</SelectItem></SelectContent>
             </Select>
           </div>
           
           <div className="space-y-1.5 flex-1 min-w-[120px]">
             <label className="text-xs font-medium text-gray-500">Country</label>
             <Select value={countryFilter} onValueChange={setCountryFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-1.5 flex-1 min-w-[120px]">
             <label className="text-xs font-medium text-gray-500">Intake</label>
             <Select value={intakeFilter} onValueChange={setIntakeFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <SelectItem key={m} value={m}>{m.substring(0, 3)}</SelectItem>
                  ))}
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-1.5 flex-1 min-w-[100px]">
             <label className="text-xs font-medium text-gray-500">Year</label>
             <Select value={yearFilter} onValueChange={setYearFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-1.5 flex-1 min-w-[140px]">
             <label className="text-xs font-medium text-gray-500">Status</label>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="submitted">App. Submitted</SelectItem>
                  <SelectItem value="in_progress">App. Incomplete</SelectItem>
               </SelectContent>
             </Select>
           </div>
           
           <div className="space-y-1.5 flex-[1.5] min-w-[180px]">
             <label className="text-xs font-medium text-gray-500">Search</label>
             <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
               <Input 
                 placeholder="Search by keyword" 
                 value={nameFilter}
                 onChange={(e) => setNameFilter(e.target.value)}
                 className="pl-8 h-8 text-xs border-gray-200" 
               />
             </div>
           </div>
           
           <div className="flex items-center gap-2 flex-1 min-w-[200px]">
             <Button onClick={handleSearch} className="w-full gap-2 bg-[#2F4F97] hover:bg-white text-white hover:text-[#2F4F97] border border-transparent hover:border-[#2F4F97] transition-colors"><Search className="h-4 w-4" /> Search</Button>
             <Button variant="outline" onClick={handleReset} className="w-full gap-2 border-gray-300">Clear</Button>
           </div>
        </div>
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-gray-100 rounded-xl bg-white shadow-sm">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30 text-[#2F4F97]" />
          <p className="text-xs font-medium text-gray-700">No students found</p>
          <p className="text-xs text-gray-500">Try adjusting your filters or add a new student</p>
        </div>
      ) : (
<div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-x-auto">
          <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="w-[40px] text-center px-4">
                    <Checkbox 
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="whitespace-nowrap min-w-[80px]">WB ID</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[100px]">Created By</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[100px]">Created on</TableHead>
                  <TableHead className="min-w-[120px]">Student Name</TableHead>
                  <TableHead className="min-w-[120px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Phone Number</TableHead>
                  <TableHead className="min-w-[100px]">Assigned To</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const label = getStatusLabel(s.status);
                  // Adapting colors for the mock:
                  const isSubmitted = s.status !== 'document_upload' && s.status !== 'document_review' && s.status !== 'document_verification';
                  const displayLabel = isSubmitted ? "1 App. Submitted" : "App. Incomplete";
                  const stClass = isSubmitted 
                    ? "bg-green-50 text-green-600 border-green-200" 
                    : "bg-gray-100 text-gray-600 border-gray-200";

                  return (
                    <TableRow
                      key={s.id}
                      ref={(row) => {
                        studentRowRefs.current[s.id] = row;
                      }}
                      className={`hover:bg-[#F1F5F9]/80 cursor-pointer border-gray-100 transition-colors ${highlightedStudentId === s.id ? "bg-blue-50/50" : ""}`}
                      onClick={() => navigate(`/partner-dashboard/students/${s.wb_student_id ? `WB-${s.wb_student_id}` : s.id}`)}
                    >
                      <TableCell className="text-center px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedIds.includes(s.id)}
                          onCheckedChange={(c) => handleSelectRow(s.id, c as boolean)}
                        />
                      </TableCell>
                      <TableCell className="text-xs font-mono py-3 whitespace-nowrap">{s.wb_student_id ? `WB-${s.wb_student_id}` : "—"}</TableCell>
                      <TableCell className="py-3 text-xs text-gray-900 font-normal whitespace-nowrap">{contactPerson || "Mr. Khondoker Fazle Rahman"}</TableCell>
                      <TableCell className="py-3 text-xs text-gray-900 whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-3 font-semibold text-xs text-[#1E293B] uppercase whitespace-nowrap">{s.full_name}</TableCell>
                      <TableCell className="py-3 text-xs text-[#2F4F97] whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{s.email || '-'}</div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#2F4F97] whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{s.phone || '-'}</div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-gray-900 font-normal whitespace-nowrap">
                        {"Mr. Khondoker Fazle Rahman"}
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap">
                        <Badge variant="outline" className={`font-normal rounded-md px-2 py-0.5 text-[11px] ${stClass}`}>
                          {displayLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          <Link2 className="w-4 h-4 text-[#2F4F97] cursor-pointer hover:text-blue-700" />
                          <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" onClick={() => handleDelete(s.id)} />
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
