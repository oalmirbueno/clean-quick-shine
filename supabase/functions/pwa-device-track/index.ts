// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    const fingerprint = String(body.fingerprint || "").trim();

    if (!fingerprint || fingerprint.length < 16 || fingerprint.length > 128) {
      return json({ error: "invalid fingerprint" }, 400);
    }

    if (action === "check") {
      const { data } = await admin
        .from("pwa_devices")
        .select("id, last_seen_at")
        .eq("fingerprint", fingerprint)
        .maybeSingle();

      return json({ installed: !!data, last_seen_at: data?.last_seen_at ?? null });
    }

    if (action === "mark") {
      const meta = typeof body.meta === "object" && body.meta ? body.meta : {};
      const { error } = await admin
        .from("pwa_devices")
        .upsert(
          { fingerprint, last_seen_at: new Date().toISOString(), meta },
          { onConflict: "fingerprint" },
        );
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? "unexpected" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
