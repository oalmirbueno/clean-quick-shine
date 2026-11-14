import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Mensalidade (cliente ou diarista) no cartão de crédito, cobrada sozinha todo mês.
// O cartão é digitado na página do Asaas (Checkout recorrente): não passa por aqui.
// A assinatura só fica ativa quando o asaas-webhook recebe o pagamento confirmado.
//   { action: "create", kind: "client" | "pro", planId }  -> { url }
//   { action: "cancel", kind: "client" | "pro" }          -> { success }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SITE = "https://jalimpo.com";
const MINUTOS_DO_LINK = 60;

// "AAAA-MM-DD HH:mm:ss" no horário de Brasília
function agoraEmBrasilia(): string {
  const d = new Date(Date.now() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) return json({ error: "Não autorizado" }, 401);

    const { action, kind, planId } = await req.json();
    if (kind !== "client" && kind !== "pro") return json({ error: "Tipo de plano inválido" }, 400);

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENV = Deno.env.get("ASAAS_ENVIRONMENT");
    if (!ASAAS_API_KEY) return json({ error: "ASAAS_API_KEY não configurada" }, 500);
    if (!ASAAS_ENV || !["sandbox", "production"].includes(ASAAS_ENV)) {
      return json({ error: "ASAAS_ENVIRONMENT não configurado (sandbox|production)" }, 500);
    }
    const baseUrl = ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    const plansTable = kind === "pro" ? "pro_plans" : "client_plans";
    const subsTable = kind === "pro" ? "pro_subscriptions" : "client_subscriptions";

    const { data: activeSub } = await supabaseAdmin
      .from(subsTable)
      .select("id, asaas_subscription_id")
      .eq("user_id", user.id)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // ───────── cancelar ─────────
    if (action === "cancel") {
      if (!activeSub) return json({ error: "Você não tem plano ativo" }, 400);
      if (activeSub.asaas_subscription_id) {
        const res = await fetch(`${baseUrl}/subscriptions/${activeSub.asaas_subscription_id}`, {
          method: "DELETE",
          headers: { access_token: ASAAS_API_KEY },
        });
        if (!res.ok && res.status !== 404) {
          console.error("Erro ao cancelar assinatura no Asaas:", await res.text());
          return json({ error: "Não foi possível cancelar agora. Tente de novo." }, 400);
        }
      }
      await supabaseAdmin
        .from(subsTable)
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", activeSub.id);
      return json({ success: true });
    }

    // ───────── assinar ─────────
    if (action !== "create" || !planId) return json({ error: "Pedido inválido" }, 400);
    if (activeSub) return json({ error: "Você já tem um plano ativo" }, 400);

    if (kind === "pro") {
      const { data: isPro } = await supabaseAdmin
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "pro").maybeSingle();
      if (!isPro) return json({ error: "Plano exclusivo para diaristas" }, 403);
    }

    const { data: plan } = await supabaseAdmin
      .from(plansTable)
      .select("id, name, monthly_price, active")
      .eq("id", planId)
      .maybeSingle();
    if (!plan || !plan.active) return json({ error: "Plano indisponível" }, 404);
    const valor = Number(plan.monthly_price);
    if (!(valor > 0)) return json({ error: "Este plano não tem mensalidade" }, 400);

    const { data: profile } = await supabaseAdmin
      .from("profiles").select("asaas_customer_id").eq("user_id", user.id).maybeSingle();
    if (!profile?.asaas_customer_id) {
      return json({ error: "Cadastre seu CPF para assinar", code: "cpf" }, 400);
    }

    // Link ainda válido do mesmo plano: devolve o mesmo, sem criar outro.
    const validoDesde = new Date(Date.now() - (MINUTOS_DO_LINK - 10) * 60 * 1000).toISOString();
    const { data: pendente } = await supabaseAdmin
      .from("plan_checkouts")
      .select("id, invoice_url")
      .eq("user_id", user.id).eq("kind", kind).eq("plan_id", plan.id)
      .eq("status", "pending").gte("created_at", validoDesde)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (pendente?.invoice_url) return json({ success: true, reused: true, url: pendente.invoice_url });

    const volta = kind === "pro" ? `${SITE}/pro/plan` : `${SITE}/client/subscription`;
    const payload = {
      billingTypes: ["CREDIT_CARD"],
      chargeTypes: ["RECURRENT"],
      minutesToExpire: MINUTOS_DO_LINK,
      externalReference: `plano:${kind}:${plan.id}:${user.id}`,
      callback: {
        successUrl: `${volta}?pagamento=ok`,
        cancelUrl: `${volta}?pagamento=cancelado`,
        expiredUrl: `${volta}?pagamento=expirado`,
      },
      items: [{
        name: `Já Limpo ${plan.name}`.slice(0, 30),
        description: "Mensalidade do plano Já Limpo",
        quantity: 1,
        value: valor,
      }],
      customer: profile.asaas_customer_id,
      subscription: { cycle: "MONTHLY", nextDueDate: agoraEmBrasilia() },
    };

    const res = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: { access_token: ASAAS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.id) {
      console.error("Erro Asaas checkout:", JSON.stringify(data));
      return json({ error: "Não foi possível abrir o pagamento do plano" }, 400);
    }

    const url = data.link || `https://asaas.com/checkoutSession/show?id=${data.id}`;
    const { error: insertError } = await supabaseAdmin.from("plan_checkouts").insert({
      user_id: user.id,
      kind,
      plan_id: plan.id,
      amount: valor,
      asaas_checkout_id: data.id,
      invoice_url: url,
    });
    if (insertError) {
      console.error("Erro ao salvar plan_checkouts:", insertError);
      return json({ error: "Erro ao registrar o pedido do plano" }, 500);
    }

    return json({ success: true, reused: false, url });
  } catch (error) {
    console.error("Erro geral:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
