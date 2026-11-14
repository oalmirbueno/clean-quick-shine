import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// deno-lint-ignore no-explicit-any
async function tratarCobrancaDePlano(db: any, event: string, payment: any): Promise<boolean> {
  let checkout = null;
  if (payment.checkoutSession) {
    const { data } = await db.from("plan_checkouts").select("*")
      .eq("asaas_checkout_id", payment.checkoutSession).maybeSingle();
    checkout = data;
  }

  let table: string | null = null;
  // deno-lint-ignore no-explicit-any
  let sub: any = null;
  if (payment.subscription) {
    for (const t of ["client_subscriptions", "pro_subscriptions"]) {
      const { data } = await db.from(t).select("*")
        .eq("asaas_subscription_id", payment.subscription)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) { table = t; sub = data; break; }
    }
  }
  if (!checkout && !sub) return false;
  if (!table) table = checkout.kind === "pro" ? "pro_subscriptions" : "client_subscriptions";
  const userId = sub?.user_id ?? checkout.user_id;
  const agora = new Date();

  if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
    // CONFIRMED e RECEIVED chegam para a mesma cobrança: só a primeira conta.
    const jaContou = sub?.last_payment_at &&
      agora.getTime() - new Date(sub.last_payment_at).getTime() < 24 * 3600 * 1000;
    const renova = new Date(agora);
    renova.setMonth(renova.getMonth() + 1);

    if (sub) {
      if (!jaContou || sub.status !== "active") {
        await db.from(table).update({
          status: "active",
          renew_at: renova.toISOString(),
          last_payment_at: agora.toISOString(),
          cancelled_at: null,
        }).eq("id", sub.id);
      }
    } else {
      // Primeiro pagamento: a assinatura nasce aqui. Planos antigos da pessoa saem.
      await db.from(table)
        .update({ status: "cancelled", cancelled_at: agora.toISOString() })
        .eq("user_id", userId).eq("status", "active");
      const { error } = await db.from(table).insert({
        user_id: userId,
        plan_id: checkout.plan_id,
        status: "active",
        start_at: agora.toISOString(),
        renew_at: renova.toISOString(),
        last_payment_at: agora.toISOString(),
        asaas_subscription_id: payment.subscription ?? null,
      });
      if (error) console.error("Erro ao criar assinatura:", error);
      await db.from("notifications").insert({
        user_id: userId,
        title: "Plano ativado",
        message: "Recebemos o pagamento e o seu plano Já Limpo já está valendo. A renovação é automática no cartão.",
        type: "payment",
        read: false,
      });
    }
    if (checkout && checkout.status !== "paid") {
      await db.from("plan_checkouts").update({
        status: "paid",
        asaas_subscription_id: payment.subscription ?? null,
        updated_at: agora.toISOString(),
      }).eq("id", checkout.id);
    }
    return true;
  }

  if (sub && sub.status === "active" && event === "PAYMENT_OVERDUE") {
    await db.from(table).update({ status: "paused" }).eq("id", sub.id);
    await db.from("notifications").insert({
      user_id: userId,
      title: "Não conseguimos cobrar seu plano",
      message: "A mensalidade do plano Já Limpo não passou no cartão. O plano fica pausado até o pagamento.",
      type: "payment",
      read: false,
    });
  }
  if (sub && sub.status === "active" && payment.status === "REFUNDED") {
    await db.from(table)
      .update({ status: "cancelled", cancelled_at: agora.toISOString() })
      .eq("id", sub.id);
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Asaas webhook token (set in Asaas dashboard + stored as ASAAS_WEBHOOK_TOKEN)
    const expectedToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN") ?? "";
    const providedToken = req.headers.get("asaas-access-token") ?? "";
    if (!expectedToken || !providedToken || !timingSafeEqual(providedToken, expectedToken)) {
      console.warn("Asaas webhook rejected: invalid or missing token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Webhook Asaas recebido:", JSON.stringify(body));

    const { event, payment } = body;
    const ok = (extra: Record<string, unknown>) =>
      new Response(JSON.stringify({ received: true, ...extra }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // ── Mensalidade: assinatura encerrada no Asaas ──
    if (
      (event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED") &&
      body.subscription?.id
    ) {
      for (const table of ["client_subscriptions", "pro_subscriptions"]) {
        await supabaseAdmin
          .from(table)
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("asaas_subscription_id", body.subscription.id)
          .eq("status", "active");
      }
      return ok({ message: "Subscription closed" });
    }

    // ── Mensalidade: cobrança de um plano (1ª pelo checkout, as seguintes pela assinatura) ──
    if (payment?.id && (payment.subscription || payment.checkoutSession)) {
      const handled = await tratarCobrancaDePlano(supabaseAdmin, event, payment);
      if (handled) return ok({ message: "Plan payment" });
    }

    if (!payment || !payment.id) {
      return new Response(JSON.stringify({ received: true, message: "No payment data" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusMap: Record<string, string> = {
      CONFIRMED: "confirmed",
      RECEIVED: "confirmed",
      PENDING: "pending",
      OVERDUE: "overdue",
      REFUNDED: "refunded",
      REFUND_REQUESTED: "refund_requested",
      CHARGEBACK_REQUESTED: "chargeback",
      CHARGEBACK_DISPUTE: "chargeback",
      AWAITING_CHARGEBACK_REVERSAL: "chargeback",
      DUNNING_REQUESTED: "overdue",
      DUNNING_RECEIVED: "confirmed",
      PAYMENT_DELETED: "cancelled",
    };

    const paymentEvents = [
      "PAYMENT_CONFIRMED",
      "PAYMENT_RECEIVED",
      "PAYMENT_OVERDUE",
      "PAYMENT_REFUNDED",
      "PAYMENT_DELETED",
      "PAYMENT_UPDATED",
      "PAYMENT_CHARGEBACK_REQUESTED",
    ];

    if (!paymentEvents.includes(event)) {
      return new Response(JSON.stringify({ received: true, message: "Event ignored" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const internalStatus = statusMap[payment.status] || "pending";

    const { data: paymentRecord, error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: internalStatus,
        asaas_status: payment.status,
        updated_at: new Date().toISOString(),
      })
      .eq("asaas_payment_id", payment.id)
      .select("order_id")
      .maybeSingle();

    if (updateError) {
      console.error("Erro ao atualizar payment:", updateError);
    }

    if (paymentRecord?.order_id && (payment.status === "CONFIRMED" || payment.status === "RECEIVED")) {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("client_id, pro_id, service:services(name)")
        .eq("id", paymentRecord.order_id)
        .maybeSingle();

      // Com diarista já atribuída (fluxo de oferta) vira "confirmed";
      // sem diarista vira "scheduled" e entra no mural.
      const targetStatus = order?.pro_id ? "confirmed" : "scheduled";
      const { error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          status: targetStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentRecord.order_id)
        .in("status", ["draft"]);

      if (orderError) {
        console.error("Erro ao atualizar order:", orderError);
      }

      if (order?.client_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: order.client_id,
          title: "Pagamento confirmado! ✅",
          message: order?.pro_id
            ? `Seu pagamento para ${(order as any).service?.name || "serviço de limpeza"} foi confirmado. Sua profissional já está reservada para o serviço.`
            : `Seu pagamento para ${(order as any).service?.name || "serviço de limpeza"} foi confirmado. Estamos buscando uma profissional para você.`,
          type: "payment",
          read: false,
        });
      }
    }

    if (paymentRecord?.order_id && (payment.status === "REFUNDED" || payment.status === "PAYMENT_DELETED")) {
      await supabaseAdmin
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentRecord.order_id);
    }

    return new Response(JSON.stringify({ received: true, status: internalStatus }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ received: true, error: "Internal error" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
