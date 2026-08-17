import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Loader2, Trash2, X, Search, Mail, Phone } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { statusPhases, exceptionalStatuses, getStatusLabel } from "@/config/statusFlow";

const statusOptions = [
  ...statusPhases.flatMap(p => p.steps.map(s => ({ value: s.id, label: s.label }))),
  ...exceptionalStatuses.map(s => ({ value: s.id, label: s.label }))
];

const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-600 border-gray-200",
  received_application_at_wb: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  application_in_progress: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  application_on_hold_intake: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  application_on_hold_wb: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  application_on_hold_university: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  application_submitted: "bg-theme/10 text-theme border-theme/20",
  offer_letter_received_conditional: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  offer_letter_received_unconditional: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  rejected_by_university: "bg-destructive/10 text-destructive border-destructive/20",
  ready_for_visa_application: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  emgs_approval_pending: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  rejected_by_visa_office: "bg-destructive/10 text-destructive border-destructive/20",
};
import { format } from "date-fns";

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
  const [nameFilter, setNameFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [appliedFilters, setAppliedFilters] = useState({
    nameFilter: "",
    dateFromFilter: "",
    dateToFilter: "",
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
    setNameFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setIntakeFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
  };

  const handleSearch = () => {
    setAppliedFilters({ nameFilter, dateFromFilter, dateToFilter, intakeFilter, yearFilter, statusFilter });
  };

  const handleReset = () => {
    setNameFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setIntakeFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
    setAppliedFilters({
      nameFilter: "", dateFromFilter: "", dateToFilter: "", intakeFilter: "all", yearFilter: "all", statusFilter: "all"
    });
  };

  const filtered = students.filter(s => {
    // Multi-field search keyword (name, created by, wb id, email, phone, status)
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
      const statusMatch = statusLabel.includes(q) || statusRaw.includes(q);

      if (!nameMatch && !createdByMatch && !wbIdMatch && !emailMatch && !phoneMatch && !statusMatch) {
        return false;
      }
    }
    
    // Date Range filter
    if (appliedFilters.dateFromFilter && new Date(s.created_at) < new Date(appliedFilters.dateFromFilter)) return false;
    if (appliedFilters.dateToFilter && new Date(s.created_at) > new Date(appliedFilters.dateToFilter + 'T23:59:59')) return false;
    
    // Intake filter
    if (appliedFilters.intakeFilter && appliedFilters.intakeFilter !== "all" && s.intake_month !== appliedFilters.intakeFilter) return false;
    
    // Year filter
    if (appliedFilters.yearFilter && appliedFilters.yearFilter !== "all" && new Date(s.created_at).getFullYear().toString() !== appliedFilters.yearFilter) return false;
    
    // Status filter
    if (appliedFilters.statusFilter && appliedFilters.statusFilter !== "all") {
      if (s.status !== appliedFilters.statusFilter) return false;
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
           <div className="space-y-1.5 flex-1 min-w-[130px]">
             <label className="text-xs font-medium text-gray-500">From Date</label>
             <Input
               type="date"
               value={dateFromFilter}
               onChange={(e) => setDateFromFilter(e.target.value)}
               className="h-8 text-xs border-gray-200"
             />
           </div>

           <div className="space-y-1.5 flex-1 min-w-[130px]">
             <label className="text-xs font-medium text-gray-500">To Date</label>
             <Input
               type="date"
               value={dateToFilter}
               onChange={(e) => setDateToFilter(e.target.value)}
               className="h-8 text-xs border-gray-200"
             />
           </div>

           <div className="space-y-1.5 flex-1 min-w-[110px]">
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

           <div className="space-y-1.5 flex-1 min-w-[90px]">
             <label className="text-xs font-medium text-gray-500">Year</label>
             <Select value={yearFilter} onValueChange={setYearFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-1.5 flex-1 min-w-[130px]">
             <label className="text-xs font-medium text-gray-500">Status</label>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="h-8 text-xs border-gray-200"><SelectValue placeholder="All" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
               </SelectContent>
             </Select>
           </div>
           
           <div className="space-y-1.5 flex-[1.5] min-w-[200px]">
             <label className="text-xs font-medium text-gray-500">Search</label>
             <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
               <Input 
                 placeholder="Search name, ID, email, phone, created by, status" 
                 value={nameFilter}
                 onChange={(e) => setNameFilter(e.target.value)}
                 className="pl-8 h-8 text-xs border-gray-200" 
               />
             </div>
           </div>
           
           <div className="flex items-center gap-2 flex-1 min-w-[170px]">
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
                  <TableHead className="whitespace-nowrap min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[90px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const label = getStatusLabel(s.status);
                  const stClass = statusColors[s.status] || "bg-gray-100 text-gray-600 border-gray-200";

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
                        {format(new Date(s.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="py-3 font-semibold text-xs text-[#1E293B] uppercase whitespace-nowrap">{s.full_name}</TableCell>
                      <TableCell className="py-3 text-xs text-[#2F4F97] whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{s.email || '-'}</div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#2F4F97] whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{s.phone || '-'}</div>
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap">
                        <Badge variant="outline" className={`font-medium rounded-md px-2 py-0.5 text-[11px] ${stClass}`}>
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(s.id)}
                            className="h-7 px-2.5 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
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
