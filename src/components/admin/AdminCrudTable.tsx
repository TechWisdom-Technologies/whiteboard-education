/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useMemo, type ChangeEvent } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Plus, Pencil, Trash2, Search, X, Upload, Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type TemplateColumnMeta = {
  column: string;
  label: string;
  type: string;
  example: string | number;
};

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "json_array" | "json_object" | "relation" | "tag_input" | "richtext";
  options?: string[];
  showInTable?: boolean;
  placeholder?: string;
  /** For relation fields: { data, valueKey, labelKey } */
  relationConfig?: {
    data: any[];
    valueKey: string;
    labelKey: string;
  };
  /** Help text shown below the field */
  helpText?: string;
}

const singularize = (word: string) => {
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }
  if (word.endsWith("s")) {
    return word.slice(0, -1);
  }
  return word;
};

interface AdminCrudTableProps {
  title: string;
  data: any[] | undefined;
  isLoading: boolean;
  fields: FieldConfig[];
  searchKey: string;
  onInsert: (row: Record<string, any>) => void;
  onUpdate: (row: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onBulkUpsert?: (rows: Record<string, any>[]) => Promise<void>;
  renderCell?: (row: any, key: string) => React.ReactNode;
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder={placeholder || "Type and press Enter"}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
      </div>
    </div>
  );
}

function JsonObjectEditor({ value, onChange, placeholder }: { value: any; onChange: (v: any) => void; placeholder?: string }) {
  // Parse initial value into key-value pairs
  const getEntries = (): Array<{ key: string; value: string }> => {
    try {
      const obj = typeof value === "string" ? JSON.parse(value) : value;
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        return Object.entries(obj).map(([k, v]) => ({ key: k, value: String(v) }));
      }
    } catch { /* ignore */ }
    return [];
  };

  const [entries, setEntries] = useState(getEntries);

  const sync = (updated: Array<{ key: string; value: string }>) => {
    setEntries(updated);
    const obj: Record<string, string> = {};
    updated.forEach(({ key, value: val }) => { if (key.trim()) obj[key.trim()] = val; });
    onChange(obj);
  };

  const updateEntry = (index: number, field: "key" | "value", val: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: val };
    sync(updated);
  };

  const addEntry = () => sync([...entries, { key: "", value: "" }]);
  const removeEntry = (i: number) => sync(entries.filter((_, j) => j !== i));

  // Parse hint keys from placeholder like {"IELTS":"6.0"}
  const hintKeys = (() => {
    if (!placeholder) return null;
    try {
      const parsed = JSON.parse(placeholder);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return Object.keys(parsed);
    } catch { /* ignore */ }
    return null;
  })();

  return (
    <div className="space-y-2">
      {entries.length === 0 && (
        <p className="text-xs text-muted-foreground italic py-2">No entries yet. Click "Add" to start.</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={entry.key}
            onChange={(e) => updateEntry(i, "key", e.target.value)}
            placeholder={hintKeys?.[0] || "Key"}
            className="flex-1 h-8 text-xs"
          />
          <Input
            value={entry.value}
            onChange={(e) => updateEntry(i, "value", e.target.value)}
            placeholder="Value"
            className="flex-1 h-8 text-xs"
          />
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => removeEntry(i)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addEntry}>
        <Plus className="h-3 w-3 mr-1" /> Add Entry
      </Button>
    </div>
  );
}

function JsonArrayEditor({ value, onChange, placeholder }: { value: any; onChange: (v: any) => void; placeholder?: string }) {
  // Detect the shape from the placeholder/existing data
  const detectKeys = (): string[] | null => {
    // Try from placeholder
    if (placeholder) {
      try {
        const parsed = JSON.parse(placeholder);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
          return Object.keys(parsed[0]);
        }
      } catch { /* ignore */ }
    }
    // Try from existing value
    const arr = Array.isArray(value) ? value : (() => { try { return JSON.parse(value); } catch { return []; } })();
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object" && arr[0] !== null) {
      return Object.keys(arr[0]);
    }
    return null;
  };

  const objectKeys = detectKeys();
  const isObjectArray = objectKeys !== null;

  const getItems = (): any[] => {
    try {
      const arr = Array.isArray(value) ? value : JSON.parse(value);
      if (Array.isArray(arr)) return arr;
    } catch { /* ignore */ }
    return [];
  };

  const [items, setItems] = useState(getItems);

  const sync = (updated: any[]) => {
    setItems(updated);
    onChange(updated);
  };

  // --- Plain string array mode ---
  if (!isObjectArray) {
    const addItem = () => sync([...items, ""]);
    const updateItem = (i: number, val: string) => {
      const updated = [...items];
      updated[i] = val;
      sync(updated);
    };
    const removeItem = (i: number) => sync(items.filter((_, j) => j !== i));

    return (
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No items yet. Click "Add" to start.</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={String(item || "")}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
              className="flex-1 h-8 text-xs"
            />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => removeItem(i)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addItem}>
          <Plus className="h-3 w-3 mr-1" /> Add Item
        </Button>
      </div>
    );
  }

  // --- Object array mode ---
  const addItem = () => {
    const empty: Record<string, any> = {};
    objectKeys.forEach((k) => (empty[k] = ""));
    sync([...items, empty]);
  };

  const updateField = (itemIndex: number, key: string, val: any) => {
    const updated = [...items];
    updated[itemIndex] = { ...updated[itemIndex], [key]: val };
    sync(updated);
  };

  const removeItem = (i: number) => sync(items.filter((_, j) => j !== i));

  // Check if any key likely holds long text (description, answer, etc.)
  const longKeys = new Set(
    objectKeys.filter((k) => /desc|answer|content|text|body|note|detail|overview|summary/i.test(k))
  );

  // Check for nested array keys (like "modules")
  const nestedArrayKeys = new Set(
    objectKeys.filter((k) => {
      return items.some((item) => Array.isArray(item?.[k]));
    })
  );

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic py-2">No items yet. Click "Add" to start.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="border bg-muted/30 p-3 space-y-2 relative group">
          {/* Item number badge and delete */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              Item {i + 1}
            </span>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-60 hover:opacity-100" onClick={() => removeItem(i)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          {objectKeys.map((key) => {
            // Skip rendering nested arrays as simple inputs - show a sub-list
            if (nestedArrayKeys.has(key)) {
              const subItems: any[] = Array.isArray(item?.[key]) ? item[key] : [];
              return (
                <div key={key}>
                  <label className="text-[11px] font-semibold text-muted-foreground capitalize block mb-1">
                    {key.replace(/_/g, " ")}
                  </label>
                  <div className="space-y-1 pl-2 border-l-2 border-primary/20">
                    {subItems.map((sub, si) => (
                      <div key={si} className="flex items-center gap-1.5">
                        {typeof sub === "object" && sub !== null ? (
                          Object.keys(sub).map((sk) => (
                            <Input
                              key={sk}
                              value={String(sub[sk] || "")}
                              onChange={(e) => {
                                const updatedSub = [...subItems];
                                updatedSub[si] = { ...updatedSub[si], [sk]: e.target.value };
                                updateField(i, key, updatedSub);
                              }}
                              placeholder={sk.replace(/_/g, " ")}
                              className="flex-1 h-7 text-xs"
                            />
                          ))
                        ) : (
                          <Input
                            value={String(sub || "")}
                            onChange={(e) => {
                              const updatedSub = [...subItems];
                              updatedSub[si] = e.target.value;
                              updateField(i, key, updatedSub);
                            }}
                            placeholder={`${key} ${si + 1}`}
                            className="flex-1 h-7 text-xs"
                          />
                        )}
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive flex-shrink-0" onClick={() => {
                          const updatedSub = subItems.filter((_, j) => j !== si);
                          updateField(i, key, updatedSub);
                        }}>
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button" variant="ghost" size="sm" className="h-6 text-[10px] px-2"
                      onClick={() => {
                        // Detect sub-item shape
                        const sample = subItems[0];
                        const newSub = sample && typeof sample === "object"
                          ? Object.fromEntries(Object.keys(sample).map((k) => [k, ""]))
                          : "";
                        updateField(i, key, [...subItems, newSub]);
                      }}
                    >
                      <Plus className="h-2.5 w-2.5 mr-0.5" /> Add {key.replace(/_/g, " ").replace(/s$/, "")}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div key={key}>
                <label className="text-[11px] font-semibold text-muted-foreground capitalize block mb-0.5">
                  {key.replace(/_/g, " ")}
                </label>
                {longKeys.has(key) ? (
                  <Textarea
                    value={String(item?.[key] || "")}
                    onChange={(e) => updateField(i, key, e.target.value)}
                    placeholder={key.replace(/_/g, " ")}
                    rows={2}
                    className="text-xs"
                  />
                ) : (
                  <Input
                    value={String(item?.[key] || "")}
                    onChange={(e) => updateField(i, key, e.target.value)}
                    placeholder={key.replace(/_/g, " ")}
                    className="h-8 text-xs"
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addItem}>
        <Plus className="h-3 w-3 mr-1" /> Add Item
      </Button>
    </div>
  );
}

export default function AdminCrudTable({
  title, data, isLoading, fields, searchKey, onInsert, onUpdate, onDelete, onBulkUpsert, renderCell,
}: AdminCrudTableProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tableFields = useMemo(() => fields.filter((f) => f.showInTable !== false), [fields]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const lowerSearch = search.toLowerCase();
    return data.filter((row) => {
      if (!lowerSearch) return true;
      // Search across all fields shown in table, plus the designated searchKey
      return tableFields.some(f => 
        String(row[f.key] || "").toLowerCase().includes(lowerSearch)
      ) || String(row[searchKey] || "").toLowerCase().includes(lowerSearch);
    });
  }, [data, search, tableFields, searchKey]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const getDefaultValue = (f: FieldConfig) => {
    if (f.type === "number") return 0;
    if (f.type === "json_array") return [];
    if (f.type === "json_object") return {};
    if (f.type === "tag_input") return [];
    return "";
  };

  const parseUnknownJson = (value: unknown) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return value;
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  };

  const parseByFieldType = (field: FieldConfig, value: unknown) => {
    if (field.type === "number") {
      if (value === "" || value === null || value === undefined) return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    if (field.type === "json_object") {
      if (value === "" || value === null || value === undefined) return {};
      const parsed = parseUnknownJson(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    }

    if (field.type === "json_array") {
      if (value === "" || value === null || value === undefined) return [];
      const parsed = parseUnknownJson(value);
      if (Array.isArray(parsed)) return parsed;
      if (typeof value === "string") {
        const tags = value
          .split(/[,;]+/)
          .map((v) => v.trim())
          .filter(Boolean);
        return tags;
      }
      return [];
    }

    if (field.type === "tag_input") {
      if (value === "" || value === null || value === undefined) return [];
      if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
      const parsed = parseUnknownJson(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
      if (typeof value === "string") {
        return value
          .split(/[,;]+/)
          .map((v) => v.trim())
          .filter(Boolean);
      }
      return [];
    }

    if (field.type === "relation") {
      if (value === "" || value === null || value === undefined) return null;
      return value;
    }

    if (typeof value === "string") return value.trim();
    return value;
  };

  const mapImportedRow = (row: Record<string, any>) => {
    const keyLookup: Record<string, string> = { id: "id" };
    fields.forEach((f) => {
      keyLookup[f.key.toLowerCase()] = f.key;
      keyLookup[f.label.toLowerCase()] = f.key;
    });

    const normalized: Record<string, any> = {};
    Object.keys(row).forEach((rawKey) => {
      const normalizedKey = keyLookup[String(rawKey).trim().toLowerCase()];
      if (normalizedKey) {
        normalized[normalizedKey] = row[rawKey];
      }
    });

    const cleaned: Record<string, any> = {};
    if (normalized.id !== undefined && normalized.id !== "") {
      cleaned.id = String(normalized.id);
    }

    fields.forEach((f) => {
      const rawVal = normalized[f.key];
      if (rawVal !== undefined) {
        cleaned[f.key] = parseByFieldType(f, rawVal);
      }
    });

    return cleaned;
  };

  const toExportValue = (field: FieldConfig, value: unknown) => {
    if (value === null || value === undefined) return "";
    if (field.type === "tag_input" && Array.isArray(value)) return value.join(", ");
    if (field.type === "json_array" || field.type === "json_object") return JSON.stringify(value);
    if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
    return value;
  };

  const getTemplateValue = (field: FieldConfig): string | number => {
    if (field.type === "number") return 0;
    if (field.type === "json_array") return "[]";
    if (field.type === "json_object") return "{}";
    if (field.type === "tag_input") return "value-1, value-2";
    if (field.type === "relation") return "related-record-id";
    if (field.type === "select") return field.options?.[0] || "";
    return field.placeholder || "";
  };

  const getColumnTypeLabel = (field: FieldConfig) => {
    if (!field.type) return "text";
    return field.type;
  };

  const handleDownloadTemplate = () => {
    const templateRow: Record<string, string | number> = { id: "" };
    fields.forEach((f) => {
      templateRow[f.key] = getTemplateValue(f);
    });

    const guideRows: TemplateColumnMeta[] = [
      { column: "id", label: "ID", type: "uuid", example: "leave empty for new rows" },
      ...fields.map((f) => ({
        column: f.key,
        label: f.label,
        type: getColumnTypeLabel(f),
        example: getTemplateValue(f),
      })),
    ];

    const workbook = XLSX.utils.book_new();
    const templateSheet = XLSX.utils.json_to_sheet([templateRow]);
    const guideSheet = XLSX.utils.json_to_sheet(guideRows);

    XLSX.utils.book_append_sheet(workbook, templateSheet, "Template");
    XLSX.utils.book_append_sheet(workbook, guideSheet, "Column Guide");

    const filePrefix = title.toLowerCase().replace(/\s+/g, "_");
    XLSX.writeFile(workbook, `${filePrefix}_template.xlsx`);
  };

  const handleExportExcel = () => {
    const rows = data || [];
    if (rows.length === 0) {
      toast({ title: "No data to export", description: `Add ${title.toLowerCase()} first.` });
      return;
    }

    const exportRows = rows.map((row) => {
      const result: Record<string, any> = {};
      if (row.id) result.id = row.id;
      fields.forEach((f) => {
        result[f.key] = toExportValue(f, row[f.key]);
      });
      return result;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const filePrefix = title.toLowerCase().replace(/\s+/g, "_");
    XLSX.writeFile(workbook, `${filePrefix}_export.xlsx`);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onBulkUpsert) return;

    setIsImporting(true);
    try {
      const lowerName = file.name.toLowerCase();
      let importedRows: Record<string, any>[] = [];

      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        importedRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      } else {
        throw new Error("Unsupported file type. Use .xlsx or .xls");
      }

      const cleanedRows = importedRows
        .map(mapImportedRow)
        .filter((row) => Object.keys(row).some((key) => key !== "id"));

      if (cleanedRows.length === 0) {
        throw new Error("No valid rows found in the selected file");
      }

      await onBulkUpsert(cleanedRows);
      toast({ title: "Import complete", description: `${cleanedRows.length} rows imported into ${title.toLowerCase()}.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import file";
      toast({ title: "Import failed", description: message, variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openCreate = () => {
    setEditingRow(null);
    const empty: Record<string, any> = {};
    fields.forEach((f) => (empty[f.key] = getDefaultValue(f)));
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    const vals: Record<string, any> = {};
    fields.forEach((f) => {
      const val = row[f.key];
      if (f.type === "json_array" || f.type === "tag_input") {
        vals[f.key] = Array.isArray(val) ? val : [];
      } else if (f.type === "json_object") {
        vals[f.key] = val && typeof val === "object" ? val : {};
      } else {
        vals[f.key] = val ?? "";
      }
    });
    setForm(vals);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const cleaned: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "number") {
        cleaned[f.key] = Number(form[f.key]) || 0;
      } else if (f.type === "json_array" || f.type === "tag_input") {
        cleaned[f.key] = Array.isArray(form[f.key]) ? form[f.key] : [];
      } else if (f.type === "json_object") {
        cleaned[f.key] = form[f.key] && typeof form[f.key] === "object" ? form[f.key] : {};
      } else if (f.type === "relation") {
        cleaned[f.key] = form[f.key] || null;
      } else {
        cleaned[f.key] = form[f.key];
      }
    });
    if (editingRow) {
      onUpdate({ id: editingRow.id, ...cleaned });
    } else {
      onInsert(cleaned);
    }
    setDialogOpen(false);
  };

  const renderField = (f: FieldConfig) => {
    if (f.type === "textarea") {
      return (
        <Textarea
          value={form[f.key] || ""}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          placeholder={f.placeholder || f.label}
          rows={3}
        />
      );
    }
    if (f.type === "richtext") {
      return (
        <div className="bg-white rounded-sm">
          <ReactQuill 
            theme="snow" 
            value={form[f.key] || ""} 
            onChange={(val) => setForm({ ...form, [f.key]: val })}
            className="bg-white text-gray-900 rounded-sm"
          />
        </div>
      );
    }
    if (f.type === "select") {
      return (
        <select
          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
          value={form[f.key] || ""}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        >
          <option value="">Select...</option>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.type === "relation") {
      const cfg = f.relationConfig;
      return (
        <select
          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
          value={form[f.key] || ""}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        >
          <option value="">None</option>
          {cfg?.data?.map((item: any) => (
            <option key={item[cfg.valueKey]} value={item[cfg.valueKey]}>
              {item[cfg.labelKey]}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === "tag_input") {
      return (
        <TagInput
          value={Array.isArray(form[f.key]) ? form[f.key] : []}
          onChange={(v) => setForm({ ...form, [f.key]: v })}
          placeholder={f.placeholder}
        />
      );
    }
    if (f.type === "json_array") {
      return (
        <JsonArrayEditor
          value={form[f.key]}
          onChange={(v) => setForm({ ...form, [f.key]: v })}
          placeholder={f.placeholder}
        />
      );
    }
    if (f.type === "json_object") {
      return (
        <JsonObjectEditor
          value={form[f.key]}
          onChange={(v) => setForm({ ...form, [f.key]: v })}
          placeholder={f.placeholder}
        />
      );
    }
    return (
      <Input
        type={f.type || "text"}
        value={form[f.key] || ""}
        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        placeholder={f.placeholder || f.label}
      />
    );
  };

  const formatCellValue = (row: any, key: string) => {
    const val = row[key];
    if (val === null || val === undefined) return "-";
    if (Array.isArray(val)) return val.length > 0 ? val.slice(0, 3).join(", ") + (val.length > 3 ? "…" : "") : "-";
    if (typeof val === "object") return JSON.stringify(val).slice(0, 50) + "…";
    return String(val);
  };

  if (isLoading) {
    return (
      <LoadingScreen label={`Loading ${title.toLowerCase()}`} sublabel="Fetching latest records" className="py-8" />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          {/* Search Field */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder={`Search ${title.toLowerCase()}...`} 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }} 
              className="pl-9 h-8 text-xs md:text-[13px] bg-white w-full" 
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 md:gap-2 justify-end flex-shrink-0">
            <Button variant="outline" onClick={handleDownloadTemplate} className="h-8 text-xs xl:text-[13px] px-2 xl:px-2.5 whitespace-nowrap">
              <Download className="h-3.5 w-3.5 mr-1 xl:mr-1.5" />Download Template
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="h-8 text-xs xl:text-[13px] px-2 xl:px-2.5 whitespace-nowrap">
              <Download className="h-3.5 w-3.5 mr-1 xl:mr-1.5" />Export Excel
            </Button>
            <Button
              variant="outline"
              disabled={!onBulkUpsert || isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs xl:text-[13px] px-2 xl:px-2.5 whitespace-nowrap"
            >
              <Upload className="h-3.5 w-3.5 mr-1 xl:mr-1.5" />{isImporting ? "Importing..." : "Import Excel"}
            </Button>
            <Button onClick={openCreate} className="h-8 text-xs xl:text-[13px] px-2 xl:px-2.5 whitespace-nowrap">
              <Plus className="h-3.5 w-3.5 mr-1 xl:mr-1.5" />Add {singularize(title)}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl text-[13px]">
          <DialogHeader>
            <DialogTitle className="text-base">{editingRow ? "Edit" : "Add"} {singularize(title)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {fields.map((f) => (
              <div key={f.key}>
                <Label className="mb-1 block text-xs font-semibold">{f.label}</Label>
                {renderField(f)}
                {f.helpText && <p className="text-[11px] text-muted-foreground mt-1">{f.helpText}</p>}
              </div>
            ))}
            <Button className="w-full text-[13px] h-9" onClick={handleSave}>
              {editingRow ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-sm border bg-card overflow-x-auto">
        <Table className="text-xs md:text-[13px]">
          <TableHeader>
            <TableRow>
              {tableFields.map((f) => (
                <TableHead key={f.key} className="h-10 text-xs text-muted-foreground">{f.label}</TableHead>
              ))}
              <TableHead className="text-right h-10 text-xs text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableFields.length + 1} className="text-center py-8 text-muted-foreground">
                  No {title.toLowerCase()} found. Add your first one!
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {tableFields.map((f) => (
                    <TableCell key={f.key} className={`${f.key === searchKey ? "font-medium" : ""} py-2.5 text-xs md:text-[13px]`}>
                      {renderCell ? renderCell(row, f.key) ?? formatCellValue(row, f.key) : formatCellValue(row, f.key)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right py-2.5 text-xs md:text-[13px]">
                    <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive h-7 w-7">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="text-[13px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">Delete this item?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs">This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-[13px] h-8">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="text-[13px] h-8 bg-destructive hover:bg-destructive/90" onClick={() => onDelete(row.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs md:text-[13px]">
          <p className="text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
