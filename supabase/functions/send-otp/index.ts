import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FAST2SMS_API_KEY = Deno.env.get("FAST2SMS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGINS = ["https://www.niatawards.in", "https://niatawards.in"];
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin || "") ? origin! : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
});

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = cors(origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { phone } = await req.json();
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (cleaned.length !== 10) return new Response(JSON.stringify({ error: "Enter a valid 10-digit number" }), { status: 400, headers: corsHeaders });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB with 5 min expiry
    await fetch(`${SUPABASE_URL}/rest/v1/otp_verifications`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        phone: cleaned,
        otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      }),
    });

    // Use Quick route (no DLT/website verification needed)
    const message = `${otp} is your OTP for NIAT Educator Awards 2026. Valid for 5 minutes. Do not share with anyone.`;
    const params = new URLSearchParams({
      authorization: FAST2SMS_API_KEY,
      route: "q",
      message,
      numbers: cleaned,
      flash: "0",
    });

    const smsRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
      method: "GET",
      headers: { "cache-control": "no-cache" },
    });

    const rawText = await smsRes.text();
    console.log("Fast2SMS response:", rawText);

    let smsData: any = {};
    try { smsData = JSON.parse(rawText); } catch { smsData = { return: false, message: [rawText] }; }

    if (!smsData.return) {
      const errMsg = Array.isArray(smsData.message) ? smsData.message.join(", ") : (smsData.message || "SMS failed");
      return new Response(JSON.stringify({ error: errMsg }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
