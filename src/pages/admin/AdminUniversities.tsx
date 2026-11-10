import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AdminUniversityForm from "./AdminUniversityForm";
import { ALL_PRIORITY_UNIVERSITIES } from "@/lib/universityPriority";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminUniversities() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useTableData("universities");
  const { data: countries } = useTableData("countries", { orderBy: "name" });
  const insert = useInsertRow("universities");
  const update = useUpdateRow("universities");
  const del = useDeleteRow("universities");
  const bulkUpsert = useBulkUpsertRows("universities");

  const [isSeeding, setIsSeeding] = useState(false);

  // Identify partner universities not yet in the database
  const missingPriorityUnis = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return ALL_PRIORITY_UNIVERSITIES.filter((p) => {
      return !data.some((row: any) => {
        const nameLower = (row.name || "").toLowerCase();
        return p.matchKeys.some((k) => nameLower.includes(k));
      });
    });
  }, [data]);

  const handleSeedMissing = async () => {
    if (missingPriorityUnis.length === 0) return;
    setIsSeeding(true);
    try {
      const malaysia = countries?.find((c: any) => c.name?.toLowerCase() === "malaysia");
      const countryId = malaysia?.id || (countries && countries[0]?.id);

      const rowsToInsert = missingPriorityUnis.map((p) => ({
        name: p.name,
        city: p.city,
        country_id: countryId,
        description: p.description,
        about_text: p.description,
        logo_url: p.logo_url,
        hero_image: p.hero_image,
        faqs: [],
      }));

      const { error } = await (supabase.from("universities") as any).insert(rowsToInsert);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success(
        `Successfully created ${rowsToInsert.length} partner universities in the database! You can now edit their details.`
      );
    } catch (err: any) {
      toast.error(`Failed to create universities: ${err.message || err}`);
    } finally {
      setIsSeeding(false);
    }
  };

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
    <div className="space-y-4">
      {missingPriorityUnis.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-[#2F4F97] shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">
                {missingPriorityUnis.length} Partner Universities from the official list are not in the database yet.
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Create these universities with preconfigured logos and descriptions so you can edit details, add courses, and attach accommodations.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-[#2F4F97] hover:bg-[#233d75] text-white shrink-0 font-medium px-4 h-9"
            disabled={isSeeding}
            onClick={handleSeedMissing}
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Universities...
              </>
            ) : (
              `Create ${missingPriorityUnis.length} Missing Universities`
            )}
          </Button>
        </div>
      )}

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
    </div>
  );
}
