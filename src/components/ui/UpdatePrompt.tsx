import { useRegisterSW } from "@/hooks/useRegisterSW";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [dismissed, setDismissed] = useState(false);

  if (!needRefresh || dismissed) {
    return null;
  }

  const handleUpdate = async () => {
    await updateServiceWorker();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Nova versão disponível
            </p>
            <p className="text-xs text-muted-foreground">
              Atualize para a versão mais recente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="text-xs"
            >
              Atualizar
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
