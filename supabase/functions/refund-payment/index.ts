import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client to validate the caller
    const supabaseUserClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify caller is admin
    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso negado: apenas administradores" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId, reason, description } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Block refund if pro was already paid out
    if (order.status === "paid_out") {
      return new Response(JSON.stringify({ error: "Pedido já foi pago à diarista. Estorno não pode ser feito automaticamente." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if there are completed withdrawals associated with this order's earnings
    if (order.pro_id && (order.status === "rated" || order.status === "completed")) {
      // Check if pro has enough balance to cover this order's portion (i.e., not yet withdrawn)
      const { data: balance } = await supabaseAdmin.rpc("calculate_pro_available_balance", { p_user_id: order.pro_id });
      const proPortion = Number(order.total_price) * 0.8;
      if (Number(balance ?? 0) < proPortion) {
        return new Response(JSON.stringify({
          error: `Saldo da diarista (R$ ${Number(balance ?? 0).toFixed(2)}) é insuficiente para cobrir o repasse deste pedido (R$ ${proPortion.toFixed(2)}). Verifique se já houve saque.`,
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Find latest payment
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let asaasRefundResult: any = null;
    let refundedViaAsaas = false;

    if (payment?.asaas_payment_id && (payment.status === "paid" || payment.status === "confirmed" || payment.asaas_status === "RECEIVED" || payment.asaas_status === "CONFIRMED")) {
      const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
      const asaasEnv = Deno.env.get("ASAAS_ENVIRONMENT") || "production";
      const asaasBaseUrl = asaasEnv === "production" ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";

      if (!asaasApiKey) {
        return new Response(JSON.stringify({ error: "ASAAS_API_KEY não configurada" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const refundResp = await fetch(`${asaasBaseUrl}/payments/${payment.asaas_payment_id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": asaasApiKey,
        },
        body: JSON.stringify({
          description: description || reason || "Estorno solicitado pelo administrador",
        }),
      });

      const refundData = await refundResp.json();

      if (!refundResp.ok) {
        console.error("Asaas refund error:", refundData);
        const asaasMsg = refundData?.errors?.[0]?.description || "";
        let friendly = asaasMsg || "Falha ao processar estorno no Asaas";
        if (asaasMsg.toLowerCase().includes("saldo")) {
          friendly = "Saldo insuficiente na conta Asaas para realizar o estorno. Adicione saldo na sua conta Asaas (transferindo do seu saldo recebido) e tente novamente. Alternativamente, processe o estorno manualmente via PIX ao cliente.";
        }
        return new Response(JSON.stringify({
          error: friendly,
          asaasError: asaasMsg,
          details: refundData,
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      asaasRefundResult = refundData;
      refundedViaAsaas = true;

      // Update payment record
      await supabaseAdmin
        .from("payments")
        .update({
          status: "refunded",
          asaas_status: refundData?.status || "REFUNDED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
    } else if (payment) {
      // Mark payment as refunded even if not paid via Asaas (manual handling)
      await supabaseAdmin
        .from("payments")
        .update({
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
    }

    // Cancel the order
    await supabaseAdmin
      .from("orders")
      .update({
        status: "cancelled",
        notes: order.notes
          ? `${order.notes}\n\n[ESTORNO ADMIN] ${reason || "Reembolso processado"}`
          : `[ESTORNO ADMIN] ${reason || "Reembolso processado"}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Notify client
    await supabaseAdmin.from("notifications").insert({
      user_id: order.client_id,
      title: "Reembolso processado 💰",
      message: refundedViaAsaas
        ? `Seu reembolso de R$ ${Number(order.total_price).toFixed(2).replace(".", ",")} foi processado. Baixe o comprovante no detalhe do pedido. Retorno em até 7 dias úteis.`
        : `Seu pedido foi cancelado e o estorno está em processamento. Baixe o comprovante no detalhe do pedido.`,
      type: "success",
      data: { order_id: orderId, refund: true },
    });

    // Notify pro if assigned
    if (order.pro_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: order.pro_id,
        title: "Pedido cancelado e estornado",
        message: "Um pedido atribuído a você foi cancelado e estornado pelo administrador.",
        type: "warning",
        data: { order_id: orderId },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      refundedViaAsaas,
      asaasRefund: asaasRefundResult,
      message: refundedViaAsaas
        ? "Estorno processado com sucesso no Asaas. O valor retornará ao cliente em até 7 dias úteis."
        : "Pedido cancelado e marcado como estornado.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Refund error:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
