import { useRegisterSW } from "@/hooks/useRegisterSW";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "jalimpo_update_dismissed";
const DISMISS_VERSION_KEY = "jalimpo_update_dismissed_version";

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker, swVersion } = useRegisterSW();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!needRefresh) return;

    // Check if this specific update was already dismissed
    const dismissedVersion = localStorage.getItem(DISMISS_VERSION_KEY);
    if (dismissedVersion === swVersion) return;

    setVisible(true);
  }, [needRefresh, swVersion]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    localStorage.setItem(DISMISS_VERSION_KEY, swVersion);
  };

  const handleUpdate = () => {
    setVisible(false);
    updateServiceWorker();
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
            <Button size="sm" onClick={handleUpdate} className="text-xs rounded-xl">
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
