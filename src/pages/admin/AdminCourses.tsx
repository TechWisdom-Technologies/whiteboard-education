import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCourseForm from "./AdminCourseForm";

export default function AdminCourses() {
  const { data, isLoading } = useTableData("courses");
  const { data: universities } = useTableData("universities", { orderBy: "name" });
  const insert = useInsertRow("courses");
  const update = useUpdateRow("courses");
  const del = useDeleteRow("courses");
  const bulkUpsert = useBulkUpsertRows("courses");

  const fields: FieldConfig[] = [
    { key: "title", label: "Course Title", showInTable: true },
    { key: "university_id", label: "University", type: "relation", showInTable: false, relationConfig: { data: universities || [], valueKey: "id", labelKey: "name" } },
    { key: "degree_level", label: "Qualification", type: "select", options: ["Foundation", "Diploma", "Advanced Diploma", "Certificate", "Bachelor", "Master", "PhD"], showInTable: true },
    { key: "intake_months", label: "Intake", type: "tag_input", showInTable: false, placeholder: "e.g. January, May, September" },
    { key: "offer_letter", label: "Offer Letter", placeholder: "e.g. Free, Fees Applies", showInTable: false },
    { key: "duration", label: "Duration", showInTable: true, placeholder: "e.g. 3 years" },
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

  return (
    <AdminCrudTable
      title="Courses"
      data={data}
      isLoading={isLoading}
      fields={fields}
      searchKey="title"
      onInsert={(row) => insert.mutate(row)}
      onUpdate={(row) => update.mutate(row)}
      onDelete={(id) => del.mutate(id)}
      onBulkUpsert={(rows) => bulkUpsert.mutateAsync(rows).then(() => undefined)}
      onAddClick={() => setSearchParams({ action: "new" })}
      onEditClick={(row) => setEditingRow(row)}
    />
  );
}
