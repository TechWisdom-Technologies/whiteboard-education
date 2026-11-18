import { useState, useEffect, useMemo } from "react";
import { useTableData, useInsertRow, useUpdateRow } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    class_type: "",
    yearly_fees: [] as { year: string; fee: string }[],
    other_fees: [] as { description: string; fee: string }[],
    overview: "",
    curriculum: [] as { year: string; modules: string[] }[],
    career_outcomes: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [newCareerTag, setNewCareerTag] = useState("");

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
      setForm({
        title: initialData.title || "",
        university_id: initialData.university_id || "",
        campus: initialData.campus || "",
        degree_level: initialData.degree_level || "",
        category: initialData.category || "",
        intake_months: Array.isArray(initialData.intake_months) ? initialData.intake_months : [],
        offer_letter: initialData.offer_letter || "",
        duration: initialData.duration || "",
        entry_requirements: typeof initialData.entry_requirements === "object" && initialData.entry_requirements !== null ? initialData.entry_requirements : {},
        entry_requirements_text: initialData.entry_requirements_text || "",
        class_type: initialData.class_type || "",
        yearly_fees: Array.isArray(initialData.yearly_fees) ? initialData.yearly_fees : [],
        other_fees: Array.isArray(initialData.other_fees) ? initialData.other_fees : [],
        overview: initialData.overview || "",
        curriculum: Array.isArray(initialData.curriculum) ? initialData.curriculum : [],
        career_outcomes: Array.isArray(initialData.career_outcomes) ? initialData.career_outcomes : [],
      });
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

    let currentPayload: Record<string, any> = { ...form };
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
    setForm(prev => ({ ...prev, entry_requirements: { ...prev.entry_requirements, "": "" } }));
  };
  const updateEnglishReq = (oldKey: string, newKey: string, val: string) => {
    setForm(prev => {
      const newReqs = { ...prev.entry_requirements };
      if (oldKey !== newKey) {
        delete newReqs[oldKey];
      }
      newReqs[newKey] = val;
      return { ...prev, entry_requirements: newReqs };
    });
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
            <select
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
              value={form.university_id}
              onChange={(e) => {
                const newUniId = e.target.value;
                setForm(prev => ({
                  ...prev,
                  university_id: newUniId,
                  campus: "", // reset campus when university changes
                }));
              }}
            >
              <option value="">Select University...</option>
              {universities?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
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
            <select
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
              value={form.campus}
              onChange={(e) => setForm(prev => ({ ...prev, campus: e.target.value }))}
              disabled={!form.university_id}
            >
              <option value="">
                {!form.university_id
                  ? "Select a university first..."
                  : availableCampuses.length === 0
                    ? "No campuses configured for this university"
                    : "Select Campus..."}
              </option>
              {availableCampuses.map((camp: string) => (
                <option key={camp} value={camp}>{camp}</option>
              ))}
              {availableCampuses.length > 1 && (
                <option value="All Campuses">All Campuses</option>
              )}
              {form.campus && !availableCampuses.includes(form.campus) && form.campus !== "All Campuses" && (
                <option value={form.campus}>{form.campus}</option>
              )}
            </select>
            {form.university_id && availableCampuses.length === 0 && (
              <p className="text-[11px] text-amber-600">
                Tip: Configure campuses for this university in the Universities section.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Qualification Level</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
              value={form.degree_level}
              onChange={(e) => setForm(prev => ({ ...prev, degree_level: e.target.value }))}
            >
              <option value="">Select Qualification...</option>
              {DEGREE_LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Department / Study Area</Label>
              {!isAddingDept && (
                <button
                  type="button"
                  onClick={() => setIsAddingDept(true)}
                  className="text-xs text-[#2F4F97] hover:text-[#233d75] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add New
                </button>
              )}
            </div>

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
                  className="h-10 text-sm bg-white border-blue-300 focus:border-[#2F4F97]"
                  autoFocus
                  disabled={isCreatingDept}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateDepartment}
                  disabled={isCreatingDept || !newDeptName.trim()}
                  className="h-10 px-3.5 bg-[#2F4F97] hover:bg-[#233d75] text-white shrink-0 text-xs font-semibold"
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
                <select
                  className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select Department / Study Area...</option>
                  {allDepartments.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingDept(true)}
                  className="h-10 px-3 text-xs shrink-0 whitespace-nowrap border-slate-200 hover:border-[#2F4F97] hover:text-[#2F4F97] flex items-center gap-1 font-medium shadow-sm"
                  title="Add a new department"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add New
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Duration</Label>
            <Input 
              value={form.duration} 
              onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))} 
              placeholder="e.g. 3 Years, 4 Years" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[13px] font-semibold text-gray-700">Intake Months</Label>
              <Button size="sm" type="button" onClick={() => addTag("intake_months", newTag, setNewTag)} className="h-7 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("intake_months", newTag, setNewTag))}
              >
                <option value="">Select Month...</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
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
              <Button size="sm" onClick={addEnglishReq} className="h-7 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(form.entry_requirements).length === 0 && (
                <p className="text-xs text-muted-foreground italic">No English requirements added.</p>
              )}
              {Object.entries(form.entry_requirements).map(([key, val], i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    placeholder="e.g. IELTS" 
                    value={key} 
                    className="w-1/2"
                    onChange={(e) => updateEnglishReq(key, e.target.value, val)}
                  />
                  <Input 
                    placeholder="e.g. 6.0" 
                    value={val} 
                    className="w-1/2"
                    onChange={(e) => updateEnglishReq(key, key, e.target.value)}
                  />
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0" onClick={() => removeEnglishReq(key)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Offer Letter Fee</Label>
            <Input 
              value={form.offer_letter} 
              onChange={(e) => setForm(prev => ({ ...prev, offer_letter: e.target.value }))} 
              placeholder="e.g. Free, RM 250 Fees Applies" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-gray-700">Class Type</Label>
            <Input 
              value={form.class_type} 
              onChange={(e) => setForm(prev => ({ ...prev, class_type: e.target.value }))} 
              placeholder="e.g. Physical, Online, Blended" 
            />
          </div>
        </div>

        {/* Group 2: Course Fee Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Yearly Tuition Fees</Label>
              <Button size="sm" className="h-7 px-3 text-xs" onClick={() => setForm(p => ({ ...p, yearly_fees: [...p.yearly_fees, { year: "", fee: "" }] }))}>
                <Plus className="h-3 w-3 mr-1" /> Add Year
              </Button>
            </div>
            <div className="space-y-2">
              {form.yearly_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No yearly fees added.</p>}
              {form.yearly_fees.map((yf, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input 
                    placeholder="e.g. 1st Year" 
                    value={yf.year} 
                    onChange={(e) => {
                      const newArr = [...form.yearly_fees];
                      newArr[i].year = e.target.value;
                      setForm(prev => ({ ...prev, yearly_fees: newArr }));
                    }}
                  />
                  <Input 
                    placeholder="e.g. MYR 25,000" 
                    value={yf.fee} 
                    onChange={(e) => {
                      const newArr = [...form.yearly_fees];
                      newArr[i].fee = e.target.value;
                      setForm(prev => ({ ...prev, yearly_fees: newArr }));
                    }}
                  />
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0" onClick={() => setForm(p => ({ ...p, yearly_fees: p.yearly_fees.filter((_, idx) => idx !== i) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-gray-700">Other Fees</Label>
              <Button size="sm" className="h-7 px-3 text-xs" onClick={() => setForm(p => ({ ...p, other_fees: [...p.other_fees, { description: "", fee: "" }] }))}>
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
                  />
                  <Input 
                    placeholder="e.g. MYR 2,500" 
                    value={of.fee} 
                    onChange={(e) => {
                      const newArr = [...form.other_fees];
                      newArr[i].fee = e.target.value;
                      setForm(prev => ({ ...prev, other_fees: newArr }));
                    }}
                  />
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors shrink-0" onClick={() => setForm(p => ({ ...p, other_fees: p.other_fees.filter((_, idx) => idx !== i) }))}>
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
