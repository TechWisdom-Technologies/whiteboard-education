import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

const fields: FieldConfig[] = [
  { key: "name", label: "Program Name", showInTable: true },
  { key: "institute", label: "Institute", showInTable: true },
  { key: "city", label: "City", showInTable: true },
  { key: "level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"], showInTable: true },
  { key: "tuition_fee", label: "Tuition Fee (MYR)", type: "number", showInTable: true },
  { key: "duration", label: "Duration", showInTable: false, placeholder: "e.g. 6 months" },
  { key: "overview", label: "Overview", type: "textarea", showInTable: false },
  { key: "intake_months", label: "Intake Months", type: "tag_input", showInTable: false, placeholder: "e.g. January, May, September" },
  { key: "curriculum", label: "Curriculum", type: "json_array", showInTable: false, placeholder: '[{"module":"Grammar","hours":40}]' },
];

export default function AdminLanguageCenters() {
  const { data, isLoading } = useTableData("language_centers");
  const insert = useInsertRow("language_centers");
  const update = useUpdateRow("language_centers");
  const del = useDeleteRow("language_centers");
  const bulkUpsert = useBulkUpsertRows("language_centers");

  return (
    <AdminCrudTable
      title="Language Centers"
      data={data}
      isLoading={isLoading}
      fields={fields}
      searchKey="name"
      onInsert={(row) => insert.mutate(row)}
      onUpdate={(row) => update.mutate(row)}
      onDelete={(id) => del.mutate(id)}
      onBulkUpsert={(rows) => bulkUpsert.mutateAsync(rows).then(() => undefined)}
    />
  );
}
