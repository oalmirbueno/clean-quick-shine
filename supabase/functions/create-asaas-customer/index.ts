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

    const responder = (body: Record<string, unknown>, status: number) =>
      new Response(JSON.stringify(body), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    const INDISPONIVEL = "Pagamento temporariamente indisponível. Nossa equipe já foi avisada; tente de novo em instantes.";

    const cpfLimpo = String(cpfCnpj).replace(/\D/g, "");
    if (cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
      return responder({ error: "CPF inválido. Confira os números." }, 400);
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_ENV = Deno.env.get("ASAAS_ENVIRONMENT");
    if (!ASAAS_API_KEY || !ASAAS_ENV || !["sandbox", "production"].includes(ASAAS_ENV)) {
      console.error("ASAAS_API_KEY/ASAAS_ENVIRONMENT não configurados");
      return responder({ error: INDISPONIVEL, code: "gateway" }, 503);
    }
    const baseUrl = ASAAS_ENV === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Verificar se já existe customer com esse CPF
    const searchRes = await fetch(`${baseUrl}/customers?cpfCnpj=${cpfLimpo}`, {
      headers: { "access_token": ASAAS_API_KEY! },
    });
    const searchData = await searchRes.json().catch(() => ({}));
    if (!searchRes.ok) {
      // 401 aqui = chave de API errada/expirada: ninguém consegue pagar.
      console.error("Erro Asaas (busca de cliente):", searchRes.status, JSON.stringify(searchData));
      return responder({ error: INDISPONIVEL, code: "gateway" }, 503);
    }

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
          cpfCnpj: cpfLimpo,
          phone: phone || undefined,
          notificationDisabled: false,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}));
        console.error("Erro Asaas:", createRes.status, JSON.stringify(errorData));
        if (createRes.status === 401 || createRes.status === 403 || createRes.status >= 500) {
          return responder({ error: INDISPONIVEL, code: "gateway" }, 503);
        }
        const motivo = errorData?.errors?.[0]?.description;
        return responder({ error: motivo || "Não foi possível cadastrar. Confira nome e CPF." }, 400);
      }

      const customerData = await createRes.json();
      customerId = customerData.id;
    }

    // Grava no perfil com a chave do servidor e confere: sem isso a pessoa
    // voltaria para a etapa do CPF mesmo com o cadastro feito.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data: salvo, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ asaas_customer_id: customerId, cpf: cpfLimpo })
      .eq("user_id", user.id)
      .select("user_id")
      .maybeSingle();

    if (updateError || !salvo) {
      console.error("Erro ao salvar customer_id:", updateError);
      return responder({ error: "Não foi possível salvar seu cadastro. Tente de novo." }, 500);
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
