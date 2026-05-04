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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all active reminders
    const { data: reminders, error } = await supabase
      .from("intake_reminders")
      .select("*")
      .eq("active", true);

    if (error) throw error;
    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No active reminders" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sent = 0;
    for (const reminder of reminders) {
      // Check if deadline has passed
      if (reminder.deadline_date) {
        const deadline = new Date(reminder.deadline_date);
        if (deadline < new Date()) {
          // Deactivate expired reminders
          await supabase.from("intake_reminders").update({ active: false }).eq("id", reminder.id);
          continue;
        }
      }

      // Send email via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "YourUni <onboarding@resend.dev>",
          to: [reminder.email],
          subject: `⏰ Reminder: ${reminder.university_name} ${reminder.intake_label} Deadline`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#1a1a2e;">Deadline Reminder</h2>
              <p>Hi ${reminder.full_name || "there"},</p>
              <p>This is your weekly reminder about the upcoming deadline:</p>
              <div style="background:#f8f9fa;border-left:4px solid #e94560;padding:16px;border-radius:4px;margin:16px 0;">
                <p style="margin:0;font-weight:bold;">${reminder.university_name}</p>
                <p style="margin:4px 0;color:#666;">${reminder.intake_label} Intake</p>
                <p style="margin:4px 0;color:#e94560;font-weight:bold;">Deadline: ${reminder.deadline_date}</p>
              </div>
              <p>Don't miss your chance — prepare your documents and apply before the deadline closes!</p>
              <p style="color:#666;font-size:12px;margin-top:24px;">You're receiving this because you subscribed to deadline reminders on YourUni.</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        sent++;
        await supabase.from("intake_reminders").update({ last_sent_at: new Date().toISOString() }).eq("id", reminder.id);
      }
    }

    return new Response(JSON.stringify({ message: `Sent ${sent} reminder emails` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
