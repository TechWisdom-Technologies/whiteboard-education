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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";

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
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const qc = useQueryClient();

  const formatSource = (src: string) => {
    if (!src) return "Application Page";
    const lower = src.toLowerCase();
    if (lower.includes("contact") || lower.includes("event")) return "Contact Page";
    return "Application Page";
  };

  const openDetail = (lead: any) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

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
            <div className="rounded-sm border">
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
                    <TableHead>Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="font-medium text-foreground">{lead.full_name}</TableCell>
                      <TableCell>
                        <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">{lead.email}</a>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Badge className={`${statusColors[lead.status] || ""} border-0`}>{lead.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatSource(lead.source)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl text-sm">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Name</Label><p className="font-medium">{selectedLead.full_name}</p></div>
                <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{selectedLead.email}</p></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{selectedLead.phone || "N/A"}</p></div>
                <div><Label className="text-xs text-muted-foreground">Nationality</Label><p className="font-medium">{selectedLead.nationality || "N/A"}</p></div>
                <div><Label className="text-xs text-muted-foreground">Interested Course</Label><p className="font-medium">{selectedLead.interested_course || "N/A"}</p></div>
                <div><Label className="text-xs text-muted-foreground">Interested University</Label><p className="font-medium">{selectedLead.interested_university || "N/A"}</p></div>
                <div><Label className="text-xs text-muted-foreground">Source</Label><p className="font-medium">{formatSource(selectedLead.source)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Date</Label><p className="font-medium">{new Date(selectedLead.created_at).toLocaleString()}</p></div>
              </div>
              {selectedLead.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Message</Label>
                  <div className="p-3 bg-muted/50 rounded-sm mt-1 border whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>
              )}
              <div className="border-t pt-4 mt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Update Status</Label>
                <Select value={selectedLead.status} onValueChange={(v) => { updateStatus(selectedLead.id, v); setSelectedLead({...selectedLead, status: v}); }}>
                  <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
