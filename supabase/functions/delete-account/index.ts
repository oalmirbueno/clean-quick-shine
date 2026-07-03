import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// LGPD — Exclusão de conta pelo próprio usuário (exigência Apple 5.1.1(v) e
// Google Play). Estratégia:
//  - Pedido/serviço em andamento -> recusa (encerrar primeiro).
//  - Sempre: apaga PII (endereços, push subscriptions, notificações) e
//    anonimiza o profile. Pedidos/pagamentos são PRESERVADOS por obrigação
//    contábil/fiscal, desvinculados de dados pessoais.
//  - Sem pedidos no histórico: exclui o usuário Auth de vez (hard delete).
//  - Com pedidos: orders.client_id referencia auth.users sem CASCADE, então o
//    usuário Auth é anonimizado (e-mail sintético, senha aleatória, banido) —
//    equivalente funcional à exclusão, preservando integridade referencial.

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
    if (authError || !user) return json({ error: "Não autorizado" }, 401);

    const body = await req.json().catch(() => ({}));
    if (body.confirm !== true) {
      return json({ error: "Confirmação obrigatória (confirm: true)" }, 400);
    }

    const uid = user.id;

    // --- Bloqueios: serviço em andamento ou saque pendente ---
    const { data: activeOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .or(`client_id.eq.${uid},pro_id.eq.${uid}`)
      .in("status", ["scheduled", "matching", "confirmed", "en_route", "in_progress"])
      .limit(1);

    if (activeOrders && activeOrders.length > 0) {
      return json({
        error: "Você tem um serviço em aberto. Conclua ou cancele antes de excluir a conta.",
      }, 400);
    }

    const { data: activeWithdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("id")
      .eq("user_id", uid)
      .in("status", ["pending", "processing"])
      .limit(1);

    if (activeWithdrawals && activeWithdrawals.length > 0) {
      return json({
        error: "Você tem um saque em processamento. Aguarde a conclusão antes de excluir a conta.",
      }, 400);
    }

    // --- Limpeza de PII (independe do caminho de exclusão) ---
    await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", uid);
    await supabaseAdmin.from("addresses").delete().eq("user_id", uid);
    await supabaseAdmin.from("notifications").delete().eq("user_id", uid);
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: "Conta excluída", phone: null, asaas_customer_id: null })
      .eq("user_id", uid);

    // --- Histórico define o caminho ---
    const { count: orderCount } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .or(`client_id.eq.${uid},pro_id.eq.${uid}`);

    let mode: "hard_delete" | "anonymized";

    if (!orderCount || orderCount === 0) {
      // Sem histórico: exclusão real (CASCADE limpa profiles/user_roles/etc.)
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (delErr) {
        console.error("deleteUser failed:", delErr);
        return json({ error: "Erro ao excluir a conta. Contate o suporte." }, 500);
      }
      mode = "hard_delete";
    } else {
      // Com histórico: anonimiza e bloqueia o login para sempre
      const anonEmail = `excluida-${uid}@anon.jalimpo.invalid`;
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { error: anonErr } = await supabaseAdmin.auth.admin.updateUserById(uid, {
        email: anonEmail,
        password: randomPassword,
        user_metadata: { full_name: "Conta excluída", deleted_at: new Date().toISOString() },
        ban_duration: "876000h", // ~100 anos
      });
      if (anonErr) {
        console.error("anonymize failed:", anonErr);
        return json({ error: "Erro ao excluir a conta. Contate o suporte." }, 500);
      }
      await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
      mode = "anonymized";
    }

    // Registro de auditoria (ator = o próprio titular)
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: uid,
      action: "account_deleted_self",
      target_user_id: uid,
      metadata: { mode, order_count: orderCount ?? 0 },
    }).then(() => {}, (e) => console.error("audit insert failed", e));

    return json({ success: true, mode });
  } catch (error) {
    console.error("delete-account error:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
