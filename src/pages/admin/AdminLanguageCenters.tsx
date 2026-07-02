import { useMemo } from "react";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

const fields: FieldConfig[] = [
  { key: "name", label: "Center Name", showInTable: true },
  { key: "slug", label: "Slug", showInTable: true },
  { key: "city", label: "City", showInTable: true },
  { key: "logo_url", label: "Logo URL", showInTable: false, placeholder: "e.g. https://..." },
  { key: "about_image_url", label: "About Image URL", showInTable: false, placeholder: "e.g. https://..." },
  { key: "about_text", label: "About Text", type: "textarea", showInTable: false },
  { key: "more_info", label: "More Info", type: "json_array", showInTable: false, placeholder: '[{"title": "Intensive English", "description": "..."}]' },
  { key: "tuition_fees", label: "Tuition Fees", type: "json_array", showInTable: false, placeholder: '[{"duration": "1 month", "tuition_fee": "MYR 2,850", "visa": "0 month"}]' },
  { key: "faqs", label: "FAQs", type: "json_array", showInTable: false, placeholder: '[{"question": "...", "answer": "..."}]' },
];

export default function AdminLanguageCenters() {
  const { data, isLoading } = useTableData("language_centers");
  const insert = useInsertRow("language_centers");
  const update = useUpdateRow("language_centers");
  const del = useDeleteRow("language_centers");
  const bulkUpsert = useBulkUpsertRows("language_centers");

  // Map JSONB fields to arrays for visual editing
  const mappedData = useMemo(() => {
    if (!data) return [];
    return data.map((row: any) => {
      return {
        ...row,
        more_info: Array.isArray(row.more_info) ? row.more_info : [],
        tuition_fees: Array.isArray(row.tuition_fees) ? row.tuition_fees : [],
        faqs: Array.isArray(row.faqs) ? row.faqs : [],
      };
    });
  }, [data]);

  const parseJsonField = (val: any) => {
    if (!val) return [];
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  const handleInsert = (row: Record<string, any>) => {
    const { more_info, tuition_fees, faqs, ...rest } = row;
    insert.mutate({
      ...rest,
      more_info: parseJsonField(more_info),
      tuition_fees: parseJsonField(tuition_fees),
      faqs: parseJsonField(faqs),
    });
  };

  const handleUpdate = (row: Record<string, any>) => {
    const { more_info, tuition_fees, faqs, ...rest } = row;
    update.mutate({
      ...rest,
      more_info: parseJsonField(more_info),
      tuition_fees: parseJsonField(tuition_fees),
      faqs: parseJsonField(faqs),
    });
  };

  const handleBulkUpsert = async (rows: Record<string, any>[]) => {
    const mapped = rows.map((row) => {
      const { more_info, tuition_fees, faqs, ...rest } = row;
      return {
        ...rest,
        more_info: parseJsonField(more_info),
        tuition_fees: parseJsonField(tuition_fees),
        faqs: parseJsonField(faqs),
      };
    });
    await bulkUpsert.mutateAsync(mapped);
  };

  return (
    <AdminCrudTable
      title="Language Centers"
      data={mappedData}
      isLoading={isLoading}
      fields={fields}
      searchKey="name"
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onDelete={(id) => del.mutate(id)}
      onBulkUpsert={handleBulkUpsert}
    />
  );
}
