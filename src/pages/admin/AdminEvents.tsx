import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import AdminEventForm from "./AdminEventForm";

export default function AdminEvents() {
  const { data, isLoading } = useTableData("events");
  const insert = useInsertRow("events");
  const update = useUpdateRow("events");
  const del = useDeleteRow("events");
  const bulkUpsert = useBulkUpsertRows("events");

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields: FieldConfig[] = [
    { key: "title", label: "Title", showInTable: true },
    { key: "type", label: "Type", type: "select", options: ["Open Day", "Workshop", "Webinar", "Info Session"], showInTable: true },
    { key: "date", label: "Date", showInTable: true, placeholder: "2026-04-15" },
    { key: "time", label: "Time", showInTable: true, placeholder: "10:00 AM" },
    { key: "meeting_link", label: "Meeting Link (Zoom / Google Meet)", showInTable: false, placeholder: "https://meet.google.com/... or https://zoom.us/j/..." },
    { key: "description", label: "Description", type: "textarea", showInTable: false },
    { key: "spots_left", label: "Spots Left", type: "number", showInTable: true },
    { key: "university_ids", label: "University IDs", type: "json_array", showInTable: false, placeholder: '["uuid-1","uuid-2"]' },
  ];

  if (action === "new" || editingRow) {
    return <AdminEventForm initialData={editingRow} onCancel={closeForm} onSuccess={closeForm} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Upcoming Webinars & Events</h1>
        <p className="text-sm text-muted-foreground">
          Webinars and events added here appear under <strong>Upcoming Webinars</strong> on the partner portal dashboard.
        </p>
      </div>

      <AdminCrudTable
        title="Events"
        data={data}
        isLoading={isLoading}
        fields={fields}
        searchKey="title"
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
