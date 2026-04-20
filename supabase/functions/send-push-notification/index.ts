import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- AUTH: require valid JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } =
      await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub as string;

    // ---- Parse + validate body ----
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = typeof body.userId === "string" ? body.userId : null;
    const title = typeof body.title === "string" ? body.title.slice(0, 200) : null;
    const message =
      typeof body.message === "string" ? body.message.slice(0, 1000) : "";
    const type = typeof body.type === "string" ? body.type.slice(0, 50) : "general";
    const data = body.data ?? null;

    if (!userId || !title) {
      return new Response(
        JSON.stringify({ error: "userId e title são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ---- AUTHORIZATION: caller must be the target user OR an admin ----
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let allowed = callerId === userId;
    if (!allowed) {
      const { data: isAdminData, error: isAdminErr } = await supabaseAdmin.rpc(
        "is_admin",
        { _user_id: callerId }
      );
      if (isAdminErr) {
        console.error("is_admin check failed:", isAdminErr);
        return new Response(JSON.stringify({ error: "Authorization check failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      allowed = !!isAdminData;
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- 1. Save in-app notification ----
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      read: false,
      data,
    });

    // ---- 2. Get push subscriptions ----
    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    const results: Array<{ endpoint: string; status: string }> = [];
    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        try {
          results.push({ endpoint: sub.endpoint, status: "queued" });
        } catch (err) {
          console.error("Push error:", err);
          results.push({ endpoint: sub.endpoint, status: "failed" });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: results.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
