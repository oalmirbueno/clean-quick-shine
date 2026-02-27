import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, title, message, type, data } = await req.json();

    if (!userId || !title) {
      return new Response(
        JSON.stringify({ error: "userId e title são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 1. Save notification in DB (for in-app)
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title,
      message: message || "",
      type: type || "general",
      read: false,
      data: data || null,
    });

    // 2. Get user's push subscriptions
    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    const results = [];
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
