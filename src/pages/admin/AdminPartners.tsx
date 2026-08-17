import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string;
  country: string;
  annual_students: number;
  nid_document_url: string;
  trade_license_url: string;
  certificate_urls: any[];
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
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<PartnerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
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
    navigate(`/admin/partners/${reg.id}`);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All B2B Partners</h1>
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
            className={`relative px-4 py-2.5 text-[12px] font-normal transition-colors ${
              activeTab === tab.key
                ? "text-[#1E293B]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[12px] font-normal px-1.5 py-0.5 rounded-xl ${
              activeTab === tab.key ? "bg-[#1d283a]/15 text-[#1d283a]" : "bg-gray-100 text-gray-400"
            }`}>
              {counts[tab.key]}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1d283a]" />
            )}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex justify-end mb-3">
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-7 text-[12px] px-3">
            <Trash2 className="h-3 w-3 mr-1" /> Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No {activeTab === "all" ? "" : activeTab} partner registrations{activeTab === "all" ? " yet" : ""}.
        </div>
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
                <TableHead className="h-10">Agency</TableHead>
                <TableHead className="h-10">Representative</TableHead>
                <TableHead className="h-10">Email</TableHead>
                <TableHead className="w-[80px] h-10">Status</TableHead>
                <TableHead className="w-[100px] h-10">Documents</TableHead>
                <TableHead className="w-[120px] h-10">Date</TableHead>
                <TableHead className="text-left w-[80px] h-10">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((reg) => {
                const docCount = (reg.nid_document_url ? 1 : 0) + (reg.trade_license_url ? 1 : 0) + ((reg.certificate_urls as any[])?.length || 0);
                return (
                  <TableRow key={reg.id} className="h-10 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openDetail(reg)}>
                    <TableCell className="text-center px-0 py-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.includes(reg.id)}
                        onCheckedChange={(c) => handleSelectRow(reg.id, c as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-normal max-w-[150px] truncate py-1 text-xs md:text-[13px]" title={reg.agency_name}>{reg.agency_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate py-1 text-xs md:text-[13px]" title={`${reg.contact_first_name} ${reg.contact_last_name}`.trim()}>{`${reg.contact_first_name} ${reg.contact_last_name}`.trim()}</TableCell>
                    <TableCell className="text-[12px] max-w-[150px] truncate py-1 md:text-[13px]" title={reg.email}>{reg.email}</TableCell>
                    <TableCell className="py-1">
                      {reg.status === 'approved' && <span title="Approved"><CheckCircle className="h-4 w-4 text-green-600" /></span>}
                      {reg.status === 'pending' && <span title="Pending"><Clock className="h-4 w-4 text-warning" /></span>}
                      {reg.status === 'rejected' && <span title="Rejected"><XCircle className="h-4 w-4 text-destructive" /></span>}
                    </TableCell>
                    <TableCell className="py-1">
                      <span className="text-xs md:text-[13px] font-normal text-muted-foreground">{docCount} Docs</span>
                    </TableCell>
                    <TableCell className="text-xs md:text-[13px] text-muted-foreground whitespace-nowrap py-1">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-left py-1">
                      <div className="flex items-center justify-start gap-1">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs font-semibold rounded-lg text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 border-gray-200 shadow-sm transition-colors" onClick={(e) => handleDelete(reg.id, e)} title="Delete Partner">
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
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


    </div>
  );
}
