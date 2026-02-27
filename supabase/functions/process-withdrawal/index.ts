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

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify pro role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "pro");

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Apenas profissionais podem solicitar saques",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { amount, pixKeyType, pixKey } = await req.json();

    // Validations
    if (!amount || amount < 10) {
      return new Response(
        JSON.stringify({ error: "Valor mínimo de saque é R$ 10,00" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!pixKey || !pixKeyType) {
      return new Response(
        JSON.stringify({ error: "Chave Pix é obrigatória" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate available balance
    const { data: completedOrders } = await supabaseAdmin
      .from("orders")
      .select("total_price")
      .eq("pro_id", user.id)
      .in("status", ["completed", "rated", "paid_out"]);

    const totalEarnings = (completedOrders || []).reduce(
      (sum: number, o: any) => sum + (o.total_price || 0) * 0.8,
      0
    );

    const { data: existingWithdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("amount")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);

    const totalWithdrawn = (existingWithdrawals || []).reduce(
      (sum: number, w: any) => sum + (w.amount || 0),
      0
    );

    const availableBalance = totalEarnings - totalWithdrawn;

    if (amount > availableBalance) {
      return new Response(
        JSON.stringify({
          error: `Saldo insuficiente. Disponível: R$ ${availableBalance.toFixed(2)}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Asaas transfer
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

    const transferData = await transferRes.json();

    if (!transferRes.ok) {
      console.error("Asaas transfer error:", transferData);
      return new Response(
        JSON.stringify({
          error: "Erro ao processar transferência",
          details: transferData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save withdrawal
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount,
        method: "pix",
        status: transferData.status === "DONE" ? "completed" : "processing",
        encrypted_pix_key: pixKey,
        asaas_transfer_id: transferData.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving withdrawal:", insertError);
    }

    // Create notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "Saque solicitado! 💰",
      message: `Seu saque de R$ ${amount
        .toFixed(2)
        .replace(".", ",")} via Pix está sendo processado.`,
      type: "withdrawal",
      read: false,
    });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal: {
          id: withdrawal?.id || transferData.id,
          amount,
          status: transferData.status,
          estimatedDate: transferData.scheduleDate || "Em instantes",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("General error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
