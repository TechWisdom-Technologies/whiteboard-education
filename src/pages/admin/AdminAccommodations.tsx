import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";
import AdminAccommodationForm from "./AdminAccommodationForm";

export default function AdminAccommodations() {
  const { data, isLoading } = useTableData("accommodations");
  const { data: universities } = useTableData("universities");
  const insert = useInsertRow("accommodations");
  const update = useUpdateRow("accommodations");
  const del = useDeleteRow("accommodations");
  const bulkUpsert = useBulkUpsertRows("accommodations");

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const action = searchParams.get("action");

  const closeForm = () => {
    setSearchParams(new URLSearchParams());
    setEditingRow(null);
  };

  const fields = useMemo<FieldConfig[]>(() => [
    { key: "name", label: "Name", showInTable: true },
    { key: "city", label: "City", showInTable: true },
    { key: "property_type", label: "Property Type", type: "select", options: ["Residential", "Commercial", "Mixed-Use", "Student Housing"], showInTable: false },
    { key: "type", label: "Accommodation Type", type: "select", options: ["Apartment", "Hostel", "Condominium", "Studio", "Shared House", "Dormitory"], showInTable: true },
    { key: "price_per_month", label: "Price/Month (MYR)", type: "number", showInTable: true },
    { key: "description", label: "Description", type: "textarea", showInTable: false, placeholder: "Brief description of the property..." },
    { key: "image_url", label: "Image URL", showInTable: false },
    { key: "latitude", label: "Latitude", type: "number", showInTable: false, placeholder: "e.g. 3.1390" },
    { key: "longitude", label: "Longitude", type: "number", showInTable: false, placeholder: "e.g. 101.6869" },
    { key: "unit_types", label: "Unit Types", type: "tag_input", showInTable: false, placeholder: "e.g. Single, Double, Twin, Suite" },
    { key: "room_types", label: "Available Room Types", type: "tag_input", showInTable: false, placeholder: "e.g. En-suite, Shared Bathroom, Master" },
    { key: "travel_distance", label: "Travel Distance (from nearest uni)", showInTable: false, placeholder: "e.g. 5 min walk / 15 min bus" },
    { key: "amenities", label: "Amenities", type: "tag_input", showInTable: false, placeholder: "e.g. WiFi, Gym, Pool, Laundry, 24h Security" },
    { key: "contact_phone", label: "Contact Phone", showInTable: false },
    { key: "contact_email", label: "Contact Email", showInTable: false },
    {
      key: "near_university_ids",
      label: "Nearby Universities",
      type: "relation_array",
      showInTable: false,
      relationConfig: {
        data: universities || [],
        valueKey: "id",
        labelKey: "name",
      }
    },
  ], [universities]);

  if (action === "new" || editingRow) {
    return (
      <AdminAccommodationForm
        initialData={editingRow}
        onCancel={closeForm}
        onSuccess={closeForm}
      />
    );
  }

  return (
    <AdminCrudTable
      title="Accommodations"
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
