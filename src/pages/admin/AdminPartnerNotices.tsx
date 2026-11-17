import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import AdminNoticeForm, { NOTICE_CATEGORIES } from "./AdminNoticeForm";

export default function AdminPartnerNotices() {
  const { data, isLoading } = useTableData("partner_notices");
  const insert = useInsertRow("partner_notices");
  const update = useUpdateRow("partner_notices");
  const del = useDeleteRow("partner_notices");
  const bulkUpsert = useBulkUpsertRows("partner_notices");

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields: FieldConfig[] = [
    { key: "title", label: "Title", showInTable: true, placeholder: "Notice headline" },
    { key: "category", label: "Category", type: "select", options: NOTICE_CATEGORIES, showInTable: true },
    { key: "content", label: "Details / Message", type: "textarea", showInTable: true },
    { key: "link_url", label: "Link URL", showInTable: false, placeholder: "https://... (Optional)" },
    { key: "is_active", label: "Active", type: "select", options: ["true", "false"], showInTable: true },
  ];

  if (action === "new" || editingRow) {
    return <AdminNoticeForm initialData={editingRow} onCancel={closeForm} onSuccess={closeForm} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Recent Updates & Notices</h1>
        <p className="text-sm text-muted-foreground">
          Publish announcements, scholarship offers, and crucial notices that appear on the partner portal dashboard.
        </p>
      </div>

      <AdminCrudTable
        title="Updates & Notices"
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

