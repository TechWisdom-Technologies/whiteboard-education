/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, type ChangeEvent } from "react";
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

type TemplateColumnMeta = {
  column: string;
  label: string;
  type: string;
  example: string | number;
};

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "json_array" | "json_object" | "relation" | "tag_input";
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
  const [text, setText] = useState(() => {
    try { return typeof value === "string" ? value : JSON.stringify(value, null, 2); } catch { return "{}"; }
  });
  const [error, setError] = useState("");

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder || '{"key": "value"}'}
        rows={4}
        className="font-mono text-xs"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function JsonArrayEditor({ value, onChange, placeholder }: { value: any; onChange: (v: any) => void; placeholder?: string }) {
  const [text, setText] = useState(() => {
    try { return typeof value === "string" ? value : JSON.stringify(value, null, 2); } catch { return "[]"; }
  });
  const [error, setError] = useState("");

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Must be array");
      onChange(parsed);
      setError("");
    } catch {
      setError("Invalid JSON array");
    }
  };

  return (
    <div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder || '[{"key": "value"}]'}
        rows={4}
        className="font-mono text-xs"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tableFields = fields.filter((f) => f.showInTable !== false);

  const filtered = (data || []).filter((row) =>
    String(row[searchKey] || "").toLowerCase().includes(search.toLowerCase())
  );

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

      if (lowerName.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("JSON file must contain an array of objects");
        importedRows = parsed;
      } else if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        importedRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      } else {
        throw new Error("Unsupported file type. Use .xlsx, .xls, or .json");
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
    if (f.type === "select") {
      return (
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
    if (val === null || val === undefined) return "—";
    if (Array.isArray(val)) return val.length > 0 ? val.slice(0, 3).join(", ") + (val.length > 3 ? "…" : "") : "—";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.json"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button variant="outline" onClick={handleDownloadTemplate} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />Download Template
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />Export Excel
          </Button>
          <Button
            variant="outline"
            disabled={!onBulkUpsert || isImporting}
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />{isImporting ? "Importing..." : "Import Excel/JSON"}
          </Button>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />Add {title.replace(/s$/, "")}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRow ? "Edit" : "Add"} {title.replace(/s$/, "")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {fields.map((f) => (
              <div key={f.key}>
                <Label className="mb-1 block">{f.label}</Label>
                {renderField(f)}
                {f.helpText && <p className="text-xs text-muted-foreground mt-1">{f.helpText}</p>}
              </div>
            ))}
            <Button className="w-full" onClick={handleSave}>
              {editingRow ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative mb-4 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {tableFields.map((f) => (
                <TableHead key={f.key}>{f.label}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
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
              filtered.map((row) => (
                <TableRow key={row.id}>
                  {tableFields.map((f) => (
                    <TableCell key={f.key} className={f.key === searchKey ? "font-medium" : ""}>
                      {renderCell ? renderCell(row, f.key) ?? formatCellValue(row, f.key) : formatCellValue(row, f.key)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(row.id)}>Delete</AlertDialogAction>
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
    </div>
  );
}
