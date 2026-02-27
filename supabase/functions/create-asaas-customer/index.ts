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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, cpfCnpj, phone } = await req.json();

    if (!name || !cpfCnpj) {
      return new Response(JSON.stringify({ error: "Nome e CPF/CNPJ são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENV = Deno.env.get("ASAAS_ENVIRONMENT") || "sandbox";
    const baseUrl = ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Verificar se já existe customer com esse CPF
    const searchRes = await fetch(`${baseUrl}/customers?cpfCnpj=${cpfCnpj}`, {
      headers: { "access_token": ASAAS_API_KEY! },
    });
    const searchData = await searchRes.json();

    let customerId: string;

    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
    } else {
      const createRes = await fetch(`${baseUrl}/customers`, {
        method: "POST",
        headers: {
          "access_token": ASAAS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: email || undefined,
          cpfCnpj,
          phone: phone || undefined,
          notificationDisabled: false,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        console.error("Erro Asaas:", errorData);
        return new Response(JSON.stringify({ error: "Erro ao criar cliente no Asaas", details: errorData }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const customerData = await createRes.json();
      customerId = customerData.id;
    }

    // Salvar asaas_customer_id no profile do usuário
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ asaas_customer_id: customerId })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erro ao salvar customer_id:", updateError);
    }

    return new Response(JSON.stringify({ success: true, customerId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
