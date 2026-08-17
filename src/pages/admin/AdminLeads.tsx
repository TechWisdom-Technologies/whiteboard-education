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
import { Eye, ArrowLeft } from "lucide-react";

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

  if (detailOpen && selectedLead) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
              <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl border border-gray-100 shadow-sm backdrop-blur-md sticky top-4 z-10">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setDetailOpen(false)} 
                  className="h-8 w-8 rounded-full bg-[#1d283a]/10 hover:bg-[#1d283a]/20 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-semibold text-[#1E293B]">
                  Lead Details
                </h2>
              </div>
        
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Name</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{selectedLead.full_name}</p></div>
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{selectedLead.email}</p></div>
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Phone</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{selectedLead.phone || "N/A"}</p></div>
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Nationality</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{selectedLead.nationality || "N/A"}</p></div>
              </div>
              <div className="space-y-4">
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Interested Course</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{selectedLead.interested_course || "N/A"}</p></div>
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Interested University</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{selectedLead.interested_university || "N/A"}</p></div>
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Source</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{formatSource(selectedLead.source)}</p></div>
                <div><Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Date Received</Label><p className="font-medium text-[14px] mt-1 text-gray-900">{new Date(selectedLead.created_at).toLocaleString()}</p></div>
              </div>
            </div>
            
            {selectedLead.message && (
              <div className="pt-4 border-t border-gray-100">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Message</Label>
                <div className="p-4 bg-[#F8FAFC] rounded-xl mt-2 border border-gray-100 whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
                  {selectedLead.message}
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-gray-100 bg-gray-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 pb-2 mt-4 rounded-b-xl">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3 block">Update Lead Status</Label>
              <Select value={selectedLead.status} onValueChange={(v) => { updateStatus(selectedLead.id, v); setSelectedLead({...selectedLead, status: v}); }}>
                <SelectTrigger className="w-full sm:w-[250px] bg-white h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">All Leads</h1>
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-10 text-[13px] px-4 whitespace-nowrap">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white shadow-sm border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No leads found.</p>
          ) : (
            <div className="rounded-xl border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] text-center px-0">
                      <Checkbox 
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="h-10">Name</TableHead>
                    <TableHead className="h-10">Email</TableHead>
                    <TableHead className="h-10">Date</TableHead>
                    <TableHead className="h-10">Status</TableHead>
                    <TableHead className="h-10">Source</TableHead>
                    <TableHead className="text-left h-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead: any) => (
                    <TableRow key={lead.id} className="h-10 hover:bg-muted/50 transition-colors">
                      <TableCell className="text-center px-0 py-1">
                        <Checkbox 
                          checked={selectedIds.includes(lead.id)}
                          onCheckedChange={(c) => handleSelectRow(lead.id, c as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-normal text-foreground py-1 text-xs md:text-[13px]">{lead.full_name}</TableCell>
                      <TableCell className="py-1 text-xs md:text-[13px]">
                        <a href={`mailto:${lead.email}`} className="text-[#1d283a] hover:underline">{lead.email}</a>
                      </TableCell>
                      <TableCell className="py-1 text-xs md:text-[13px] text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="py-1"><Badge className={`${statusColors[lead.status] || ""} border-0`}>{lead.status}</Badge></TableCell>
                      <TableCell className="py-1 text-xs md:text-[13px] text-muted-foreground">{formatSource(lead.source)}</TableCell>
                      <TableCell className="text-left py-1">
                        <div className="flex items-center justify-start gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={() => openDetail(lead)}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
    </div>
  );
}
