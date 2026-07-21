/**
 * Cross-context PWA installation detection.
 *
 * iOS Safari does not expose an API to detect if a PWA is installed
 * (installed PWA has isolated storage). To bridge this, we compute a
 * device fingerprint from stable properties and store it server-side
 * whenever the app opens in standalone mode. When the browser later
 * visits /install, we query the same fingerprint to detect installation.
 *
 * Accuracy: ~90-95%. Rare false positives possible between identical
 * devices behind the same NAT with same locale/screen — acceptable
 * tradeoff for the UX gain.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const FN_URL = `${SUPABASE_URL}/functions/v1/pwa-device-track`;
const LOCAL_CHECK_CACHE = "jl_pwa_remote_installed";
const LOCAL_CHECK_TS = "jl_pwa_remote_installed_ts";

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let fingerprintPromise: Promise<string> | null = null;

export function computeDeviceFingerprint(): Promise<string> {
  if (fingerprintPromise) return fingerprintPromise;
  fingerprintPromise = (async () => {
    const parts = [
      navigator.userAgent,
      navigator.platform ?? "",
      navigator.language ?? "",
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
      String(window.devicePixelRatio ?? 1),
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
      String((navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 0),
    ];
    return sha256(parts.join("|"));
  })();
  return fingerprintPromise;
}

async function callFn(action: "mark" | "check", extra?: Record<string, unknown>) {
  const fingerprint = await computeDeviceFingerprint();
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, fingerprint, ...(extra ?? {}) }),
  });
  if (!res.ok) throw new Error(`pwa-device-track ${action} failed: ${res.status}`);
  return res.json();
}

/** Called from main.tsx when the app boots in standalone mode. */
export async function markDeviceInstalled(meta?: Record<string, unknown>) {
  try {
    await callFn("mark", { meta });
    try {
      localStorage.setItem(LOCAL_CHECK_CACHE, "1");
      localStorage.setItem(LOCAL_CHECK_TS, String(Date.now()));
    } catch {
      /* noop */
    }
  } catch {
    /* silently ignore — best effort */
  }
}

/** Called from the install page (browser context) to detect prior install. */
export async function checkDeviceInstalled(): Promise<boolean> {
  try {
    const data = await callFn("check");
    return !!data?.installed;
  } catch {
    return false;
  }
}
