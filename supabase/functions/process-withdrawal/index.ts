import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// A2b — Solicitação de saque NÃO transfere mais na hora.
// Valida saldo e registra o saque como 'pending'; a transferência PIX real
// acontece apenas quando um admin aprova (edge function approve-withdrawal).
// A chave PIX é cifrada no banco pela RPC store_withdrawal_request.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return json({ error: "Não autorizado" }, 401);
    }

    // --- Role check ---
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "pro");

    if (!roles || roles.length === 0) {
      return json({ error: "Apenas profissionais podem solicitar saques" }, 403);
    }

    // --- Input validation ---
    const body = await req.json();
    const amount = Number(body.amount);
    const pixKeyType = String(body.pixKeyType || "").trim();
    const pixKey = String(body.pixKey || "").trim();

    if (!amount || !Number.isFinite(amount) || amount < 10) {
      return json({ error: "Valor mínimo de saque é R$ 10,00" }, 400);
    }
    if (amount > 50000) {
      return json({ error: "Valor máximo de saque é R$ 50.000,00" }, 400);
    }
    if (!pixKey) {
      return json({ error: "Chave Pix é obrigatória" }, 400);
    }
    const validPixTypes = ["cpf", "email", "phone", "random"];
    if (!validPixTypes.includes(pixKeyType)) {
      return json({ error: "Tipo de chave Pix inválido" }, 400);
    }

    // --- Registro atômico (saldo + insert sob advisory lock, chave cifrada) ---
    const { data: withdrawalId, error: storeError } = await supabaseAdmin.rpc(
      "store_withdrawal_request",
      {
        p_user_id: user.id,
        p_amount: amount,
        p_pix_key: pixKey,
        p_pix_key_type: pixKeyType,
      }
    );

    if (storeError) {
      console.error("store_withdrawal_request error:", storeError);
      const msg = storeError.message?.includes("Saldo insuficiente")
        ? storeError.message.replace(/^.*Saldo insuficiente/, "Saldo insuficiente")
        : "Erro ao registrar saque";
      return json({ error: msg }, 400);
    }

    // --- Notificações: diarista + admins ---
    const fmt = (v: number) => v.toFixed(2).replace(".", ",");

    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "Saque solicitado! 💰",
      message: `Seu saque de R$ ${fmt(amount)} via Pix foi registrado e está aguardando aprovação. Você será avisada quando for processado.`,
      type: "withdrawal",
      read: false,
    });

    const { data: admins } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      await supabaseAdmin.from("notifications").insert(
        admins.map((a) => ({
          user_id: a.user_id,
          title: "Novo saque aguardando aprovação",
          message: `Saque de R$ ${fmt(amount)} solicitado. Aprove ou rejeite no painel de saques.`,
          type: "withdrawal",
          read: false,
          data: { withdrawal_id: withdrawalId },
        }))
      );
    }

    return json({
      success: true,
      withdrawal: {
        id: withdrawalId,
        amount,
        status: "pending",
        estimatedDate: "Após aprovação do administrador",
      },
    });
  } catch (error) {
    console.error("General error:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
