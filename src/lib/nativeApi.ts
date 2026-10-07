import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Geolocation } from "@capacitor/geolocation";
import { getPublicOrigin, isNativeApp } from "@/lib/platform";

/**
 * Abre um link fora do app. Na casca nativa usa o navegador interno
 * (SFSafariViewController / Custom Tabs) — window.open com _blank não
 * funciona de forma confiável no WKWebView. Na web segue com window.open.
 */
export async function openExternal(url: string) {
  if (!url) return;
  if (isNativeApp() && /^https?:\/\//i.test(url)) {
    await Browser.open({ url, presentationStyle: "popover" });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Abre uma página do próprio site (termos, privacidade) sem perder o estado da tela atual. */
export async function openSitePage(path: string) {
  if (isNativeApp()) {
    await Browser.open({ url: `${getPublicOrigin()}${path}`, presentationStyle: "popover" });
    return;
  }
  window.open(path, "_blank", "noopener,noreferrer");
}

type Pos = { lat: number; lng: number; accuracy?: number; heading?: number | null; speed?: number | null };
type GeoOpts = { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number };

/**
 * Localização com o diálogo de permissão do sistema na casca nativa (o
 * navigator.geolocation do WKWebView mostra um segundo aviso "localhost
 * deseja usar sua localização", que a revisão da Apple costuma apontar).
 */
export async function getPosition(opts: GeoOpts = {}): Promise<Pos> {
  if (isNativeApp()) {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== "granted") {
      const req = await Geolocation.requestPermissions({ permissions: ["location"] });
      if (req.location !== "granted") throw new Error("Permissão de localização negada");
    }
    const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: opts.enableHighAccuracy ?? true, timeout: opts.timeout ?? 15000, maximumAge: opts.maximumAge ?? 0 });
    return { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, heading: p.coords.heading, speed: p.coords.speed };
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocalização indisponível"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, heading: p.coords.heading, speed: p.coords.speed }),
      reject,
      opts,
    );
  });
}

/** Acompanha a posição; devolve a função que para o acompanhamento. */
export function watchPosition(onPos: (p: Pos) => void, onErr?: (e: unknown) => void, opts: GeoOpts = {}): () => void {
  if (isNativeApp()) {
    let id: string | null = null;
    let stopped = false;
    Geolocation.watchPosition({ enableHighAccuracy: opts.enableHighAccuracy ?? true, timeout: opts.timeout ?? 20000, maximumAge: opts.maximumAge ?? 0 }, (p, err) => {
      if (err) return onErr?.(err);
      if (p) onPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, heading: p.coords.heading, speed: p.coords.speed });
    })
      .then((wid) => {
        id = wid;
        if (stopped) Geolocation.clearWatch({ id: wid });
      })
      .catch((e) => onErr?.(e));
    return () => {
      stopped = true;
      if (id) Geolocation.clearWatch({ id });
    };
  }
  if (!navigator.geolocation) {
    onErr?.(new Error("Geolocalização indisponível"));
    return () => {};
  }
  const wid = navigator.geolocation.watchPosition(
    (p) => onPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, heading: p.coords.heading, speed: p.coords.speed }),
    (e) => onErr?.(e),
    opts,
  );
  return () => navigator.geolocation.clearWatch(wid);
}

export const nativePlatform = () => (isNativeApp() ? Capacitor.getPlatform() : "web");
