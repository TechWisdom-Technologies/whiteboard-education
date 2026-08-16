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
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Upload,
  Check,
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
  Image as ImageIcon,
  Award,
  Briefcase,
  CalendarClock,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getStatusLabel } from "@/config/statusFlow";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { StudentChatWidget } from "@/components/student/StudentChatWidget";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// â”€â”€â”€ Status configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-600 border-gray-200",
  received_application_at_wb: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  application_in_progress: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  application_on_hold_intake: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  application_on_hold_wb: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  application_on_hold_university: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  application_submitted: "bg-[#2F4F97]/10 text-[#2F4F97] border-[#2F4F97]/20",
  offer_letter_received: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  rejected_by_university: "bg-destructive/10 text-destructive border-destructive/20",
  ready_for_visa_application: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  emgs_approval_pending: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  rejected_by_visa_office: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  new: "New",
  received_application_at_wb: "Received Application at WB",
  application_in_progress: "Application in Progress",
  application_on_hold_intake: "Application on Hold \u2013 Intake yet to open",
  application_on_hold_wb: "Application on Hold \u2013 Wb team",
  application_on_hold_university: "Application on Hold \u2013 University",
  application_submitted: "Application Submitted",
  offer_letter_received: "Offer Letter Received",
  rejected_by_university: "Rejected by University",
  ready_for_visa_application: "Ready for Visa Application",
  emgs_approval_pending: "EMGS Approval Pending",
  rejected_by_visa_office: "Rejected by Visa Office",
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
  wb_student_id?: number;
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
  other_documents?: Record<string, any> | string[] | any;
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
      <span className="text-xs font-semibold text-[#2F4F97] uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-sm font-medium leading-snug ${isEmpty ? "text-amber-600/80 italic text-xs flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2.5 py-1 rounded-2xl border border-amber-200/30 w-fit" : "text-[#1E293B]"}`}>
        {isEmpty ? "Not provided" : value}
      </span>
    </div>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


const languageTestOptions = [
  { id: "IELTS", label: "IELTS" },
  { id: "TOEFL", label: "TOEFL iBT" },
  { id: "PTE", label: "PTE Academic" },
  { id: "Duolingo", label: "Duolingo" },
  { id: "Cambridge", label: "Cambridge English" },
  { id: "Linguaskill", label: "Linguaskill" },
  { id: "OET", label: "OET" },
  { id: "MUET", label: "MUET" },
  { id: "MOI", label: "MOI (Medium of Instruction)" },
];

const academicDegreeLevels = [
  { key: "ssc", shortLabel: "SSC", label: "SSC (Secondary School Certificate)" },
  { key: "hsc", shortLabel: "HSC", label: "HSC (Higher Secondary Certificate)" },
  { key: "bachelors", shortLabel: "Bachelors", label: "Bachelors Degree" },
  { key: "masters", shortLabel: "Masters", label: "Masters Degree" },
  { key: "phd", shortLabel: "PHD", label: "PHD (Doctorate)" },
];

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

  const handleEditProfile = () => {
    if (!student) return;
    const targetId = student.wb_student_id ? `WB-${student.wb_student_id}` : student.id;
    if (mode === "admin") {
      navigate(`/admin/students/new?edit=${targetId}`);
    } else {
      navigate(`/partner-dashboard/students/new?edit=${targetId}`);
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
      const isWbId = studentId.startsWith("WB-");
      const queryField = isWbId ? "wb_student_id" : "id";
      const queryValue = isWbId ? studentId.replace("WB-", "") : studentId;

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/students?${queryField}=eq.${queryValue}&select=*`,
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
          `${SUPABASE_URL}/rest/v1/student_applications?student_id=eq.${s.id}&select=*,universities(name),courses(title,intake_months)`,
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

  const getDocUrl = (field: string): string | undefined => {
    if (!student) return undefined;
    if ((student as any)[field]) return (student as any)[field];
    if (student.other_documents && typeof student.other_documents === "object" && !Array.isArray(student.other_documents)) {
      return (student.other_documents as Record<string, string>)[field];
    }
    if (field === "transcript_bachelors" && student.academic_transcript_url) {
      return student.academic_transcript_url;
    }
    return undefined;
  };

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

      const topLevelFields = [
        "passport_photo_url",
        "passport_url",
        "academic_transcript_url",
        "ielts_certificate_url",
        "personal_statement_url",
        "recommendation_letter_url",
      ];

      if (topLevelFields.includes(field)) {
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
        setStudent((prev) => (prev ? { ...prev, [field]: publicUrl } : null));
      } else {
        const currentOther = (typeof student.other_documents === "object" && student.other_documents !== null && !Array.isArray(student.other_documents))
          ? student.other_documents
          : {};
        const updatedOther = { ...currentOther, [field]: publicUrl };

        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?id=eq.${student.id}`,
          {
            method: "PATCH",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ other_documents: updatedOther }),
          }
        );
        if (!res.ok) throw new Error("Failed to update student record");
        setStudent((prev) => (prev ? { ...prev, other_documents: updatedOther as any } : null));
      }

      toast.success("Document uploaded successfully!");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading((p) => ({ ...p, [field]: false }));
    }
  };

  const handleDeleteDoc = async (field: string) => {
    if (!student || !session) return;
    if (!confirm("Are you sure you want to delete this document?")) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const topLevelFields = [
        "passport_photo_url",
        "passport_url",
        "academic_transcript_url",
        "ielts_certificate_url",
        "personal_statement_url",
        "recommendation_letter_url",
      ];

      if (topLevelFields.includes(field)) {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?id=eq.${student.id}`,
          {
            method: "PATCH",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ [field]: null }),
          }
        );
        if (!res.ok) throw new Error("Failed to delete document");
        setStudent((prev) => (prev ? { ...prev, [field]: null } : null));
      } else {
        const currentOther = (typeof student.other_documents === "object" && student.other_documents !== null && !Array.isArray(student.other_documents))
          ? { ...(student.other_documents as Record<string, any>) }
          : {};
        delete (currentOther as any)[field];

        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/students?id=eq.${student.id}`,
          {
            method: "PATCH",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ other_documents: currentOther }),
          }
        );
        if (!res.ok) throw new Error("Failed to delete document");
        setStudent((prev) => (prev ? { ...prev, other_documents: currentOther as any } : null));
      }

      toast.success("Document deleted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete document");
    } finally {
      setUploading((p) => ({ ...p, [field]: false }));
    }
  };

  const handleUpdateLanguageTestType = async (testType: string) => {
    if (!student || !session) return;
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
          body: JSON.stringify({
            language_test_name: testType,
            english_test_type: testType,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update test type");
      setStudent(prev => prev ? { ...prev, language_test_name: testType, english_test_type: testType } : null);
      toast.success(`Language test type set to ${testType}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update test type");
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
          status: "received_application_at_wb"
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
        student.gender
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
    document.title = `${student.full_name}_${passport}`;
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

        {/* Main Grid: Left (Student Info + Tabs) | Right (Live Discussion / Chat Widget) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Main Left Column (9 cols on XL) */}
          <div className="xl:col-span-9 space-y-6 min-w-0">

            {/* Global Student Info Card / Brief Info Box */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 w-full">
                
                {/* 1st Column: Image with uniform rounded corners */}
                <div className="shrink-0">
                  {student.passport_photo_url ? (
                    <img
                      src={student.passport_photo_url}
                      alt={student.full_name}
                      className="object-cover border border-gray-200 rounded-lg shadow-sm"
                      style={{ width: "35mm", height: "42mm" }}
                    />
                  ) : (
                    <div
                      className="bg-blue-100 flex items-center justify-center text-[#2F4F97] font-bold text-2xl border border-blue-200 rounded-lg shadow-sm"
                      style={{ width: "35mm", height: "42mm" }}
                    >
                      {student.full_name?.charAt(0) || "S"}
                    </div>
                  )}
                </div>

                {/* 2nd Column: Comprehensive info in theme blue */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2.5">
                  
                  {/* Name + (WB-ID) */}
                  <div className="w-full">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1E293B] truncate">
                      {student.full_name}
                      {student.wb_student_id ? ` (WB-${student.wb_student_id})` : ""}
                    </h2>
                  </div>

                  {/* Info Grid in Theme Blue with generous vertical row spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 sm:gap-y-3.5 text-xs text-[#2F4F97] font-medium pt-0.5">
                    
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                      <span className="truncate" title={student.email || "N/A"}>
                        {student.email || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                      <span className="truncate" title={student.phone || "N/A"}>
                        {student.phone || "N/A"}
                      </span>
                    </div>

                    {/* Degree: 'level of education' in 'program' (cgpa) */}
                    <div className="flex items-center gap-2 min-w-0">
                      <GraduationCap className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                      <span className="truncate" title={(() => {
                        const level = student.degree_level || student.previous_degree || "";
                        const program = student.major || "";
                        const gpa = student.gpa ? `(${student.gpa})` : "";
                        if (level && program) return `${level} in ${program} ${gpa}`.trim();
                        if (level) return `${level} ${gpa}`.trim();
                        if (program) return `${program} ${gpa}`.trim();
                        return "Education N/A";
                      })()}>
                        {(() => {
                          const level = student.degree_level || student.previous_degree || "";
                          const program = student.major || "";
                          const gpa = student.gpa ? `(${student.gpa})` : "";
                          if (level && program) return `${level} in ${program} ${gpa}`.trim();
                          if (level) return `${level} ${gpa}`.trim();
                          if (program) return `${program} ${gpa}`.trim();
                          return "Education N/A";
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Award className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                      <span className="truncate">
                        {student.language_test_name || student.english_test_type ? (
                          `${student.language_test_name || student.english_test_type}: ${student.english_test_score || student.ielts_score || "MOI"}`
                        ) : (
                          "English: No test"
                        )}
                      </span>
                    </div>

                    {student.nationality && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                        <span className="truncate">
                          {student.nationality}
                        </span>
                      </div>
                    )}

                    {student.passport_number && (
                      <div className="flex items-center gap-2 min-w-0">
                        <CreditCard className="w-3.5 h-3.5 text-[#2F4F97] shrink-0" />
                        <span className="truncate">
                          Passport: {student.passport_number}
                          {student.passport_expiry_date ? ` (Exp: ${new Date(student.passport_expiry_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })})` : ""}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Actions & Status: Edit Profile, Save PDF, Print, Status Box */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
                    
                    {/* Left: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Button
                        size="sm"
                        onClick={handleEditProfile}
                        className="group h-9 min-h-[36px] px-4 text-xs font-semibold bg-[#2F4F97] text-white border border-[#2F4F97] hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] gap-1.5 shadow-sm transition-all duration-200 rounded-lg inline-flex items-center justify-center cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-white group-hover:text-[#2F4F97] transition-colors duration-200" />
                        Edit Profile
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => window.print()}
                        className="group h-9 min-h-[36px] px-4 text-xs font-semibold bg-white text-[#2F4F97] border border-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] gap-1.5 shadow-sm transition-all duration-200 rounded-lg inline-flex items-center justify-center cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#2F4F97] group-hover:text-white transition-colors duration-200" />
                        Save PDF
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => window.print()}
                        className="group h-9 min-h-[36px] px-4 text-xs font-semibold bg-white text-[#2F4F97] border border-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] gap-1.5 shadow-sm transition-all duration-200 rounded-lg inline-flex items-center justify-center cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#2F4F97] group-hover:text-white transition-colors duration-200" />
                        Print
                      </Button>
                    </div>

                    {/* Right: Status Box & Submit Application */}
                    <div className="flex items-center gap-2 shrink-0">
                      {mode === "admin" ? (
                        <Select
                          value={student.status}
                          onValueChange={handleSaveStatusTracker}
                          disabled={savingStatus}
                        >
                          <SelectTrigger className={`h-9 min-h-[36px] px-3.5 flex items-center justify-center text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm ${statusColors[student.status] || "bg-gray-50 border-gray-200 text-gray-700"}`}>
                            {savingStatus ? (
                              <div className="h-3 w-3 border-2 border-[#2F4F97]/30 border-t-[#2F4F97] animate-spin rounded-full mx-2" />
                            ) : (
                              <SelectValue placeholder="Select Status" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className={`h-9 min-h-[36px] px-3.5 flex items-center justify-center text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm ${statusColors[student.status] || "bg-gray-50 border-gray-200 text-gray-700"}`}>
                          {getStatusLabel(student.status) || student.status}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            </div>

        <Tabs defaultValue={defaultTab} className="w-full space-y-6">
          <TabsList className="flex w-full h-12 bg-transparent p-0 no-print gap-8 rounded-none justify-start">
            <TabsTrigger value="profile" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">1. Profile</TabsTrigger>
            <TabsTrigger value="documents" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">2. Documents</TabsTrigger>
            <TabsTrigger value="applications" className="text-[13px] font-semibold h-12 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2F4F97] data-[state=active]:text-[#2F4F97] data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent text-gray-500 uppercase tracking-wide">3. Applications</TabsTrigger>
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
                                {app.universities?.name || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 break-words whitespace-normal leading-tight">
                                {app.courses?.title || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-gray-900 whitespace-nowrap">
                                {app.courses?.intake_months?.[0] || "—"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {mode === "admin" ? (
                                  <Select
                                    value={app.status}
                                    onValueChange={async (newStatus) => {
                                      try {
                                        const { error } = await supabase
                                          .from("student_applications")
                                          .update({ status: newStatus })
                                          .eq("id", app.id);
                                        if (error) throw error;
                                        setApplications(applications.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
                                        toast.success("Application status updated");
                                      } catch (err: any) {
                                        toast.error("Failed to update application status");
                                      }
                                    }}
                                  >
                                    <SelectTrigger className={`h-7 min-w-[120px] text-[10px] font-semibold border-transparent shadow-sm ${statusColors[app.status] || "bg-gray-100 text-gray-800"}`}>
                                      <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.filter(o => o.value !== "new").map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge variant="outline" className={`${statusColors[app.status] || "bg-gray-100 text-gray-800"} text-[10px] px-2 border-transparent whitespace-nowrap`}>
                                    {getStatusLabel(app.status)}
                                  </Badge>
                                )}
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
            {/* ── Main Single Card Container for All Documents ──────────── */}
            <Card className="print:border-none print:shadow-none border border-gray-200 shadow-sm">
              <CardContent className="p-6 sm:p-7 print:p-0 space-y-8">
                
                {/* Documents Card Header */}
                <div className="bg-[#2F4F97] p-4 sm:p-5 rounded-lg text-white no-print">
                  <h3 className="text-base font-bold text-white">Student Documents</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Identification, academic transcripts, certificates, language test results, and supporting records</p>
                </div>

                <div className="space-y-0 max-h-[475px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                  {/* Passport Size Photo */}
                  {(() => {
                    const url = getDocUrl("passport_photo_url");
                    const isUploading = uploading["passport_photo_url"];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Passport Size Photo</h4>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">1. Size must be 35mm X 45mm &nbsp;|&nbsp; 2. Must be White Background &nbsp;|&nbsp; 3. Avoid white color dress</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current["passport_photo_url"] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc("passport_photo_url", file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current["passport_photo_url"]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc("passport_photo_url")}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Full Passport Scan Copy */}
                  {(() => {
                    const url = getDocUrl("passport_url");
                    const isUploading = uploading["passport_url"];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Full Passport Scan Copy</h4>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">Scan all the pages of your passport and make a pdf file</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current["passport_url"] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc("passport_url", file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current["passport_url"]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc("passport_url")}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Academic Transcripts & Certificates grouped by degree level */}
                  {academicDegreeLevels.map((lvl) => {
                    const transcriptDocKey = `transcript_${lvl.key}`;
                    const transcriptUrl = getDocUrl(transcriptDocKey);
                    const isTranscriptUploading = uploading[transcriptDocKey];

                    const certDocKey = `certificate_${lvl.key}`;
                    const certUrl = getDocUrl(certDocKey);
                    const isCertUploading = uploading[certDocKey];

                    return (
                      <div key={lvl.key} className="contents">
                        {/* Transcript */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm text-[#1E293B]">{lvl.label} - Transcript</h4>
                              {transcriptUrl && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 italic">Official academic transcript / mark sheet for {lvl.label}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[transcriptDocKey] = el; }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDoc(transcriptDocKey, file);
                                e.target.value = "";
                              }}
                            />
                            {transcriptUrl && (
                              <a
                                href={transcriptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                              >
                                Preview
                              </a>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isTranscriptUploading}
                              onClick={() => fileInputRefs.current[transcriptDocKey]?.click()}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                            >
                              {isTranscriptUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                              {transcriptUrl ? "Replace" : "Upload"}
                            </Button>
                            {transcriptUrl && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isTranscriptUploading}
                                onClick={() => handleDeleteDoc(transcriptDocKey)}
                                className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Certificate */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm text-[#1E293B]">{lvl.label} - Certificate</h4>
                              {certUrl && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 italic">Official certificate / provisional certificate for {lvl.label}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[certDocKey] = el; }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDoc(certDocKey, file);
                                e.target.value = "";
                              }}
                            />
                            {certUrl && (
                              <a
                                href={certUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                              >
                                Preview
                              </a>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isCertUploading}
                              onClick={() => fileInputRefs.current[certDocKey]?.click()}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                            >
                              {isCertUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                              {certUrl ? "Replace" : "Upload"}
                            </Button>
                            {certUrl && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isCertUploading}
                                onClick={() => handleDeleteDoc(certDocKey)}
                                className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Language Test Certificate */}
                  {(() => {
                    const url = getDocUrl("ielts_certificate_url");
                    const isUploading = uploading["ielts_certificate_url"];

                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Language Test Certificate</h4>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500 whitespace-nowrap font-normal">Test:</span>
                              <Select
                                value={student?.language_test_name || student?.english_test_type || "IELTS"}
                                onValueChange={(val) => handleUpdateLanguageTestType(val)}
                                disabled={!!url || isUploading}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs font-semibold bg-gray-50 border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                  <SelectValue placeholder="Select Test" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {languageTestOptions.map((t) => (
                                    <SelectItem key={t.id} value={t.id} className="text-xs">
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">Upload your official language test certificate</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current["ielts_certificate_url"] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc("ielts_certificate_url", file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current["ielts_certificate_url"]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc("ielts_certificate_url")}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Statement of Purpose (SOP) */}
                  {(() => {
                    const url = getDocUrl("personal_statement_url");
                    const isUploading = uploading["personal_statement_url"];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Statement of Purpose (SOP)</h4>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">Personal statement or essay explaining academic intent and motivation</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current["personal_statement_url"] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc("personal_statement_url", file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current["personal_statement_url"]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc("personal_statement_url")}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Recommendation Letter */}
                  {(() => {
                    const url = getDocUrl("recommendation_letter_url");
                    const isUploading = uploading["recommendation_letter_url"];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Recommendation Letter</h4>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">Letter of recommendation from teacher, professor, or employer</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current["recommendation_letter_url"] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc("recommendation_letter_url", file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current["recommendation_letter_url"]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc("recommendation_letter_url")}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Job Experience (If any) */}
                  {(() => {
                    const docKey = "job_experience_url";
                    const url = getDocUrl(docKey);
                    const isUploading = uploading[docKey];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Job Experience (If any)</h4>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">Employment certificates, appointment letters, or payslips (if applicable)</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[docKey] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc(docKey, file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current[docKey]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc(docKey)}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Study Gap Evidence Documents */}
                  {(() => {
                    const docKey = "study_gap_url";
                    const url = getDocUrl(docKey);
                    const isUploading = uploading[docKey];
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-200 last:border-b-0 gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-[#1E293B]">Study Gap Evidence Documents</h4>
                            {url && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 italic">Official documents explaining study gap (e.g. employment, courses, medical certificate)</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[docKey] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDoc(docKey, file);
                              e.target.value = "";
                            }}
                          />
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white hover:border-[#2F4F97] shadow-sm transition-colors"
                            >
                              Preview
                            </a>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current[docKey]?.click()}
                            className="h-8 px-3 text-xs font-semibold rounded-lg text-gray-700 hover:text-white hover:bg-[#2F4F97] hover:border-[#2F4F97] border-gray-200 shadow-sm transition-colors"
                          >
                            {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                            {url ? "Replace" : "Upload"}
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isUploading}
                              onClick={() => handleDeleteDoc(docKey)}
                              className="h-8 px-3 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 mt-0">
            {/* ── Main Single Column Layout ────────────────────────────── */}
            <Card className="print:border-none print:shadow-none border border-gray-200 shadow-sm">
              <CardContent className="p-6 sm:p-7 print:p-0 space-y-6">
                
                {/* Profile Card Header */}
                <div className="bg-[#2F4F97] p-4 sm:p-5 rounded-lg text-white no-print">
                  <h3 className="text-base font-bold text-white">Student Profile</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Personal, academic, and contact information</p>
                </div>

                {/* ── Section 1: Personal Information ── */}
                <div>
                  <div className="flex items-center gap-2.5 pb-4">
                    <User className="h-4 w-4 text-[#2F4F97]" />
                    <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      Personal Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <InfoRow label="Full Name" value={student.full_name} />
                    <InfoRow label="Email" value={student.email} />
                    <InfoRow label="Phone" value={student.phone} />
                    <InfoRow label="Gender" value={student.gender} />
                    <InfoRow label="Nationality" value={student.nationality} />
                    <InfoRow label="Passport Number" value={student.passport_number} />
                    
                    {/* Passport Expiry & Validation */}
                    <div className="flex flex-col gap-1.5 py-1">
                      <span className="text-xs font-semibold text-[#2F4F97] uppercase tracking-wider">
                        Passport Expiry
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium leading-snug ${!student.passport_expiry_date ? "text-amber-600/80 italic text-xs flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2.5 py-1 rounded-2xl border border-amber-200/30 w-fit" : "text-[#1E293B]"}`}>
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
                </div>

                {/* ── Section 2: Academic Background ── */}
                <div className="border-t border-border/30 pt-5 print:border-none">
                  <div className="flex items-center gap-2.5 pb-4">
                    <GraduationCap className="h-4 w-4 text-[#2F4F97]" />
                    <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      Academic Background
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <InfoRow label="Level of Education" value={student.previous_degree} />
                    <InfoRow label="Institution" value={student.previous_institution} />
                    <InfoRow label="Major / Stream" value={student.major} />
                    <InfoRow label="GPA / CGPA" value={student.gpa || null} />
                  </div>
                </div>

                {/* ── Section 3: Language Proficiency ── */}
                <div className="border-t border-border/30 pt-5 print:border-none">
                  <div className="flex items-center gap-2.5 pb-4">
                    <Languages className="h-4 w-4 text-[#2F4F97]" />
                    <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      Language Proficiency
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <InfoRow label="Proficiency Test" value={student.language_test_name || student.english_test_type} />
                    <InfoRow
                      label="Score / Status"
                      value={
                        (student.language_test_name === "MOI" || student.english_test_type === "MOI")
                          ? "MOI (No Score Required)"
                          : (student.ielts_score ? student.ielts_score.toString() : student.english_test_score)
                      }
                    />
                  </div>
                </div>

                {/* ── Section 4: Emergency Contact / Guardian ── */}
                {(student.guardian_name || student.guardian_phone || student.guardian_email || student.guardian_relationship) && (
                  <div className="border-t border-border/30 pt-5 print:border-none">
                    <div className="flex items-center gap-2.5 pb-4">
                      <ShieldAlert className="h-4 w-4 text-[#2F4F97]" />
                      <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                        Emergency Contact
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <InfoRow label="Guardian Name" value={student.guardian_name} />
                      <InfoRow label="Relationship" value={student.guardian_relationship} />
                      <InfoRow label="Phone" value={student.guardian_phone} />
                      <InfoRow label="Email" value={student.guardian_email} />
                    </div>
                  </div>
                )}

                {/* ── Section 5: Submitted By ── */}
                <div className="border-t border-border/30 pt-5 print:border-none">
                  <div className="flex items-center gap-2.5 pb-4">
                    <Building2 className="h-4 w-4 text-[#2F4F97]" />
                    <h4 className="text-[13px] font-bold text-[#1E293B] uppercase tracking-wide">
                      Submitted By
                    </h4>
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

          {/* Right Column: Chat & Discussion Widget (3 cols on XL) */}
          <div className="xl:col-span-3 xl:sticky xl:top-[76px] xl:self-start no-print">
            <StudentChatWidget
              student={student}
              session={session}
              user={user}
              mode={mode}
              partner={partner}
            />
          </div>

        </div>
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
