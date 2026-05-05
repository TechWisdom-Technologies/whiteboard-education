import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserPlus, Eye, Loader2, Upload, FileText, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  passport_number: string;
  nationality: string;
  date_of_birth: string | null;
  gender: string;
  previous_institution: string;
  previous_degree: string;
  gpa: number;
  ielts_score: number;
  target_university: string;
  target_course: string;
  intake_month: string;
  degree_level: string;
  status: string;
  admin_notes: string;
  passport_url: string;
  academic_transcript_url: string;
  ielts_certificate_url: string;
  personal_statement_url: string;
  recommendation_letter_url: string;
  other_documents: string[];
  created_at: string;
}

const statusMap: Record<string, { label: string; class: string }> = {
  document_review: { label: "Document Review", class: "bg-muted text-muted-foreground" },
  documents_verified: { label: "Documents Verified", class: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  applied: { label: "Applied", class: "bg-[#ffa300]/10 text-[#ffa300] border-[#ffa300]/20" },
  offer_received: { label: "Offer Received", class: "bg-warning/10 text-warning border-warning/20" },
  visa_processing: { label: "Visa Processing", class: "bg-primary/10 text-primary border-primary/20" },
  visa_approved: { label: "Visa Approved", class: "bg-green-500/10 text-green-600 border-green-500/30" },
  enrolled: { label: "Enrolled", class: "bg-green-600/10 text-green-700 border-green-600/30" },
  rejected: { label: "Rejected", class: "bg-destructive/10 text-destructive border-destructive/20" },
};

const emptyForm = {
  full_name: "", email: "", phone: "", passport_number: "", nationality: "",
  date_of_birth: "", gender: "", previous_institution: "", previous_degree: "",
  gpa: "", ielts_score: "", target_university: "", target_course: "",
  intake_month: "", degree_level: "Bachelor",
};

export default function PartnerStudents() {
  const { session, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);
  const handledStudentParamRef = useRef(false);
  const studentRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const fetchStudents = async () => {
    if (!session) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/students?select=*&partner_id=eq.${user?.id}&order=created_at.desc`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }
      );
      if (res.ok) setStudents(await res.json());
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
    setSearch("");
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

  const uploadDoc = async (studentId: string, field: string, file: File) => {
    setUploading(p => ({ ...p, [field]: true }));
    try {
      const path = `${user?.id}/${studentId}/${field}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("student-documents").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("student-documents").getPublicUrl(path);
      
      // Update student record
      const res = await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${studentId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ [field]: publicUrl }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Document uploaded!");
      fetchStudents();
      if (selected?.id === studentId) {
        setSelected(prev => prev ? { ...prev, [field]: publicUrl } : null);
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setUploading(p => ({ ...p, [field]: false })); }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.target_university.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Student Profiles</h1>
          <p className="text-muted-foreground text-sm">Manage your students and track their application progress</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full name" /></div>
                <div><Label>Email *</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+880..." /></div>
                <div><Label>Passport Number</Label><Input value={form.passport_number} onChange={e => setForm(f => ({ ...f, passport_number: e.target.value }))} /></div>
                <div><Label>Nationality</Label><Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} /></div>
                <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} /></div>
                <div>
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Academic Background</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Previous Institution</Label><Input value={form.previous_institution} onChange={e => setForm(f => ({ ...f, previous_institution: e.target.value }))} /></div>
                <div><Label>Previous Degree</Label><Input value={form.previous_degree} onChange={e => setForm(f => ({ ...f, previous_degree: e.target.value }))} /></div>
                <div><Label>GPA</Label><Input type="number" step="0.01" value={form.gpa} onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))} /></div>
                <div><Label>IELTS Score</Label><Input type="number" step="0.5" value={form.ielts_score} onChange={e => setForm(f => ({ ...f, ielts_score: e.target.value }))} /></div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Target Program</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>University</Label><Input value={form.target_university} onChange={e => setForm(f => ({ ...f, target_university: e.target.value }))} /></div>
                <div><Label>Course</Label><Input value={form.target_course} onChange={e => setForm(f => ({ ...f, target_course: e.target.value }))} /></div>
                <div><Label>Intake Month</Label><Input value={form.intake_month} onChange={e => setForm(f => ({ ...f, intake_month: e.target.value }))} placeholder="e.g. September 2026" /></div>
                <div>
                  <Label>Degree Level</Label>
                  <Select value={form.degree_level} onValueChange={v => setForm(f => ({ ...f, degree_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90" onClick={handleAdd} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No students yet</p>
            <p className="text-sm">Add your first student to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="rounded-sm border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Target University</TableHead>
                  <TableHead>Target Course</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const st = statusMap[s.status] || { label: s.status, class: "" };
                  const docCount = [s.passport_url, s.academic_transcript_url, s.ielts_certificate_url, s.personal_statement_url, s.recommendation_letter_url].filter(Boolean).length;
                  return (
                    <TableRow
                      key={s.id}
                      ref={(row) => {
                        studentRowRefs.current[s.id] = row;
                      }}
                      className={highlightedStudentId === s.id ? "bg-[#ffa300]/10 ring-1 ring-[#ffa300]/40" : undefined}
                    >
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{s.target_university || "—"}</TableCell>
                      <TableCell>{s.target_course || "—"}</TableCell>
                      <TableCell>{s.degree_level}</TableCell>
                      <TableCell><Badge variant="outline" className={st.class}>{st.label}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{docCount}/5</Badge></TableCell>
                      <TableCell className="text-right min-w-[120px]">
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(s); setDetailOpen(true); }}>
                          <Eye className="h-4 w-4 mr-1" />View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Detail / Upload Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Student Profile — {selected?.full_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Application Status:</span>
                <Badge variant="outline" className={statusMap[selected.status]?.class || ""}>
                  {statusMap[selected.status]?.label || selected.status}
                </Badge>
                {selected.admin_notes && (
                  <span className="text-xs text-muted-foreground italic ml-2">Note: {selected.admin_notes}</span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label className="text-muted-foreground text-xs">Email</Label><p className="font-medium text-sm">{selected.email}</p></div>
                <div><Label className="text-muted-foreground text-xs">Phone</Label><p className="font-medium text-sm">{selected.phone || "—"}</p></div>
                <div><Label className="text-muted-foreground text-xs">Passport</Label><p className="font-medium text-sm">{selected.passport_number || "—"}</p></div>
                <div><Label className="text-muted-foreground text-xs">Nationality</Label><p className="font-medium text-sm">{selected.nationality || "—"}</p></div>
                <div><Label className="text-muted-foreground text-xs">DOB</Label><p className="font-medium text-sm">{selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString() : "—"}</p></div>
                <div><Label className="text-muted-foreground text-xs">Gender</Label><p className="font-medium text-sm">{selected.gender || "—"}</p></div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Academic Background</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Previous Institution</Label><p className="font-medium text-sm">{selected.previous_institution || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Previous Degree</Label><p className="font-medium text-sm">{selected.previous_degree || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">GPA</Label><p className="font-medium text-sm">{selected.gpa || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">IELTS Score</Label><p className="font-medium text-sm">{selected.ielts_score || "—"}</p></div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Target Program</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">University</Label><p className="font-medium text-sm">{selected.target_university || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Course</Label><p className="font-medium text-sm">{selected.target_course || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Intake</Label><p className="font-medium text-sm">{selected.intake_month || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Degree Level</Label><p className="font-medium text-sm">{selected.degree_level}</p></div>
                </div>
              </div>

              {/* Documents Upload */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="space-y-3">
                  {[
                    { field: "passport_url", label: "Passport Copy" },
                    { field: "academic_transcript_url", label: "Academic Transcript" },
                    { field: "ielts_certificate_url", label: "IELTS Certificate" },
                    { field: "personal_statement_url", label: "Personal Statement" },
                    { field: "recommendation_letter_url", label: "Recommendation Letter" },
                  ].map(doc => {
                    const url = (selected as any)[doc.field];
                    return (
                      <div key={doc.field} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-sm border">
                        <FileText className={`h-5 w-5 ${url ? "text-green-600" : "text-muted-foreground"}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.label}</p>
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View document</a>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) uploadDoc(selected.id, doc.field, file);
                            }}
                          />
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-muted hover:bg-muted/80 text-sm transition-colors">
                            {uploading[doc.field] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            {url ? "Replace" : "Upload"}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
