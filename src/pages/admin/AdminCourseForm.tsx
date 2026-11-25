import { useState, useEffect, useMemo } from "react";
import { useTableData, useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface AdminCourseFormProps {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const DEGREE_LEVELS = ["Foundation", "Diploma", "Advanced Diploma", "Certificate", "Bachelor", "Master", "PhD"];
export const STUDY_AREAS = [
  "Business & Management",
  "Engineering",
  "Computer Science & IT",
  "Medicine & Health",
  "Arts & Design",
  "Natural Sciences",
  "Law",
  "Social Sciences"
];

export const CLASS_TYPES = [
  "Physical",
  "Online",
  "Hybrid (Online + Offline)",
];

export const COURSE_TYPES = [
  "Taught Course",
  "Research Type",
];

export const ENGLISH_TEST_OPTIONS = [
  { value: "IELTS", label: "IELTS" },
  { value: "TOEFL iBT", label: "TOEFL iBT" },
  { value: "PTE Academic", label: "PTE Academic" },
  { value: "Duolingo", label: "Duolingo" },
  { value: "Cambridge English", label: "Cambridge English" },
  { value: "Linguaskill", label: "Linguaskill" },
  { value: "OET", label: "OET" },
  { value: "MUET", label: "MUET" },
  { value: "MOI", label: "MOI (Medium of Instruction)" },
];

export const YEAR_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1 Year" },
  { value: "2", label: "2 Years" },
  { value: "3", label: "3 Years" },
  { value: "4", label: "4 Years" },
  { value: "5", label: "5 Years" },
  { value: "6", label: "6 Years" },
];

export const MONTH_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1 Month" },
  { value: "2", label: "2 Months" },
  { value: "3", label: "3 Months" },
  { value: "4", label: "4 Months" },
  { value: "5", label: "5 Months" },
  { value: "6", label: "6 Months" },
  { value: "7", label: "7 Months" },
  { value: "8", label: "8 Months" },
  { value: "9", label: "9 Months" },
  { value: "10", label: "10 Months" },
  { value: "11", label: "11 Months" },
];

export const parseDuration = (raw: string): { years: string; months: string } => {
  if (!raw || !raw.trim()) {
    return { years: "0", months: "0" };
  }
  const str = raw.trim();

  // Match years and months if present, e.g. "1 Year 5 Months", "2 Years", "6 Months"
  const yearMatch = str.match(/([\d.]+)\s*(?:year|yr)s?/i);
  const monthMatch = str.match(/([\d.]+)\s*(?:month|mo)s?/i);

  if (yearMatch || monthMatch) {
    return {
      years: yearMatch ? yearMatch[1] : "0",
      months: monthMatch ? monthMatch[1] : "0",
    };
  }

  // If there's no unit keyword, check if it's just a number like "3" or "1.5"
  const numMatch = str.match(/^([\d.]+)$/);
  if (numMatch) {
    return { years: numMatch[1], months: "0" };
  }

  return { years: "0", months: "0" };
};

export const formatDuration = (years: string, months: string): string => {
  const yNum = parseFloat(years);
  const mNum = parseFloat(months);

  const hasY = !isNaN(yNum) && yNum > 0;
  const hasM = !isNaN(mNum) && mNum > 0;

  const parts: string[] = [];

  if (hasY) {
    const unit = yNum === 1 ? "Year" : "Years";
    parts.push(`${years} ${unit}`);
  }

  if (hasM) {
    const unit = mNum === 1 ? "Month" : "Months";
    parts.push(`${months} ${unit}`);
  }

  return parts.join(" ");
};

const cleanFeeValue = (feeStr: string | number | undefined | null) => {
  if (!feeStr) return "";
  return String(feeStr).replace(/^(MYR|RM)\s*/i, "").trim();
};

const cleanEntryRequirements = (reqs: any): Record<string, string> => {
  if (!reqs || typeof reqs !== "object") return {};
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(reqs)) {
    if (k.toUpperCase() === "MOI" || String(v).toLowerCase() === "accepted") {
      cleaned[k] = "Accepted";
    } else {
      let numStr = String(v ?? "").replace(/[^0-9.]/g, "");
      const parts = numStr.split(".");
      if (parts.length > 2) {
        numStr = parts[0] + "." + parts.slice(1).join("");
      }
      cleaned[k] = numStr;
    }
  }
  return cleaned;
};

export default function AdminCourseForm({ initialData, onCancel, onSuccess }: AdminCourseFormProps) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("courses");
  const updateRow = useUpdateRow("courses");
  const { data: universities } = useTableData("universities", { orderBy: "name" });
  const { data: deptData } = useTableData("departments", { orderBy: "name" });
  const insertDept = useInsertRow("departments");

  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  const [form, setForm] = useState({
    title: "",
    university_id: "",
    campus: "",
    degree_level: "",
    category: "",
    intake_months: [] as string[],
    offer_letter: "",
    duration: "",
    entry_requirements: {} as Record<string, string>,
    entry_requirements_text: "",
    class_type: "Physical",
    course_type: "Taught Course",
    yearly_fees: [] as { year: string; fee: string }[],
    scholarship: 0 as number | string,
    other_fees: [] as { description: string; fee: string }[],
    overview: "",
    curriculum: [] as { year: string; modules: string[] }[],
    career_outcomes: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [newCareerTag, setNewCareerTag] = useState("");
  const [durationYears, setDurationYears] = useState<string>(() => parseDuration(initialData?.duration || "").years || "0");
  const [durationMonths, setDurationMonths] = useState<string>(() => parseDuration(initialData?.duration || "").months || "0");
  const [feeScheduleType, setFeeScheduleType] = useState<"yearly" | "semester">("yearly");

  const allYearOptions = useMemo(() => {
    if (durationYears && durationYears !== "0" && !YEAR_OPTIONS.some(o => o.value === durationYears)) {
      return [...YEAR_OPTIONS, { value: durationYears, label: `${durationYears} ${Number(durationYears) === 1 ? "Year" : "Years"}` }];
    }
    return YEAR_OPTIONS;
  }, [durationYears]);

  const allMonthOptions = useMemo(() => {
    if (durationMonths && durationMonths !== "0" && !MONTH_OPTIONS.some(o => o.value === durationMonths)) {
      return [...MONTH_OPTIONS, { value: durationMonths, label: `${durationMonths} ${Number(durationMonths) === 1 ? "Month" : "Months"}` }];
    }
    return MONTH_OPTIONS;
  }, [durationMonths]);

  const handleYearsChange = (val: string) => {
    setDurationYears(val);
    const formatted = formatDuration(val, durationMonths);
    setForm(prev => ({ ...prev, duration: formatted }));
  };

  const handleMonthsChange = (val: string) => {
    setDurationMonths(val);
    const formatted = formatDuration(durationYears, val);
    setForm(prev => ({ ...prev, duration: formatted }));
  };

  const isOfferLetterFree = useMemo(() => {
    if (!form.offer_letter) return false;
    const lower = String(form.offer_letter).trim().toLowerCase();
    return lower === "free" || lower.startsWith("free");
  }, [form.offer_letter]);

  // Automatically detect if initial fees were semester-wise or yearly
  useEffect(() => {
    if (initialData?.yearly_fees && Array.isArray(initialData.yearly_fees)) {
      const hasSemester = initialData.yearly_fees.some((yf: any) =>
        String(yf.year || "").toLowerCase().includes("semester")
      );
      if (hasSemester) {
        setFeeScheduleType("semester");
      }
    }
  }, [initialData]);

  const getFeePeriodLabel = (index: number, type: "yearly" | "semester") => {
    const num = index + 1;
    const suffix = num === 1 ? "1st" : num === 2 ? "2nd" : num === 3 ? "3rd" : `${num}th`;
    const unit = type === "semester" ? "Semester" : "Year";
    return `${suffix} ${unit}`;
  };

  const handleScheduleTypeChange = (newType: "yearly" | "semester") => {
    setFeeScheduleType(newType);
    setForm(prev => ({
      ...prev,
      yearly_fees: prev.yearly_fees.map((yf, idx) => ({
        ...yf,
        year: getFeePeriodLabel(idx, newType),
      })),
    }));
  };

  const maxFeePeriods = useMemo(() => {
    const y = parseFloat(durationYears);
    const m = parseFloat(durationMonths);
    const hasY = !isNaN(y) && y > 0;
    const hasM = !isNaN(m) && m > 0;
    if (!hasY && !hasM) return null;

    const totalMonths = (hasY ? y * 12 : 0) + (hasM ? m : 0);
    if (totalMonths <= 0) return null;

    if (feeScheduleType === "yearly") {
      return Math.max(1, Math.ceil(totalMonths / 12));
    } else {
      // Semester wise (approx 6 months per semester)
      return Math.max(1, Math.ceil(totalMonths / 6));
    }
  }, [durationYears, durationMonths, feeScheduleType]);

  const isMaxPeriodsReached = Boolean(maxFeePeriods !== null && form.yearly_fees.length >= maxFeePeriods);

  const addFeePeriod = () => {
    if (!form.duration || maxFeePeriods === null) {
      toast.error("Please select course duration first.");
      return;
    }
    if (maxFeePeriods !== null && form.yearly_fees.length >= maxFeePeriods) {
      toast.error(`Cannot add more than ${maxFeePeriods} ${feeScheduleType === "yearly" ? "years" : "semesters"} for a ${form.duration} course.`);
      return;
    }
    setForm(p => ({
      ...p,
      yearly_fees: [
        ...p.yearly_fees,
        { year: getFeePeriodLabel(p.yearly_fees.length, feeScheduleType), fee: "" },
      ],
    }));
  };

  const removeYearlyFee = (idx: number) => {
    setForm(prev => {
      const filtered = prev.yearly_fees.filter((_, i) => i !== idx);
      return {
        ...prev,
        yearly_fees: filtered.map((yf, i) => ({
          ...yf,
          year: getFeePeriodLabel(i, feeScheduleType),
        })),
      };
    });
  };

  const totalYearlyFees = useMemo(() => {
    const sum = form.yearly_fees.reduce((acc, item) => {
      const clean = String(item.fee || "").replace(/[^0-9.]/g, "");
      const val = parseFloat(clean);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const scholarshipVal = parseFloat(String(form.scholarship || "0").replace(/[^0-9.]/g, "")) || 0;
    return Math.max(0, sum - scholarshipVal);
  }, [form.yearly_fees, form.scholarship]);

  const selectedUni = universities?.find((u: any) => u.id === form.university_id);

  // Extract campuses that were configured previously for the selected university
  const availableCampuses: string[] = useMemo(() => {
    if (!selectedUni) return [];
    if (Array.isArray(selectedUni.campuses) && selectedUni.campuses.length > 0) {
      return selectedUni.campuses.filter(Boolean);
    }
    if (typeof selectedUni.city === "string" && selectedUni.city.trim()) {
      return selectedUni.city
        .split(/[,;&]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [selectedUni]);

  // Merge default study areas, departments table records, and current form value
  const allDepartments = useMemo(() => {
    const set = new Set<string>(STUDY_AREAS);
    if (deptData && Array.isArray(deptData)) {
      deptData.forEach((d: any) => {
        if (d.name && typeof d.name === "string" && d.name.trim()) {
          set.add(d.name.trim());
        }
      });
    }
    if (form.category && form.category.trim()) {
      set.add(form.category.trim());
    }
    return Array.from(set).sort();
  }, [deptData, form.category]);

  const handleCreateDepartment = async () => {
    const trimmed = newDeptName.trim();
    if (!trimmed) {
      toast.error("Please enter a department name");
      return;
    }

    setIsCreatingDept(true);
    try {
      try {
        await insertDept.mutateAsync({ name: trimmed });
      } catch (dbErr: any) {
        console.warn("Could not insert to departments table (migration may be pending):", dbErr);
      }
      setForm(prev => ({ ...prev, category: trimmed }));
      setNewDeptName("");
      setIsAddingDept(false);
      toast.success(`Department "${trimmed}" added and selected`);
    } catch (err: any) {
      toast.error(`Failed to add department: ${err.message || err}`);
    } finally {
      setIsCreatingDept(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      const parsed = parseDuration(initialData.duration || "");
      setDurationYears(parsed.years || "0");
      setDurationMonths(parsed.months || "0");

      setForm({
        title: initialData.title || "",
        university_id: initialData.university_id || "",
        campus: initialData.campus || "",
        degree_level: initialData.degree_level || "",
        category: initialData.category || "",
        intake_months: Array.isArray(initialData.intake_months) ? initialData.intake_months : [],
        offer_letter: initialData.offer_letter || "",
        duration: initialData.duration || "",
        entry_requirements: cleanEntryRequirements(initialData.entry_requirements),
        entry_requirements_text: initialData.entry_requirements_text || "",
        class_type: initialData.class_type || "Physical",
        course_type: initialData.course_type || "Taught Course",
        yearly_fees: Array.isArray(initialData.yearly_fees) ? initialData.yearly_fees : [],
        scholarship: initialData.scholarship !== undefined ? initialData.scholarship : 0,
        other_fees: Array.isArray(initialData.other_fees) ? initialData.other_fees : [],
        overview: initialData.overview || "",
        curriculum: Array.isArray(initialData.curriculum) ? initialData.curriculum : [],
        career_outcomes: Array.isArray(initialData.career_outcomes) ? initialData.career_outcomes : [],
      });

      // If heavy fields (overview, curriculum, yearly fees) were omitted by lightweight list projection,
      // load the full row for this single course in background (~50ms)
      if (initialData.id && (initialData.overview === undefined || initialData.curriculum === undefined)) {
        supabase
          .from("courses")
          .select("*")
          .eq("id", initialData.id)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              const d = data as any;
              if (d.duration !== undefined) {
                const parsedFull = parseDuration(d.duration || "");
                setDurationYears(parsedFull.years || "0");
                setDurationMonths(parsedFull.months || "0");
              }
              setForm(prev => ({
                title: d.title || prev.title,
                university_id: d.university_id || prev.university_id,
                campus: d.campus || prev.campus,
                degree_level: d.degree_level || prev.degree_level,
                category: d.category || prev.category,
                intake_months: Array.isArray(d.intake_months) ? d.intake_months.map(String) : prev.intake_months,
                offer_letter: d.offer_letter || prev.offer_letter,
                duration: d.duration || prev.duration,
                entry_requirements: cleanEntryRequirements(d.entry_requirements || prev.entry_requirements),
                entry_requirements_text: d.entry_requirements_text || prev.entry_requirements_text,
                class_type: d.class_type || prev.class_type || "Physical",
                course_type: d.course_type || prev.course_type || "Taught Course",
                yearly_fees: Array.isArray(d.yearly_fees) ? (d.yearly_fees as { year: string; fee: string }[]) : prev.yearly_fees,
                scholarship: d.scholarship !== undefined ? d.scholarship : prev.scholarship,
                other_fees: Array.isArray(d.other_fees) ? (d.other_fees as { description: string; fee: string }[]) : prev.other_fees,
                overview: d.overview || prev.overview,
                curriculum: Array.isArray(d.curriculum) ? (d.curriculum as { year: string; modules: string[] }[]) : prev.curriculum,
                career_outcomes: Array.isArray(d.career_outcomes) ? d.career_outcomes.map(String) : prev.career_outcomes,
              }));
            }
          });
      }
    }
  }, [initialData]);

  const extractMissingColumn = (message?: string) => {
    if (!message) return null;
    const m1 = message.match(/Could not find the '([^']+)' column/i);
    if (m1) return m1[1];
    const m2 = message.match(/column "?([^"\s]+)"? of relation/i);
    if (m2) return m2[1];
    const m3 = message.match(/column [a-zA-Z0-9_]+\.([a-zA-Z0-9_]+) does not exist/i);
    if (m3) return m3[1];
    const m4 = message.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i);
    if (m4) return m4[1];
    return null;
  };

  const handleSave = async () => {
    if (!form.title || !form.university_id) {
      toast.error("Please fill in the required fields (Title and University)");
      return;
    }

    if (maxFeePeriods !== null && form.yearly_fees.length > maxFeePeriods) {
      toast.error(`Course duration is ${form.duration}. You cannot have more than ${maxFeePeriods} ${feeScheduleType === "yearly" ? "years" : "semesters"} of tuition fees.`);
      return;
    }

    let currentPayload: Record<string, any> = { ...form };

    // Automatically sync tuition_fee with the 1st year fee so catalog cards,
    // search filters, and sorting that query tuition_fee work seamlessly
    if (form.yearly_fees && form.yearly_fees.length > 0) {
      if (feeScheduleType === "semester" && form.yearly_fees.length >= 2) {
        const s1 = parseFloat(String(form.yearly_fees[0]?.fee || "").replace(/[^0-9.]/g, "")) || 0;
        const s2 = parseFloat(String(form.yearly_fees[1]?.fee || "").replace(/[^0-9.]/g, "")) || 0;
        const annual = s1 + s2;
        if (annual > 0) {
          currentPayload.tuition_fee = annual;
        }
      } else {
        const firstYearFee = form.yearly_fees[0]?.fee;
        if (firstYearFee) {
          const parsedNum = parseFloat(String(firstYearFee).replace(/[^0-9.]/g, ""));
          if (!isNaN(parsedNum) && parsedNum > 0) {
            currentPayload.tuition_fee = parsedNum;
          }
        }
      }
    }
    currentPayload.scholarship = parseFloat(String(form.scholarship || "0").replace(/[^0-9.]/g, "")) || 0;

    const missingColumns: string[] = [];
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (isEditing) {
          await updateRow.mutateAsync({ id: initialData.id, ...currentPayload });
          toast.success(
            missingColumns.length > 0
              ? `Course updated! (Run migration to persist ${missingColumns.join(", ")} column in DB)`
              : "Course updated successfully"
          );
        } else {
          await insertRow.mutateAsync(currentPayload);
          toast.success(
            missingColumns.length > 0
              ? `Course created! (Run migration to persist ${missingColumns.join(", ")} column in DB)`
              : "Course created successfully"
          );
        }
        onSuccess();
        return;
      } catch (error: any) {
        const missingCol = extractMissingColumn(error?.message);
        if (missingCol && missingCol in currentPayload) {
          delete currentPayload[missingCol];
          missingColumns.push(missingCol);
          continue;
        }
        toast.error(`Save failed: ${error?.message || error}`);
        return;
      }
    }
  };

  const addTag = (field: "intake_months" | "career_outcomes", val: string, setVal: (v: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !form[field].includes(trimmed)) {
      setForm(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
      setVal("");
    }
  };

  const removeTag = (field: "intake_months" | "career_outcomes", idx: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  // English Requirements Handlers
  const addEnglishReq = () => {
    const existingKeys = Object.keys(form.entry_requirements);
    const availableTest = ENGLISH_TEST_OPTIONS.find(t => !existingKeys.includes(t.value));
    const newKey = availableTest ? availableTest.value : (existingKeys.includes("IELTS") ? `Test ${existingKeys.length + 1}` : "IELTS");
    const initialVal = newKey === "MOI" ? "Accepted" : "";

    setForm(prev => ({
      ...prev,
      entry_requirements: {
        ...prev.entry_requirements,
        [newKey]: initialVal,
      },
    }));
  };
  const updateEnglishReqKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    setForm(prev => {
      const newReqs = { ...prev.entry_requirements };
      const currentVal = newReqs[oldKey];
      delete newReqs[oldKey];
      const isMOI = newKey === "MOI";
      newReqs[newKey] = isMOI ? "Accepted" : (currentVal === "Accepted" ? "" : currentVal || "");
      return { ...prev, entry_requirements: newReqs };
    });
  };
  const updateEnglishReqScore = (key: string, rawScore: string) => {
    let clean = rawScore.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
    setForm(prev => ({
      ...prev,
      entry_requirements: {
        ...prev.entry_requirements,
        [key]: clean,
      },
    }));
  };
  const removeEnglishReq = (key: string) => {
    setForm(prev => {
      const newReqs = { ...prev.entry_requirements };
      delete newReqs[key];
      return { ...prev, entry_requirements: newReqs };
    });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col h-full max-w-5xl mx-auto my-6">
      <div className="flex items-center justify-between p-6 border-b shrink-0 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm border" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold text-[#1E293B]">
            {isEditing ? "Edit Course" : "Add New Course"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>
            {isEditing ? "Update Course" : "Save Course"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Group 1: Basic Info & Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Course Title *</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} 
              placeholder="e.g. BSc (Hons) Computer Science" 
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">University *</Label>
            <Select
              value={form.university_id || undefined}
              onValueChange={(newUniId) => {
                setForm(prev => ({
                  ...prev,
                  university_id: newUniId,
                  campus: "", // reset campus when university changes
                }));
              }}
              modal={false}
            >
              <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm">
                <SelectValue placeholder="Select University..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {universities?.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campus selection dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Campus</Label>
              {availableCampuses.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {availableCampuses.length} {availableCampuses.length === 1 ? "campus" : "campuses"} available
                </span>
              )}
            </div>
            <Select
              value={form.campus || undefined}
              onValueChange={(val) => setForm(prev => ({ ...prev, campus: val === "none" ? "" : val }))}
              disabled={!form.university_id}
              modal={false}
            >
              <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm">
                <SelectValue
                  placeholder={
                    !form.university_id
                      ? "Select a university first..."
                      : availableCampuses.length === 0
                        ? "No campuses configured for this university"
                        : "Select Campus..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="none">None / Default</SelectItem>
                {availableCampuses.map((camp: string) => (
                  <SelectItem key={camp} value={camp}>{camp}</SelectItem>
                ))}
                {availableCampuses.length > 1 && (
                  <SelectItem value="All Campuses">All Campuses</SelectItem>
                )}
                {form.campus && !availableCampuses.includes(form.campus) && form.campus !== "All Campuses" && form.campus !== "none" && (
                  <SelectItem value={form.campus}>{form.campus}</SelectItem>
                )}
              </SelectContent>
            </Select>
            {form.university_id && availableCampuses.length === 0 && (
              <p className="text-[11px] text-amber-600">
                Tip: Configure campuses for this university in the Universities section.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Qualification Level</Label>
            <Select
              value={form.degree_level || undefined}
              onValueChange={(val) => setForm(prev => ({ ...prev, degree_level: val }))}
              modal={false}
            >
              <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm">
                <SelectValue placeholder="Select Qualification..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {DEGREE_LEVELS.map(lvl => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Department / Study Area</Label>

            {isAddingDept ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <Input
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateDepartment();
                    } else if (e.key === "Escape") {
                      setIsAddingDept(false);
                      setNewDeptName("");
                    }
                  }}
                  placeholder="Type new department (e.g. Hospitality & Tourism)..."
                  className="h-10 text-sm bg-white"
                  autoFocus
                  disabled={isCreatingDept}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateDepartment}
                  disabled={isCreatingDept || !newDeptName.trim()}
                  className="h-10 px-4 text-xs font-semibold"
                >
                  {isCreatingDept ? "Adding..." : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingDept(false);
                    setNewDeptName("");
                  }}
                  disabled={isCreatingDept}
                  className="h-10 px-3 shrink-0 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Select
                  value={form.category || undefined}
                  onValueChange={(val) => setForm(prev => ({ ...prev, category: val }))}
                  modal={false}
                >
                  <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm">
                    <SelectValue placeholder="Select Department / Study Area..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {allDepartments.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingDept(true)}
                  className="h-10 px-3 text-xs shrink-0 whitespace-nowrap"
                  title="Add a new department"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add New
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Duration</Label>
              {form.duration ? (
                <span className="text-xs font-semibold text-[#2F4F97] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  {form.duration}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic font-normal">Not selected</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-medium">Years</span>
                <Select
                  value={durationYears || "0"}
                  onValueChange={handleYearsChange}
                  modal={false}
                >
                  <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700">
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allYearOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-medium">Months</span>
                <Select
                  value={durationMonths || "0"}
                  onValueChange={handleMonthsChange}
                  modal={false}
                >
                  <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3 h-10 text-sm text-gray-700">
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allMonthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[13px] font-semibold text-gray-700">Intake Months</Label>
              <Button size="sm" type="button" onClick={() => addTag("intake_months", newTag, setNewTag)} className="h-7 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="flex gap-2">
              <Select
                value={newTag || undefined}
                onValueChange={(val) => setNewTag(val)}
                modal={false}
              >
                <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm">
                  <SelectValue placeholder="Select Month..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.intake_months.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-3 py-1 rounded-full text-gray-700">
                  {m} <button type="button" onClick={() => removeTag("intake_months", i)} className="text-red-500 font-bold ml-1 hover:text-red-700">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[13px] font-semibold text-gray-700">English Requirements</Label>
              <Button type="button" size="sm" onClick={addEnglishReq} className="h-7 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(form.entry_requirements).length === 0 && (
                <p className="text-xs text-muted-foreground italic">No English requirements added.</p>
              )}
              {Object.entries(form.entry_requirements).map(([key, val], i) => {
                const isMOI = key.toUpperCase() === "MOI";
                return (
                  <div key={i} className="flex gap-2 items-center">
                    <Select
                      value={key}
                      onValueChange={(newKey) => updateEnglishReqKey(key, newKey)}
                      modal={false}
                    >
                      <SelectTrigger className="w-1/2 h-10 rounded-md border border-input bg-background px-3 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {ENGLISH_TEST_OPTIONS.map((t) => {
                          const isAlreadyUsed = t.value !== key && form.entry_requirements[t.value] !== undefined;
                          return (
                            <SelectItem key={t.value} value={t.value} disabled={isAlreadyUsed}>
                              {t.label} {isAlreadyUsed ? "(Already added)" : ""}
                            </SelectItem>
                          );
                        })}
                        {!ENGLISH_TEST_OPTIONS.some(t => t.value === key) && (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Input 
                      type="text"
                      inputMode="decimal"
                      placeholder={isMOI ? "No score required" : "e.g. 6.0"} 
                      value={isMOI ? "MOI (No Score Required)" : (val ?? "")} 
                      disabled={isMOI}
                      className={`w-1/2 h-10 ${isMOI ? "bg-slate-50 text-slate-400 cursor-not-allowed select-none" : ""}`}
                      onKeyDown={(e) => {
                        if (isMOI) return;
                        if (
                          ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key) ||
                          (e.ctrlKey || e.metaKey)
                        ) {
                          return;
                        }
                        if (e.key >= "0" && e.key <= "9") {
                          return;
                        }
                        if (e.key === "." && !e.currentTarget.value.includes(".")) {
                          return;
                        }
                        e.preventDefault();
                      }}
                      onPaste={(e) => {
                        if (isMOI) return;
                        e.preventDefault();
                        const text = e.clipboardData.getData("text");
                        let clean = text.replace(/[^0-9.]/g, "");
                        const parts = clean.split(".");
                        if (parts.length > 2) {
                          clean = parts[0] + "." + parts.slice(1).join("");
                        }
                        if (clean) {
                          const input = e.currentTarget;
                          const start = input.selectionStart || 0;
                          const end = input.selectionEnd || 0;
                          const current = input.value;
                          const next = current.slice(0, start) + clean + current.slice(end);
                          let finalClean = next.replace(/[^0-9.]/g, "");
                          const fParts = finalClean.split(".");
                          if (fParts.length > 2) {
                            finalClean = fParts[0] + "." + fParts.slice(1).join("");
                          }
                          input.value = finalClean;
                          updateEnglishReqScore(key, finalClean);
                        }
                      }}
                      onChange={(e) => {
                        if (isMOI) return;
                        let clean = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = clean.split(".");
                        if (parts.length > 2) {
                          clean = parts[0] + "." + parts.slice(1).join("");
                        }
                        e.target.value = clean;
                        updateEnglishReqScore(key, clean);
                      }}
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0" 
                      onClick={() => removeEnglishReq(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Offer Letter Fee</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                  <input 
                    type="radio" 
                    name="offerLetterFeeType" 
                    value="free" 
                    checked={isOfferLetterFree} 
                    onChange={() => setForm(prev => ({ ...prev, offer_letter: "Free" }))}
                    className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  />
                  Free
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                  <input 
                    type="radio" 
                    name="offerLetterFeeType" 
                    value="fee_applies" 
                    checked={!isOfferLetterFree} 
                    onChange={() => {
                      setForm(prev => ({
                        ...prev,
                        offer_letter: prev.offer_letter.trim().toLowerCase().startsWith("free") ? "" : prev.offer_letter,
                      }));
                    }}
                    className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  />
                  Fee Applies
                </label>
              </div>
            </div>
            <div className={`flex items-center rounded-xl border border-gray-200 overflow-hidden shadow-xs h-10 ${
              isOfferLetterFree ? "bg-slate-50 cursor-not-allowed" : "bg-white focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400"
            }`}>
              <span className="bg-slate-100 border-r border-gray-200 px-3 py-2 text-xs font-bold text-slate-600 select-none shrink-0 h-full flex items-center">
                MYR
              </span>
              <input 
                type="text"
                inputMode="decimal"
                disabled={isOfferLetterFree}
                placeholder={isOfferLetterFree ? "0 (Free Offer Letter)" : "e.g. 250"}
                value={isOfferLetterFree ? "0" : cleanFeeValue(form.offer_letter)}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = rawVal.split(".");
                  const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : rawVal;
                  setForm(prev => ({
                    ...prev,
                    offer_letter: sanitized ? `MYR ${sanitized}` : "",
                  }));
                }}
                className={`w-full px-3 py-2 text-sm text-gray-900 bg-transparent outline-none placeholder:text-muted-foreground ${
                  isOfferLetterFree ? "cursor-not-allowed text-slate-400 select-none" : ""
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Class Type</Label>
            <Select
              value={form.class_type || "Physical"}
              onValueChange={(val) => setForm(prev => ({ ...prev, class_type: val }))}
              modal={false}
            >
              <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <SelectValue placeholder="Physical" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                ))}
                {form.class_type && !CLASS_TYPES.includes(form.class_type) && (
                  <SelectItem key={form.class_type} value={form.class_type}>{form.class_type}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Course Type</Label>
            <Select
              value={form.course_type || "Taught Course"}
              onValueChange={(val) => setForm(prev => ({ ...prev, course_type: val }))}
              modal={false}
            >
              <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <SelectValue placeholder="Taught Course" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                ))}
                {form.course_type && !COURSE_TYPES.includes(form.course_type) && (
                  <SelectItem key={form.course_type} value={form.course_type}>{form.course_type}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Group 2: Course Fee Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Label className="text-[13px] font-semibold text-gray-700">Tuition Fees</Label>
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                    <input 
                      type="radio" 
                      name="feeScheduleType" 
                      value="yearly" 
                      checked={feeScheduleType === "yearly"} 
                      onChange={() => handleScheduleTypeChange("yearly")}
                      className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                    />
                    Yearly
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                    <input 
                      type="radio" 
                      name="feeScheduleType" 
                      value="semester" 
                      checked={feeScheduleType === "semester"} 
                      onChange={() => handleScheduleTypeChange("semester")}
                      className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                    />
                    Semester wise
                  </label>
                </div>
              </div>
              <Button 
                type="button"
                size="sm" 
                disabled={isMaxPeriodsReached}
                className="h-7 px-3 text-xs shrink-0 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={addFeePeriod}
                title={isMaxPeriodsReached ? `Maximum ${maxFeePeriods} ${feeScheduleType === "yearly" ? "years" : "semesters"} reached for ${form.duration}` : undefined}
              >
                <Plus className="h-3 w-3 mr-1" /> {feeScheduleType === "yearly" ? "Add Year" : "Add Semester"}
              </Button>
            </div>

            {maxFeePeriods !== null && form.yearly_fees.length > maxFeePeriods && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Course duration is <strong>{form.duration}</strong> (max {maxFeePeriods} {feeScheduleType === "yearly" ? "years" : "semesters"}). Please remove {form.yearly_fees.length - maxFeePeriods} extra {form.yearly_fees.length - maxFeePeriods === 1 ? "period" : "periods"}.
              </div>
            )}

            <div className="space-y-2">
              {form.yearly_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No tuition fees added.</p>}
              {form.yearly_fees.map((yf, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    value={yf.year || getFeePeriodLabel(i, feeScheduleType)} 
                    readOnly
                    disabled
                    className="w-1/3 min-w-[110px] bg-slate-50 text-slate-700 font-normal cursor-not-allowed select-none"
                  />
                  <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 flex-1 h-10">
                    <span className="bg-slate-100 border-r border-gray-200 px-3 py-2 text-xs font-bold text-slate-600 select-none shrink-0 h-full flex items-center">
                      MYR
                    </span>
                    <input 
                      type="text"
                      placeholder="e.g. 25,000" 
                      value={cleanFeeValue(yf.fee)} 
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        const newArr = [...form.yearly_fees];
                        newArr[i].fee = rawVal ? `MYR ${rawVal.replace(/^(MYR|RM)\s*/i, '').trim()}` : "";
                        setForm(prev => ({ ...prev, yearly_fees: newArr }));
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0" 
                    onClick={() => removeYearlyFee(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Scholarship & Total Tuition Fees - normal styling like other fields */}
              {form.yearly_fees.length > 0 && (
                <>
                  <div className="flex gap-2 items-center">
                    <Input 
                      value="Scholarship" 
                      readOnly
                      disabled
                      className="w-1/3 min-w-[110px] bg-slate-50 text-slate-700 font-normal cursor-not-allowed select-none"
                    />
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 flex-1 h-10">
                      <span className="bg-slate-100 border-r border-gray-200 px-3 py-2 text-xs font-bold text-slate-600 select-none shrink-0 h-full flex items-center">
                        MYR
                      </span>
                      <input 
                        type="text"
                        placeholder="0" 
                        value={form.scholarship ? cleanFeeValue(form.scholarship) : "0"} 
                        onChange={(e) => {
                          const rawVal = e.target.value.replace(/[^0-9.]/g, "");
                          setForm(prev => ({ ...prev, scholarship: rawVal }));
                        }}
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="w-10 shrink-0" />
                  </div>

                  <div className="flex gap-2 items-center">
                    <Input 
                      value="Total Tuition Fees" 
                      readOnly
                      disabled
                      className="w-1/3 min-w-[110px] bg-slate-50 text-slate-700 font-normal cursor-not-allowed select-none"
                    />
                    <div className="flex items-center rounded-xl border border-gray-200 bg-slate-50 overflow-hidden shadow-xs flex-1 h-10 cursor-not-allowed">
                      <span className="bg-slate-100 border-r border-gray-200 px-3 py-2 text-xs font-bold text-slate-600 select-none shrink-0 h-full flex items-center">
                        MYR
                      </span>
                      <input 
                        type="text"
                        readOnly
                        disabled
                        value={totalYearlyFees > 0 ? totalYearlyFees.toLocaleString() : "0"} 
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent outline-none cursor-not-allowed select-none"
                      />
                    </div>
                    <div className="w-10 shrink-0" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Other Fees</Label>
              <Button 
                type="button"
                size="sm" 
                className="h-7 px-3 text-xs" 
                onClick={() => setForm(p => ({ ...p, other_fees: [...p.other_fees, { description: "", fee: "" }] }))}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Fee
              </Button>
            </div>
            <div className="space-y-2">
              {form.other_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No other fees added.</p>}
              {form.other_fees.map((of, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    placeholder="e.g. EMGS Visa Fee" 
                    value={of.description} 
                    onChange={(e) => {
                      const newArr = [...form.other_fees];
                      newArr[i].description = e.target.value;
                      setForm(prev => ({ ...prev, other_fees: newArr }));
                    }}
                    className="flex-1 min-w-[130px]"
                  />
                  <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 w-44 shrink-0 h-10">
                    <span className="bg-slate-100 border-r border-gray-200 px-3 py-2 text-xs font-bold text-slate-600 select-none shrink-0 h-full flex items-center">
                      MYR
                    </span>
                    <input 
                      type="text"
                      placeholder="e.g. 2,500" 
                      value={cleanFeeValue(of.fee)} 
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        const newArr = [...form.other_fees];
                        newArr[i].fee = rawVal ? `MYR ${rawVal.replace(/^(MYR|RM)\s*/i, '').trim()}` : "";
                        setForm(prev => ({ ...prev, other_fees: newArr }));
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0" 
                    onClick={() => setForm(p => ({ ...p, other_fees: p.other_fees.filter((_, idx) => idx !== i) }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Group 3: Course Overview */}
        <div className="space-y-2 pt-4">
          <Label className="text-[13px] font-semibold text-gray-700">Course Overview (Rich Text)</Label>
          <div className="border rounded-xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[250px]">
            <ReactQuill 
              theme="snow" 
              value={form.overview} 
              onChange={(val) => setForm(prev => ({ ...prev, overview: val }))}
              className="bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Group 4: Entry Requirements */}
        <div className="space-y-2 pt-4">
          <Label className="text-[13px] font-semibold text-gray-700">Other Entry Requirements</Label>
          <Textarea 
            value={form.entry_requirements_text} 
            onChange={(e) => setForm(prev => ({ ...prev, entry_requirements_text: e.target.value }))} 
            placeholder="High school diploma, CGPA 3.0, etc..." 
            rows={8}
            className="bg-gray-50 rounded-xl resize-y min-h-[180px]"
          />
        </div>

        {/* Group 5: Career Opportunities */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[13px] font-semibold text-gray-700">Career Opportunities</Label>
            <Button size="sm" type="button" onClick={() => addTag("career_outcomes", newCareerTag, setNewCareerTag)} className="h-7 px-3 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          <div className="flex gap-2">
            <Input 
              value={newCareerTag}
              onChange={(e) => setNewCareerTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("career_outcomes", newCareerTag, setNewCareerTag))}
              placeholder="e.g. Software Engineer, Data Analyst"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.career_outcomes.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full border border-green-200">
                {m} <button type="button" onClick={() => removeTag("career_outcomes", i)} className="font-bold ml-1 hover:text-green-900">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Group 6: Curriculum */}
        <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Curriculum (By Year/Semester)</Label>
              <Button type="button" size="sm" className="h-7 px-3 text-xs" onClick={() => setForm(p => ({ ...p, curriculum: [...p.curriculum, { year: `Year ${p.curriculum.length + 1}`, modules: [] }] }))}>
                <Plus className="h-3 w-3 mr-1" /> Add Year/Semester
              </Button>
            </div>
            
            <div className="space-y-4">
            {form.curriculum.length === 0 && <p className="text-xs text-muted-foreground italic">No curriculum added yet.</p>}
            {form.curriculum.map((curr, i) => (
              <div key={i} className="bg-gray-50/50 border rounded-xl p-4 space-y-3 relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setForm(p => ({ ...p, curriculum: p.curriculum.filter((_, idx) => idx !== i) }))}
                    className="absolute top-4 right-4 h-11 w-11 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                
                <div>
                  <Label className="text-xs text-gray-500">Period Title</Label>
                  <Input 
                    value={curr.year} 
                    className="font-semibold text-gray-800 bg-white mt-1"
                    onChange={(e) => {
                      const newArr = [...form.curriculum];
                      newArr[i].year = e.target.value;
                      setForm(prev => ({ ...prev, curriculum: newArr }));
                    }}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-gray-500">Modules/Subjects</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => {
                      const newArr = [...form.curriculum];
                      newArr[i].modules.push("");
                      setForm(prev => ({ ...prev, curriculum: newArr }));
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Module
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {curr.modules.map((mod, j) => (
                      <div key={j} className="flex gap-2">
                        <Input 
                          placeholder="e.g. Introduction to Programming" 
                          value={mod} 
                          className="h-9 text-sm bg-white"
                          onChange={(e) => {
                            const newArr = [...form.curriculum];
                            newArr[i].modules[j] = e.target.value;
                            setForm(prev => ({ ...prev, curriculum: newArr }));
                          }}
                        />
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 shrink-0 bg-white border" onClick={() => {
                          const newArr = [...form.curriculum];
                          newArr[i].modules.splice(j, 1);
                          setForm(prev => ({ ...prev, curriculum: newArr }));
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
