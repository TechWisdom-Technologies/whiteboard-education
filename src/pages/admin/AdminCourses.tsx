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
    { key: "title", label: "Title", showInTable: true },
    { key: "university_id", label: "University", type: "relation", showInTable: false, relationConfig: { data: universities || [], valueKey: "id", labelKey: "name" } },
    { key: "degree_level", label: "Degree Level", type: "select", options: ["Foundation", "Bachelor", "Master", "PhD"], showInTable: true },
    { key: "tuition_fee", label: "Tuition Fee (USD/yr)", type: "number", showInTable: true },
    { key: "duration", label: "Duration", showInTable: true, placeholder: "e.g. 3 years" },
    { key: "overview", label: "Overview", type: "textarea", showInTable: false },
    { key: "intake_months", label: "Intake Months", type: "tag_input", showInTable: false, placeholder: "e.g. January, May, September" },
    { key: "entry_requirements", label: "Entry Requirements", type: "json_object", showInTable: false, helpText: 'JSON object: {"min_gpa":"3.0","ielts":"6.0","documents":["transcript"]}', placeholder: '{"min_gpa":"3.0","ielts":"6.0"}' },
    { key: "curriculum", label: "Curriculum", type: "json_array", showInTable: false, helpText: 'JSON array of objects: [{"year":1,"subjects":["Math","Physics"]}]', placeholder: '[{"year":1,"subjects":["Math","Physics"]}]' },
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
