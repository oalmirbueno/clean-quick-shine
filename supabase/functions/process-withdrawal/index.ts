import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // --- Auth ---
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

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

    // --- SERVER-SIDE BALANCE VALIDATION (atomic with advisory lock) ---
    // This DB function uses pg_advisory_xact_lock to serialize concurrent requests
    // for the same user, preventing race conditions.
    const { data: balanceResult, error: balanceError } = await supabaseAdmin
      .rpc("calculate_pro_available_balance", { p_user_id: user.id });

    if (balanceError) {
      console.error("Balance calculation error:", balanceError);
      return json({ error: "Erro ao calcular saldo" }, 500);
    }

    const availableBalance = Number(balanceResult) || 0;

    if (amount > availableBalance) {
      return json(
        {
          error: `Saldo insuficiente. Disponível: R$ ${availableBalance
            .toFixed(2)
            .replace(".", ",")}`,
        },
        400
      );
    }

    // --- Insert withdrawal FIRST (reserves the balance before Asaas call) ---
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount,
        method: "pix",
        status: "pending",
        encrypted_pix_key: pixKey,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error reserving withdrawal:", insertError);
      return json({ error: "Erro ao reservar saque" }, 500);
    }

    // --- Asaas transfer ---
    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENV = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";
    const baseUrl =
      ASAAS_ENV === "production"
        ? "https://api.asaas.com/v3"
        : "https://sandbox.asaas.com/api/v3";

    const pixKeyTypeMap: Record<string, string> = {
      cpf: "CPF",
      email: "EMAIL",
      phone: "PHONE",
      random: "EVP",
    };

    let transferData: Record<string, unknown> | null = null;

    try {
      const transferRes = await fetch(`${baseUrl}/transfers`, {
        method: "POST",
        headers: {
          access_token: ASAAS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: amount,
          operationType: "PIX",
          pixAddressKey: pixKey,
          pixAddressKeyType: pixKeyTypeMap[pixKeyType] || "CPF",
          description: `Saque JáLimpo - ${user.id.slice(0, 8)}`,
        }),
      });

      transferData = await transferRes.json();

      if (!transferRes.ok) {
        console.error("Asaas transfer error:", transferData);
        // Reject the withdrawal since Asaas failed
        await supabaseAdmin
          .from("withdrawals")
          .update({ status: "rejected" })
          .eq("id", withdrawal.id);

        return json(
          { error: "Erro ao processar transferência Pix" },
          400
        );
      }
    } catch (asaasError) {
      console.error("Asaas network error:", asaasError);
      // Reject the withdrawal on network failure
      await supabaseAdmin
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", withdrawal.id);

      return json({ error: "Erro de comunicação com gateway de pagamento" }, 502);
    }

    // --- Update withdrawal with Asaas data ---
    const finalStatus =
      (transferData as any)?.status === "DONE" ? "completed" : "processing";

    await supabaseAdmin
      .from("withdrawals")
      .update({
        status: finalStatus,
        asaas_transfer_id: (transferData as any)?.id || null,
        processed_at: finalStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", withdrawal.id);

    // --- Notification ---
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "Saque solicitado! 💰",
      message: `Seu saque de R$ ${amount
        .toFixed(2)
        .replace(".", ",")} via Pix está sendo processado.`,
      type: "withdrawal",
      read: false,
    });

    return json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount,
        status: finalStatus,
        estimatedDate: (transferData as any)?.scheduleDate || "Em instantes",
      },
    });
  } catch (error) {
    console.error("General error:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
