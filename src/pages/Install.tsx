import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Download,
  Share,
  Plus,
  MoreVertical,
  Check,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "ios" | "android" | "desktop";

export default function Install() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setDevice("ios");
    else if (/android/.test(ua)) setDevice("android");
    else setDevice("desktop");

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const stepsByDevice: Record<DeviceType, { icon: typeof Share; text: string }[]> = {
    ios: [
      { icon: Share, text: "Toque no botão Compartilhar do Safari" },
      { icon: Plus, text: "Escolha \"Adicionar à Tela de Início\"" },
      { icon: Check, text: "Confirme em \"Adicionar\"" },
    ],
    android: [
      { icon: MoreVertical, text: "Abra o menu do navegador (⋮)" },
      { icon: Download, text: "Toque em \"Instalar app\"" },
      { icon: Check, text: "Confirme em \"Instalar\"" },
    ],
    desktop: [
      { icon: Download, text: "Clique no ícone de instalar na barra de endereço" },
      { icon: Check, text: "Confirme em \"Instalar\"" },
    ],
  };

  const deviceMeta: Record<DeviceType, { label: string; icon: typeof Smartphone }> = {
    ios: { label: "iPhone", icon: Smartphone },
    android: { label: "Android", icon: Smartphone },
    desktop: { label: "Desktop", icon: Monitor },
  };

  const steps = stepsByDevice[device];
  const DeviceIcon = deviceMeta[device].icon;

  if (isInstalled) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16 }}
          className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-primary" strokeWidth={2.2} />
        </motion.div>
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center tracking-tight">
          Tudo pronto
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm max-w-xs leading-relaxed">
          Abra o Já Limpo pelo ícone na sua tela inicial para continuar.
        </p>
        <button
          onClick={() => navigate("/onboarding")}
          className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm shadow-primary/20 active:scale-95 transition-transform"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="shrink-0 px-5 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-card border border-border/60 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-md mx-auto px-5 pb-8 space-y-6">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center pt-4 space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Instale em segundos
            </div>
            <h1 className="text-[26px] font-semibold text-foreground leading-tight tracking-tight">
              Já Limpo na sua<br />tela inicial
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              Rápido, direto e sempre à mão. Sem baixar da loja.
            </p>
          </motion.section>

          {/* Quick install (Android/Chrome) */}
          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleInstall}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm
                flex items-center justify-center gap-2 shadow-sm shadow-primary/25 active:scale-[0.98] transition-transform"
            >
              <Download className="w-4 h-4" />
              Instalar agora
            </motion.button>
          )}

          {/* Device switch */}
          <section>
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-2xl">
              {(Object.keys(deviceMeta) as DeviceType[]).map((d) => {
                const active = device === d;
                const Icon = deviceMeta[d].icon;
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`relative flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {deviceMeta[d].label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Steps */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <DeviceIcon className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Como instalar no {deviceMeta[device].label}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.ol
                key={device}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {steps.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                        {i + 1}
                      </div>
                      <StepIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-foreground leading-snug flex-1">
                        {step.text}
                      </p>
                    </li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>
          </section>

          <p className="text-center text-xs text-muted-foreground pt-1 pb-[env(safe-area-inset-bottom,0px)]">
            Já instalou? Abra pelo ícone na tela inicial.
          </p>
        </div>
      </main>
    </div>
  );
}
