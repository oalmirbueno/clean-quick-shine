import { useState, useEffect, useCallback } from "react";

interface UseRegisterSWReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
}

function isPreviewOrIframe(): boolean {
  // Never register SW inside iframes (Lovable editor preview)
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  // Never register on Lovable preview hosts
  const host = window.location.hostname;
  if (host.includes("id-preview--") || host.includes("lovableproject.com")) {
    return true;
  }

  return false;
}

export function useRegisterSW(): UseRegisterSWReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (isPreviewOrIframe()) {
      // Unregister any stale SW in preview
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        setRegistration(reg);

        // Check for updates every 4 hours (not every hour)
        const intervalId = setInterval(() => {
          reg.update();
        }, 4 * 60 * 60 * 1000);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            });
          }
        });

        if (reg.waiting) {
          setNeedRefresh(true);
        }

        navigator.serviceWorker.ready.then(() => {
          setOfflineReady(true);
        });

        return () => clearInterval(intervalId);
      } catch (error) {
        console.error("SW registration failed:", error);
      }
    };

    registerSW();

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return { needRefresh, offlineReady, updateServiceWorker };
}
