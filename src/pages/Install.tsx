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
  ChevronRight,
  Sparkles,
  Zap,
  WifiOff,
  Bell,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "ios" | "android" | "desktop" | "auto";

const deviceTabs = [
  { id: "auto" as DeviceType, label: "Detectar", icon: Sparkles },
  { id: "ios" as DeviceType, label: "iPhone", icon: Smartphone },
  { id: "android" as DeviceType, label: "Android", icon: Smartphone },
  { id: "desktop" as DeviceType, label: "Desktop", icon: Monitor },
];

const benefits = [
  { icon: Zap, title: "Acesso rápido", description: "Direto da tela inicial" },
  { icon: WifiOff, title: "Funciona offline", description: "Sem precisar de internet" },
  { icon: Bell, title: "Notificações", description: "Alertas em tempo real" },
];

export default function Install() {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("auto");
  const [detectedDevice, setDetectedDevice] = useState<DeviceType>("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) setDetectedDevice("ios");
    else if (/android/.test(userAgent)) setDetectedDevice("android");
    else setDetectedDevice("desktop");

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

  const activeDevice = selectedDevice === "auto" ? detectedDevice : selectedDevice;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const iosSteps = [
    { icon: Share, title: "Toque em Compartilhar", description: "Use o ícone de compartilhar do Safari." },
    { icon: Plus, title: "Adicionar à Tela de Início", description: "Role e selecione a opção." },
    { icon: Check, title: "Confirme", description: "Toque em 'Adicionar' no canto superior." },
  ];
  const androidSteps = [
    { icon: MoreVertical, title: "Menu do navegador", description: "Toque nos três pontos no topo." },
    { icon: Download, title: "Instalar aplicativo", description: "Selecione 'Instalar app' ou 'Adicionar à tela'." },
    { icon: Check, title: "Confirme", description: "Toque em 'Instalar'." },
  ];
  const desktopSteps = [
    { icon: Download, title: "Ícone de instalação", description: "Clique no ícone na barra de endereços." },
    { icon: Check, title: "Confirme", description: "Clique em 'Instalar' na janela." },
  ];

  const steps =
    activeDevice === "ios" ? iosSteps : activeDevice === "android" ? androidSteps : desktopSteps;

  if (isInstalled) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5"
        >
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">App instalado</h1>
        <p className="text-muted-foreground text-center mb-7 text-sm">
          O Já Limpo está pronto na sua tela inicial. Abra pelo ícone do app para fazer login.
        </p>
        <button
          onClick={() => navigate("/onboarding")}
          className="px-7 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          Continuar
        </button>
      </div>
    );
  }

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="shrink-0 px-5 pt-3 pb-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Logo size="sm" />
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-md mx-auto px-5 pb-6 space-y-5">
          {/* Hero */}
          <section className="text-center space-y-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Download className="w-3.5 h-3.5" />
              Instale o app
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Baixe o Já Limpo
            </h1>
            <p className="text-sm text-muted-foreground leading-snug">
              Para usar o app é preciso instalar primeiro. Depois faça login pelo ícone na tela inicial.
            </p>
          </section>

          {/* Quick install */}
          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleInstall}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm
                flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
            >
              <Download className="w-4 h-4" />
              Instalar agora
            </motion.button>
          )}

          {/* Benefits */}
          <section className="grid grid-cols-3 gap-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="text-center p-3 rounded-2xl bg-card border border-border/60 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <b.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-[11px] leading-tight">{b.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {b.description}
                </p>
              </div>
            ))}
          </section>

          {/* Device tabs */}
          <section className="space-y-3">
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
              {deviceTabs.map((tab) => {
                const active = selectedDevice === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedDevice(tab.id);
                      setCurrentStep(0);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Steps */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Passo a passo</h2>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="bg-card rounded-2xl border border-border/60 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <StepIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold leading-tight">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1 py-2.5 rounded-xl border border-border/60 text-muted-foreground text-xs font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          <p className="text-center text-xs text-muted-foreground pt-2 pb-[env(safe-area-inset-bottom,0px)]">
            Já instalou? Abra pelo ícone do app na tela inicial.
          </p>
        </div>
      </main>
    </div>
  );
}
