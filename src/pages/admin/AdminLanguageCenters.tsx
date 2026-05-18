import { useMemo } from "react";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

const fields: FieldConfig[] = [
  { key: "name", label: "Program Name", showInTable: true },
  { key: "institute", label: "Institute", showInTable: true },
  { key: "city", label: "City", showInTable: true },
  { key: "level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"], showInTable: true },
  { key: "tuition_fee", label: "Tuition Fee (MYR)", type: "number", showInTable: true },
  { key: "duration", label: "Duration", showInTable: false, placeholder: "e.g. 6 months" },
  { key: "overview_1", label: "Overview Paragraph 1", type: "textarea", showInTable: false },
  { key: "overview_2", label: "Overview Paragraph 2", type: "textarea", showInTable: false },
  { key: "about_image_url", label: "About Image URL", showInTable: false, placeholder: "e.g. https://images.unsplash.com/..." },
  { key: "intake_months", label: "Intake Months", type: "tag_input", showInTable: false, placeholder: "e.g. January, May, September" },
];

export default function AdminLanguageCenters() {
  const { data, isLoading } = useTableData("language_centers");
  const insert = useInsertRow("language_centers");
  const update = useUpdateRow("language_centers");
  const del = useDeleteRow("language_centers");
  const bulkUpsert = useBulkUpsertRows("language_centers");

  // Map Supabase rows to match the front-end fields (overview_1, overview_2, about_image_url)
  const mappedData = useMemo(() => {
    if (!data) return [];
    return data.map((row: any) => {
      const rawAbout = row.overview || "";
      const paragraphs = rawAbout
        .split("\n")
        .map((p: string) => p.trim())
        .filter((p: string) => p !== "");
      
      const overview_1 = paragraphs[0] || "";
      const overview_2 = paragraphs.slice(1).join("\n\n") || "";

      let about_image_url = "";
      if (row.curriculum) {
        if (typeof row.curriculum === "object") {
          if (!Array.isArray(row.curriculum)) {
            about_image_url = (row.curriculum as any).about_image_url || "";
          }
        } else if (typeof row.curriculum === "string") {
          try {
            const parsed = JSON.parse(row.curriculum);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              about_image_url = parsed.about_image_url || "";
            } else {
              about_image_url = row.curriculum;
            }
          } catch {
            about_image_url = row.curriculum;
          }
        }
      }

      return {
        ...row,
        overview_1,
        overview_2,
        about_image_url,
      };
    });
  }, [data]);

  // Convert form fields back to database structure before saving
  const handleInsert = (row: Record<string, any>) => {
    const { overview_1, overview_2, about_image_url, ...rest } = row;
    const overview = [overview_1?.trim(), overview_2?.trim()].filter(Boolean).join("\n\n");
    const curriculum = about_image_url ? { about_image_url } : null;
    
    insert.mutate({
      ...rest,
      overview,
      curriculum,
    });
  };

  const handleUpdate = (row: Record<string, any>) => {
    const { overview_1, overview_2, about_image_url, ...rest } = row;
    const overview = [overview_1?.trim(), overview_2?.trim()].filter(Boolean).join("\n\n");
    const curriculum = about_image_url ? { about_image_url } : null;

    update.mutate({
      ...rest,
      overview,
      curriculum,
    });
  };

  const handleBulkUpsert = async (rows: Record<string, any>[]) => {
    const mapped = rows.map((row) => {
      const { overview_1, overview_2, about_image_url, ...rest } = row;
      const overview = [overview_1?.trim(), overview_2?.trim()].filter(Boolean).join("\n\n");
      const curriculum = about_image_url ? { about_image_url } : null;
      return {
        ...rest,
        overview,
        curriculum,
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
