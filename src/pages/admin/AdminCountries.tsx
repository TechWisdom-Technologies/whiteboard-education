import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

export default function AdminCountries() {
  const { data, isLoading } = useTableData("countries");
  const insert = useInsertRow("countries");
  const update = useUpdateRow("countries");
  const del = useDeleteRow("countries");
  const bulkUpsert = useBulkUpsertRows("countries");

  const fields: FieldConfig[] = [
    { key: "name", label: "Country Name", showInTable: true },
    { key: "code", label: "Code (e.g. MY)", showInTable: true, placeholder: "MY" },
    { key: "capital", label: "Capital", showInTable: true },
    { key: "currency", label: "Currency", showInTable: false, placeholder: "e.g. MYR" },
    { key: "language", label: "Language", showInTable: false },
    { key: "population", label: "Population", showInTable: false },
    { key: "flag_icon", label: "Flag Icon URL", showInTable: false },
    { key: "banner_image", label: "Banner Image URL", showInTable: false },
    { key: "about_text", label: "About Text", type: "textarea", showInTable: false },
    { key: "post_study_work_rights", label: "Post-Study Work Rights", type: "textarea", showInTable: false },
    { key: "reasons_to_study", label: "Reasons to Study", type: "json_array", showInTable: false, placeholder: '[{"title":"Affordable Tuition","description":"Low cost..."}]' },
    { key: "cost_of_living", label: "Cost of Living", type: "json_array", showInTable: false, placeholder: '{"rent":"$300","food":"$150","transport":"$50"}' },
  ];

  return (
    <AdminCrudTable
      title="Countries"
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
