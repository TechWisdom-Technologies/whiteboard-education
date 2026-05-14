import AdminCrudTable, { FieldConfig } from "@/components/admin/AdminCrudTable";
import { useTableData, useInsertRow, useUpdateRow, useDeleteRow, useBulkUpsertRows } from "@/hooks/useSupabaseData";

const fields: FieldConfig[] = [
  { key: "name", label: "Name", showInTable: true },
  { key: "city", label: "City", showInTable: true },
  { key: "property_type", label: "Property Type", type: "select", options: ["Residential", "Commercial", "Mixed-Use", "Student Housing"], showInTable: true },
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
  { key: "near_university_ids", label: "Nearby University IDs", type: "json_array", showInTable: false, placeholder: '["uuid-1","uuid-2"]' },
];

export default function AdminAccommodations() {
  const { data, isLoading } = useTableData("accommodations");
  const insert = useInsertRow("accommodations");
  const update = useUpdateRow("accommodations");
  const del = useDeleteRow("accommodations");
  const bulkUpsert = useBulkUpsertRows("accommodations");

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
    />
  );
}
