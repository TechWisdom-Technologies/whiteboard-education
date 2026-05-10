import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

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
    { key: "degree_level", label: "Qualification", type: "select", options: ["Foundation", "Diploma", "Bachelor", "Master", "PhD"], showInTable: true },
    { key: "intake_months", label: "Intake", type: "tag_input", showInTable: false, placeholder: "e.g. January, May, September" },
    { key: "offer_letter", label: "Offer Letter", placeholder: "e.g. Free, Fees Applies", showInTable: false },
    { key: "duration", label: "Duration", showInTable: true, placeholder: "e.g. 3 years" },
    { key: "entry_requirements", label: "English Requirements", type: "json_object", showInTable: false, helpText: 'Use IELTS key. Example: {"IELTS":"6.0"}', placeholder: '{"IELTS":"6.0"}' },
    { key: "entry_requirements_text", label: "Other Entry Requirements", type: "textarea", showInTable: false },
    { key: "class_type", label: "Class Type", placeholder: "e.g. Physical", showInTable: false },
    { key: "tuition_fee", label: "Base Tuition Fee (MYR) - For Search", type: "number", showInTable: true },
    { key: "yearly_fees", label: "Yearly Tuition fees", type: "json_array", showInTable: false, helpText: 'Example: [{"year":"1st Year","fee":"MYR 20,000"}]', placeholder: '[{"year":"1st Year","fee":"MYR 20,000"}]' },
    { key: "other_fees", label: "Other fees", type: "json_array", showInTable: false, helpText: 'Example: [{"description":"Registration Fee","fee":"MYR 280"}]', placeholder: '[{"description":"Registration Fee","fee":"MYR 280"}]' },
    { key: "overview", label: "Course Overview", type: "richtext", showInTable: false },
    { key: "curriculum", label: "Curriculum", type: "json_array", showInTable: false, helpText: 'Array of years: [{"year":"Year 1","modules":[{"name":"Math","credits":3}]}]', placeholder: '[{"year":"Year 1","modules":["Math"]}]' },
    { key: "career_outcomes", label: "Career Outcomes", type: "tag_input", showInTable: false, placeholder: "e.g. Software Engineer, Data Analyst" },
  ];

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
    />
  );
}
