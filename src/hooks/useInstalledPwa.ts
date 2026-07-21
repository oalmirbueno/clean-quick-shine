import { useEffect, useState } from "react";

const INSTALLED_FLAG = "jl_pwa_installed";

/**
 * Marca localmente que este dispositivo já rodou o app em modo standalone.
 * Deve ser chamado uma vez quando o app abre como PWA instalado.
 */
export function markPwaInstalled() {
  try {
    localStorage.setItem(INSTALLED_FLAG, "1");
  } catch {
    /* noop */
  }
}

/**
 * Detecta se o PWA já está instalado neste dispositivo.
 * Combina três sinais:
 *  1. Flag local salva em execução anterior standalone (funciona em iOS/Android)
 *  2. navigator.getInstalledRelatedApps (Android/Chromium)
 *  3. Heurística: appinstalled event já disparado nesta sessão
 */
export function useInstalledPwa(): boolean {
  const [installed, setInstalled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INSTALLED_FLAG) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let cancelled = false;

    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<{ platform: string; url?: string; id?: string }>>;
    };

    const check = () => {
      if (typeof nav.getInstalledRelatedApps !== "function") return;
      nav
        .getInstalledRelatedApps()
        .then((apps) => {
          if (cancelled) return;
          if (apps && apps.length > 0) {
            markPwaInstalled();
            setInstalled(true);
          }
        })
        .catch(() => {
          /* ignore */
        });
    };

    check();

    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    const onInstalled = () => {
      markPwaInstalled();
      setInstalled(true);
    };
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", check);

    return () => {
      cancelled = true;
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", check);
    };
  }, []);

  return installed;
}
