import { useState, useEffect, useCallback } from "react";

interface UseRegisterSWReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
}

export function useRegisterSW(): UseRegisterSWReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        setRegistration(reg);

        // Check for updates periodically
        const intervalId = setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // Check every hour

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

        // Initial check
        if (reg.waiting) {
          setNeedRefresh(true);
        }

        // Service worker is ready
        navigator.serviceWorker.ready.then(() => {
          setOfflineReady(true);
        });

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error("SW registration failed:", error);
      }
    };

    registerSW();

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if (!registration?.waiting) {
      return;
    }

    // Tell waiting SW to skip waiting and become active
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  };
}
