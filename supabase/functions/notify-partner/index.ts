/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const { registration_id, action, admin_notes, email_only } = await req.json();

    if (!registration_id || !action) {
      return new Response(JSON.stringify({ error: "Missing registration_id or action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to access data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the registration
    const { data: reg, error: regError } = await supabase
      .from("partner_registrations")
      .select("*")
      .eq("id", registration_id)
      .single();

    if (regError || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip DB writes when email_only=true (frontend already did the update)
    if (!email_only) {
      // Update registration status
      const { error: updateError } = await supabase
        .from("partner_registrations")
        .update({ status: action, admin_notes: admin_notes || "" })
        .eq("id", registration_id);

      if (updateError) throw updateError;

      // If approved, assign partner role
      if (action === "approved" && reg.user_id) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({ user_id: reg.user_id, role: "partner" }, { onConflict: "user_id,role" });

        if (roleError) {
          console.error("Role assignment error:", roleError);
        }
      }
    }

    // Try to send email via Resend if API key exists
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    let resendError = "";

    if (resendKey) {
      const isApproved = action === "approved";
      const subject = isApproved
        ? "🎉 Your YourUni Partner Registration is Approved!"
        : "Update on Your YourUni Partner Registration";

      const htmlBody = isApproved
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a2e; font-size: 24px;">Welcome to YourUni Partner Network! 🎉</h1>
            </div>
            <p style="color: #333; font-size: 16px;">Dear <strong>${reg.contact_person}</strong>,</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Great news! Your partner registration for <strong>${reg.agency_name}</strong> has been approved by our team.
            </p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              You can now log in to your Partner Dashboard to start managing referrals, track commissions, and access marketing resources.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://youruni.com/login" style="background-color: #e8a317; color: #1a1a2e; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Go to Partner Dashboard
              </a>
            </div>
            ${admin_notes ? `<p style="color: #555; font-size: 14px;"><strong>Note from admin:</strong> ${admin_notes}</p>` : ""}
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              YourUni Partner Program — Empowering Education Agencies Worldwide
            </p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a2e; font-size: 24px;">Partner Registration Update</h1>
            </div>
            <p style="color: #333; font-size: 16px;">Dear <strong>${reg.contact_person}</strong>,</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Thank you for your interest in joining the YourUni Partner Network. After reviewing your application for <strong>${reg.agency_name}</strong>, we were unable to approve it at this time.
            </p>
            ${admin_notes ? `<p style="color: #555; font-size: 14px; line-height: 1.6;"><strong>Reason:</strong> ${admin_notes}</p>` : ""}
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              If you believe this was a mistake or would like to provide additional documentation, please feel free to reapply or contact our support team.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://youruni.com/partner" style="background-color: #e8a317; color: #1a1a2e; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reapply
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              YourUni Partner Program — Empowering Education Agencies Worldwide
            </p>
          </div>
        `;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "YourUni <onboarding@resend.dev>",
            to: [reg.email],
            subject,
            html: htmlBody,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log("Email sent successfully to", reg.email);
        } else {
          resendError = await emailRes.text();
          console.error("Resend error:", resendError);
        }
      } catch (emailErr: any) {
        console.error("Email send error:", emailErr);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        resendError: resendError || undefined,
        recipientEmail: reg.email,
        message: `Registration ${action} successfully${emailSent ? " and email notification sent" : ""}`,
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
