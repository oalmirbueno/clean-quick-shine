import { useState, useEffect, useCallback } from "react";

interface UseRegisterSWReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  swVersion: string;
}

function isPreviewOrIframe(): boolean {
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

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
  const [swVersion, setSwVersion] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (isPreviewOrIframe()) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        setRegistration(reg);

        // Check for updates every 4 hours
        intervalId = setInterval(() => {
          reg.update();
        }, 4 * 60 * 60 * 1000);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Generate a version identifier from the timestamp
                const version = Date.now().toString();
                setSwVersion(version);
                setNeedRefresh(true);
              }
            });
          }
        });

        if (reg.waiting) {
          const version = Date.now().toString();
          setSwVersion(version);
          setNeedRefresh(true);
        }

        navigator.serviceWorker.ready.then(() => {
          setOfflineReady(true);
        });
      } catch (error) {
        console.error("SW registration failed:", error);
      }
    };

    registerSW();

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return { needRefresh, offlineReady, updateServiceWorker, swVersion };
}
