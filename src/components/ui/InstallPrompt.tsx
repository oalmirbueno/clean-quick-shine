import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share, Plus, ExternalLink } from "lucide-react";
import { Logo } from "./Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (24h cooldown)
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  const handleViewInstructions = () => {
    setShowPrompt(false);
    navigate("/install");
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-border"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-8">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Logo size="sm" iconOnly />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Instalar App</h2>
                <p className="text-sm text-muted-foreground">Acesso rápido na sua tela inicial</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {isIOS ? (
              // iOS Instructions
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para instalar no seu iPhone ou iPad:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Share className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">1. Toque em Compartilhar</p>
                      <p className="text-xs text-muted-foreground">No menu do Safari</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">2. Adicionar à Tela de Início</p>
                      <p className="text-xs text-muted-foreground">Role e selecione esta opção</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Android/Chrome Instructions
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <Smartphone className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Acesso instantâneo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Instale o app para ter acesso rápido direto da sua tela inicial.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium
                  hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar Agora
              </button>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground font-medium
                  hover:bg-muted/50 transition-colors"
              >
                Depois
              </button>
              <button
                onClick={handleViewInstructions}
                className="flex-1 py-3 px-4 rounded-xl bg-muted text-foreground font-medium
                  hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver instruções
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
