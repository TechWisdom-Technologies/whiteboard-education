import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

export default function AdminUniversities() {
  const { data, isLoading } = useTableData("universities");
  const { data: countries } = useTableData("countries", { orderBy: "name" });
  const insert = useInsertRow("universities");
  const update = useUpdateRow("universities");
  const del = useDeleteRow("universities");
  const bulkUpsert = useBulkUpsertRows("universities");

  const fields: FieldConfig[] = [
    { key: "name", label: "Name", showInTable: true },
    { key: "city", label: "City", showInTable: true },
    { key: "country_id", label: "Country", type: "relation", showInTable: false, relationConfig: { data: countries || [], valueKey: "id", labelKey: "name" } },
    { key: "description", label: "Short Description", type: "textarea", showInTable: false },
    { key: "about_text", label: "About (detailed)", type: "textarea", showInTable: false },
    { key: "ranking", label: "Ranking", type: "number", showInTable: true },
    { key: "global_score", label: "Global Score", type: "number", showInTable: true },
    { key: "total_students", label: "Total Students", type: "number", showInTable: false },
    { key: "international_ratio", label: "International %", type: "number", showInTable: false },
    { key: "established", label: "Established Year", type: "number", showInTable: false },
    { key: "campus_size", label: "Campus Size", showInTable: false, placeholder: "e.g. 100 acres" },
    { key: "logo_url", label: "Logo URL", showInTable: false },
    { key: "hero_image", label: "Hero Image URL", showInTable: false },
    { key: "latitude", label: "Latitude", type: "number", showInTable: false, placeholder: "e.g. 3.1390" },
    { key: "longitude", label: "Longitude", type: "number", showInTable: false, placeholder: "e.g. 101.6869" },
    { key: "study_reasons", label: "Reasons to Study Here", type: "json_array", showInTable: false, helpText: 'JSON array of objects: [{"title":"...","description":"..."}]', placeholder: '[{"title":"World-class Faculty","description":"Top professors..."}]' },
    { key: "registration_steps", label: "Registration Steps", type: "json_array", showInTable: false, helpText: 'JSON array of objects: [{"step":1,"title":"...","description":"..."}]', placeholder: '[{"step":1,"title":"Apply Online","description":"Submit your application..."}]' },
    { key: "faqs", label: "FAQs", type: "json_array", showInTable: false, helpText: 'JSON array: [{"question":"...","answer":"..."}]', placeholder: '[{"question":"How to apply?","answer":"Visit our portal..."}]' },
  ];

  return (
    <AdminCrudTable
      title="Universities"
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
