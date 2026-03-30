import { useRegisterSW } from "@/hooks/useRegisterSW";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "jalimpo_update_dismissed";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [dismissed, setDismissed] = useState(true); // start hidden

  useEffect(() => {
    if (!needRefresh) return;
    const lastDismissed = localStorage.getItem(DISMISS_KEY);
    if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < COOLDOWN_MS) {
      return;
    }
    setDismissed(false);
  }, [needRefresh]);

  if (!needRefresh || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Nova versão disponível</p>
            <p className="text-xs text-muted-foreground">Atualize para a versão mais recente</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => updateServiceWorker()} className="text-xs rounded-xl">
              Atualizar
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
