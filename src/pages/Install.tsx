import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smartphone, 
  Monitor, 
  Download, 
  Share, 
  Plus, 
  MoreVertical,
  Menu,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Wifi,
  WifiOff,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function StyledLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const textSize = size === "sm" ? "text-xl" : "text-3xl";
  return (
    <span className={`${textSize} font-bold tracking-tight`}>
      <span className="text-primary">Já</span>
      <span className="text-foreground ml-1">Limpo</span>
    </span>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "ios" | "android" | "desktop" | "auto";

const deviceTabs = [
  { id: "auto" as DeviceType, label: "Detectar", icon: Sparkles },
  { id: "ios" as DeviceType, label: "iPhone/iPad", icon: Smartphone },
  { id: "android" as DeviceType, label: "Android", icon: Smartphone },
  { id: "desktop" as DeviceType, label: "Computador", icon: Monitor },
];

const benefits = [
  { icon: Zap, title: "Acesso Rápido", description: "Abra direto da tela inicial" },
  { icon: WifiOff, title: "Funciona Offline", description: "Use mesmo sem internet" },
  { icon: Bell, title: "Notificações", description: "Receba alertas importantes" },
];

export default function Install() {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("auto");
  const [detectedDevice, setDetectedDevice] = useState<DeviceType>("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDetectedDevice("ios");
    } else if (/android/.test(userAgent)) {
      setDetectedDevice("android");
    } else {
      setDetectedDevice("desktop");
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const activeDevice = selectedDevice === "auto" ? detectedDevice : selectedDevice;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const iosSteps = [
    {
      icon: Share,
      title: "Abra o menu Compartilhar",
      description: "Toque no ícone de compartilhar na barra inferior do Safari",
      visual: (
        <div className="relative w-full h-32 bg-muted/30 rounded-xl flex items-end justify-center pb-4">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-lg bg-muted/50" />
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center"
            >
              <Share className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="w-10 h-10 rounded-lg bg-muted/50" />
          </div>
        </div>
      )
    },
    {
      icon: Plus,
      title: "Adicionar à Tela de Início",
      description: "Role para baixo e toque em 'Adicionar à Tela de Início'",
      visual: (
        <div className="w-full bg-muted/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Copiar</span>
          </div>
          <motion.div 
            animate={{ backgroundColor: ["hsl(var(--muted) / 0.5)", "hsl(var(--primary) / 0.2)", "hsl(var(--muted) / 0.5)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-3 p-3 rounded-lg border border-primary/50"
          >
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Adicionar à Tela de Início</span>
          </motion.div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Favoritos</span>
          </div>
        </div>
      )
    },
    {
      icon: Check,
      title: "Confirme a instalação",
      description: "Toque em 'Adicionar' no canto superior direito",
      visual: (
        <div className="w-full bg-muted/30 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-sm text-muted-foreground">Cancelar</span>
            <span className="text-sm font-medium">Adicionar à Tela</span>
            <motion.span 
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-sm font-medium text-primary"
            >
              Adicionar
            </motion.span>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
              <StyledLogo size="sm" />
            </div>
            <span className="font-medium">Já Limpo</span>
          </div>
        </div>
      )
    }
  ];

  const androidSteps = [
    {
      icon: MoreVertical,
      title: "Abra o menu do navegador",
      description: "Toque nos três pontos no canto superior direito",
      visual: (
        <div className="w-full h-32 bg-muted/30 rounded-xl relative">
          <div className="absolute top-4 right-4">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5 text-primary" />
            </motion.div>
          </div>
          <div className="absolute top-4 left-4 w-24 h-3 rounded bg-muted/50" />
        </div>
      )
    },
    {
      icon: Download,
      title: "Instalar aplicativo",
      description: "Selecione 'Instalar aplicativo' ou 'Adicionar à tela inicial'",
      visual: (
        <div className="w-full bg-muted/30 rounded-xl p-2 space-y-1">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-6 h-6 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Nova guia</span>
          </div>
          <motion.div 
            animate={{ backgroundColor: ["hsl(var(--muted) / 0.5)", "hsl(var(--primary) / 0.2)", "hsl(var(--muted) / 0.5)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-3 p-3 rounded-lg border border-primary/50"
          >
            <Download className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Instalar aplicativo</span>
          </motion.div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-6 h-6 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Configurações</span>
          </div>
        </div>
      )
    },
    {
      icon: Check,
      title: "Confirme a instalação",
      description: "Toque em 'Instalar' na janela de confirmação",
      visual: (
        <div className="w-full bg-muted/30 rounded-xl p-6">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <StyledLogo size="sm" />
              </div>
              <div>
                <p className="font-medium">Já Limpo</p>
                <p className="text-xs text-muted-foreground">jalimpo.app</p>
              </div>
            </div>
            <motion.button
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              Instalar
            </motion.button>
          </div>
        </div>
      )
    }
  ];

  const desktopSteps = [
    {
      icon: Download,
      title: "Clique no ícone de instalação",
      description: "Na barra de endereços, clique no ícone de instalação",
      visual: (
        <div className="w-full bg-muted/30 rounded-xl p-4">
          <div className="bg-card rounded-lg border border-border p-2 flex items-center gap-2">
            <div className="flex-1 h-8 rounded bg-muted/50 px-3 flex items-center">
              <span className="text-xs text-muted-foreground truncate">jalimpo.app</span>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-8 h-8 rounded-lg bg-primary/20 border border-primary flex items-center justify-center"
            >
              <Download className="w-4 h-4 text-primary" />
            </motion.div>
            <div className="w-8 h-8 rounded bg-muted/50" />
          </div>
        </div>
      )
    },
    {
      icon: Check,
      title: "Confirme a instalação",
      description: "Clique em 'Instalar' na janela que aparece",
      visual: (
        <div className="w-full bg-muted/30 rounded-xl p-6 flex justify-center">
          <div className="bg-card rounded-xl p-5 shadow-xl border border-border w-64">
            <p className="font-medium text-center mb-4">Instalar Já Limpo?</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground">
                Cancelar
              </button>
              <motion.button
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Instalar
              </motion.button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const getSteps = () => {
    switch (activeDevice) {
      case "ios": return iosSteps;
      case "android": return androidSteps;
      case "desktop": return desktopSteps;
      default: return androidSteps;
    }
  };

  const steps = getSteps();

  if (isInstalled) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center p-6 overflow-hidden safe-top safe-bottom">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          App Instalado
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          O Já Limpo está pronto para usar na sua tela inicial
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          Ir para o App
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border z-10"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <StyledLogo size="sm" />
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular
          </button>
        </div>
      </motion.header>

      <main className="flex-1 overflow-y-auto max-w-2xl mx-auto px-4 py-8 space-y-8 safe-bottom">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Download className="w-4 h-4" />
            Instale o App
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Adicione à Tela Inicial
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Instale o Já Limpo para ter acesso rápido e uma experiência como app nativo
          </p>
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="text-center p-4 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-sm">{benefit.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Device Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {deviceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedDevice(tab.id);
                  setCurrentStep(0);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  (selectedDevice === tab.id || (selectedDevice === "auto" && tab.id === "auto"))
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "auto" && selectedDevice === "auto" && (
                  <span className="text-xs opacity-75">
                    ({detectedDevice === "ios" ? "iOS" : detectedDevice === "android" ? "Android" : "Desktop"})
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Quick Install Button (for supported browsers) */}
        {deferredPrompt && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleInstall}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold
                flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
            >
              <Download className="w-5 h-5" />
              Instalar Agora
            </button>
          </motion.section>
        )}

        {/* Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold">Passo a passo</h2>
          
          {/* Step indicators */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {(() => {
                      const StepIcon = steps[currentStep].icon;
                      return <StepIcon className="w-6 h-6 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Passo {currentStep + 1} de {steps.length}
                    </div>
                    <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
                    <p className="text-muted-foreground mt-1">{steps[currentStep].description}</p>
                  </div>
                </div>

                {/* Visual representation */}
                {steps[currentStep].visual}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 p-4 bg-muted/30 border-t border-border">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => {
                    if (currentStep < steps.length - 1) {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={currentStep === steps.length - 1}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity
                    flex items-center justify-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* Help */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <p className="text-sm text-muted-foreground">
            Está com dificuldades?{" "}
            <button
              onClick={() => navigate("/client/support")}
              className="text-primary font-medium hover:underline"
            >
              Fale com o suporte
            </button>
          </p>
        </motion.section>
      </main>
    </div>
  );
}
