// Entrega push nativo de uma notificação já gravada em `notifications`.
// Chamada pelo gatilho trg_disparar_push (pg_net) com { notification_id }.
//
// Segurança: não recebe título nem texto — lê a notificação pelo id com a
// service role e marca pushed_at de forma atômica, então chamar de novo não
// reenvia nada. Por isso pode rodar sem JWT (verify_jwt = false).
//
// Segredos (Supabase → Edge Functions → Secrets). Sem eles o canal é pulado:
//   FCM_SERVICE_ACCOUNT  JSON da conta de serviço do Firebase (Android)
//   APNS_KEY             conteúdo do arquivo .p8 da Apple (iPhone)
//   APNS_KEY_ID          ID da chave (10 caracteres)
//   APNS_TEAM_ID         Team ID da conta Apple Developer
//   APNS_BUNDLE_ID       opcional, padrão br.com.jalimpo.app
//   APNS_SANDBOX         opcional, "1" só para build de desenvolvimento do Xcode
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const b64url = (data: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const pemParaDer = (pem: string) => {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
};

async function assinarJwt(header: Record<string, unknown>, payload: Record<string, unknown>, chave: CryptoKey, alg: AlgorithmIdentifier | EcdsaParams) {
  const corpo = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = await crypto.subtle.sign(alg, chave, new TextEncoder().encode(corpo));
  return `${corpo}.${b64url(sig)}`;
}

// ---------------- FCM (Android) ----------------
let fcmCache: { token: string; exp: number; projectId: string } | null = null;

async function tokenFcm() {
  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT");
  if (!raw) return null;
  if (fcmCache && fcmCache.exp > Date.now() + 60_000) return fcmCache;
  const sa = JSON.parse(raw);
  const chave = await crypto.subtle.importKey("pkcs8", pemParaDer(sa.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const agora = Math.floor(Date.now() / 1000);
  const jwt = await assinarJwt(
    { alg: "RS256", typ: "JWT" },
    { iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 3600 },
    chave,
    { name: "RSASSA-PKCS1-v1_5" },
  );
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`OAuth FCM falhou: ${JSON.stringify(j).slice(0, 200)}`);
  fcmCache = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000, projectId: sa.project_id };
  return fcmCache;
}

async function enviarFcm(token: string, titulo: string, texto: string, url: string) {
  const auth = await tokenFcm();
  if (!auth) return "sem_config";
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${auth.projectId}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: titulo, body: texto },
        data: { url },
        android: { priority: "HIGH", notification: { channel_id: "pedidos", sound: "default" } },
      },
    }),
  });
  if (r.ok) return "ok";
  const corpo = await r.text();
  if (r.status === 404 || corpo.includes("UNREGISTERED") || corpo.includes("INVALID_ARGUMENT")) return "token_invalido";
  return `erro_${r.status}`;
}

// ---------------- APNs (iPhone) ----------------
let apnsCache: { jwt: string; exp: number } | null = null;

async function jwtApns() {
  const p8 = Deno.env.get("APNS_KEY");
  const kid = Deno.env.get("APNS_KEY_ID");
  const iss = Deno.env.get("APNS_TEAM_ID");
  if (!p8 || !kid || !iss) return null;
  if (apnsCache && apnsCache.exp > Date.now()) return apnsCache.jwt;
  const chave = await crypto.subtle.importKey("pkcs8", pemParaDer(p8), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const jwt = await assinarJwt({ alg: "ES256", kid }, { iss, iat: Math.floor(Date.now() / 1000) }, chave, { name: "ECDSA", hash: "SHA-256" });
  apnsCache = { jwt, exp: Date.now() + 45 * 60_000 }; // a Apple aceita até 60 min
  return jwt;
}

async function enviarApns(token: string, titulo: string, texto: string, url: string) {
  const jwt = await jwtApns();
  if (!jwt) return "sem_config";
  const host = Deno.env.get("APNS_SANDBOX") === "1" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const r = await fetch(`https://${host}/3/device/${token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": Deno.env.get("APNS_BUNDLE_ID") ?? "br.com.jalimpo.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify({ aps: { alert: { title: titulo, body: texto }, sound: "default" }, url }),
  });
  if (r.ok) return "ok";
  const corpo = await r.text();
  if (r.status === 410 || corpo.includes("BadDeviceToken") || corpo.includes("Unregistered")) return "token_invalido";
  return `erro_${r.status}`;
}

// ---------------- rota de abertura ----------------
// deno-lint-ignore no-explicit-any
async function destino(admin: any, n: { user_id: string; data: Record<string, unknown> | null }) {
  const explicita = typeof n.data?.url === "string" ? (n.data.url as string) : "";
  if (explicita.startsWith("/")) return explicita;
  const { data: papeis } = await admin.from("user_roles").select("role").eq("user_id", n.user_id);
  const r = (papeis ?? []).map((p: { role: string }) => p.role);
  if (r.includes("pro")) return "/pro/home";
  if (r.includes("admin")) return "/admin/dashboard";
  return "/client/orders";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "método" }, 405);
  let id = "";
  try {
    id = String((await req.json()).notification_id ?? "");
  } catch {
    return json({ error: "json" }, 400);
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "id" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  // trava atômica: só um envio por notificação
  const { data: n } = await admin
    .from("notifications")
    .update({ pushed_at: new Date().toISOString() })
    .eq("id", id)
    .is("pushed_at", null)
    .select("id, user_id, title, message, data")
    .maybeSingle();
  if (!n) return json({ skipped: "já enviada ou inexistente" });

  const { data: tokens } = await admin.from("device_tokens").select("id, token, platform").eq("user_id", n.user_id);
  if (!tokens?.length) return json({ sent: 0, motivo: "sem aparelhos" });

  const url = await destino(admin, n as never);
  const titulo = String(n.title ?? "Já Limpo").slice(0, 120);
  const texto = String(n.message ?? "").slice(0, 300);
  const resultados: Record<string, number> = {};
  const invalidos: string[] = [];

  await Promise.all(
    tokens.map(async (t: { id: string; token: string; platform: string }) => {
      let r = "erro";
      try {
        r = t.platform === "ios" ? await enviarApns(t.token, titulo, texto, url) : await enviarFcm(t.token, titulo, texto, url);
      } catch (e) {
        console.error("push falhou", t.platform, e);
      }
      resultados[r] = (resultados[r] ?? 0) + 1;
      if (r === "token_invalido") invalidos.push(t.id);
    }),
  );
  if (invalidos.length) await admin.from("device_tokens").delete().in("id", invalidos);

  await admin.from("notification_dispatch_logs").insert({
    user_id: n.user_id,
    title: titulo,
    message: texto,
    type: "push_nativo",
    channel: "push",
    status: resultados.ok ? "success" : "skipped",
    error: resultados.ok ? null : JSON.stringify(resultados),
    payload: { notification_id: n.id, resultados },
  });

  return json({ notification_id: n.id, resultados });
});
