import { useTableData } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, UserPlus, Clock, CheckCircle, Phone, Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-warning/10 text-warning",
  qualified: "bg-secondary/10 text-secondary",
  converted: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export default function AdminLeads() {
  const { data: leads = [], isLoading } = useTableData("leads");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const qc = useQueryClient();

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase.from("leads" as any) as any).update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    qc.invalidateQueries({ queryKey: ["leads"] });
    toast.success(`Status updated to ${status}`);
  };

  const filtered = filter === "all" ? leads : leads.filter((l: any) => l.status === filter);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((l: any) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(v => v !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} leads? This action cannot be undone.`)) return;

    try {
      await Promise.all(selectedIds.map(id => 
        (supabase.from("leads" as any) as any).delete().eq("id", id).then((res: any) => {
          if (res.error) throw new Error("Failed to delete lead");
        })
      ));

      toast.success(`${selectedIds.length} leads deleted successfully`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete leads");
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l: any) => l.status === "new").length,
    contacted: leads.filter((l: any) => l.status === "contacted").length,
    converted: leads.filter((l: any) => l.status === "converted").length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, color: "text-primary" },
          { label: "New", value: stats.new, icon: UserPlus, color: "text-secondary" },
          { label: "Contacted", value: stats.contacted, icon: Clock, color: "text-warning" },
          { label: "Converted", value: stats.converted, icon: CheckCircle, color: "text-success" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-3">
          <div className="flex items-center gap-3">
            <CardTitle>All Leads</CardTitle>
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-7 text-xs px-2.5">
                <Trash2 className="h-3 w-3 mr-1" /> Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No leads found.</p>
          ) : (
            <div className="overflow-x-auto rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] text-center px-0">
                      <Checkbox 
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-center px-0">
                        <Checkbox 
                          checked={selectedIds.includes(lead.id)}
                          onCheckedChange={(c) => handleSelectRow(lead.id, c as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{lead.full_name}</p>
                          {lead.nationality && <p className="text-xs text-muted-foreground">{lead.nationality}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline"><Mail className="h-3 w-3" />{lead.email}</a>
                          {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{lead.phone}</a>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {lead.interested_course && <p className="font-medium text-foreground">{lead.interested_course}</p>}
                          {lead.interested_university && <p className="text-muted-foreground">{lead.interested_university}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{lead.source}</Badge></TableCell>
                      <TableCell><Badge className={`${statusColors[lead.status] || ""} border-0`}>{lead.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="min-w-[150px]">
                        <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                          <SelectTrigger className="h-8 w-full sm:w-[120px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
