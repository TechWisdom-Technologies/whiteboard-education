import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Loader2, Search, Users, Filter, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { statusPhases, exceptionalStatuses, getStatusLabel } from "@/config/statusFlow";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const statusOptions = [
  ...statusPhases.flatMap(p => p.steps.map(s => ({ value: s.id, label: s.label }))),
  ...exceptionalStatuses.map(s => ({ value: s.id, label: s.label }))
];

const statusColors: Record<string, string> = {
  document_review: "bg-gray-100 text-gray-600",
  documents_verified: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  university_applied: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  offer_letter: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  emgs_processing: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
  visa_approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  travel_ready: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  enrolled: "bg-green-600/10 text-green-700 border-green-600/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  on_hold: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

interface Student {
  id: string;
  partner_id: string;
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
}

interface Partner {
  id: string;
  agency_name: string;
  contact_person: string;
  email: string;
  phone: string;
  user_id: string;
}

export default function AdminStudents() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchData = async () => {
    if (!session) return;
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` };
    try {
      const [studentsRes, partnersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/students?select=id,partner_id,full_name,email,phone,passport_number,nationality,nid_number,date_of_birth,gender,previous_institution,previous_degree,major,gpa,ielts_score,language_test_name,target_university,target_course,intake_month,degree_level,status,admin_notes,passport_photo_url,passport_url,academic_transcript_url,ielts_certificate_url,personal_statement_url,recommendation_letter_url,other_documents,created_at&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=id,agency_name,contact_person,email,phone,user_id`, { headers }),
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (partnersRes.ok) setPartners(await partnersRes.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [session]);

  const getPartner = (partnerId: string) => partners.find(p => p.user_id === partnerId);


  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student");
    }
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

  const handleBulkDelete = async () => {
    if (!session) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} students? This action cannot be undone.`)) return;

    try {
      // Execute all deletions concurrently
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
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete students");
    }
  };


  const filtered = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchPartner = filterPartner === "all" || s.partner_id === filterPartner;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchPartner && matchStatus;
  });



  if (loading) return <LoadingScreen fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 text-[12px]">
        {selectedIds.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-6 text-[12px] px-2 py-0">
            <Trash2 className="h-3 w-3 mr-1" /> Delete Selected ({selectedIds.length})
          </Button>
        )}
        <Badge variant="secondary" className="px-2 py-0.5">{students.length} Total Students</Badge>
        <Badge variant="secondary" className="px-2 py-0.5">{partners.length} Partners</Badge>
      </div>



      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-2">
        {/* Left: Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 bg-white shadow-sm border-slate-200 h-10 w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200" 
          />
        </div>
        
        {/* Right: Select Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={filterPartner} onValueChange={setFilterPartner}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white shadow-sm border-slate-200 h-10 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200"><Filter className="h-4 w-4 mr-2 text-slate-400" /><SelectValue placeholder="All Partners" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Partners</SelectItem>
              {partners.map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.agency_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white shadow-sm border-slate-200 h-10 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No students found.</CardContent></Card>
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
                <TableHead>Student Name</TableHead>
                <TableHead>Partner Agency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const partner = getPartner(s.partner_id);
                const label = getStatusLabel(s.status);
                const docCount = [s.passport_photo_url, s.passport_url, s.academic_transcript_url, s.ielts_certificate_url, s.personal_statement_url, s.recommendation_letter_url].filter(Boolean).length;
                return (
                  <TableRow 
                    key={s.id} 
                    className="h-10 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/students/${s.id}`)}
                  >
                    <TableCell className="text-center px-0 py-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={(c) => handleSelectRow(s.id, c as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-normal py-1">{s.full_name}</TableCell>
                    <TableCell className="text-[12px] py-1">{partner?.agency_name || "Unknown"}</TableCell>
                    <TableCell className="py-1"><Badge variant="outline" className={statusColors[s.status] || "bg-muted text-muted-foreground"}>{label}</Badge></TableCell>
                    <TableCell className="text-[12px] text-muted-foreground py-1">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right py-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(s.id, e)} title="Delete Student">
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
