import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  AlertTriangle,
  Mail,
  Phone,
  Link2,
  MapPin,
  Trash2,
  ShieldAlert,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StatusTracker } from "@/components/ui/StatusTracker";
import { getStatusLabel } from "@/config/statusFlow";
import { LoadingScreen } from "@/components/ui/loading-screen";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// â”€â”€â”€ Status configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Document fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const documentFields = [
  { field: "passport_photo_url", label: "Passport Photo" },
  { field: "passport_url", label: "Passport Copy" },
  { field: "academic_transcript_url", label: "Academic Transcript" },
  { field: "ielts_certificate_url", label: "IELTS Certificate" },
  { field: "personal_statement_url", label: "Personal Statement" },
  { field: "recommendation_letter_url", label: "Recommendation Letter" },
] as const;

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  passport_expiry_date?: string;
  english_test_type?: string;
  english_test_score?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_phone?: string;
  guardian_email?: string;
  emgs_application_number?: string | null;
  emgs_status_percentage?: number | null;
}

interface Application {
  id: string;
  application_code: string;
  university_id: string;
  course_id: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  emgs_application_number?: string;
  emgs_status_percentage?: number;
  partner_id?: string;
  universities?: { name: string };
  courses?: { title: string; intake_months?: string[] };
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
      <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-sm font-medium leading-snug ${isEmpty ? "text-amber-600/80 italic text-xs flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2.5 py-1 rounded-2xl border border-amber-200/30 w-fit" : "text-[#1E293B]"}`}>
        {isEmpty ? "Not provided" : value}
      </span>
    </div>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function StudentProfilePage({ mode }: { mode: "admin" | "partner" }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const { session, user } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Add Application Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [addingApp, setAddingApp] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    university_id: "",
    course_id: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin status update
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activityNotes, setActivityNotes] = useState<any[]>([]);
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
  const [isEditingGuardian, setIsEditingGuardian] = useState(false);

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
    // Target Info
    target_university: "",
    target_course: "",
    intake_month: "",
    degree_level: "",
    emgs_application_number: "",
    emgs_status_percentage: "",
    // New Fields
    passport_expiry_date: "",
    english_test_type: "",
    english_test_score: "",
    guardian_name: "",
    guardian_relationship: "",
    guardian_phone: "",
    guardian_email: "",
  });

  const startEditingPersonal = () => {
    if (!student) return;
    setEditForm((prev) => ({
      ...prev,
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      passport_number: student.passport_number || "",
      passport_expiry_date: student.passport_expiry_date || "",
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
      english_test_type: student.english_test_type || "",
      english_test_score: student.english_test_score || "",
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
      emgs_application_number: student.emgs_application_number || "",
      emgs_status_percentage: student.emgs_status_percentage?.toString() || "",
    }));
    setIsEditingTarget(true);
  };

  const startEditingGuardian = () => {
    if (!student) return;
    setEditForm((prev) => ({
      ...prev,
      guardian_name: student.guardian_name || "",
      guardian_relationship: student.guardian_relationship || "",
      guardian_phone: student.guardian_phone || "",
      guardian_email: student.guardian_email || "",
    }));
    setIsEditingGuardian(true);
  };

  const handleSaveSection = async (section: "personal" | "academic" | "language" | "target" | "guardian") => {
    if (!student || !session) return;
    
    let bodyToUpdate: Partial<Student> = {};
    if (section === "personal") {
      bodyToUpdate = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        passport_number: editForm.passport_number,
        passport_expiry_date: editForm.passport_expiry_date || null,
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
        english_test_type: editForm.english_test_type,
        english_test_score: editForm.english_test_score,
      };
    } else if (section === "target") {
      bodyToUpdate = {
        target_university: editForm.target_university,
        target_course: editForm.target_course,
        intake_month: editForm.intake_month,
        degree_level: editForm.degree_level,
        emgs_application_number: editForm.emgs_application_number,
        emgs_status_percentage: editForm.emgs_status_percentage ? parseInt(editForm.emgs_status_percentage) : null,
      };
    } else if (section as string === "guardian") {
      bodyToUpdate = {
        guardian_name: editForm.guardian_name,
        guardian_relationship: editForm.guardian_relationship,
        guardian_phone: editForm.guardian_phone,
        guardian_email: editForm.guardian_email,
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
      if (section as string === "guardian") setIsEditingGuardian(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save details");
    }
  };

  const handleAddActivityNote = async () => {
    if (!student || !session || !adminNotes.trim()) return;
    setSavingStatus(true);
    try {
      const adminName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin";
      
      const newNote = {
        student_id: student.id,
        admin_name: adminName,
        content: adminNotes.trim(),
      };
      
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/student_notes`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(newNote),
        }
      );
      
      if (!res.ok) throw new Error("Failed to add note");
      const savedData = await res.json();
      
      if (savedData && savedData.length > 0) {
        setActivityNotes(prev => [savedData[0], ...prev]);
        setAdminNotes("");
        toast.success("Note added to activity stream");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to add note");
    } finally {
      setSavingStatus(false);
    }
  };

  // â”€â”€ Fetch student data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

      // Fetch partner info and applications concurrently
      const promises = [];
      
      if (s.partner_id) {
        promises.push(
          fetch(
            `${SUPABASE_URL}/rest/v1/partner_registrations?user_id=eq.${s.partner_id}&select=id,agency_name,contact_person,email,phone,user_id`,
            { headers }
          ).then(res => res.json()).then(data => {
            if (data && data.length > 0) setPartner(data[0]);
          })
        );
      }
      
      promises.push(
        fetch(
          `${SUPABASE_URL}/rest/v1/student_applications?student_id=eq.${studentId}&select=*,universities(name),courses(title,intake_months)`,
          { headers }
        ).then(res => res.json()).then(data => {
          if (Array.isArray(data)) setApplications(data);
        }).catch(err => console.error("Error fetching applications:", err))
      );

      // Fetch activity notes if admin
      if (mode === "admin") {
        promises.push(
          fetch(
            `${SUPABASE_URL}/rest/v1/student_notes?student_id=eq.${studentId}&select=*&order=created_at.desc`,
            { headers }
          ).then(res => res.json()).then(data => {
            if (Array.isArray(data)) setActivityNotes(data);
          }).catch(err => console.error("Error fetching notes:", err))
        );
      }
      
      // Fetch universities for the dropdown if admin
      if (mode === "admin") {
        promises.push(
          fetch(`${SUPABASE_URL}/rest/v1/universities?select=id,name`, { headers })
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) setUniversities(data);
            }).catch(err => console.error("Error fetching universities:", err))
        );
        promises.push(
          fetch(`${SUPABASE_URL}/rest/v1/courses?select=id,title,university_id`, { headers })
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) setCourses(data);
            }).catch(err => console.error("Error fetching courses:", err))
        );
      }
      
      await Promise.all(promises);
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

  // â”€â”€ Upload document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ Add Application â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleAddApplication = async () => {
    if (!newAppForm.university_id || !newAppForm.course_id || !student || !session) {
      toast.error("Please select a university and course.");
      return;
    }
    
    setAddingApp(true);
    
    try {
      const selectedUni = universities.find(u => u.id === newAppForm.university_id);
      
      // Generate short name
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "APP-";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const applicationCode = code;

      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/student_applications`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          student_id: student.id,
          university_id: newAppForm.university_id,
          course_id: newAppForm.course_id,
          application_code: applicationCode,
          status: "document_review"
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create application");
      }
      
      toast.success("Application created successfully");
      setIsAppModalOpen(false);
      setNewAppForm({ university_id: "", course_id: "" });
      fetchStudent(); // Refresh data
    } catch (e: any) {
      toast.error(e.message || "Failed to create application");
    } finally {
      setAddingApp(false);
    }
  };

  // â”€â”€ Print / PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleSaveStatusTracker = async (updatedStatus: string) => {
    if (!student || updatedStatus === student.status) return;
    setSavingStatus(true);
    try {
      const { error } = await supabase
        .from("students")
        .update({ status: updatedStatus })
        .eq("id", student.id);
      if (error) throw error;
      setStudent({ ...student, status: updatedStatus });
      toast.success("Status updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  // â”€â”€ Auto-Progression Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!student || mode !== "admin") return;

    const checkAutoProgression = async () => {
      let newStatus = null;
      
      const currentDocCount = documentFields.filter((d) => !!(student as any)[d.field]).length;

      // Rule 1: Document Upload -> Document Review
      if (student.status === "document_upload" && currentDocCount === documentFields.length) {
        newStatus = "document_review";
      }
      
      // Rule 2: University Selection -> University Application
      if (student.status === "university_selection" && applications.length > 0) {
        newStatus = "university_application";
      }

      if (newStatus) {
        try {
          const { error } = await supabase
            .from("students")
            .update({ status: newStatus })
            .eq("id", student.id);
          if (error) throw error;
          setStudent(prev => prev ? { ...prev, status: newStatus as string } : null);
          toast.success(`System automatically advanced status to: ${getStatusLabel(newStatus)}`);
        } catch (err) {
          console.error("Failed to auto-advance status:", err);
        }
      }
    };

    checkAutoProgression();
  }, [student, applications.length, mode]);

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

  // â”€â”€ Profile completeness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ Back navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleBack = () => {
    if (mode === "admin") {
      navigate("/admin/students");
    } else {
      navigate("/partner-dashboard/students");
    }
  };

  // â”€â”€ Print / PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handlePrint = () => {
    if (!student) return;
    const originalTitle = document.title;
    const passport = student.passport_number || "NoPassport";
    const uni = student.target_university || "NoUniversity";
    document.title = `${student.full_name}_${passport}_${uni}`;
    window.print();
    document.title = originalTitle;
  };

  // â”€â”€ Loading & error states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (loading) return <LoadingScreen fullScreen />;

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

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

      <div id="student-profile-print" className="space-y-6 animate-fade-in pb-12">
        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print mb-2">
          <div className="flex items-center text-[#1E293B] font-semibold text-lg">
             <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 mr-2"><ArrowLeft className="h-4 w-4" /></Button>
             Student Profile
          </div>
        </div>

        {/* Global Student Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print mt-2">
           <div className="flex items-center gap-4">
             {student.passport_photo_url ? (
               <img src={student.passport_photo_url} alt={student.full_name} className="w-[60px] h-[60px] rounded-full object-cover border border-gray-200" />
             ) : (
               <div className="w-[60px] h-[60px] rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border border-blue-200">
                 {student.full_name.charAt(0)}
               </div>
             )}
             <div className="flex flex-col gap-1">
               <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">{student.full_name}
                 <Badge variant="outline" className="text-[10px] font-normal bg-gray-50 h-5 px-1.5 text-gray-500 uppercase">{student.status}</Badge>
               </h2>
               <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-gray-600">
                 <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400"/> {student.email}</div>
                 <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400"/> {student.phone || "N/A"}</div>
                 <div className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-400"/> {student.gender || "N/A"}</div>
               </div>
             </div>
           </div>
           <div className="flex items-center gap-2">
             {student.status === 'document_upload' && mode === 'partner' && (
               <Button 
                 className="bg-green-600 hover:bg-green-700 text-xs h-9"
                 onClick={() => {
                   if (confirm("Are you sure you want to submit this student's application to Whiteboard for review?")) {
                     handleSaveStatusTracker('document_review');
                   }
                 }}
               >
                 Submit Application
               </Button>
             )}
             {/* Student Platform Link Removed */}
           </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full space-y-6">
          <TabsList className="flex w-full h-12 bg-transparent border-b border-gray-200 p-0 no-print gap-8 rounded-none justify-start">
            <TabsTrigger value="profile" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">1. Profile</TabsTrigger>
            <TabsTrigger value="applications" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">2. Applications</TabsTrigger>
            <TabsTrigger value="documents" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">3. Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications" className="space-y-6 mt-0">
             <Card className="border border-gray-200 shadow-sm overflow-hidden">
               <CardContent className="p-0">
                 {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No applications found for this student.</p>
                      {mode === "partner" && (
                        <Button
                          variant="outline"
                          className="mt-4 gap-2"
                          onClick={() => navigate('/partner-dashboard/search-programs')}
                        >
                          <Search className="w-4 h-4" /> Browse Programs
                        </Button>
                      )}
                    </div>
                 ) : (
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                            <TableHead className="whitespace-nowrap w-[100px]">App ID</TableHead>
                            <TableHead className="whitespace-nowrap w-[100px]">Date created</TableHead>
                            <TableHead className="min-w-[140px]">University</TableHead>
                            <TableHead className="min-w-[140px]">Program</TableHead>
                            <TableHead className="whitespace-nowrap w-[80px]">Intake</TableHead>
                            <TableHead className="min-w-[100px]">Created By</TableHead>
                            <TableHead className="whitespace-nowrap w-[120px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-mono text-xs font-semibold text-[#2F4F97] whitespace-nowrap">
                                {app.application_code}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {new Date(app.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                {app.universities?.name || "â€”"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                {app.courses?.title || "â€”"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {app.courses?.intake_months?.[0] || "â€”"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {student?.partner_id === app.partner_id ? "Partner" : "Admin"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant="outline" className={`${statusColors[app.status] || "bg-gray-100 text-gray-800"} text-[10px] px-2 border-transparent whitespace-nowrap`}>
                                  {getStatusLabel(app.status)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                 )}
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 mt-0">
             <Tabs defaultValue="your-documents" className="w-full">
               <TabsList className="bg-transparent gap-8 p-0 h-10 border-b border-gray-200 w-full justify-start rounded-none mb-6">
                 <TabsTrigger value="your-documents" className="text-[13px] font-semibold h-10 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">Your Documents</TabsTrigger>
                 <TabsTrigger value="whiteboard-documents" className="text-[13px] font-semibold h-10 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">Whiteboard Documents</TabsTrigger>
               </TabsList>
               
               <TabsContent value="your-documents" className="mt-0">
                  <Accordion type="multiple" className="space-y-3">
                    {documentFields.map((doc) => {
                      const url = (student as any)[doc.field] as string | undefined;
                      const isUploading = uploading[doc.field];
                      return (
                        <AccordionItem key={doc.field} value={doc.field} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 [&[data-state=open]]:bg-gray-50">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                  <FileText className="w-4 h-4 text-[#2F4F97]" />
                                </div>
                                <span className="font-semibold text-sm text-[#1E293B]">{doc.label}</span>
                              </div>
                              {url ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-normal uppercase bg-gray-50">Missing</Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-4 bg-gray-50/50 border-t border-gray-100">
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex-wrap gap-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center border border-red-100">
                                    <FileText className="w-5 h-5 text-red-500" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-[#1E293B]">{url ? 'Document Uploaded' : 'No Document'}</p>
                                    <p className="text-xs text-gray-500">{url ? 'Click preview to view file' : 'Please upload a PDF/Image'}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 {url && (
                                   <a
                                     href={url}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex h-9 items-center justify-center rounded-md border bg-white px-3 text-xs font-medium text-[#2F4F97] hover:bg-gray-50 shadow-sm transition-colors"
                                     title="Preview Document"
                                   >
                                     Preview
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
                                 <Button
                                   type="button"
                                   size="sm"
                                   disabled={isUploading}
                                   onClick={() => fileInputRefs.current[doc.field]?.click()}
                                   className="h-9 px-3 text-xs font-medium"
                                 >
                                   {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-2" />}
                                   {url ? "Replace" : "Upload"}
                                 </Button>
                                 {url && (
                                    <Button variant="outline" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                 )}
                               </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
               </TabsContent>
               <TabsContent value="whiteboard-documents">
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                     <p className="text-gray-500 text-sm">No Whiteboard documents available for this student.</p>
                  </div>
               </TabsContent>
             </Tabs>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 mt-0">
            {/* â”€â”€ Main Single Column Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <Card className="print:border-none print:shadow-none border border-gray-200 shadow-sm">
              <CardContent className="p-6 sm:p-7 print:p-0">
                {/* â”€â”€ Section 1: Personal Information â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                          className="h-8 text-xs font-semibold"
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
                      <Label className="text-xs font-semibold text-muted-foreground">Passport No.</Label>
                      <Input
                        value={editForm.passport_number}
                        onChange={(e) => setEditForm({ ...editForm, passport_number: e.target.value })}
                        placeholder="Passport Number"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Passport Expiry Date</Label>
                      <Input
                        type="date"
                        value={editForm.passport_expiry_date || ""}
                        onChange={(e) => setEditForm({ ...editForm, passport_expiry_date: e.target.value })}
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
                    
                    {/* Passport Expiry & Validation */}
                    <div className="flex flex-col gap-1.5 py-1">
                      <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                        Passport Expiry
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-medium leading-snug ${!student.passport_expiry_date ? "text-amber-600/80 italic text-xs flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2.5 py-1 rounded-2xl border border-amber-200/30 w-fit" : "text-[#1E293B]"}`}>
                          {student.passport_expiry_date ? new Date(student.passport_expiry_date).toLocaleDateString() : "Not provided"}
                        </span>
                        {student.passport_expiry_date && (
                          (() => {
                            const today = new Date();
                            const expiry = new Date(student.passport_expiry_date);
                            const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
                            if (monthsDiff < 18) {
                              return (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px] px-1.5 h-4 uppercase">
                                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                  &lt; 18m
                                </Badge>
                              );
                            }
                            return null;
                          })()
                        )}
                      </div>
                    </div>

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

                {/* â”€â”€ Section 2: Academic Background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                            className="h-8 text-xs font-semibold"
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

                {/* â”€â”€ Section 3: Language Proficiency â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                            className="h-8 text-xs font-semibold"
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
                        <Label className="text-xs font-semibold text-muted-foreground">Test Type / Medium</Label>
                        <Select
                          value={editForm.english_test_type}
                          onValueChange={(val) => setEditForm({ ...editForm, english_test_type: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="e.g. IELTS, MOI" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IELTS">IELTS</SelectItem>
                            <SelectItem value="TOEFL">TOEFL</SelectItem>
                            <SelectItem value="Duolingo">Duolingo</SelectItem>
                            <SelectItem value="MOI">MOI (Medium of Instruction)</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Score / Status</Label>
                        <Input
                          value={editForm.english_test_score}
                          onChange={(e) => setEditForm({ ...editForm, english_test_score: e.target.value })}
                          placeholder="e.g. 6.5 or 'Approved'"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <InfoRow label="Proficiency Type" value={student.english_test_type} />
                      <InfoRow label="Score / Status" value={student.english_test_score} />
                    </div>
                  )}
                </div>

                {/* â”€â”€ Section 4: Target Program â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                            className="h-8 text-xs font-semibold"
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
                        <Label className="text-xs font-semibold text-muted-foreground">Preferred Program</Label>
                        <Input
                          value={editForm.target_course}
                          onChange={(e) => setEditForm({ ...editForm, target_course: e.target.value })}
                          placeholder="Target Course"
                        />
                      </div>
                      {/* Target University is deprecated and hidden. Applications tab handles this. */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Preferred Intake</Label>
                        <Input
                          value={editForm.intake_month}
                          onChange={(e) => setEditForm({ ...editForm, intake_month: e.target.value })}
                          placeholder="e.g. September 2026"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">EMGS Application No.</Label>
                        <Input
                          value={editForm.emgs_application_number}
                          onChange={(e) => setEditForm({ ...editForm, emgs_application_number: e.target.value })}
                          placeholder="e.g. E123456789"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">EMGS Status %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.emgs_status_percentage}
                          onChange={(e) => setEditForm({ ...editForm, emgs_status_percentage: e.target.value })}
                          placeholder="e.g. 35"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                      <InfoRow label="Degree Level" value={student.degree_level} />
                      <InfoRow label="Preferred Program" value={student.target_course} />
                      <InfoRow label="Preferred Intake" value={student.intake_month} />
                      
                      <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-px bg-border/40 my-1"></div>
                      
                      <InfoRow label="Primary Target Institution" value={applications.length > 0 ? applications[0].universities?.name : "No Applications"} />
                      <div className="flex flex-col gap-1.5 py-1">
                        <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                          Offer Status
                        </span>
                        <span className="text-[13px] font-bold text-[#1E293B]">
                          {applications.length > 0 ? getStatusLabel(applications[0].status) : "N/A"}
                        </span>
                      </div>
                      
                      <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-px bg-border/40 my-1"></div>

                      <InfoRow label="EMGS Application No." value={student.emgs_application_number} />
                      <InfoRow label="EMGS Status %" value={student.emgs_status_percentage !== undefined && student.emgs_status_percentage !== null ? `${student.emgs_status_percentage}%` : null} />
                    </div>
                  )}
                </div>

                {/* â”€â”€ Section 5: Emergency Contact / Guardian â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="border-t border-border/30 pt-5 mt-4 print:border-none">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="flex items-center gap-2.5 text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      <ShieldAlert className="h-4 w-4 text-[#2F4F97]" />
                      Emergency Contact
                    </h3>
                    <div className="no-print">
                      {isEditingGuardian ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setIsEditingGuardian(false)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold"
                            onClick={() => handleSaveSection("guardian")}
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
                          onClick={startEditingGuardian}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  {isEditingGuardian ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Guardian Name</Label>
                        <Input
                          value={editForm.guardian_name}
                          onChange={(e) => setEditForm({ ...editForm, guardian_name: e.target.value })}
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Relationship</Label>
                        <Input
                          value={editForm.guardian_relationship}
                          onChange={(e) => setEditForm({ ...editForm, guardian_relationship: e.target.value })}
                          placeholder="e.g. Mother"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
                        <Input
                          value={editForm.guardian_phone}
                          onChange={(e) => setEditForm({ ...editForm, guardian_phone: e.target.value })}
                          placeholder="e.g. +60123456789"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                        <Input
                          type="email"
                          value={editForm.guardian_email}
                          onChange={(e) => setEditForm({ ...editForm, guardian_email: e.target.value })}
                          placeholder="e.g. jane@example.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <InfoRow label="Guardian Name" value={student.guardian_name} />
                      <InfoRow label="Relationship" value={student.guardian_relationship} />
                      <InfoRow label="Phone" value={student.guardian_phone} />
                      <InfoRow label="Email" value={student.guardian_email} />
                    </div>
                  )}
                </div>

                {/* â”€â”€ Section 6: Submitted By â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

        {/* Admin Activity Stream (Admin only) - Moved to bottom */}
        {mode === "admin" && (
          <Card className="no-print border border-[#2F4F97]/10 shadow-sm mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B] uppercase tracking-wide mb-6">
                <ClipboardList className="h-4 w-4 text-[#2F4F97]" />
                Admin Internal Notes & Activity
              </div>
              
              <div className="space-y-6">
                {/* Notes Feed */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {activityNotes.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground italic bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                      No internal notes yet.
                    </div>
                  ) : (
                    activityNotes.map((note) => (
                      <div key={note.id} className="flex gap-3 text-sm">
                        <div className="mt-0.5 shrink-0">
                          <div className="h-8 w-8 rounded-full bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] font-semibold text-xs border border-[#2F4F97]/20">
                            {note.admin_name ? note.admin_name.substring(0, 2).toUpperCase() : "AD"}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1E293B] text-xs">
                              {note.admin_name || "Admin"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(note.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[13px]">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add a private note about this application..."
                    rows={2}
                    className="resize-none text-sm bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="h-8 px-4 font-medium text-xs shadow-sm"
                      onClick={handleAddActivityNote}
                      disabled={savingStatus || !adminNotes.trim()}
                    >
                      {savingStatus ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      ) : (
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* â”€â”€ Print-Only Documents Checklist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
        </TabsContent>
        
      </Tabs>
      </div>

      {/* Add Application Modal */}
      <Dialog open={isAppModalOpen} onOpenChange={setIsAppModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Application</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="university">University</Label>
              <Select
                value={newAppForm.university_id}
                onValueChange={(val) => setNewAppForm({ ...newAppForm, university_id: val, course_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={newAppForm.course_id}
                onValueChange={(val) => setNewAppForm({ ...newAppForm, course_id: val })}
                disabled={!newAppForm.university_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={newAppForm.university_id ? "Select a course" : "Select university first"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.filter(c => c.university_id === newAppForm.university_id).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAppModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddApplication} disabled={addingApp || !newAppForm.university_id || !newAppForm.course_id} >
              {addingApp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
