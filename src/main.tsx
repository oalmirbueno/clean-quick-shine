import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function Root() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash when opened as PWA (standalone mode)
    return window.matchMedia("(display-mode: standalone)").matches || 
           (window.navigator as any).standalone === true;
  });

  useEffect(() => {
    if (showSplash) {
      // Hide splash after animation
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Remove HTML splash screen once React is ready
  useEffect(() => {
    const htmlSplash = document.getElementById('splash-screen');
    if (htmlSplash) {
      htmlSplash.classList.add('hidden');
      setTimeout(() => htmlSplash.remove(), 500);
    }
  }, []);

  return <App showSplash={showSplash} onSplashComplete={() => setShowSplash(false)} />;
}

createRoot(document.getElementById("root")!).render(<Root />);
