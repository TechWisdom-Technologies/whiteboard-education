import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

const fields: FieldConfig[] = [
  { key: "title", label: "Title", showInTable: true },
  { key: "excerpt", label: "Excerpt", type: "textarea", showInTable: false },
  { key: "content", label: "Content", type: "richtext", showInTable: false },
  { key: "author", label: "Author", showInTable: true },
  { key: "category", label: "Category", showInTable: true },
  { key: "read_time", label: "Read Time", showInTable: true, placeholder: "5 min read" },
  { key: "image", label: "Thumbnail URL", showInTable: false },
  { key: "cover_image", label: "Cover Image URL", showInTable: false },
];

export default function AdminBlogs() {
  const { data, isLoading } = useTableData("blogs");
  const insert = useInsertRow("blogs");
  const update = useUpdateRow("blogs");
  const del = useDeleteRow("blogs");
  const bulkUpsert = useBulkUpsertRows("blogs");

  return (
    <AdminCrudTable
      title="Blog Posts"
      data={data}
      isLoading={isLoading}
      fields={fields}
      searchKey="title"
      onInsert={(row) => insert.mutate({ ...row, date: new Date().toISOString().split('T')[0] })}
      onUpdate={(row) => update.mutate(row)}
      onDelete={(id) => del.mutate(id)}
      onBulkUpsert={(rows) => bulkUpsert.mutateAsync(rows).then(() => undefined)}
    />
  );
}
