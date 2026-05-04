import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

export default function AdminScholarships() {
  const { data, isLoading } = useTableData("scholarships");
  const { data: universities } = useTableData("universities", { orderBy: "name" });
  const insert = useInsertRow("scholarships");
  const update = useUpdateRow("scholarships");
  const del = useDeleteRow("scholarships");
  const bulkUpsert = useBulkUpsertRows("scholarships");

  const fields: FieldConfig[] = [
    { key: "name", label: "Name", showInTable: true },
    { key: "university_id", label: "University", type: "relation", showInTable: false, relationConfig: { data: universities || [], valueKey: "id", labelKey: "name" } },
    { key: "coverage_amount", label: "Coverage Amount", showInTable: true, placeholder: "e.g. 50% tuition waiver" },
    { key: "criteria", label: "Criteria", type: "textarea", showInTable: true, placeholder: "Eligibility criteria..." },
  ];

  return (
    <AdminCrudTable
      title="Scholarships"
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
