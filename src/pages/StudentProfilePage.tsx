import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
  Languages,
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
  emgs_processing: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
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

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const isEmpty = value === null || value === undefined || value === "" || (typeof value === "number" && value === 0);
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-[13px] font-medium leading-snug ${isEmpty ? "text-amber-600/80 italic text-xs flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2.5 py-1 rounded-2xl border border-amber-200/30 w-fit" : "text-[#1E293B]"}`}>
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
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    // Personal Info
    full_name: "",
    email: "",
    phone: "",
    passport_number: "",
    nationality: "",
    nid_number: "",
    date_of_birth: "",
    gender: "",
    // Academic Info
    previous_institution: "",
    previous_degree: "",
    major: "",
    gpa: "",
    // Language Proficiency
    language_test_name: "",
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
      nid_number: student.nid_number || "",
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
      major: student.major || "",
      gpa: student.gpa !== undefined && student.gpa !== null ? student.gpa.toString() : "",
    }));
    setIsEditingAcademic(true);
  };

  const startEditingLanguage = () => {
    if (!student) return;
    setEditForm((prev) => ({
      ...prev,
      language_test_name: student.language_test_name || "",
      ielts_score: student.ielts_score !== undefined && student.ielts_score !== null ? student.ielts_score.toString() : "",
    }));
    setIsEditingLanguage(true);
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

  const handleSaveSection = async (section: "personal" | "academic" | "language" | "target") => {
    if (!student || !session) return;
    
    let bodyToUpdate: Partial<Student> = {};
    if (section === "personal") {
      bodyToUpdate = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        passport_number: editForm.passport_number,
        nationality: editForm.nationality,
        nid_number: editForm.nid_number,
        date_of_birth: editForm.date_of_birth || null,
        gender: editForm.gender,
      };
    } else if (section === "academic") {
      bodyToUpdate = {
        previous_institution: editForm.previous_institution,
        previous_degree: editForm.previous_degree,
        major: editForm.major,
        gpa: editForm.gpa ? parseFloat(editForm.gpa) : 0,
      };
    } else if (section === "language") {
      bodyToUpdate = {
        language_test_name: editForm.language_test_name,
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
      if (section === "language") setIsEditingLanguage(false);
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
          `${SUPABASE_URL}/rest/v1/partner_registrations?user_id=eq.${s.partner_id}&select=id,agency_name,contact_person,email,phone,user_id`,
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

  const handlePrint = () => {
    if (!student) return;
    const originalTitle = document.title;
    const passport = student.passport_number || "NoPassport";
    const uni = student.target_university || "NoUniversity";
    document.title = `${student.full_name}_${passport}_${uni}`;
    window.print();
    document.title = originalTitle;
  };

  // ── Loading & error states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F4F97]" />
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

      <div id="student-profile-print" className="space-y-8 animate-fade-in pb-12">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="w-fit -ml-2 text-muted-foreground hover:text-[#1E293B]"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Students
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side: Photo & Info */}
          <div className="flex items-start gap-5 flex-1">
            {student.passport_photo_url ? (
              <img
                src={student.passport_photo_url}
                alt={student.full_name}
                className="w-[148px] h-[177px] rounded-2xl object-cover border border-[#2F4F97]/25 shadow-sm shrink-0 animate-fade-in"
                style={{ aspectRatio: "591/709" }}
              />
            ) : (
              <div 
                className="w-[148px] h-[177px] rounded-2xl border border-dashed border-border bg-muted/10 flex flex-col items-center justify-center shrink-0 text-muted-foreground/30 text-center"
                style={{ aspectRatio: "591/709" }}
              >
                <User className="h-7 w-7 mb-1" />
                <span className="text-[9px] leading-normal font-semibold">PASSPORT<br/>PHOTO</span>
              </div>
            )}
            
            <div className="flex flex-col gap-1.5 pt-1">
              <h1 className="text-3xl font-extrabold text-[#1E293B] leading-tight">
                {student.full_name}
              </h1>
              <p className="text-[13px] text-muted-foreground font-medium mb-1">
                File Opened on {new Date(student.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-sm font-bold ${statusColors[student.status]?.replace(/bg-[^\s]+/, '').replace(/border-[^\s]+/, '').trim() || 'text-[#1E293B]'}`}>
                  {statusLabels[student.status] || student.status}
                </span>
                
                {profileComplete && (
                  <Badge className="bg-green-600/10 text-green-700 border-green-600/30 text-[10px] uppercase px-1.5 py-0 h-4" variant="outline">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    Complete
                  </Badge>
                )}
              </div>

              {/* Status Update (Admin Only) */}
              {mode === "admin" && (
                <div className="flex items-center gap-2 mt-3 no-print">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="h-8 text-xs w-[180px] bg-white">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-xs">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 text-xs font-semibold"
                    onClick={handleSaveStatus}
                    disabled={savingStatus || newStatus === student.status}
                  >
                    {savingStatus ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-col gap-2 shrink-0 md:items-end no-print pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 font-semibold"
                disabled={!profileComplete}
                onClick={handlePrint}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 font-semibold"
                disabled={!profileComplete}
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
            {!profileComplete && (
              <p className="text-[11px] text-muted-foreground text-right max-w-[220px]">
                Complete required fields & upload 6 docs to enable print/PDF.
              </p>
            )}
          </div>
        </div>

        {/* ── Horizontal Documents Section ─────────────────────────────── */}
        <Card className="no-print">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                <FileCheck className="h-4 w-4 text-[#2F4F97]" />
                Required Documents
              </h3>
              <Badge variant="secondary" className="text-xs">
                {docCount}/{documentFields.length} Uploaded
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {documentFields.map((doc) => {
                const url = (student as any)[doc.field] as string | undefined;
                const isUploading = uploading[doc.field];
                return (
                  <div
                    key={doc.field}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors text-center relative group ${
                      url
                        ? "bg-green-50/40 border-green-200/60 dark:bg-green-950/20 dark:border-green-900/40 hover:border-green-300"
                        : "bg-muted/10 border-dashed hover:border-border/80"
                    }`}
                  >
                    {url ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                    ) : (
                      <FileText className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    )}
                    
                    <p className="text-[10px] font-medium leading-tight mb-3 px-1 text-muted-foreground h-6 flex items-center justify-center">
                      {doc.label}
                    </p>

                    <div className="flex items-center gap-2 mt-auto">
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview Document"
                          className="h-7 w-7 rounded-full bg-white border border-border flex items-center justify-center text-[#2F4F97] hover:bg-muted transition-colors shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      
                      <input
                        type="file"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[doc.field] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDoc(doc.field, file);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        title={url ? "Replace Document" : "Upload Document"}
                        disabled={isUploading}
                        onClick={() => fileInputRefs.current[doc.field]?.click()}
                        className={`h-7 w-7 rounded-full bg-white border border-border flex items-center justify-center transition-colors shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {isUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Main Single Column Layout ──────────────────────────────── */}
        <Card className="print:border-none print:shadow-none">
          <CardContent className="p-6 sm:p-7 print:p-0">
                {/* ── Section 1: Personal Information ──────────────── */}
                <div className="flex items-center justify-between pb-4">
                  <h3 className="flex items-center gap-2.5 text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                    <User className="h-4 w-4 text-[#2F4F97]" />
                    Personal Information
                  </h3>
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
                          className="h-8 text-xs bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 font-semibold"
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
                        className="h-8 text-xs text-muted-foreground hover:text-[#1E293B]"
                        onClick={startEditingPersonal}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                {isEditingPersonal ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Nationality</Label>
                      <Input
                        value={editForm.nationality}
                        onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                        placeholder="Nationality"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">NID Number</Label>
                      <Input
                        value={editForm.nid_number}
                        onChange={(e) => setEditForm({ ...editForm, nid_number: e.target.value })}
                        placeholder="NID Number"
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
                      <Label className="text-xs font-semibold text-muted-foreground">Date of Birth</Label>
                      <Input
                        type="date"
                        value={editForm.date_of_birth || ""}
                        onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <InfoRow label="Full Name" value={student.full_name} />
                    <InfoRow label="Email" value={student.email} />
                    <InfoRow label="Phone" value={student.phone} />
                    <InfoRow label="Gender" value={student.gender} />
                    <InfoRow label="Nationality" value={student.nationality} />
                    <InfoRow label="NID Number" value={student.nid_number} />
                    <InfoRow label="Passport Number" value={student.passport_number} />
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
                  </div>
                )}

                {/* ── Section 2: Academic Background ──────────────── */}
                <div className="border-t border-border/30 pt-5 mt-4 print:border-none">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="flex items-center gap-2.5 text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      <GraduationCap className="h-4 w-4 text-[#2F4F97]" />
                      Academic Background
                    </h3>
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
                            className="h-8 text-xs bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 font-semibold"
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
                          className="h-8 text-xs text-muted-foreground hover:text-[#1E293B]"
                          onClick={startEditingAcademic}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  {isEditingAcademic ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Degree Name</Label>
                        <Input
                          value={editForm.previous_degree}
                          onChange={(e) => setEditForm({ ...editForm, previous_degree: e.target.value })}
                          placeholder="e.g. High School Diploma"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Institution</Label>
                        <Input
                          value={editForm.previous_institution}
                          onChange={(e) => setEditForm({ ...editForm, previous_institution: e.target.value })}
                          placeholder="Previous School / University"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Major</Label>
                        <Input
                          value={editForm.major}
                          onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                          placeholder="e.g. Computer Science"
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
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <InfoRow label="Degree Name" value={student.previous_degree} />
                      <InfoRow label="Institution" value={student.previous_institution} />
                      <InfoRow label="Major" value={student.major} />
                      <InfoRow label="GPA / CGPA" value={student.gpa || null} />
                    </div>
                  )}
                </div>

                {/* ── Section 3: Language Proficiency ──────────────── */}
                <div className="border-t border-border/30 pt-5 mt-4 print:border-none">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="flex items-center gap-2.5 text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      <Languages className="h-4 w-4 text-[#2F4F97]" />
                      Language Proficiency
                    </h3>
                    <div className="no-print">
                      {isEditingLanguage ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setIsEditingLanguage(false)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 font-semibold"
                            onClick={() => handleSaveSection("language")}
                          >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-[#1E293B]"
                          onClick={startEditingLanguage}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  {isEditingLanguage ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Test Name</Label>
                        <Input
                          value={editForm.language_test_name}
                          onChange={(e) => setEditForm({ ...editForm, language_test_name: e.target.value })}
                          placeholder="e.g. IELTS, TOEFL, Duolingo"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Score</Label>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <InfoRow label="Test Name" value={student.language_test_name} />
                      <InfoRow label="Score" value={student.ielts_score || null} />
                    </div>
                  )}
                </div>

                {/* ── Section 4: Target Program ───────────────────── */}
                <div className="border-t border-border/30 pt-5 mt-4 print:border-none">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="flex items-center gap-2.5 text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      <Target className="h-4 w-4 text-[#2F4F97]" />
                      Target Program
                    </h3>
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
                            className="h-8 text-xs bg-[#2F4F97] text-white hover:bg-[#2F4F97]/90 font-semibold"
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
                          className="h-8 text-xs text-muted-foreground hover:text-[#1E293B]"
                          onClick={startEditingTarget}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  {isEditingTarget ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Course</Label>
                        <Input
                          value={editForm.target_course}
                          onChange={(e) => setEditForm({ ...editForm, target_course: e.target.value })}
                          placeholder="Target Course"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">University</Label>
                        <Input
                          value={editForm.target_university}
                          onChange={(e) => setEditForm({ ...editForm, target_university: e.target.value })}
                          placeholder="Target University"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Preferred Intake</Label>
                        <Input
                          value={editForm.intake_month}
                          onChange={(e) => setEditForm({ ...editForm, intake_month: e.target.value })}
                          placeholder="e.g. September 2026"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                      <InfoRow label="Degree Level" value={student.degree_level} />
                      <InfoRow label="Course" value={student.target_course} />
                      <InfoRow label="University" value={student.target_university} />
                      <InfoRow label="Preferred Intake" value={student.intake_month} />
                    </div>
                  )}
                </div>

                {/* ── Section 5: Submitted By ─────────────────────── */}
                <div className="border-t border-border/30 pt-5 mt-4 print:border-none">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="flex items-center gap-2.5 text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      <Building2 className="h-4 w-4 text-[#2F4F97]" />
                      Submitted By
                    </h3>
                  </div>
                  {partner ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <InfoRow label="Agency Name" value={partner.agency_name} />
                      <InfoRow label="Contact Person" value={partner.contact_person} />
                      <InfoRow label="Phone" value={partner.phone} />
                      <InfoRow label="Email" value={partner.email} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Partner information not available</p>
                  )}
                </div>
              </CardContent>
        </Card>

        {/* Admin Notes Section (Admin only) - Moved to bottom */}
        {mode === "admin" && (
          <Card className="no-print border-dashed border-amber-200/50 bg-amber-50/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                  <ClipboardList className="h-4 w-4 text-[#2F4F97]" />
                  Admin Internal Notes
                </div>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-white border border-border text-xs hover:bg-muted font-medium"
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                >
                  {savingStatus ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />}
                  Save Notes
                </Button>
              </div>
              
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add private notes about this application (not visible to partners)..."
                rows={4}
                className="resize-none bg-white/60 focus:bg-white"
              />
            </CardContent>
          </Card>
        )}

        {/* ── Print-Only Documents Checklist ──────────────────────────── */}
        <div className="hidden print:block pt-8 mt-8">
          <h3 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide mb-5 flex items-center gap-2.5">
            <FileCheck className="h-4 w-4 text-[#2F4F97]" />
            Uploaded Documents Checklist
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            {documentFields.map((doc) => {
              const url = (student as any)[doc.field] as string | undefined;
              return (
                <div key={doc.field} className="flex items-center gap-3 text-[13px]">
                  {url ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-xl border border-muted-foreground/40" />
                  )}
                  <span className={url ? "text-[#1E293B] font-medium" : "text-muted-foreground italic"}>
                    {doc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
