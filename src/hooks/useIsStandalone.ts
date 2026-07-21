import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/platform";
import { getResponsiveViewportWidth } from "@/lib/platformDetect";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
  getInstalledRelatedApps?: () => Promise<Array<{ platform: string }>>;
};

/**
 * Sinal síncrono robusto: verdadeiro se o app está rodando AGORA como
 * PWA instalado. Combina múltiplos sinais para cobrir iOS Safari, iOS
 * Chrome, Android Chrome e a casca nativa Capacitor.
 */
export function detectInstalledNow(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) return true;
  const nav = window.navigator as NavigatorWithStandalone;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
    if (window.matchMedia("(display-mode: minimal-ui)").matches) return true;
  } catch {
    /* noop */
  }
  // iOS Safari / iOS Chrome / iOS Edge (todos usam WebKit e expõem esta flag
  // quando lançados a partir do ícone salvo na tela inicial).
  if (nav.standalone === true) return true;
  // Referrer android-app:// indica que o Chrome abriu o PWA como app.
  if (document.referrer.startsWith("android-app://")) return true;
  return false;
}

/**
 * Detecta se o app está rodando como PWA instalado (standalone).
 * Reavalia em display-mode change, visibilitychange e focus para pegar
 * o caso de o iOS restaurar a webview em standalone tardiamente.
 */
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState<boolean>(detectInstalledNow);

  useEffect(() => {
    if (isNativeApp()) return;
    const update = () => setIsStandalone(detectInstalledNow());

    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const mqFullscreen = window.matchMedia("(display-mode: fullscreen)");
    const mqMinimal = window.matchMedia("(display-mode: minimal-ui)");
    const onVis = () => {
      if (document.visibilityState === "visible") update();
    };

    mqStandalone.addEventListener?.("change", update);
    mqFullscreen.addEventListener?.("change", update);
    mqMinimal.addEventListener?.("change", update);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", update);
    window.addEventListener("pageshow", update);

    // Reavalia uma vez após montar (iOS às vezes reporta tarde).
    const t = window.setTimeout(update, 250);

    return () => {
      mqStandalone.removeEventListener?.("change", update);
      mqFullscreen.removeEventListener?.("change", update);
      mqMinimal.removeEventListener?.("change", update);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", update);
      window.removeEventListener("pageshow", update);
      window.clearTimeout(t);
    };
  }, []);

  return isStandalone;
}


/**
 * Retorna true se for um device mobile OU tablet (iOS/iPadOS/Android).
 * Detecta iPad moderno mesmo quando o UA reporta Macintosh (iPadOS >= 13).
 * Desktop continua tendo acesso normal pelo navegador.
 */
export function useIsMobileDevice() {
  const detect = () => {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent.toLowerCase();
    const width = getResponsiveViewportWidth();
    if (/iphone|ipad|ipod|android/.test(ua)) return true;
    // iPadOS 13+ reporta como "Macintosh". Detecta via maxTouchPoints.
    const nav = window.navigator as Navigator & { maxTouchPoints?: number };
    if (/macintosh/.test(ua) && (nav.maxTouchPoints ?? 0) > 1) return true;
    // Tablets Android/Windows com touch primário e viewport pequeno-médio.
    const isCoarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (isCoarse && width <= 1180) return true;
    // Preview responsivo: o User Agent continua desktop, mas a largura muda.
    if (width < 1024) return true;
    return false;
  };

  const [isMobile, setIsMobile] = useState<boolean>(detect);

  useEffect(() => {
    const update = () => setIsMobile(detect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    const mql = window.matchMedia("(max-width: 1023px)");
    mql.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      mql.removeEventListener?.("change", update);
    };
  }, []);

  return isMobile;
}


/**
 * True quando o app está rodando dentro de um iframe (preview Lovable).
 * Usado para nunca bloquear acesso na preview do editor.
 */
export function useIsInIframe() {
  const [inIframe, setInIframe] = useState<boolean>(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      setInIframe(window.self !== window.top);
    } catch {
      setInIframe(true);
    }
  }, []);
  return inIframe;
}
