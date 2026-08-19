import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import AdminAccountManagerForm from "./AdminAccountManagerForm";

export default function AdminPartnerAccountManagers() {
  const { data, isLoading } = useTableData("account_managers");
  const insert = useInsertRow("account_managers");
  const update = useUpdateRow("account_managers");
  const del = useDeleteRow("account_managers");
  const bulkUpsert = useBulkUpsertRows("account_managers");

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields: FieldConfig[] = [
    { key: "name", label: "Full Name", showInTable: true, placeholder: "John Doe" },
    { key: "title", label: "Job Title", showInTable: true, placeholder: "Senior Partner Manager" },
    { key: "email", label: "Email Address", showInTable: true, placeholder: "john@example.com" },
    { key: "phone", label: "Phone Number", showInTable: true, placeholder: "+1 234 567 8900" },
    { key: "photo_url", label: "Photo URL", showInTable: false, placeholder: "https://example.com/photo.jpg (Optional)" },
  ];

  if (action === "new" || editingRow) {
    return <AdminAccountManagerForm initialData={editingRow} onCancel={closeForm} onSuccess={closeForm} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Account Manager Profiles</h1>
        <p className="text-sm text-muted-foreground">
          Manage the Account Managers displayed on the partner portal dashboard.
        </p>
      </div>

      <AdminCrudTable
        title="Account Managers"
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
        hideTitle
      />
    </div>
  );
}
