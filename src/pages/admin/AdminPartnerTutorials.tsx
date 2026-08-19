import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import AdminTutorialForm from "./AdminTutorialForm";

export default function AdminPartnerTutorials() {
  const { data, isLoading } = useTableData("platform_tutorials");
  const insert = useInsertRow("platform_tutorials");
  const update = useUpdateRow("platform_tutorials");
  const del = useDeleteRow("platform_tutorials");
  const bulkUpsert = useBulkUpsertRows("platform_tutorials");

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields: FieldConfig[] = [
    { key: "title", label: "Title", showInTable: true, placeholder: "How to use the dashboard" },
    { key: "description", label: "Description", type: "textarea", showInTable: true },
    { key: "youtube_url", label: "YouTube URL", showInTable: true, placeholder: "https://youtube.com/watch?v=..." },
    { key: "video_url", label: "Direct Video URL", showInTable: false, placeholder: "https://example.com/video.mp4 (Optional)" },
    { key: "sort_order", label: "Sort Order", type: "number", showInTable: true },
    { key: "is_active", label: "Active", type: "select", options: ["true", "false"], showInTable: true },
  ];

  if (action === "new" || editingRow) {
    return <AdminTutorialForm initialData={editingRow} onCancel={closeForm} onSuccess={closeForm} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Platform Tutorials</h1>
        <p className="text-sm text-muted-foreground">
          Manage tutorial videos shown on the partner dashboard.
        </p>
      </div>

      <AdminCrudTable
        title="Platform Tutorials"
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
      />
    </div>
  );
}
