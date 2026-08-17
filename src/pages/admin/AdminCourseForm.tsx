import { useState, useEffect } from "react";
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

const DEGREE_LEVELS = ["Foundation", "Diploma", "Advanced Diploma", "Certificate", "Bachelor", "Master", "PhD"];

export default function AdminCourseForm({ initialData, onCancel, onSuccess }: AdminCourseFormProps) {
  const isEditing = !!initialData;
  const insertRow = useInsertRow("courses");
  const updateRow = useUpdateRow("courses");
  const { data: universities } = useTableData("universities", { orderBy: "name" });

  const [form, setForm] = useState({
    title: "",
    university_id: "",
    degree_level: "",
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

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        university_id: initialData.university_id || "",
        degree_level: initialData.degree_level || "",
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

  const handleSave = async () => {
    if (!form.title || !form.university_id) {
      toast.error("Please fill in the required fields (Title and University)");
      return;
    }

    try {
      if (isEditing) {
        await updateRow.mutateAsync({ id: initialData.id, ...form });
        toast.success("Course updated successfully");
      } else {
        await insertRow.mutateAsync(form);
        toast.success("Course created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
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
          <Button onClick={handleSave} className="bg-[#2F4F97] hover:bg-[#1E3A75]">
            {isEditing ? "Update Course" : "Save Course"}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12 overflow-y-auto">
        
        {/* SECTION: Basic Information */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 flex items-center gap-2">
            <span className="bg-[#2F4F97] text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">1</span>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30 p-6 rounded-xl border border-gray-100">
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Course Title *</Label>
              <Input 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                placeholder="e.g. BSc (Hons) Computer Science" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">University *</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
                value={form.university_id}
                onChange={(e) => setForm({ ...form, university_id: e.target.value })}
              >
                <option value="">Select University...</option>
                {universities?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Qualification Level</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
                value={form.degree_level}
                onChange={(e) => setForm({ ...form, degree_level: e.target.value })}
              >
                <option value="">Select Qualification...</option>
                {DEGREE_LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Duration</Label>
              <Input 
                value={form.duration} 
                onChange={(e) => setForm({ ...form, duration: e.target.value })} 
                placeholder="e.g. 3 Years, 4 Years" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Class Type</Label>
              <Input 
                value={form.class_type} 
                onChange={(e) => setForm({ ...form, class_type: e.target.value })} 
                placeholder="e.g. Physical, Online, Blended" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-gray-700">Intake Months</Label>
              <div className="flex gap-2">
                <Input 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("intake_months", newTag, setNewTag))}
                  placeholder="e.g. January, September"
                />
                <Button type="button" variant="secondary" onClick={() => addTag("intake_months", newTag, setNewTag)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.intake_months.map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-3 py-1 rounded-full text-gray-700">
                    {m} <button onClick={() => removeTag("intake_months", i)} className="text-red-500 font-bold ml-1 hover:text-red-700">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Requirements */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 flex items-center gap-2">
            <span className="bg-[#2F4F97] text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">2</span>
            Requirements & Applications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30 p-6 rounded-xl border border-gray-100">
            
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold text-gray-700">English Requirements</Label>
                <Button variant="ghost" size="sm" onClick={addEnglishReq} className="text-xs h-7 px-2 text-[#2F4F97] hover:bg-blue-50">
                  <Plus className="h-3 w-3 mr-1" /> Add Exam
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" onClick={() => removeEnglishReq(key)}>
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
                onChange={(e) => setForm({ ...form, offer_letter: e.target.value })} 
                placeholder="e.g. Free, RM 250 Fees Applies" 
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[13px] font-semibold text-gray-700">Other Entry Requirements</Label>
              <Textarea 
                value={form.entry_requirements_text} 
                onChange={(e) => setForm({ ...form, entry_requirements_text: e.target.value })} 
                placeholder="High school diploma, CGPA 3.0, etc..." 
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* SECTION: Financials */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 flex items-center gap-2">
            <span className="bg-[#2F4F97] text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">3</span>
            Financials (Fees)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/30 p-6 rounded-xl border border-gray-100">
            
            {/* Yearly Tuition Fees */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold text-gray-700">Yearly Tuition Fees</Label>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-[#2F4F97] hover:bg-blue-50" onClick={() => setForm(p => ({ ...p, yearly_fees: [...p.yearly_fees, { year: "", fee: "" }] }))}>
                  <Plus className="h-3 w-3 mr-1" /> Add Year
                </Button>
              </div>
              <div className="space-y-2">
                {form.yearly_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No yearly fees added.</p>}
                {form.yearly_fees.map((yf, i) => (
                  <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-md border shadow-sm">
                    <Input 
                      placeholder="e.g. 1st Year" 
                      value={yf.year} 
                      onChange={(e) => {
                        const newArr = [...form.yearly_fees];
                        newArr[i].year = e.target.value;
                        setForm({ ...form, yearly_fees: newArr });
                      }}
                    />
                    <Input 
                      placeholder="e.g. MYR 25,000" 
                      value={yf.fee} 
                      onChange={(e) => {
                        const newArr = [...form.yearly_fees];
                        newArr[i].fee = e.target.value;
                        setForm({ ...form, yearly_fees: newArr });
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, yearly_fees: p.yearly_fees.filter((_, idx) => idx !== i) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Fees */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold text-gray-700">Other Fees (One-time, Visa, etc.)</Label>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-[#2F4F97] hover:bg-blue-50" onClick={() => setForm(p => ({ ...p, other_fees: [...p.other_fees, { description: "", fee: "" }] }))}>
                  <Plus className="h-3 w-3 mr-1" /> Add Fee
                </Button>
              </div>
              <div className="space-y-2">
                {form.other_fees.length === 0 && <p className="text-xs text-muted-foreground italic">No other fees added.</p>}
                {form.other_fees.map((of, i) => (
                  <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-md border shadow-sm">
                    <Input 
                      placeholder="e.g. EMGS Visa Fee" 
                      value={of.description} 
                      onChange={(e) => {
                        const newArr = [...form.other_fees];
                        newArr[i].description = e.target.value;
                        setForm({ ...form, other_fees: newArr });
                      }}
                    />
                    <Input 
                      placeholder="e.g. MYR 2,500" 
                      value={of.fee} 
                      onChange={(e) => {
                        const newArr = [...form.other_fees];
                        newArr[i].fee = e.target.value;
                        setForm({ ...form, other_fees: newArr });
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0 hover:bg-red-50" onClick={() => setForm(p => ({ ...p, other_fees: p.other_fees.filter((_, idx) => idx !== i) }))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: Syllabus & Overview */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-[#1E293B] border-b pb-2 flex items-center gap-2">
            <span className="bg-[#2F4F97] text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">4</span>
            Syllabus & Career
          </h3>
          <div className="grid grid-cols-1 gap-8 bg-gray-50/30 p-6 rounded-xl border border-gray-100">
            
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold text-gray-700">Course Overview (Rich Text)</Label>
              <div className="bg-white rounded-md [&_.ql-container]:min-h-[200px] border">
                <ReactQuill 
                  theme="snow" 
                  value={form.overview} 
                  onChange={(val) => setForm({ ...form, overview: val })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-[13px] font-semibold text-gray-700">Curriculum (By Year/Semester)</Label>
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3 text-[#2F4F97] bg-white border shadow-sm hover:bg-blue-50" onClick={() => setForm(p => ({ ...p, curriculum: [...p.curriculum, { year: `Year ${p.curriculum.length + 1}`, modules: [] }] }))}>
                  <Plus className="h-3 w-3 mr-1" /> Add Year/Semester
                </Button>
              </div>
              
              <div className="space-y-4">
                {form.curriculum.length === 0 && <p className="text-xs text-muted-foreground italic">No curriculum added yet.</p>}
                {form.curriculum.map((curr, i) => (
                  <div key={i} className="bg-white border rounded-lg p-4 shadow-sm space-y-3 relative group">
                    <button 
                      onClick={() => setForm(p => ({ ...p, curriculum: p.curriculum.filter((_, idx) => idx !== i) }))}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Period Title</Label>
                      <Input 
                        value={curr.year} 
                        className="font-semibold text-gray-800 bg-gray-50 border-transparent hover:border-gray-200 mt-1"
                        onChange={(e) => {
                          const newArr = [...form.curriculum];
                          newArr[i].year = e.target.value;
                          setForm({ ...form, curriculum: newArr });
                        }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-gray-500">Modules/Subjects</Label>
                        <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => {
                          const newArr = [...form.curriculum];
                          newArr[i].modules.push("");
                          setForm({ ...form, curriculum: newArr });
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
                              className="h-8 text-sm"
                              onChange={(e) => {
                                const newArr = [...form.curriculum];
                                newArr[i].modules[j] = e.target.value;
                                setForm({ ...form, curriculum: newArr });
                              }}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 shrink-0" onClick={() => {
                              const newArr = [...form.curriculum];
                              newArr[i].modules.splice(j, 1);
                              setForm({ ...form, curriculum: newArr });
                            }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label className="text-[13px] font-semibold text-gray-700">Career Outcomes</Label>
              <div className="flex gap-2">
                <Input 
                  value={newCareerTag}
                  onChange={(e) => setNewCareerTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag("career_outcomes", newCareerTag, setNewCareerTag))}
                  placeholder="e.g. Software Engineer, Data Analyst"
                />
                <Button type="button" variant="secondary" onClick={() => addTag("career_outcomes", newCareerTag, setNewCareerTag)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.career_outcomes.map((m, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full border border-green-200">
                    {m} <button onClick={() => removeTag("career_outcomes", i)} className="font-bold ml-1 hover:text-green-900">&times;</button>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
