import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle, Loader2, FileText, ExternalLink, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface PartnerRegistration {
  id: string;
  user_id: string;
  agency_name: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  annual_students: number;
  nid_document_url: string;
  trade_license_url: string;
  certificate_urls: string[];
  status: string;
  admin_notes: string;
  created_at: string;
}

type TabKey = "all" | "approved" | "pending" | "rejected";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminPartners() {
  const { session } = useAuth();
  const [registrations, setRegistrations] = useState<PartnerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<PartnerRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const fetchRegistrations = async () => {
    try {
      const token = session?.access_token || SUPABASE_KEY;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?select=*&order=created_at.desc`, {
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setRegistrations(await res.json());
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRegistrations(); }, [session]);

  const openDetail = (reg: PartnerRegistration) => {
    setSelectedReg(reg);
    setAdminNotes(reg.admin_notes || "");
    setDetailOpen(true);
  };

  const handleAction = async (action: "approved" | "rejected") => {
    if (!selectedReg || !session) return;
    setProcessing(true);
    try {
      const { error: regError } = await supabase
        .from("partner_registrations")
        .update({
          status: action,
          admin_notes: adminNotes || "",
        })
        .eq("id", selectedReg.id);

      if (regError) throw regError;

      if (action === "approved" && selectedReg.user_id) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({ user_id: selectedReg.user_id, role: "partner" }, { onConflict: "user_id,role" });

        if (roleError) throw roleError;
        
        // Notify the partner agent that their account has been approved
        await fetch(`${SUPABASE_URL}/rest/v1/partner_notifications`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            partner_id: selectedReg.user_id,
            title: "Account Approved",
            message: "Your partner agency account has been approved. You can now access the partner portal.",
            type: "success",
          }),
        });
      }

      toast.success(`Partner registration ${action}!`);
      setDetailOpen(false);
      fetchRegistrations();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} registration`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;
    if (!window.confirm("Are you sure you want to delete this partner? This action cannot be undone.")) return;

    try {
      const partner = registrations.find(r => r.id === id);
      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete partner");
      }

      if (partner?.user_id) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${partner.user_id}`, {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
        });
      }

      toast.success("Partner deleted successfully");
      fetchRegistrations();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete partner");
    }
  };

  // Filtered data based on active tab
  const filtered = activeTab === "all" ? registrations : registrations.filter(r => r.status === activeTab);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map(r => r.id));
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
    if (!session) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} partners? This action cannot be undone.`)) return;

    try {
      await Promise.all(selectedIds.map(async id => {
        const partner = registrations.find(r => r.id === id);
        
        const res = await fetch(`${SUPABASE_URL}/rest/v1/partner_registrations?id=eq.${id}`, {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
        });
        
        if (!res.ok) throw new Error("Failed to delete partner");

        if (partner?.user_id) {
          await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${partner.user_id}`, {
            method: "DELETE",
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${session.access_token}`,
            },
          });
        }
      }));

      toast.success(`${selectedIds.length} partners deleted successfully`);
      setSelectedIds([]);
      fetchRegistrations();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete partners");
    }
  };


  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved": return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Tab counts
  const counts = {
    all: registrations.length,
    approved: registrations.filter(r => r.status === "approved").length,
    pending: registrations.filter(r => r.status === "pending").length,
    rejected: registrations.filter(r => r.status === "rejected").length,
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "text-[#181d29]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
              activeTab === tab.key ? "bg-[#ffa300]/15 text-[#ffa300]" : "bg-gray-100 text-gray-400"
            }`}>
              {counts[tab.key]}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ffa300]" />
            )}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex justify-end mb-3">
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-7 text-xs px-3">
            <Trash2 className="h-3 w-3 mr-1" /> Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-sm border bg-card p-12 text-center text-muted-foreground">
          No {activeTab === "all" ? "" : activeTab} partner registrations{activeTab === "all" ? " yet" : ""}.
        </div>
      ) : (
        <div className="rounded-sm border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center px-0">
                  <Checkbox 
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Representative</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[100px]">Documents</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="text-right w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((reg) => {
                const docCount = (reg.nid_document_url ? 1 : 0) + (reg.trade_license_url ? 1 : 0) + ((reg.certificate_urls as string[])?.length || 0);
                return (
                  <TableRow key={reg.id}>
                    <TableCell className="text-center px-0">
                      <Checkbox 
                        checked={selectedIds.includes(reg.id)}
                        onCheckedChange={(c) => handleSelectRow(reg.id, c as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate" title={reg.agency_name}>{reg.agency_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={reg.contact_person}>{reg.contact_person}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={reg.email}>{reg.email}</TableCell>
                    <TableCell>
                      {reg.status === 'approved' && <span title="Approved"><CheckCircle className="h-5 w-5 text-green-600" /></span>}
                      {reg.status === 'pending' && <span title="Pending"><Clock className="h-5 w-5 text-warning" /></span>}
                      {reg.status === 'rejected' && <span title="Rejected"><XCircle className="h-5 w-5 text-destructive" /></span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-muted-foreground">{docCount} Docs</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(reg)} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(reg.id, e)} title="Delete Partner">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details - {selectedReg?.agency_name}</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground text-xs">Agency Name</Label><p className="font-medium">{selectedReg.agency_name}</p></div>
                <div><Label className="text-muted-foreground text-xs">Contact Person</Label><p className="font-medium">{selectedReg.contact_person}</p></div>
                <div><Label className="text-muted-foreground text-xs">Email</Label><p className="font-medium">{selectedReg.email}</p></div>
                <div><Label className="text-muted-foreground text-xs">Phone</Label><p className="font-medium">{selectedReg.phone || "N/A"}</p></div>
                <div><Label className="text-muted-foreground text-xs">Country</Label><p className="font-medium">{selectedReg.country || "N/A"}</p></div>
                <div><Label className="text-muted-foreground text-xs">Annual Students</Label><p className="font-medium">{selectedReg.annual_students || "N/A"}</p></div>
                <div><Label className="text-muted-foreground text-xs">Status</Label><div className="mt-1">{statusBadge(selectedReg.status)}</div></div>
                <div><Label className="text-muted-foreground text-xs">Submitted</Label><p className="font-medium break-words">{new Date(selectedReg.created_at).toLocaleString()}</p></div>
              </div>

              {/* Documents */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Uploaded Documents</h3>
                <div className="space-y-3">
                  {selectedReg.nid_document_url && (
                    <a href={selectedReg.nid_document_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-sm border hover:bg-muted/50 transition-colors">
                      <FileText className="h-5 w-5 text-secondary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">National ID (NID)</p>
                        <p className="text-xs text-muted-foreground">Click to view document</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {selectedReg.trade_license_url && (
                    <a href={selectedReg.trade_license_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-sm border hover:bg-muted/50 transition-colors">
                      <FileText className="h-5 w-5 text-secondary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Trade License</p>
                        <p className="text-xs text-muted-foreground">Click to view document</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {(selectedReg.certificate_urls as string[])?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-sm border hover:bg-muted/50 transition-colors">
                      <FileText className="h-5 w-5 text-secondary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Certificate #{i + 1}</p>
                        <p className="text-xs text-muted-foreground">Click to view document</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="border-t pt-4">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this registration..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Actions */}
              {selectedReg.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3 border-t pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction("approved")}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve & Grant Partner Access
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAction("rejected")}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                </div>
              )}

              {selectedReg.status !== "pending" && (
                <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                  This registration has already been <strong>{selectedReg.status}</strong>.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
