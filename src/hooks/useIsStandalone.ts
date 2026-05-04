import { useEffect, useState } from "react";

/**
 * Detecta se o app está rodando como PWA instalado (standalone).
 * Inclui detecção iOS (navigator.standalone) e modo display-mode.
 */
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      if (window.matchMedia("(display-mode: standalone)").matches) return true;
      if ((window.navigator as any).standalone === true) return true;
    } catch {
      /* noop */
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return isStandalone;
}

/**
 * Retorna true se for um device mobile (iOS/Android) por user-agent.
 * Desktop continua tendo acesso normal pelo navegador.
 */
export function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod|android/.test(ua);
  });

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsMobile(/iphone|ipad|ipod|android/.test(ua));
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
