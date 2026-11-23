import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import AdminAccountManagerForm from "./AdminAccountManagerForm";

export default function AdminPartnerAccountManagers() {
  const { data, isLoading } = useTableData("account_managers");
  const insert = useInsertRow("account_managers");
  const update = useUpdateRow("account_managers");
  const del = useDeleteRow("account_managers");
  const bulkUpsert = useBulkUpsertRows("account_managers");

  const [partners, setPartners] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  useEffect(() => {
    supabase
      .from("partner_registrations")
      .select("id, account_manager_id")
      .then(({ data: pData }) => {
        if (pData) setPartners(pData);
      });
  }, []);

  const countsMap = useMemo(() => {
    const map = new Map<string, number>();
    partners.forEach((p) => {
      if (p.account_manager_id) {
        map.set(p.account_manager_id, (map.get(p.account_manager_id) || 0) + 1);
      }
    });
    return map;
  }, [partners]);

  const enhancedData = useMemo(() => {
    return (data || []).map((manager: any) => ({
      ...manager,
      assigned_partners_count: countsMap.get(manager.id) || 0,
    }));
  }, [data, countsMap]);

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields: FieldConfig[] = [
    { key: "name", label: "Full Name", showInTable: true, placeholder: "John Doe" },
    { key: "title", label: "Job Title", showInTable: true, placeholder: "Senior Partner Manager" },
    { key: "email", label: "Email Address", showInTable: true, placeholder: "john@example.com" },
    { key: "phone", label: "Phone Number", showInTable: true, placeholder: "+1 234 567 8900" },
    { key: "assigned_partners_count", label: "Assigned Agencies", showInTable: true },
    { key: "photo_url", label: "Photo URL", showInTable: false, placeholder: "https://example.com/photo.jpg (Optional)" },
  ];

  const renderCustomCell = (row: any, key: string) => {
    if (key === "assigned_partners_count") {
      const count = row.assigned_partners_count || 0;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            count > 0 ? "bg-slate-100 text-slate-800" : "bg-gray-50 text-gray-400"
          }`}
        >
          {count} {count === 1 ? "agency" : "agencies"}
        </span>
      );
    }
    return undefined;
  };

  if (action === "new" || editingRow) {
    return <AdminAccountManagerForm initialData={editingRow} onCancel={closeForm} onSuccess={closeForm} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Account Manager Profiles</h1>
        <p className="text-sm text-muted-foreground">
          Manage the Account Managers and see assigned partner agencies.
        </p>
      </div>

      <AdminCrudTable
        title="Account Managers"
        data={enhancedData}
        isLoading={isLoading}
        fields={fields}
        searchKey="name"
        renderCell={renderCustomCell}
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
