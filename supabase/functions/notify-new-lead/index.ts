import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    // Get admin emails from user_roles + profiles
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ message: "No admins found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roleRows = (adminRoles || []) as Array<{ user_id: string }>;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", roleRows.map((r: { user_id: string }) => r.user_id));

    const profileRows = (profiles || []) as Array<{ email: string | null }>;
    const adminEmails = profileRows.map((p: { email: string | null }) => p.email).filter(Boolean);

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: "YourUni <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🔔 New Lead: ${record.full_name} — ${record.source}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1a1a2e;margin-bottom:4px;">New Lead Submitted</h2>
            <p style="color:#666;margin-top:0;">A visitor just submitted an application on YourUni.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;width:140px;">Name</td><td style="padding:8px 12px;">${record.full_name}</td></tr>
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;">Email</td><td style="padding:8px 12px;"><a href="mailto:${record.email}">${record.email}</a></td></tr>
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;">Phone</td><td style="padding:8px 12px;">${record.phone || "—"}</td></tr>
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;">Nationality</td><td style="padding:8px 12px;">${record.nationality || "—"}</td></tr>
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;">Course</td><td style="padding:8px 12px;">${record.interested_course || "—"}</td></tr>
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;">University</td><td style="padding:8px 12px;">${record.interested_university || "—"}</td></tr>
              <tr><td style="padding:8px 12px;background:#f8f9fa;font-weight:bold;">Source</td><td style="padding:8px 12px;">${record.source}</td></tr>
            </table>
            <p style="margin-top:16px;">Log in to the <strong>Admin Panel → Leads</strong> to follow up.</p>
          </div>
        `,
      }),
    });

    const body = await res.text();
    return new Response(JSON.stringify({ success: res.ok, detail: body }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
