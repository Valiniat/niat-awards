import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FAST2SMS_API_KEY = Deno.env.get("FAST2SMS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { phone } = await req.json();
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (cleaned.length !== 10) {
      return new Response(JSON.stringify({ error: "Enter a valid 10-digit number" }), { status: 400, headers: cors });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/otp_verifications`, {
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

    if (!dbRes.ok) {
      const dbErr = await dbRes.text();
      console.error("DB error:", dbErr);
      return new Response(JSON.stringify({ error: "Database error: " + dbErr }), { status: 500, headers: cors });
    }

    // Send via Fast2SMS using GET method (more reliable)
    const params = new URLSearchParams({
      authorization: FAST2SMS_API_KEY,
      variables_values: otp,
      route: "otp",
      numbers: cleaned,
    });

    const smsRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
      method: "GET",
      headers: { "cache-control": "no-cache" },
    });

    const rawText = await smsRes.text();
    console.log("Fast2SMS raw response:", rawText);

    let smsData: any = {};
    try { smsData = JSON.parse(rawText); } catch { smsData = { return: false, message: [rawText] }; }

    if (!smsData.return) {
      const errMsg = Array.isArray(smsData.message) ? smsData.message.join(", ") : (smsData.message || "SMS failed");
      return new Response(JSON.stringify({ error: errMsg }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...cors, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
