import { useState, useEffect, useCallback } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: PermissionState;
  isSubscribed: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (!supported) {
        setPermission("unsupported");
        return;
      }

      // Get current permission state
      setPermission(Notification.permission as PermissionState);

      // Get service worker registration
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        // Check if already subscribed
        const subscription = await (reg as any).pushManager?.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking push subscription:", error);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!registration || permission !== "granted") {
      return null;
    }

    try {
      // In production, you'd use your VAPID public key here
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setIsSubscribed(true);

      // In production, send subscription to your backend
      console.log("Push subscription:", JSON.stringify(subscription));

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return null;
    }
  }, [registration, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) {
      return false;
    }

    try {
      const subscription = await (registration as any).pushManager?.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      return false;
    }
  }, [registration]);

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// Helper function for VAPID key conversion (for future use)
// function urlBase64ToUint8Array(base64String: string): Uint8Array {
//   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);
//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }
