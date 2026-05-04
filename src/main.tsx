import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const PREVIEW_CACHE_RESET_KEY = "jalimpo_preview_cache_reset_client_home_glass_v3";

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
  if (sessionStorage.getItem(PREVIEW_CACHE_RESET_KEY) === "done") return;

  sessionStorage.setItem(PREVIEW_CACHE_RESET_KEY, "done");

  const registrations = "serviceWorker" in navigator
    ? await navigator.serviceWorker.getRegistrations()
    : [];
  const cacheNames = "caches" in window ? await caches.keys() : [];

  await Promise.all([
    ...registrations.map((registration) => registration.unregister()),
    ...cacheNames.map((cacheName) => caches.delete(cacheName)),
  ]);

  if (registrations.length > 0 || cacheNames.length > 0) {
    window.location.reload();
  }
}

void resetPreviewCacheOnce();

createRoot(document.getElementById("root")!).render(<App />);
