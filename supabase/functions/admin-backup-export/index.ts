// FUNÇÃO TEMPORÁRIA DE BACKUP — REMOVER APÓS EXPORT
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ALLOWED_TABLES = new Set([
  "profiles", "user_roles", "addresses", "orders", "payments", "withdrawals",
  "coupons", "coupon_uses", "pro_profiles", "pro_zones", "pro_metrics",
  "support_tickets", "support_messages", "notifications", "services",
  "zones", "zone_rules", "cities",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Não autorizado" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user) return json({ error: "Não autorizado" }, 401);

    const { data: isAdmin, error: roleErr } = await admin.rpc("is_admin", { _user_id: userData.user.id });
    if (roleErr || !isAdmin) return json({ error: "Acesso restrito a administradores" }, 403);

    const body = await req.json().catch(() => ({}));
    const table = String((body as any).table || "");

    if (table === "auth_users") {
      const all: any[] = [];
      let page = 1;
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) return json({ error: error.message }, 500);
        for (const u of data.users) {
          all.push({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            email_confirmed_at: u.email_confirmed_at,
            last_sign_in_at: u.last_sign_in_at,
            user_metadata: u.user_metadata,
          });
        }
        if (data.users.length < 200) break;
        page++;
        if (page > 50) break;
      }
      return json({ table, rows: all, count: all.length });
    }

    if (table === "storage_list") {
      const result: Record<string, any[]> = {};
      for (const bucket of ["pro-documents", "chat-attachments"]) {
        const files: any[] = [];
        const walk = async (prefix: string) => {
          const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
          if (error || !data) return;
          for (const item of data) {
            const path = prefix ? `${prefix}/${item.name}` : item.name;
            if (item.id === null || (item as any).metadata === null) {
              await walk(path);
            } else {
              const { data: signed } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
              files.push({
                path,
                size: (item as any).metadata?.size ?? null,
                mimetype: (item as any).metadata?.mimetype ?? null,
                created_at: item.created_at,
                updated_at: item.updated_at,
                signed_url: signed?.signedUrl ?? null,
              });
            }
          }
        };
        await walk("");
        result[bucket] = files;
      }
      return json({ table, buckets: result });
    }

    if (!ALLOWED_TABLES.has(table)) {
      return json({ error: "Tabela não permitida" }, 400);
    }

    const rows: any[] = [];
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await admin.from(table).select("*").range(from, from + pageSize - 1);
      if (error) return json({ error: error.message }, 500);
      if (!data || data.length === 0) break;
      rows.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
      if (from > 500000) break;
    }
    return json({ table, rows, count: rows.length });
  } catch (err) {
    console.error("admin-backup-export error:", err);
    return json({ error: (err as Error).message || "Erro interno" }, 500);
  }
});
