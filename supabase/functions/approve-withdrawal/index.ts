import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// A2c — Aprovação de saque (admin-only). Único lugar que executa a
// transferência PIX no Asaas. Ações:
//   approve : pending    -> processing|completed (executa transferência)
//   complete: processing -> completed            (confirmação manual)
//   reject  : pending|processing -> rejected     (devolve saldo, sem Asaas)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    if (roleErr || !isAdmin) {
      return json({ error: "Acesso restrito a administradores" }, 403);
    }

    const body = await req.json();
    const withdrawalId = String(body.withdrawalId || "");
    const action = String(body.action || "");
    const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : null;

    if (!withdrawalId) return json({ error: "withdrawalId é obrigatório" }, 400);
    if (!["approve", "complete", "reject"].includes(action)) {
      return json({ error: "Ação inválida" }, 400);
    }

    const { data: withdrawal, error: wErr } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .maybeSingle();

    if (wErr || !withdrawal) return json({ error: "Saque não encontrado" }, 404);

    const fmt = (v: number) => Number(v).toFixed(2).replace(".", ",");

    const audit = (auditAction: string, metadata: Record<string, unknown>) =>
      supabaseAdmin.from("admin_audit_log").insert({
        actor_id: user.id,
        action: auditAction,
        target_user_id: withdrawal.user_id,
        metadata: { withdrawal_id: withdrawalId, amount: withdrawal.amount, ...metadata },
      }).then(() => {}, (e) => console.error("audit insert failed", e));

    const notify = (title: string, message: string, type = "withdrawal") =>
      supabaseAdmin.from("notifications").insert({
        user_id: withdrawal.user_id,
        title,
        message,
        type,
        read: false,
        data: { withdrawal_id: withdrawalId },
      }).then(() => {}, (e) => console.error("notify insert failed", e));

    // ---------- REJECT ----------
    if (action === "reject") {
      if (!["pending", "processing"].includes(withdrawal.status)) {
        return json({ error: `Saque em status '${withdrawal.status}' não pode ser rejeitado` }, 400);
      }
      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", withdrawalId)
        .in("status", ["pending", "processing"]);
      if (error) return json({ error: "Erro ao rejeitar saque" }, 500);

      await audit("withdrawal_rejected", { reason });
      await notify(
        "Saque não aprovado",
        `Seu saque de R$ ${fmt(withdrawal.amount)} não foi aprovado${reason ? `: ${reason}` : ""}. O valor voltou ao seu saldo disponível.`
      );
      return json({ success: true, status: "rejected" });
    }

    // ---------- COMPLETE (confirmação manual de transferência em processamento) ----------
    if (action === "complete") {
      if (withdrawal.status !== "processing") {
        return json({ error: `Apenas saques em processamento podem ser concluídos (atual: '${withdrawal.status}')` }, 400);
      }
      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({ status: "completed", processed_at: new Date().toISOString() })
        .eq("id", withdrawalId)
        .eq("status", "processing");
      if (error) return json({ error: "Erro ao concluir saque" }, 500);

      await audit("withdrawal_completed", {});
      await notify(
        "Saque concluído! ✅",
        `Sua transferência Pix de R$ ${fmt(withdrawal.amount)} foi concluída.`
      );
      return json({ success: true, status: "completed" });
    }

    // ---------- APPROVE (executa a transferência PIX no Asaas) ----------
    if (withdrawal.status !== "pending") {
      return json({ error: `Apenas saques pendentes podem ser aprovados (atual: '${withdrawal.status}')` }, 400);
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

    // Chave PIX decifrada apenas aqui, via RPC restrita a service role
    const { data: pixKey, error: pixErr } = await supabaseAdmin.rpc(
      "admin_get_withdrawal_pix_key",
      { p_withdrawal_id: withdrawalId }
    );
    if (pixErr || !pixKey) {
      console.error("pix key decrypt error:", pixErr);
      return json({ error: "Não foi possível recuperar a chave Pix do saque" }, 500);
    }

    const pixKeyTypeMap: Record<string, string> = {
      cpf: "CPF",
      email: "EMAIL",
      phone: "PHONE",
      random: "EVP",
    };
    const pixAddressKeyType = pixKeyTypeMap[withdrawal.pix_key_type ?? ""] || "CPF";

    // Marca como processing ANTES da chamada externa (reserva o estado);
    // se o Asaas falhar, volta para pending.
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from("withdrawals")
      .update({ status: "processing" })
      .eq("id", withdrawalId)
      .eq("status", "pending")
      .select("id");
    if (claimErr || !claimed || claimed.length === 0) {
      return json({ error: "Saque já foi processado por outro administrador" }, 409);
    }

    let transferData: Record<string, unknown> | null = null;
    try {
      const transferRes = await fetch(`${baseUrl}/transfers`, {
        method: "POST",
        headers: {
          access_token: ASAAS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: Number(withdrawal.amount),
          operationType: "PIX",
          pixAddressKey: pixKey,
          pixAddressKeyType,
          description: `Saque JáLimpo - ${String(withdrawal.user_id).slice(0, 8)}`,
        }),
      });
      transferData = await transferRes.json();

      if (!transferRes.ok) {
        console.error("Asaas transfer error:", transferData);
        await supabaseAdmin
          .from("withdrawals")
          .update({ status: "pending" })
          .eq("id", withdrawalId)
          .eq("status", "processing");
        const asaasMsg = (transferData as any)?.errors?.[0]?.description || "";
        return json({ error: asaasMsg || "Erro ao processar transferência Pix. O saque voltou para pendente." }, 400);
      }
    } catch (asaasError) {
      console.error("Asaas network error:", asaasError);
      await supabaseAdmin
        .from("withdrawals")
        .update({ status: "pending" })
        .eq("id", withdrawalId)
        .eq("status", "processing");
      return json({ error: "Erro de comunicação com o gateway. O saque voltou para pendente." }, 502);
    }

    const finalStatus = (transferData as any)?.status === "DONE" ? "completed" : "processing";
    await supabaseAdmin
      .from("withdrawals")
      .update({
        status: finalStatus,
        asaas_transfer_id: (transferData as any)?.id || null,
        processed_at: finalStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", withdrawalId);

    await audit("withdrawal_approved", { asaas_transfer_id: (transferData as any)?.id, final_status: finalStatus });
    await notify(
      "Saque aprovado! 💰",
      `Seu saque de R$ ${fmt(withdrawal.amount)} foi aprovado e a transferência Pix está ${finalStatus === "completed" ? "concluída" : "em processamento"}.`
    );

    return json({ success: true, status: finalStatus, asaasTransferId: (transferData as any)?.id || null });
  } catch (error) {
    console.error("approve-withdrawal error:", error);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
