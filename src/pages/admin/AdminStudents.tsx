import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Loader2, Search, FileText, ExternalLink, Users, Filter, X, Download, Image, File } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const statusOptions = [
  { value: "document_review", label: "Document Review" },
  { value: "documents_verified", label: "Documents Verified" },
  { value: "applied", label: "Applied" },
  { value: "offer_received", label: "Offer Received" },
  { value: "visa_processing", label: "Visa Processing" },
  { value: "visa_approved", label: "Visa Approved" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" },
];

const statusColors: Record<string, string> = {
  document_review: "bg-muted text-muted-foreground",
  documents_verified: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  applied: "bg-secondary/10 text-secondary border-secondary/20",
  offer_received: "bg-warning/10 text-warning border-warning/20",
  visa_processing: "bg-primary/10 text-primary border-primary/20",
  visa_approved: "bg-green-500/10 text-green-600 border-green-500/30",
  enrolled: "bg-green-600/10 text-green-700 border-green-600/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Student {
  id: string;
  partner_id: string;
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

interface Partner {
  id: string;
  agency_name: string;
  contact_person: string;
  email: string;
  user_id: string;
}

export default function AdminStudents() {
  const { session } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = async () => {
    if (!session) return;
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` };
    try {
      const [studentsRes, partnersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/students?select=id,partner_id,full_name,email,phone,passport_number,nationality,date_of_birth,gender,previous_institution,previous_degree,gpa,ielts_score,target_university,target_course,intake_month,degree_level,status,admin_notes,passport_url,academic_transcript_url,ielts_certificate_url,personal_statement_url,recommendation_letter_url,other_documents,created_at&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=id,agency_name,contact_person,email,user_id`, { headers }),
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (partnersRes.ok) setPartners(await partnersRes.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [session]);

  const getPartner = (partnerId: string) => partners.find(p => p.user_id === partnerId);

  const openDetail = (s: Student) => {
    setSelected(s);
    setNewStatus(s.status);
    setAdminNotes(s.admin_notes || "");
    setDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selected || !session) return;
    setSaving(true);
    try {
      const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      const partner = getPartner(selected.partner_id);

      // Update student row
      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${selected.id}`, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes || "",
        }),
      });

      if (!updateRes.ok) {
        const err = await updateRes.text();
        throw new Error(err || "Failed to update status");
      }

      // Insert in-app notification for partner dashboard.
      const notifType = newStatus === "rejected" ? "warning" : (["documents_verified", "offer_received", "visa_approved", "enrolled"].includes(newStatus) ? "success" : "info");
      const notifTitle = `${selected.full_name} — Status Updated`;
      const notifMessage = `Status changed to ${newStatus.replace(/_/g, " ")}.${adminNotes ? ` Note: ${adminNotes}` : ""}`;

      await fetch(`${SUPABASE_URL}/rest/v1/partner_notifications`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({
          partner_id: selected.partner_id,
          student_id: selected.id,
          title: notifTitle,
          message: notifMessage,
          type: notifType,
        }),
      });

      toast.success(`Student status updated to ${newStatus}!`);
      setDetailOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally { setSaving(false); }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchPartner = filterPartner === "all" || s.partner_id === filterPartner;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchPartner && matchStatus;
  });

  // Group by partner for summary
  const partnerSummary = partners.map(p => ({
    ...p,
    studentCount: students.filter(s => s.partner_id === p.user_id).length,
  })).filter(p => p.studentCount > 0).sort((a, b) => b.studentCount - a.studentCount);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 text-xs">
        <Badge variant="secondary" className="px-2 py-0.5">{students.length} Total Students</Badge>
        <Badge variant="secondary" className="px-2 py-0.5">{partners.length} Partners</Badge>
      </div>

      {/* Partner Summary Cards */}
      {partnerSummary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerSummary.slice(0, 4).map(p => (
            <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterPartner(filterPartner === p.user_id ? "all" : p.user_id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-sm bg-secondary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.agency_name}</p>
                    <p className="text-xs text-muted-foreground">{p.studentCount} student{p.studentCount > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] w-full sm:w-auto sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPartner} onValueChange={setFilterPartner}>
          <SelectTrigger className="w-full sm:w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Partners" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            {partners.map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.agency_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No students found.</CardContent></Card>
      ) : (
        <div className="rounded-sm border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Partner Agency</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const partner = getPartner(s.partner_id);
                const st = statusOptions.find(o => o.value === s.status);
                const docCount = [s.passport_url, s.academic_transcript_url, s.ielts_certificate_url, s.personal_statement_url, s.recommendation_letter_url].filter(Boolean).length;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell className="text-sm">{partner?.agency_name || "Unknown"}</TableCell>
                    <TableCell className="text-sm">{s.target_university || "—"}</TableCell>
                    <TableCell className="text-sm">{s.target_course || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[s.status] || ""}>{st?.label || s.status}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{docCount}/5</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(s)}><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Student Details — {selected?.full_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Partner Info */}
              <div className="p-3 rounded-sm bg-muted/50 border">
                <p className="text-xs text-muted-foreground">Submitted by Partner</p>
                <p className="font-semibold text-sm">{getPartner(selected.partner_id)?.agency_name || "Unknown"} — {getPartner(selected.partner_id)?.contact_person}</p>
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Email</Label><p className="font-medium text-sm">{selected.email}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Phone</Label><p className="font-medium text-sm">{selected.phone || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Passport</Label><p className="font-medium text-sm">{selected.passport_number || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Nationality</Label><p className="font-medium text-sm">{selected.nationality || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">DOB</Label><p className="font-medium text-sm">{selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString() : "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Gender</Label><p className="font-medium text-sm">{selected.gender || "—"}</p></div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Academic Background</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Previous Institution</Label><p className="font-medium text-sm">{selected.previous_institution || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Previous Degree</Label><p className="font-medium text-sm">{selected.previous_degree || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">GPA</Label><p className="font-medium text-sm">{selected.gpa || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">IELTS Score</Label><p className="font-medium text-sm">{selected.ielts_score || "—"}</p></div>
                </div>
              </div>

              {/* Target Program */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Target Program</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">University</Label><p className="font-medium text-sm">{selected.target_university || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Course</Label><p className="font-medium text-sm">{selected.target_course || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Intake</Label><p className="font-medium text-sm">{selected.intake_month || "—"}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Degree Level</Label><p className="font-medium text-sm">{selected.degree_level}</p></div>
                </div>
              </div>

              {/* Documents with Inline Preview */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="space-y-2">
                  {[
                    { field: "passport_url", label: "Passport Copy" },
                    { field: "academic_transcript_url", label: "Academic Transcript" },
                    { field: "ielts_certificate_url", label: "IELTS Certificate" },
                    { field: "personal_statement_url", label: "Personal Statement" },
                    { field: "recommendation_letter_url", label: "Recommendation Letter" },
                  ].map(doc => {
                    const url = (selected as any)[doc.field] as string | undefined;
                    const isImage = url && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
                    const isPdf = url && /\.pdf(\?|$)/i.test(url);
                    return (
                      <div key={doc.field} className="rounded-sm border overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2">
                          {isImage ? <Image className="h-4 w-4 text-primary" /> : isPdf ? <File className="h-4 w-4 text-destructive" /> : <FileText className={`h-4 w-4 ${url ? "text-green-600" : "text-muted-foreground/40"}`} />}
                          <span className="text-sm flex-1 font-medium">{doc.label}</span>
                          {url ? (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPreviewDoc(previewDoc === doc.field ? null : doc.field)}>
                                <Eye className="h-3 w-3 mr-1" /> {previewDoc === doc.field ? "Hide" : "Preview"}
                              </Button>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  <ExternalLink className="h-3 w-3 mr-1" /> Open
                                </Button>
                              </a>
                              <a href={url} download>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not uploaded</span>
                          )}
                        </div>
                        {/* Inline preview */}
                        {previewDoc === doc.field && url && (
                          <div className="border-t bg-muted/30 p-3">
                            {isImage ? (
                              <img src={url} alt={doc.label} className="max-h-[400px] w-auto mx-auto rounded-sm object-contain" />
                            ) : isPdf ? (
                              <iframe src={url} className="w-full h-[500px] rounded-sm border" title={doc.label} />
                            ) : (
                              <iframe src={url} className="w-full h-[400px] rounded-sm border" title={doc.label} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Control */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">Update Application Status</h3>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div>
                  <Label>Admin Notes</Label>
                  <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes about this application..." rows={3} className="mt-1" />
                </div>



                <Button onClick={handleUpdateStatus} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
