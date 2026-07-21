import { useState, useEffect, useCallback } from "react";
import { isNativeApp } from "@/lib/platform";

const SW_URL = "/sw.js";
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

interface UseRegisterSWReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  swVersion: string;
}

function shouldSkipServiceWorker(): boolean {
  if (!import.meta.env.PROD) return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;

  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }

  return false;
}

async function cleanupAppServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        const scopePath = new URL(registration.scope).pathname;
        const scriptURL = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";
        return scopePath === "/" || scriptURL.endsWith(SW_URL);
      })
      .map((registration) => registration.unregister())
  );
}

export function useRegisterSW(): UseRegisterSWReturn {
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Na casca nativa os assets são servidos localmente pelo Capacitor;
    // service worker só atrapalharia (cache duplo, prompt de update falso).
    if (isNativeApp()) return;
    if (!("serviceWorker" in navigator)) return;

    if (shouldSkipServiceWorker()) {
      void cleanupAppServiceWorker();
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;
    let hasReloadedForUpdate = false;

    const activateWaitingWorker = (worker?: ServiceWorker | null) => {
      if (!worker) return;
      worker.postMessage({ type: "SKIP_WAITING" });
    };

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register(SW_URL, { scope: "/" });
        setRegistration(reg);

        const checkForUpdate = () => {
          if (document.visibilityState === "hidden") return;
          void reg.update();
        };

        // Ao abrir/reabrir o PWA, força a checagem da versão publicada.
        checkForUpdate();

        if (reg.waiting && navigator.serviceWorker.controller) {
          activateWaitingWorker(reg.waiting);
        }

        intervalId = setInterval(checkForUpdate, CHECK_INTERVAL_MS);

        window.addEventListener("focus", checkForUpdate);
        window.addEventListener("pageshow", checkForUpdate);
        window.addEventListener("online", checkForUpdate);
        document.addEventListener("visibilitychange", checkForUpdate);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                activateWaitingWorker(newWorker);
              }
            });
          }
        });

        navigator.serviceWorker.ready.then(() => {
          setOfflineReady(true);
        });

        return () => {
          window.removeEventListener("focus", checkForUpdate);
          window.removeEventListener("pageshow", checkForUpdate);
          window.removeEventListener("online", checkForUpdate);
          document.removeEventListener("visibilitychange", checkForUpdate);
        };
      } catch (error) {
        console.error("SW registration failed:", error);
      }
    };

    let removeUpdateListeners: (() => void) | undefined;
    void registerSW().then((cleanup) => {
      removeUpdateListeners = cleanup;
    });

    const handleControllerChange = () => {
      if (hasReloadedForUpdate) return;
      hasReloadedForUpdate = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      removeUpdateListeners?.();
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return { needRefresh: false, offlineReady, updateServiceWorker, swVersion: "" };
}
