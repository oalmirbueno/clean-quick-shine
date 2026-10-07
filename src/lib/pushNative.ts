import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/platform";

/**
 * Push nativo (FCM no Android, APNs no iPhone). O token do aparelho vai para
 * `device_tokens`; quem envia é a função push-dispatch, disparada pelo banco a
 * cada notificação nova.
 *
 * No Android o register() derruba o app se o Firebase não estiver configurado
 * (google-services.json ausente). Por isso ele só roda quando o build foi feito
 * com VITE_NATIVE_PUSH=1 — o Codemagic liga a flag junto com o arquivo.
 */
const PUSH_HABILITADO = import.meta.env.VITE_NATIVE_PUSH === "1";

const CHAVE_TOKEN = "jalimpo_push_token";

let registrado = false;
let usuarioAtual: string | null = null;
let ouvintes = false;

export async function registerNativePush(userId: string, onOpen?: (path: string) => void) {
  if (!isNativeApp() || !PUSH_HABILITADO) return;
  usuarioAtual = userId;
  if (registrado) return;
  registrado = true;
  const plataforma = Capacitor.getPlatform();

  try {
    if (!ouvintes) {
      ouvintes = true;
      await PushNotifications.addListener("registration", async ({ value }) => {
        try {
          localStorage.setItem(CHAVE_TOKEN, value);
        } catch {
          /* noop */
        }
        if (!usuarioAtual) return;
        const { error } = await supabase.rpc("reivindicar_device_token" as never, { p_token: value, p_platform: plataforma } as never);
        if (error) console.warn("[push] token não salvo", error.message);
      });
      await PushNotifications.addListener("registrationError", (e) => console.warn("[push] registro falhou", e));
      await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
        const url = (notification.data as { url?: string } | undefined)?.url;
        if (url && url.startsWith("/")) onOpen?.(url);
      });
    }

    if (plataforma === "android") {
      await PushNotifications.createChannel({ id: "pedidos", name: "Pedidos e atendimento", importance: 5, visibility: 1, sound: "default", vibration: true });
    }

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") return;
    await PushNotifications.register();
  } catch (e) {
    registrado = false;
    console.warn("[push] indisponível", e);
  }
}

/** Ao sair da conta: o aparelho deixa de receber push daquele usuário. */
export async function unregisterNativePush() {
  if (!isNativeApp() || !PUSH_HABILITADO) return;
  try {
    const token = localStorage.getItem(CHAVE_TOKEN);
    if (token) await supabase.from("device_tokens" as never).delete().eq("token", token);
    localStorage.removeItem(CHAVE_TOKEN);
    await PushNotifications.unregister();
  } catch {
    /* noop */
  }
  registrado = false;
  usuarioAtual = null;
}
