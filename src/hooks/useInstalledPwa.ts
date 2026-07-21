import { useEffect, useState } from "react";
import { checkDeviceInstalled, markDeviceInstalled } from "@/lib/pwaDeviceTrack";

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
  void markDeviceInstalled();
}

/**
 * Detecta se o PWA já está instalado neste dispositivo.
 * Sinais (em ordem de confiança):
 *  1. Flag local salva em execução anterior standalone (mesmo contexto)
 *  2. navigator.getInstalledRelatedApps (Android/Chromium)
 *  3. Fingerprint remoto (bridge para iOS Safari e cross-context)
 *  4. Evento `appinstalled` desta sessão
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

    const persistInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_FLAG, "1");
      } catch {
        /* noop */
      }
      if (!cancelled) setInstalled(true);
    };

    const checkRelated = () => {
      if (typeof nav.getInstalledRelatedApps !== "function") return;
      nav
        .getInstalledRelatedApps()
        .then((apps) => {
          if (cancelled) return;
          if (apps && apps.length > 0) persistInstalled();
        })
        .catch(() => {
          /* ignore */
        });
    };

    const checkRemote = () => {
      checkDeviceInstalled().then((yes) => {
        if (cancelled) return;
        if (yes) persistInstalled();
      });
    };

    // Fire both checks on mount and on refocus.
    checkRelated();
    checkRemote();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkRelated();
        checkRemote();
      }
    };
    const onInstalled = () => {
      persistInstalled();
      void markDeviceInstalled();
    };
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", checkRelated);

    return () => {
      cancelled = true;
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", checkRelated);
    };
  }, []);

  return installed;
}

