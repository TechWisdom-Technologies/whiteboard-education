import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminUniversityForm from "./AdminUniversityForm";

export default function AdminUniversities() {
  const { data, isLoading } = useTableData("universities");
  const { data: countries } = useTableData("countries", { orderBy: "name" });
  const insert = useInsertRow("universities");
  const update = useUpdateRow("universities");
  const del = useDeleteRow("universities");
  const bulkUpsert = useBulkUpsertRows("universities");

  // Only keep columns that actually exist in the local public.universities table schema
  const fields: FieldConfig[] = [
    { key: "name", label: "Name", showInTable: true },
    { key: "city", label: "City", showInTable: true },
    { key: "country_id", label: "Country", type: "relation", showInTable: false, relationConfig: { data: countries || [], valueKey: "id", labelKey: "name" } },
    { key: "description", label: "Short Description", type: "textarea", showInTable: false },
    { key: "about_text", label: "About (detailed)", type: "textarea", showInTable: false },
    { key: "logo_url", label: "Logo URL", showInTable: false },
    { key: "hero_image", label: "Hero Image URL", showInTable: false },
    { key: "faqs", label: "FAQs", type: "json_array", showInTable: false, placeholder: '[{"question":"How to apply?","answer":"Visit our portal..."}]' },
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
      <AdminUniversityForm 
        initialData={editingRow} 
        onCancel={closeForm} 
        onSuccess={closeForm} 
      />
    );
  }

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
      onAddClick={() => setSearchParams({ action: "new" })}
      onEditClick={(row) => setEditingRow(row)}
    />
  );
}
