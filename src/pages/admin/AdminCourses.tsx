import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCourseForm, { STUDY_AREAS, DEGREE_LEVELS } from "./AdminCourseForm";
import { Building2, FolderTree, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCourses() {
  const { data, isLoading } = useTableData("courses");
  const { data: universities } = useTableData("universities", { orderBy: "name" });
  const { data: deptData } = useTableData("departments", { orderBy: "name" });
  const insert = useInsertRow("courses");
  const update = useUpdateRow("courses");
  const del = useDeleteRow("courses");
  const bulkUpsert = useBulkUpsertRows("courses");

  // Dynamic departments list
  const allDepartments = useMemo(() => {
    const set = new Set<string>(STUDY_AREAS);
    if (deptData && Array.isArray(deptData)) {
      deptData.forEach((d: any) => {
        if (d.name && typeof d.name === "string" && d.name.trim()) {
          set.add(d.name.trim());
        }
      });
    }
    if (data && Array.isArray(data)) {
      data.forEach((c: any) => {
        if (c.category && typeof c.category === "string" && c.category.trim()) {
          set.add(c.category.trim());
        }
      });
    }
    return Array.from(set).sort();
  }, [deptData, data]);

  // Filter states
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const fields: FieldConfig[] = [
    { key: "title", label: "Course Title", showInTable: true },
    { key: "university_id", label: "University", type: "relation", showInTable: false, relationConfig: { data: universities || [], valueKey: "id", labelKey: "name" } },
    { key: "campus", label: "Campus", showInTable: true, placeholder: "e.g. Cyberjaya" },
    { key: "category", label: "Department / Area", type: "select", options: allDepartments, showInTable: true },
    { key: "degree_level", label: "Qualification", type: "select", options: DEGREE_LEVELS, showInTable: true },
    { key: "duration", label: "Duration", showInTable: true, placeholder: "e.g. 3 years" },
    { key: "intake_months", label: "Intake", type: "tag_input", showInTable: false, placeholder: "e.g. January, May, September" },
    { key: "offer_letter", label: "Offer Letter", placeholder: "e.g. Free, Fees Applies", showInTable: false },
    { key: "entry_requirements", label: "English Requirements", type: "json_object", showInTable: false, placeholder: '{"IELTS":"6.0"}' },
    { key: "entry_requirements_text", label: "Other Entry Requirements", type: "textarea", showInTable: false },
    { key: "class_type", label: "Class Type", placeholder: "e.g. Physical", showInTable: false },
    { key: "yearly_fees", label: "Yearly Tuition fees", type: "json_array", showInTable: false, placeholder: '[{"year":"1st Year","fee":"MYR 20,000"}]' },
    { key: "other_fees", label: "Other fees", type: "json_array", showInTable: false, placeholder: '[{"description":"Registration Fee","fee":"MYR 280"}]' },
    { key: "overview", label: "Course Overview", type: "richtext", showInTable: false },
    { key: "curriculum", label: "Curriculum", type: "json_array", showInTable: false, placeholder: '[{"year":"Year 1","modules":["Math"]}]' },
    { key: "career_outcomes", label: "Career Outcomes", type: "tag_input", showInTable: false, placeholder: "e.g. Software Engineer, Data Analyst" },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);

  const action = searchParams.get("action");
  
  // Close form by clearing url params and local state
  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  // Filtered courses based on University, Department, and Level
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((course: any) => {
      if (selectedUniversity !== "all" && course.university_id !== selectedUniversity) {
        return false;
      }
      if (selectedDepartment !== "all" && course.category !== selectedDepartment) {
        return false;
      }
      if (selectedLevel !== "all" && course.degree_level !== selectedLevel) {
        return false;
      }
      return true;
    });
  }, [data, selectedUniversity, selectedDepartment, selectedLevel]);

  const hasActiveFilters = selectedUniversity !== "all" || selectedDepartment !== "all" || selectedLevel !== "all";

  const clearFilters = () => {
    setSelectedUniversity("all");
    setSelectedDepartment("all");
    setSelectedLevel("all");
  };

  // If action is new, or we are editing a row, show the custom form
  if (action === "new" || editingRow) {
    return (
      <AdminCourseForm 
        initialData={editingRow} 
        onCancel={closeForm} 
        onSuccess={closeForm} 
      />
    );
  }

  const filterSlot = (
    <div className="flex flex-wrap items-center gap-3 py-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
      {/* University Wise Filter */}
      <div className="flex items-center gap-1.5 min-w-[220px] flex-1 sm:flex-initial">
        <Building2 className="h-4 w-4 text-slate-500 shrink-0" />
        <select
          value={selectedUniversity}
          onChange={(e) => setSelectedUniversity(e.target.value)}
          className="h-9 w-full sm:w-[240px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium shadow-sm hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2F4F97]"
        >
          <option value="all">All Universities ({universities?.length || 0})</option>
          {universities?.map((u: any) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Department Wise Filter */}
      <div className="flex items-center gap-1.5 min-w-[190px] flex-1 sm:flex-initial">
        <FolderTree className="h-4 w-4 text-slate-500 shrink-0" />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="h-9 w-full sm:w-[200px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium shadow-sm hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2F4F97]"
        >
          <option value="all">All Departments ({allDepartments.length})</option>
          {allDepartments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Level of Study Wise Filter */}
      <div className="flex items-center gap-1.5 min-w-[170px] flex-1 sm:flex-initial">
        <GraduationCap className="h-4 w-4 text-slate-500 shrink-0" />
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="h-9 w-full sm:w-[170px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium shadow-sm hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2F4F97]"
        >
          <option value="all">All Levels ({DEGREE_LEVELS.length})</option>
          {DEGREE_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-2.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Reset filters
        </Button>
      )}

      {/* Total Filtered Count */}
      <div className="ml-auto text-xs text-slate-500 whitespace-nowrap pl-2">
        Showing <span className="font-semibold text-slate-800">{filteredData.length}</span> of {data?.length || 0} courses
      </div>
    </div>
  );

  return (
    <AdminCrudTable
      title="Courses"
      data={filteredData}
      isLoading={isLoading}
      fields={fields}
      searchKey="title"
      filterSlot={filterSlot}
      onInsert={(row) => insert.mutate(row)}
      onUpdate={(row) => update.mutate(row)}
      onDelete={(id) => del.mutate(id)}
      onBulkUpsert={(rows) => bulkUpsert.mutateAsync(rows).then(() => undefined)}
      onAddClick={() => setSearchParams({ action: "new" })}
      onEditClick={(row) => setEditingRow(row)}
      renderCell={(row, key) => {
        if (key === "title") {
          return <span className="font-semibold text-slate-900">{row.title || "-"}</span>;
        }
        if (key === "campus") {
          if (row.campus) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {row.campus}
              </span>
            );
          }
          const uni = universities?.find((u: any) => u.id === row.university_id);
          const fallback = Array.isArray(uni?.campuses) && uni.campuses.length > 0 ? uni.campuses[0] : (uni?.city || "-");
          return <span className="text-muted-foreground text-xs">{fallback}</span>;
        }
        return undefined;
      }}
    />
  );
}
