import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Upload,
  CheckCircle2,
  ExternalLink,
  Printer,
  Download,
  Save,
  User,
  GraduationCap,
  Target,
  Building2,
  FileCheck,
  ClipboardList,
  Zap,
  Pencil,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ─── Status configuration ───────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  document_review: "bg-gray-100 text-gray-600",
  documents_verified: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  university_applied: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  offer_letter: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  emgs_processing: "bg-[#ffa300]/10 text-[#ffa300] border-[#ffa300]/20",
  visa_approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  travel_ready: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  enrolled: "bg-green-600/10 text-green-700 border-green-600/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  on_hold: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const statusLabels: Record<string, string> = {
  document_review: "Document Review",
  documents_verified: "Documents Verified",
  university_applied: "University Applied",
  offer_letter: "Offer Letter",
  emgs_processing: "EMGS Processing",
  visa_approved: "Visa Approved",
  travel_ready: "Travel Ready",
  enrolled: "Enrolled",
  rejected: "Rejected",
  on_hold: "On Hold",
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

// ─── Document fields ────────────────────────────────────────────────────────

const documentFields = [
  { field: "passport_photo_url", label: "Passport Photo" },
  { field: "passport_url", label: "Passport Copy" },
  { field: "academic_transcript_url", label: "Academic Transcript" },
  { field: "ielts_certificate_url", label: "IELTS Certificate" },
  { field: "personal_statement_url", label: "Personal Statement" },
  { field: "recommendation_letter_url", label: "Recommendation Letter" },
] as const;

// ─── Types ──────────────────────────────────────────────────────────────────

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
  user_id: string;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const isEmpty = value === null || value === undefined || value === "" || (typeof value === "number" && value === 0);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-sm font-medium ${isEmpty ? "text-amber-600/80 italic text-xs flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2 py-0.5 rounded border border-amber-200/30 w-fit" : "text-[#181d29]"}`}>
        {isEmpty ? "Not provided" : value}
      </span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function StudentProfilePage({ mode }: { mode: "admin" | "partner" }) {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { session, user } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin status update
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Document upload
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${session?.access_token}`,
  };

  // Inline editing states for each section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    // Personal Info
    full_name: "",
    email: "",
    phone: "",
    passport_number: "",
    nationality: "",
    date_of_birth: "",
    gender: "",
    // Academic Info
    previous_institution: "",
    previous_degree: "",
    gpa: "",
    ielts_score: "",
    // Target Info
    target_university: "",
    target_course: "",
    intake_month: "",
    degree_level: "",
  });

  const startEditingPersonal = () => {
    if (!student) return;
    setEditForm((prev) => ({
      ...prev,
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      passport_number: student.passport_number || "",
      nationality: student.nationality || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
    }));
    setIsEditingPersonal(true);
  };

  const startEditingAcademic = () => {
    if (!student) return;
    setEditForm((prev) => ({
      ...prev,
      previous_institution: student.previous_institution || "",
      previous_degree: student.previous_degree || "",
      gpa: student.gpa !== undefined && student.gpa !== null ? student.gpa.toString() : "",
      ielts_score: student.ielts_score !== undefined && student.ielts_score !== null ? student.ielts_score.toString() : "",
    }));
    setIsEditingAcademic(true);
  };

  const startEditingTarget = () => {
    if (!student) return;
    setEditForm((prev) => ({
      ...prev,
      target_university: student.target_university || "",
      target_course: student.target_course || "",
      intake_month: student.intake_month || "",
      degree_level: student.degree_level || "",
    }));
    setIsEditingTarget(true);
  };

  const handleSaveSection = async (section: "personal" | "academic" | "target") => {
    if (!student || !session) return;
    
    let bodyToUpdate: Partial<Student> = {};
    if (section === "personal") {
      bodyToUpdate = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        passport_number: editForm.passport_number,
        nationality: editForm.nationality,
        date_of_birth: editForm.date_of_birth || null,
        gender: editForm.gender,
      };
    } else if (section === "academic") {
      bodyToUpdate = {
        previous_institution: editForm.previous_institution,
        previous_degree: editForm.previous_degree,
        gpa: editForm.gpa ? parseFloat(editForm.gpa) : 0,
        ielts_score: editForm.ielts_score ? parseFloat(editForm.ielts_score) : 0,
      };
    } else if (section === "target") {
      bodyToUpdate = {
        target_university: editForm.target_university,
        target_course: editForm.target_course,
        intake_month: editForm.intake_month,
        degree_level: editForm.degree_level,
      };
    }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/students?id=eq.${student.id}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(bodyToUpdate),
        }
      );
      if (!res.ok) throw new Error("Failed to update student details");
      
      toast.success("Student details updated successfully!");
      setStudent((prev) => (prev ? { ...prev, ...bodyToUpdate } : null));
      
      if (section === "personal") setIsEditingPersonal(false);
      if (section === "academic") setIsEditingAcademic(false);
      if (section === "target") setIsEditingTarget(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save details");
    }
  };

  // ── Fetch student data ──────────────────────────────────────────────────

  const fetchStudent = async () => {
    if (!session || !studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/students?id=eq.${studentId}&select=*`,
        { headers }
      );
      if (!res.ok) throw new Error("Failed to fetch student");
      const data = await res.json();
      if (!data || data.length === 0) {
        setError("Student not found");
        setLoading(false);
        return;
      }
      const s = data[0] as Student;
      setStudent(s);
      setNewStatus(s.status);
      setAdminNotes(s.admin_notes || "");

      // Fetch partner info
      if (s.partner_id) {
        const partnerRes = await fetch(
          `${SUPABASE_URL}/rest/v1/partner_registrations?user_id=eq.${s.partner_id}&select=id,agency_name,contact_person,email,user_id`,
          { headers }
        );
        if (partnerRes.ok) {
          const pData = await partnerRes.json();
          if (pData.length > 0) setPartner(pData[0]);
        }
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, studentId]);

  // ── Upload document ─────────────────────────────────────────────────────

  const handleUploadDoc = async (field: string, file: File) => {
    if (!student || !session) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const path = `${user?.id}/${student.id}/${field}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("student-documents")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("student-documents").getPublicUrl(path);

      // PATCH student record
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/students?id=eq.${student.id}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ [field]: publicUrl }),
        }
      );
      if (!res.ok) throw new Error("Failed to update student record");
      toast.success("Document uploaded successfully!");
      setStudent((prev) => (prev ? { ...prev, [field]: publicUrl } : null));
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading((p) => ({ ...p, [field]: false }));
    }
  };

  // ── Save status (admin only) ───────────────────────────────────────────

  const handleSaveStatus = async () => {
    if (!student || !session) return;
    setSavingStatus(true);
    try {
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/students?id=eq.${student.id}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: newStatus,
            admin_notes: adminNotes || "",
          }),
        }
      );
      if (!updateRes.ok) throw new Error("Failed to update status");

      // Send partner notification
      const notifType =
        newStatus === "rejected"
          ? "warning"
          : ["documents_verified", "offer_letter", "visa_approved", "enrolled"].includes(newStatus)
          ? "success"
          : "info";

      await fetch(`${SUPABASE_URL}/rest/v1/partner_notifications`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          partner_id: student.partner_id,
          student_id: student.id,
          title: `${student.full_name} - Status Updated`,
          message: `Status changed to ${newStatus.replace(/_/g, " ")}.${
            adminNotes ? ` Note: ${adminNotes}` : ""
          }`,
          type: notifType,
        }),
      });

      toast.success(`Status updated to ${statusLabels[newStatus] || newStatus}`);
      setStudent((prev) =>
        prev ? { ...prev, status: newStatus, admin_notes: adminNotes } : null
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSavingStatus(false);
    }
  };

  // ── Profile completeness ───────────────────────────────────────────────

  const allDocsUploaded = student
    ? documentFields.every((d) => !!(student as any)[d.field])
    : false;

  const requiredFieldsFilled = student
    ? !!(
        student.full_name &&
        student.email &&
        student.phone &&
        student.passport_number &&
        student.nationality &&
        student.date_of_birth &&
        student.gender &&
        student.previous_institution &&
        student.previous_degree &&
        student.target_university &&
        student.target_course &&
        student.intake_month &&
        student.degree_level
      )
    : false;

  const profileComplete = allDocsUploaded && requiredFieldsFilled;
  const docCount = student
    ? documentFields.filter((d) => !!(student as any)[d.field]).length
    : 0;

  // ── Back navigation ────────────────────────────────────────────────────

  const handleBack = () => {
    if (mode === "admin") {
      navigate("/admin/students");
    } else {
      navigate("/partner-dashboard/students");
    }
  };

  // ── Print / PDF ────────────────────────────────────────────────────────

  const handlePrint = () => window.print();

  // ── Loading & error states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#ffa300]" />
          <p className="text-sm text-muted-foreground">Loading student profile…</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <User className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">{error || "Student not found"}</h2>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #student-profile-print, #student-profile-print * { visibility: visible; }
          #student-profile-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="student-profile-print" className="space-y-6 animate-fade-in">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="w-fit -ml-2 text-muted-foreground hover:text-[#181d29]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Students
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {student.passport_photo_url ? (
              <img
                src={student.passport_photo_url}
                alt={student.full_name}
                className="w-[95px] h-[122px] rounded-md object-cover border border-[#ffa300]/25 shadow-sm shrink-0 animate-fade-in"
              />
            ) : (
              <div className="w-[95px] h-[122px] rounded-md border border-dashed border-border bg-muted/10 flex flex-col items-center justify-center shrink-0 text-muted-foreground/30 text-center">
                <User className="h-7 w-7 mb-1" />
                <span className="text-[8px] leading-normal font-semibold">PASSPORT<br/>PHOTO</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-[#181d29] leading-tight">
                {student.full_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Added {new Date(student.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-3 py-1 ${statusColors[student.status] || ""}`}
            >
              {statusLabels[student.status] || student.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Badge variant="secondary" className="text-xs">
              {docCount}/{documentFields.length} Docs
            </Badge>
            {profileComplete && (
              <Badge className="bg-green-600/10 text-green-700 border-green-600/30 text-xs" variant="outline">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </div>

        {/* ── Two-column layout ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN (2/3) ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-[#ffa300]" />
                  Personal Information
                </CardTitle>
                <div className="no-print">
                  {isEditingPersonal ? (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsEditingPersonal(false)}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-semibold"
                        onClick={() => handleSaveSection("personal")}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-[#181d29]"
                      onClick={startEditingPersonal}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingPersonal ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="e.g. john@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="e.g. +60123456789"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Passport Number</Label>
                      <Input
                        value={editForm.passport_number}
                        onChange={(e) => setEditForm({ ...editForm, passport_number: e.target.value })}
                        placeholder="Passport Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Nationality</Label>
                      <Input
                        value={editForm.nationality}
                        onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                        placeholder="Nationality"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Date of Birth</Label>
                      <Input
                        type="date"
                        value={editForm.date_of_birth || ""}
                        onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Gender</Label>
                      <Select
                        value={editForm.gender}
                        onValueChange={(val) => setEditForm({ ...editForm, gender: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoRow label="Full Name" value={student.full_name} />
                    <InfoRow label="Email" value={student.email} />
                    <InfoRow label="Phone" value={student.phone} />
                    <InfoRow label="Passport Number" value={student.passport_number} />
                    <InfoRow label="Nationality" value={student.nationality} />
                    <InfoRow
                      label="Date of Birth"
                      value={
                        student.date_of_birth
                          ? new Date(student.date_of_birth).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : null
                      }
                    />
                    <InfoRow label="Gender" value={student.gender} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Background */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4 text-[#ffa300]" />
                  Academic Background
                </CardTitle>
                <div className="no-print">
                  {isEditingAcademic ? (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsEditingAcademic(false)}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-semibold"
                        onClick={() => handleSaveSection("academic")}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-[#181d29]"
                      onClick={startEditingAcademic}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingAcademic ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Previous Institution</Label>
                      <Input
                        value={editForm.previous_institution}
                        onChange={(e) => setEditForm({ ...editForm, previous_institution: e.target.value })}
                        placeholder="Previous School / University"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Previous Degree</Label>
                      <Input
                        value={editForm.previous_degree}
                        onChange={(e) => setEditForm({ ...editForm, previous_degree: e.target.value })}
                        placeholder="e.g. High School Diploma"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">GPA / CGPA</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.gpa}
                        onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
                        placeholder="e.g. 3.85"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">IELTS Score</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={editForm.ielts_score}
                        onChange={(e) => setEditForm({ ...editForm, ielts_score: e.target.value })}
                        placeholder="e.g. 6.5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Previous Institution" value={student.previous_institution} />
                    <InfoRow label="Previous Degree" value={student.previous_degree} />
                    <InfoRow label="GPA" value={student.gpa || null} />
                    <InfoRow label="IELTS Score" value={student.ielts_score || null} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Program */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-[#ffa300]" />
                  Target Program
                </CardTitle>
                <div className="no-print">
                  {isEditingTarget ? (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsEditingTarget(false)}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-semibold"
                        onClick={() => handleSaveSection("target")}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-[#181d29]"
                      onClick={startEditingTarget}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingTarget ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">University</Label>
                      <Input
                        value={editForm.target_university}
                        onChange={(e) => setEditForm({ ...editForm, target_university: e.target.value })}
                        placeholder="Target University"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Course</Label>
                      <Input
                        value={editForm.target_course}
                        onChange={(e) => setEditForm({ ...editForm, target_course: e.target.value })}
                        placeholder="Target Course"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Intake Month</Label>
                      <Input
                        value={editForm.intake_month}
                        onChange={(e) => setEditForm({ ...editForm, intake_month: e.target.value })}
                        placeholder="e.g. September 2026"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Degree Level</Label>
                      <Select
                        value={editForm.degree_level}
                        onValueChange={(val) => setEditForm({ ...editForm, degree_level: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Degree Level" />
                        </SelectTrigger>
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="University" value={student.target_university} />
                    <InfoRow label="Course" value={student.target_course} />
                    <InfoRow label="Intake Month" value={student.intake_month} />
                    <InfoRow label="Degree Level" value={student.degree_level} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submitted By */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-[#ffa300]" />
                  Submitted By
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoRow label="Agency Name" value={partner.agency_name} />
                    <InfoRow label="Contact Person" value={partner.contact_person} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Partner information not available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (1/3) ─────────────────────────────────── */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileCheck className="h-4 w-4 text-[#ffa300]" />
                  Documents
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {docCount}/{documentFields.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documentFields.map((doc) => {
                  const url = (student as any)[doc.field] as string | undefined;
                  const isUploading = uploading[doc.field];
                  return (
                    <div
                      key={doc.field}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        url
                          ? "bg-green-50/50 border-green-200/60 dark:bg-green-950/10 dark:border-green-900/30"
                          : "bg-muted/30 border-dashed"
                      }`}
                    >
                      {url ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.label}</p>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#ffa300] hover:underline flex items-center gap-1 no-print"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Preview
                          </a>
                        )}
                      </div>
                      <div className="no-print">
                        <input
                          type="file"
                          className="hidden"
                          ref={(el) => {
                            fileInputRefs.current[doc.field] = el;
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadDoc(doc.field, file);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isUploading}
                          onClick={() => fileInputRefs.current[doc.field]?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Upload className="h-3 w-3 mr-1" />
                          )}
                          {url ? "Replace" : "Upload"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Application Status (admin only) */}
            {mode === "admin" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4 text-[#ffa300]" />
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this application…"
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-semibold"
                    onClick={handleSaveStatus}
                    disabled={savingStatus}
                  >
                    {savingStatus ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="no-print">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-[#ffa300]" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!profileComplete}
                  onClick={handlePrint}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!profileComplete}
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Profile
                </Button>
                {!profileComplete && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    Complete all required fields and upload all 6 documents to enable print/PDF.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
