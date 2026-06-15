import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const VALID_ROLES = ["admin", "pro", "client"] as const;
type AppRole = (typeof VALID_ROLES)[number];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autorizado" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Não autorizado" }, 401);

    // Verify caller is admin
    const { data: callerRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!callerRoles || callerRoles.length === 0) {
      return json({ error: "Acesso restrito a administradores" }, 403);
    }

    const body = await req.json();
    const action = String(body.action || "");

    // -------- LIST --------
    if (action === "list") {
      const search = String(body.search || "").trim().toLowerCase();
      const page = Math.max(1, Number(body.page) || 1);
      const perPage = Math.min(200, Math.max(1, Number(body.perPage) || 100));

      const { data: usersData, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return json({ error: error.message }, 500);

      let users = usersData.users;
      if (search) {
        users = users.filter(u =>
          (u.email || "").toLowerCase().includes(search) ||
          ((u.user_metadata as any)?.full_name || "").toLowerCase().includes(search)
        );
      }

      const ids = users.map(u => u.id);
      const { data: rolesRows } = await admin
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

      const { data: profilesRows } = await admin
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

      const rolesMap = new Map<string, AppRole[]>();
      (rolesRows || []).forEach(r => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role as AppRole);
        rolesMap.set(r.user_id, arr);
      });
      const profileMap = new Map<string, { full_name: string | null; phone: string | null }>();
      (profilesRows || []).forEach(p => profileMap.set(p.user_id, { full_name: p.full_name, phone: p.phone }));

      const result = users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        full_name: profileMap.get(u.id)?.full_name ?? (u.user_metadata as any)?.full_name ?? null,
        phone: profileMap.get(u.id)?.phone ?? null,
        roles: rolesMap.get(u.id) || [],
      }));

      return json({ users: result, page, perPage });
    }

    // All mutating actions require targetUserId
    const targetUserId = String(body.targetUserId || "");
    if (!targetUserId) return json({ error: "targetUserId é obrigatório" }, 400);

    // -------- SET PASSWORD --------
    if (action === "set_password") {
      const password = String(body.password || "");
      if (password.length < 8) return json({ error: "Senha deve ter no mínimo 8 caracteres" }, 400);
      if (password.length > 72) return json({ error: "Senha muito longa" }, 400);

      const { error } = await admin.auth.admin.updateUserById(targetUserId, { password });
      if (error) return json({ error: error.message }, 500);

      await admin.from("admin_audit_log").insert({
        actor_id: user.id, action: "reset_password", target_user_id: targetUserId,
      }).then(() => {}, () => {});

      return json({ ok: true });
    }

    // -------- ADD ROLE --------
    if (action === "add_role") {
      const role = String(body.role || "") as AppRole;
      if (!VALID_ROLES.includes(role)) return json({ error: "Role inválida" }, 400);

      const { error } = await admin
        .from("user_roles")
        .upsert({ user_id: targetUserId, role }, { onConflict: "user_id,role" });
      if (error) return json({ error: error.message }, 500);

      await admin.from("admin_audit_log").insert({
        actor_id: user.id, action: "add_role", target_user_id: targetUserId, metadata: { role },
      }).then(() => {}, () => {});

      return json({ ok: true });
    }

    // -------- REMOVE ROLE --------
    if (action === "remove_role") {
      const role = String(body.role || "") as AppRole;
      if (!VALID_ROLES.includes(role)) return json({ error: "Role inválida" }, 400);

      // Prevent admin from removing their own last admin role
      if (targetUserId === user.id && role === "admin") {
        const { count } = await admin
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) <= 1) {
          return json({ error: "Não é possível remover o último administrador" }, 400);
        }
      }

      const { error } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", role);
      if (error) return json({ error: error.message }, 500);

      await admin.from("admin_audit_log").insert({
        actor_id: user.id, action: "remove_role", target_user_id: targetUserId, metadata: { role },
      }).then(() => {}, () => {});

      return json({ ok: true });
    }

    // -------- DELETE USER --------
    if (action === "delete_user") {
      if (targetUserId === user.id) return json({ error: "Você não pode excluir sua própria conta" }, 400);

      const { error } = await admin.auth.admin.deleteUser(targetUserId);
      if (error) return json({ error: error.message }, 500);

      await admin.from("admin_audit_log").insert({
        actor_id: user.id, action: "delete_user", target_user_id: targetUserId,
      }).then(() => {}, () => {});

      return json({ ok: true });
    }

    // -------- SEND PASSWORD RESET EMAIL --------
    if (action === "send_reset_email") {
      const email = String(body.email || "");
      if (!email) return json({ error: "Email obrigatório" }, 400);
      const redirectTo = String(body.redirectTo || "");
      const { error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: redirectTo ? { redirectTo } : undefined,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    console.error("admin-users error:", err);
    return json({ error: (err as Error).message || "Erro interno" }, 500);
  }
});
