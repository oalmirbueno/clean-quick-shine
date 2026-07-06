import { Capacitor } from "@capacitor/core";

/**
 * True quando o app roda dentro da casca nativa Capacitor (Android/iOS).
 * No navegador/PWA retorna false — todo o comportamento web permanece igual.
 */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Origin público do produto para links que saem do app (e-mails de auth,
 * compartilhamento, deep links). Na casca nativa `window.location.origin`
 * é `https://localhost` / `capacitor://localhost` — inútil fora do device —
 * então usamos o domínio real.
 */
export const PUBLIC_ORIGIN = "https://jalimpo.com";

export function getPublicOrigin(): string {
  if (isNativeApp()) return PUBLIC_ORIGIN;
  try {
    return window.location.origin;
  } catch {
    return PUBLIC_ORIGIN;
  }
}
