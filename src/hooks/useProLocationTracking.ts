import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks the pro's GPS location and pushes it to `pro_locations` every 30s
 * while an order is active (en_route or in_progress). Also keeps the legacy
 * `pro_profiles.current_lat/lng` updated for backward compatibility.
 *
 * Uses high-accuracy geolocation similar to Uber/iFood driver apps.
 */
export function useProLocationTracking(params: {
  enabled: boolean;
  userId: string | null | undefined;
  orderId?: string | null;
}) {
  const { enabled, userId, orderId } = params;
  const lastSentRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPositionRef = useRef<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("[GPS] Geolocation not supported");
      return;
    }

    const persist = async () => {
      const pos = latestPositionRef.current;
      if (!pos) return;
      const now = Date.now();
      if (now - lastSentRef.current < 25_000) return; // safety throttle
      lastSentRef.current = now;

      const { latitude, longitude, accuracy, heading, speed } = pos.coords;

      // Insert tracking sample (visible to client in realtime)
      const { error: insertErr } = await supabase.from("pro_locations").insert({
        user_id: userId,
        order_id: orderId ?? null,
        lat: latitude,
        lng: longitude,
        accuracy: accuracy ?? null,
        heading: Number.isFinite(heading) ? heading : null,
        speed: Number.isFinite(speed) ? speed : null,
      });
      if (insertErr) console.warn("[GPS] insert error", insertErr.message);

      // Keep last-known location on profile for matching
      await supabase
        .from("pro_profiles")
        .update({ current_lat: latitude, current_lng: longitude })
        .eq("user_id", userId);
    };

    // Continuous watch for accuracy; we only persist every 30s.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestPositionRef.current = pos;
      },
      (err) => console.warn("[GPS] watch error", err.message),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 }
    );

    // Also request a fast first fix.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latestPositionRef.current = pos;
        persist();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15_000 }
    );

    intervalRef.current = setInterval(persist, 30_000);

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      watchIdRef.current = null;
      intervalRef.current = null;
    };
  }, [enabled, userId, orderId]);
}
