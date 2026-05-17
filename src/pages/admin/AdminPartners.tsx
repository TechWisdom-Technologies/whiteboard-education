import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle, Loader2, FileText, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

export default function AdminPartners() {
  const { session } = useAuth();
  const [registrations, setRegistrations] = useState<PartnerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<PartnerRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

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

  return (
    <div>
      <div className="flex justify-end gap-2 text-xs mb-6">
        <Badge variant="secondary" className="px-2 py-0.5">{registrations.filter(r => r.status === "pending").length} Pending</Badge>
        <Badge variant="secondary" className="px-2 py-0.5">{registrations.filter(r => r.status === "approved").length} Approved</Badge>
      </div>

      {registrations.length === 0 ? (
        <div className="rounded-sm border bg-card p-12 text-center text-muted-foreground">
          No partner registrations yet.
        </div>
      ) : (
        <div className="rounded-sm border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Representative</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[100px]">Documents</TableHead>
                <TableHead className="w-[120px]">Approval Date</TableHead>
                <TableHead className="text-right w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => {
                const docCount = (reg.nid_document_url ? 1 : 0) + (reg.trade_license_url ? 1 : 0) + ((reg.certificate_urls as string[])?.length || 0);
                return (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium max-w-[150px] truncate" title={reg.agency_name}>{reg.agency_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={reg.contact_person}>{reg.contact_person}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={reg.email}>{reg.email}</TableCell>
                    <TableCell>
                      {reg.status === 'approved' && <CheckCircle className="h-5 w-5 text-green-600" title="Approved" />}
                      {reg.status === 'pending' && <Clock className="h-5 w-5 text-warning" title="Pending" />}
                      {reg.status === 'rejected' && <XCircle className="h-5 w-5 text-destructive" title="Rejected" />}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-muted-foreground">{docCount} Docs</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(reg)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
