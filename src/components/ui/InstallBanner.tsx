import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "jalimpo_install_banner_dismissed";
const COOLDOWN_DAYS = 7;

export function InstallBanner() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Never show in standalone/PWA mode
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone === true) return;

    // Never show in iframe (Lovable preview)
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    // Check cooldown
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const elapsed = Date.now() - parseInt(dismissed, 10);
      if (elapsed < COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Show after short delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 safe-top"
        >
          <div className="mx-3 mt-3 bg-card border border-border rounded-2xl shadow-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Instale o Já Limpo
              </p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                Use como app no celular
              </p>
            </div>
            <button
              onClick={() => { handleDismiss(); navigate("/install"); }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shrink-0"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
