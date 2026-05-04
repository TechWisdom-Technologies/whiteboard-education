import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { student_id, new_status, admin_notes, email_only } = await req.json();

    if (!student_id || !new_status) {
      return new Response(JSON.stringify({ error: "Missing student_id or new_status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, full_name, partner_id, target_university, target_course, status")
      .eq("id", student_id)
      .single();

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oldStatus = student.status;

    if (!email_only) {
      const { error: updateError } = await supabase
        .from("students")
        .update({ status: new_status, admin_notes: admin_notes || "" })
        .eq("id", student_id);
      if (updateError) throw updateError;
    }

    const { data: partner } = await supabase
      .from("partner_registrations")
      .select("email, contact_person")
      .eq("user_id", student.partner_id)
      .single();

    let emailSent = false;
    let resendError = "";

    if (resendKey && partner?.email) {
      const subject = `Student update: ${student.full_name} -> ${new_status}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2>Student Application Update</h2>
          <p>Dear ${partner.contact_person || "Partner"},</p>
          <p>Status for <strong>${student.full_name}</strong> changed from <strong>${oldStatus}</strong> to <strong>${new_status}</strong>.</p>
          <p>University: ${student.target_university || "N/A"}</p>
          <p>Course: ${student.target_course || "N/A"}</p>
          ${admin_notes ? `<p>Admin note: ${admin_notes}</p>` : ""}
        </div>
      `;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "YourUni <onboarding@resend.dev>",
          to: [partner.email],
          subject,
          html,
        }),
      });

      if (emailRes.ok) {
        emailSent = true;
      } else {
        resendError = await emailRes.text();
        console.error("Resend error:", resendError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        oldStatus,
        newStatus: new_status,
        partnerEmail: partner?.email,
        resendError: resendError || undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
