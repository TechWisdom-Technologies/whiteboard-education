import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import AdminDocumentForm, { DOCUMENT_TYPES } from "./AdminDocumentForm";

export default function AdminPartnerDocuments() {
  const { data, isLoading } = useTableData("partner_documents");
  const insert = useInsertRow("partner_documents");
  const update = useUpdateRow("partner_documents");
  const del = useDeleteRow("partner_documents");
  const bulkUpsert = useBulkUpsertRows("partner_documents");

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields: FieldConfig[] = [
    { key: "title", label: "Document Name", showInTable: true, placeholder: "e.g. Study Guide" },
    {
      key: "file_type",
      label: "File Type",
      type: "select",
      options: DOCUMENT_TYPES.map((t) => t.value),
      showInTable: true,
    },
    { key: "file_size", label: "Size (MB)", type: "number", showInTable: true, placeholder: "e.g. 4.2" },
    { key: "file_url", label: "File URL", showInTable: true, placeholder: "https://..." },
    { key: "is_active", label: "Active", type: "select", options: ["true", "false"], showInTable: true },
  ];

  if (action === "new" || editingRow) {
    return <AdminDocumentForm initialData={editingRow} onCancel={closeForm} onSuccess={closeForm} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Partner Documents & Resources</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage marketing documents, study guides, and forms that appear in the partner portal Documents section.
        </p>
      </div>

      <AdminCrudTable
        title="Partner Documents"
        data={data}
        isLoading={isLoading}
        fields={fields}
        searchKey="title"
        onInsert={(row) => insert.mutate({ ...row, is_active: row.is_active === "true" || row.is_active === true })}
        onUpdate={(row) => update.mutate({ ...row, is_active: row.is_active === "true" || row.is_active === true })}
        onDelete={(id) => del.mutate(id)}
        onBulkUpsert={(rows) => bulkUpsert.mutateAsync(rows.map(r => ({ ...r, is_active: r.is_active === "true" || r.is_active === true }))).then(() => undefined)}
        onAddClick={() => setSearchParams({ action: "new" })}
        onEditClick={(row) => setEditingRow(row)}
        hideTitle
      />
    </div>
  );
}

