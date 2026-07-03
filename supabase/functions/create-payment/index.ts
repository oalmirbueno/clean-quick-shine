import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// A4 — Idempotência: nunca cria uma segunda cobrança viva para o mesmo pedido.
// - pagamento confirmado existente  -> erro "pedido já pago"
// - pendente do mesmo billingType   -> devolve a cobrança existente
// - pendente de outro billingType   -> cancela a antiga no Asaas e cria a nova
// Apenas pedidos em 'draft' são pagáveis. A promoção draft->scheduled em
// cartão confirmado é feita com service role (o trigger C1 bloqueia o cliente).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { orderId, billingType, creditCard, creditCardHolderInfo } = await req.json();

    if (!orderId || !billingType) {
      return json({ error: "orderId e billingType são obrigatórios" }, 400);
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENV = Deno.env.get("ASAAS_ENVIRONMENT");
    if (!ASAAS_API_KEY) return json({ error: "ASAAS_API_KEY não configurada" }, 500);
    if (!ASAAS_ENV || !["sandbox", "production"].includes(ASAAS_ENV)) {
      return json({ error: "ASAAS_ENVIRONMENT não configurado (sandbox|production)" }, 500);
    }
    const baseUrl = ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Buscar dados do pedido (escopo do próprio cliente via RLS)
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, service:services(name)")
      .eq("id", orderId)
      .eq("client_id", user.id)
      .maybeSingle();

    if (orderError || !order) {
      return json({ error: "Pedido não encontrado" }, 404);
    }

    if (order.status !== "draft") {
      return json({ error: "Este pedido não está aguardando pagamento" }, 400);
    }

    // ---- Idempotência: verificar cobranças existentes deste pedido ----
    const { data: existingPayments } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .in("status", ["pending", "confirmed"])
      .order("created_at", { ascending: false });

    const confirmed = existingPayments?.find((p) => p.status === "confirmed");
    if (confirmed) {
      return json({ error: "Este pedido já possui pagamento confirmado" }, 400);
    }

    const samePending = existingPayments?.find(
      (p) => p.status === "pending" && p.method === String(billingType).toLowerCase()
    );
    if (samePending) {
      // Devolve a cobrança existente em vez de criar outra
      return json({
        success: true,
        reused: true,
        payment: {
          id: samePending.asaas_payment_id,
          status: samePending.asaas_status || "PENDING",
          billingType,
          value: samePending.amount,
          invoiceUrl: samePending.invoice_url || null,
          bankSlipUrl: samePending.boleto_url || null,
          pixQrCode: samePending.pix_qr_code || null,
          pixCopyPaste: samePending.pix_copy_paste || null,
        },
      });
    }

    // Pendente de outro tipo: cancela a cobrança antiga no Asaas antes de criar a nova
    const otherPending = existingPayments?.filter((p) => p.status === "pending") || [];
    for (const old of otherPending) {
      if (old.asaas_payment_id) {
        try {
          await fetch(`${baseUrl}/payments/${old.asaas_payment_id}`, {
            method: "DELETE",
            headers: { access_token: ASAAS_API_KEY },
          });
        } catch (e) {
          console.error("Erro ao cancelar cobrança antiga no Asaas:", e);
        }
      }
      await supabaseAdmin
        .from("payments")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", old.id);
    }

    // Buscar asaas_customer_id do profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("asaas_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.asaas_customer_id) {
      return json({ error: "Cliente não cadastrado no gateway. Cadastre CPF primeiro." }, 400);
    }

    // Montar payload da cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const paymentPayload: Record<string, unknown> = {
      customer: profile.asaas_customer_id,
      billingType,
      value: order.total_price,
      dueDate: dueDate.toISOString().split("T")[0],
      description: `JáLimpo - ${(order as { service?: { name?: string } }).service?.name || "Serviço de limpeza"} - Pedido #${order.id.slice(0, 8)}`,
      externalReference: order.id,
    };

    if (billingType === "CREDIT_CARD" && creditCard) {
      paymentPayload.creditCard = creditCard;
      paymentPayload.creditCardHolderInfo = creditCardHolderInfo;
    }

    const paymentRes = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "access_token": ASAAS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error("Erro Asaas payment:", paymentData);
      return json({ error: "Erro ao criar cobrança" }, 400);
    }

    // Se for PIX, buscar QR Code
    let pixData = null;
    if (billingType === "PIX") {
      const pixRes = await fetch(`${baseUrl}/payments/${paymentData.id}/pixQrCode`, {
        headers: { "access_token": ASAAS_API_KEY },
      });
      if (pixRes.ok) {
        pixData = await pixRes.json();
      }
    }

    // Salvar pagamento (trigger força status pending para usuário comum;
    // aqui usamos service role para refletir o status real do gateway)
    const isConfirmed = paymentData.status === "CONFIRMED" || paymentData.status === "RECEIVED";
    const { error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        user_id: user.id,
        amount: order.total_price,
        method: String(billingType).toLowerCase(),
        status: isConfirmed ? "confirmed" : "pending",
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

    // Cartão confirmado na hora: promove o pedido com service role
    // (o trigger C1 não permite mais que o cliente faça draft->scheduled)
    if (isConfirmed) {
      const { error: promoteError } = await supabaseAdmin
        .from("orders")
        .update({ status: "scheduled", updated_at: new Date().toISOString() })
        .eq("id", order.id)
        .eq("status", "draft");
      if (promoteError) {
        console.error("Erro ao promover pedido:", promoteError);
      }
    }

    return json({
      success: true,
      reused: false,
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
    });

  } catch (error) {
    console.error("Erro geral:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
