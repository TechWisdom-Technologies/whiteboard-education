import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle2,
  ExternalLink,
  Printer,
  Download,
  Save,
  Building2,
  User,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-green-600/10 text-green-700 border-green-600/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

interface PartnerRegistration {
  id: string;
  user_id: string | null;
  agency_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  country: string;
  annual_students: number | null;
  nid_document_url: string | null;
  trade_license_url: string | null;
  certificate_urls: any[] | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const isEmpty = value === null || value === undefined || value === "" || (typeof value === "number" && value === 0);
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <span className="text-[12px] font-normal text-muted-foreground/70 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-[12px] font-normal leading-snug ${isEmpty ? "text-amber-600/80 italic text-[12px] flex items-center gap-1 bg-amber-50/50 dark:bg-amber-950/10 px-2.5 py-1 rounded-2xl border border-amber-200/30 w-fit" : "text-[#1E293B]"}`}>
        {isEmpty ? "Not provided" : value}
      </span>
    </div>
  );
}

export default function AdminPartnerProfile() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [partner, setPartner] = useState<PartnerRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [adminNotes, setAdminNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("pending");

  useEffect(() => {
    if (!partnerId || !session) return;
    fetchPartnerData();
  }, [partnerId, session]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("partner_registrations")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("Partner not found");

      setPartner(data as unknown as PartnerRegistration);
      setCurrentStatus(data.status);
      setAdminNotes(data.admin_notes || "");
    } catch (err: any) {
      setError(err.message || "Failed to load partner profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/admin/partners");

  const handlePrint = () => {
    if (!partner) return;
    const originalTitle = document.title;
    document.title = `${partner.agency_name}_${partner.contact_person}_Registration`;
    window.print();
    document.title = originalTitle;
  };

  const handleSaveStatusAndNotes = async () => {
    if (!partner || !session) return;
    setSavingStatus(true);
    try {
      const { error: updateError } = await supabase
        .from("partner_registrations")
        .update({
          status: currentStatus,
          admin_notes: adminNotes,
        })
        .eq("id", partner.id);

      if (updateError) throw updateError;

      if (currentStatus === "approved" && partner.user_id) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({ user_id: partner.user_id, role: "partner" }, { onConflict: "user_id,role" });
        if (roleError) throw roleError;
        
        await fetch(`${SUPABASE_URL}/rest/v1/partner_notifications`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            partner_id: partner.user_id,
            title: "Account Approved",
            message: "Your partner registration has been approved. You now have full access to the B2B portal.",
            type: "system"
          })
        }).catch(console.error);
      }

      if (adminNotes.trim() && adminNotes !== partner.admin_notes && partner.user_id) {
        await fetch(`${SUPABASE_URL}/rest/v1/partner_notifications`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            partner_id: partner.user_id,
            title: "New Update on Registration",
            message: adminNotes.trim(),
            type: "system"
          })
        }).catch(console.error);
      }

      toast.success("Partner details updated successfully");
      setPartner({ ...partner, status: currentStatus, admin_notes: adminNotes });
    } catch (err: any) {
      toast.error(err.message || "Failed to update partner");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) return <LoadingScreen fullScreen />;

  if (error || !partner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <User className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-[12px] font-normal">{error || "Partner not found"}</h2>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const registeredDate = new Date(partner.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const docs = [
    { label: "National ID / Passport", url: partner.nid_document_url },
    { label: "Trade License", url: partner.trade_license_url },
    ...(partner.certificate_urls || []).map((item, i) => {
      const isObj = typeof item === 'object' && item !== null;
      return {
        label: isObj ? (item as any).name : `Certificate ${i + 1}`,
        url: isObj ? (item as any).url : (item as string),
      };
    }),
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #partner-profile-print, #partner-profile-print * { visibility: visible; }
          #partner-profile-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="partner-profile-print" className="space-y-8 animate-fade-in pb-12">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="w-fit pl-0 hover:bg-transparent hover:text-foreground text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          <div className="flex gap-5 items-start">
            <div className="h-20 w-20 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm print:h-24 print:w-24">
              <Building2 className="h-10 w-10 text-[#1d283a]" />
            </div>
            
            <div className="pt-1">
              <h1 className="text-[12px] sm:text-[12px] font-normal text-[#1E293B] tracking-tight mb-1">
                {partner.agency_name}
              </h1>
              <p className="text-[12px] font-normal text-muted-foreground mb-4">
                Registered on {registeredDate}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className={`text-[12px] font-normal uppercase tracking-wider px-0 ${statusColors[partner.status] ? statusColors[partner.status].split(" ")[1] : "text-gray-500"}`}>
                  {partner.status.replace("_", " ")}
                </span>
                
                <div className="flex items-center gap-2 no-print ml-0 sm:ml-2">
                  <Select
                    value={currentStatus}
                    onValueChange={setCurrentStatus}
                  >
                    <SelectTrigger className="h-8 w-[140px] text-[12px] font-normal bg-white border-border">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="h-8 font-normal"
                    onClick={handleSaveStatusAndNotes}
                    disabled={savingStatus || (currentStatus === partner.status && adminNotes === partner.admin_notes)}
                  >
                    {savingStatus ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:ml-auto no-print">
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-normal"
              onClick={handlePrint}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-normal"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* ── Horizontal Documents Section ─────────────────────────────── */}
        <Card className="no-print">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-[12px] font-normal text-[#1E293B]">
                <FileCheck className="h-4 w-4 text-[#1d283a]" />
                Agency Documents
              </h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors text-center relative group ${
                    doc.url
                      ? "bg-green-50/40 border-green-200/60 dark:bg-green-950/20 dark:border-green-900/40 hover:border-green-300"
                      : "bg-muted/10 border-dashed hover:border-border/80"
                  }`}
                >
                  {doc.url ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                  ) : (
                    <FileText className="h-6 w-6 text-muted-foreground/30 mb-2" />
                  )}
                  
                  <p className="text-[12px] font-normal leading-tight mb-3 px-1 text-muted-foreground h-6 flex items-center justify-center">
                    {doc.label}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Preview Document"
                        className="h-7 w-7 rounded-full bg-white border border-border flex items-center justify-center text-[#1d283a] hover:bg-muted transition-colors shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-[12px] text-muted-foreground italic mt-1">Missing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Main Single Column Layout ──────────────────────────────── */}
        <Card className="print:border-none print:shadow-none">
          <CardContent className="p-6 sm:p-7 print:p-0">
                {/* ── Section 1: Agency Information ──────────────── */}
                <div className="flex items-center justify-between pb-4">
                  <h3 className="flex items-center gap-2.5 text-[12px] font-normal text-[#1E293B] uppercase tracking-wide">
                    <Building2 className="h-4 w-4 text-[#1d283a]" />
                    Agency Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  <InfoRow label="Agency Name" value={partner.agency_name} />
                  <InfoRow label="Country of Operation" value={partner.country} />
                  <InfoRow label="Annual Students Volume" value={partner.annual_students} />
                </div>

                {/* ── Section 2: Contact Details ──────────────── */}
                <div className="border-t border-border/30 pt-5 mt-4 print:border-none">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="flex items-center gap-2.5 text-[12px] font-normal text-[#1E293B] uppercase tracking-wide">
                      <User className="h-4 w-4 text-[#1d283a]" />
                      Contact Person
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <InfoRow label="Full Name" value={partner.contact_person} />
                    <InfoRow label="Email" value={partner.email} />
                    <InfoRow label="Phone" value={partner.phone} />
                  </div>
                </div>
          </CardContent>
        </Card>

        {/* Admin Notes Section */}
        <Card className="no-print border-dashed border-amber-200/50 bg-amber-50/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-normal text-[#1E293B]">
                <ClipboardList className="h-4 w-4 text-[#1d283a]" />
                Admin Notes (Visible to Partner)
              </div>
            </div>
            
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes or updates regarding this registration. These notes will be sent to the partner..."
              rows={4}
              className="resize-none bg-white/60 focus:bg-white"
            />
          </CardContent>
        </Card>

        {/* ── Print-Only Documents Checklist ──────────────────────────── */}
        <div className="hidden print:block pt-8 mt-8">
          <h3 className="text-[12px] font-normal text-[#1E293B] uppercase tracking-wide mb-5 flex items-center gap-2.5">
            <FileCheck className="h-4 w-4 text-[#1d283a]" />
            Uploaded Documents Checklist
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            {docs.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[12px]">
                {doc.url ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-xl border border-muted-foreground/40" />
                )}
                <span className={doc.url ? "text-[#1E293B] font-normal" : "text-muted-foreground italic"}>
                  {doc.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
