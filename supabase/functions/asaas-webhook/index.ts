import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
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

    const body = await req.json();
    console.log("Webhook Asaas recebido:", JSON.stringify(body));

    const { event, payment } = body;

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
      const { error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "scheduled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentRecord.order_id)
        .in("status", ["draft"]);

      if (orderError) {
        console.error("Erro ao atualizar order:", orderError);
      }

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("client_id, service:services(name)")
        .eq("id", paymentRecord.order_id)
        .maybeSingle();

      if (order?.client_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: order.client_id,
          title: "Pagamento confirmado! ✅",
          message: `Seu pagamento para ${(order as any).service?.name || "serviço de limpeza"} foi confirmado. Estamos buscando uma profissional para você.`,
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
