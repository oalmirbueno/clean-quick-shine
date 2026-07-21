import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativeApp } from "@/lib/platform";

const PREVIEW_CACHE_RESET_KEY = "jalimpo_preview_cache_reset_v3_identity_v5";
const PWA_CACHE_RESET_KEY = "jalimpo_pwa_cache_reset_v3_ios_bottom_nav_v1";

function isLovablePreview() {
  try {
    return (
      window.self !== window.top ||
      window.location.hostname.includes("id-preview--") ||
      window.location.hostname.includes("lovableproject.com")
    );
  } catch {
    return true;
  }
}

async function resetPreviewCacheOnce() {
  if (!isLovablePreview()) return;
  const cleanupMarker = sessionStorage.getItem(PREVIEW_CACHE_RESET_KEY);

  if (cleanupMarker === "done") return;
  sessionStorage.setItem(PREVIEW_CACHE_RESET_KEY, "running");

  const registrations = "serviceWorker" in navigator
    ? await navigator.serviceWorker.getRegistrations()
    : [];
  const cacheNames = "caches" in window ? await caches.keys() : [];

  await Promise.all([
    ...registrations.map((registration) => registration.unregister()),
    ...cacheNames.map((cacheName) => caches.delete(cacheName)),
  ]);

  sessionStorage.setItem(PREVIEW_CACHE_RESET_KEY, "done");
  window.location.replace(window.location.href);
}

async function resetInstalledPwaCacheOnce() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (!isStandalone || isLovablePreview()) return;
  if (localStorage.getItem(PWA_CACHE_RESET_KEY) === "done") return;

  localStorage.setItem(PWA_CACHE_RESET_KEY, "done");

  const registrations = "serviceWorker" in navigator
    ? await navigator.serviceWorker.getRegistrations()
    : [];
  const cacheNames = "caches" in window ? await caches.keys() : [];

  await Promise.all([
    ...registrations.map((registration) => registration.update()),
    ...cacheNames.map((cacheName) => caches.delete(cacheName)),
  ]);

  window.location.reload();
}

// Rotinas de limpeza de cache são exclusivas do PWA/preview web;
// na casca nativa não há service worker e o reload viraria loop.
if (!isNativeApp()) {
  void resetPreviewCacheOnce();
  void resetInstalledPwaCacheOnce();
}

createRoot(document.getElementById("root")!).render(<App />);
