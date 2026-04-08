import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return new Response(JSON.stringify({ error: "Phone and OTP required" }), { status: 400, headers: corsHeaders });

    const cleaned = phone.replace(/\D/g, "").slice(-10);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch OTP record
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/otp_verifications?phone=eq.${cleaned}&select=otp,expires_at`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    const records = await res.json();

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "OTP not found. Please request a new one." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const record = records[0];

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return new Response(JSON.stringify({ success: false, error: "OTP expired. Please request a new one." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check OTP match
    if (record.otp !== otp) {
      return new Response(JSON.stringify({ success: false, error: "Invalid OTP. Please try again." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Delete used OTP
    await fetch(`${SUPABASE_URL}/rest/v1/otp_verifications?phone=eq.${cleaned}`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
