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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId, billingType, creditCard, creditCardHolderInfo } = await req.json();

    if (!orderId || !billingType) {
      return new Response(JSON.stringify({ error: "orderId e billingType são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar dados do pedido
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, service:services(name)")
      .eq("id", orderId)
      .eq("client_id", user.id)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status !== "draft" && order.status !== "scheduled") {
      return new Response(JSON.stringify({ error: "Pedido não pode ser pago neste status" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar asaas_customer_id do profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("asaas_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.asaas_customer_id) {
      return new Response(JSON.stringify({ error: "Cliente não cadastrado no gateway. Cadastre CPF primeiro." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENV = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";
    const baseUrl = ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Montar payload da cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const paymentPayload: any = {
      customer: profile.asaas_customer_id,
      billingType,
      value: order.total_price,
      dueDate: dueDate.toISOString().split("T")[0],
      description: `JáLimpo - ${(order as any).service?.name || "Serviço de limpeza"} - Pedido #${order.id.slice(0, 8)}`,
      externalReference: order.id,
    };

    if (billingType === "CREDIT_CARD" && creditCard) {
      paymentPayload.creditCard = creditCard;
      paymentPayload.creditCardHolderInfo = creditCardHolderInfo;
    }

    // Criar cobrança no Asaas
    const paymentRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "access_token": ASAAS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error("Erro Asaas payment:", paymentData);
      return new Response(JSON.stringify({ error: "Erro ao criar cobrança", details: paymentData }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Se for PIX, buscar QR Code
    let pixData = null;
    if (billingType === "PIX") {
      const pixRes = await fetch(`${baseUrl}/payments/${paymentData.id}/pixQrCode`, {
        headers: { "access_token": ASAAS_API_KEY! },
      });
      if (pixRes.ok) {
        pixData = await pixRes.json();
      }
    }

    // Salvar pagamento no banco
    const { error: insertError } = await supabaseClient
      .from("payments")
      .insert({
        order_id: order.id,
        user_id: user.id,
        amount: order.total_price,
        method: billingType.toLowerCase(),
        status: paymentData.status === "CONFIRMED" || paymentData.status === "RECEIVED"
          ? "confirmed"
          : "pending",
        asaas_payment_id: paymentData.id,
        asaas_status: paymentData.status,
        pix_qr_code: pixData?.encodedImage || null,
        pix_copy_paste: pixData?.payload || null,
        boleto_url: paymentData.bankSlipUrl || null,
        invoice_url: paymentData.invoiceUrl || null,
      });

    if (insertError) {
      console.error("Erro ao salvar payment:", insertError);
    }

    // Se pagamento já confirmado (cartão), atualizar status do pedido
    if (paymentData.status === "CONFIRMED" || paymentData.status === "RECEIVED") {
      await supabaseClient
        .from("orders")
        .update({ status: "scheduled", updated_at: new Date().toISOString() })
        .eq("id", order.id);
    }

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        billingType: paymentData.billingType,
        value: paymentData.value,
        invoiceUrl: paymentData.invoiceUrl,
        bankSlipUrl: paymentData.bankSlipUrl,
        pixQrCode: pixData?.encodedImage || null,
        pixCopyPaste: pixData?.payload || null,
      },
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
