import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Download, Share, PlusSquare, Smartphone, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TUTORIAL_STORAGE_KEY = "cleanquick_pwa_tutorial_completed";

// Detect platform
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
    || (window.navigator as any).standalone === true;
  
  return { isIOS, isAndroid, isStandalone };
};

interface TutorialStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: string;
}

const getIOSSteps = (): TutorialStep[] => [
  {
    icon: Share,
    title: "Toque no botão Compartilhar",
    description: "Na barra inferior do Safari, toque no ícone de compartilhamento (quadrado com seta para cima).",
    action: "Passo 1 de 3",
  },
  {
    icon: PlusSquare,
    title: "Adicionar à Tela de Início",
    description: "Role as opções e toque em \"Adicionar à Tela de Início\".",
    action: "Passo 2 de 3",
  },
  {
    icon: Check,
    title: "Confirme a instalação",
    description: "Toque em \"Adicionar\" no canto superior direito. Pronto! O app estará na sua tela inicial.",
    action: "Passo 3 de 3",
  },
];

const getAndroidSteps = (): TutorialStep[] => [
  {
    icon: Download,
    title: "Menu do navegador",
    description: "Toque nos três pontos (⋮) no canto superior direito do Chrome.",
    action: "Passo 1 de 2",
  },
  {
    icon: PlusSquare,
    title: "Instalar aplicativo",
    description: "Toque em \"Instalar aplicativo\" ou \"Adicionar à tela inicial\" e confirme.",
    action: "Passo 2 de 2",
  },
];

const getGenericSteps = (): TutorialStep[] => [
  {
    icon: Download,
    title: "Abra o menu do navegador",
    description: "No Chrome, Edge ou Firefox, clique nos três pontos (⋮) no canto superior direito da tela.",
    action: "Passo 1 de 2",
  },
  {
    icon: PlusSquare,
    title: "Instalar como aplicativo",
    description: "Selecione \"Instalar aplicativo\" ou \"Adicionar à tela inicial\". No Chrome, também pode usar Ctrl+Shift+A.",
    action: "Passo 2 de 2",
  },
];

interface WelcomeTutorialProps {
  onComplete: () => void;
}

export function WelcomeTutorial({ onComplete }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [deviceInfo] = useState(getDeviceInfo);
  const [showIntro, setShowIntro] = useState(true);

  const steps = deviceInfo.isIOS 
    ? getIOSSteps() 
    : deviceInfo.isAndroid 
      ? getAndroidSteps() 
      : getGenericSteps();

  const handleNext = () => {
    if (showIntro) {
      setShowIntro(false);
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsExiting(true);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  // If already installed as PWA, skip tutorial
  useEffect(() => {
    if (deviceInfo.isStandalone) {
      handleComplete();
    }
  }, [deviceInfo.isStandalone]);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const totalSteps = steps.length;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col safe-top overflow-hidden"
        >
          {/* Header */}
          <header className="p-4 flex items-center justify-between">
            <div className="w-10" />
            <Logo size="sm" iconOnly />
            <button
              onClick={handleSkip}
              aria-label="Pular tutorial de instalação"
              className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl bg-muted/50 transition-colors"
            >
              Pular
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-6">
            <AnimatePresence mode="wait">
              {showIntro ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm text-center"
                >
                  {/* Phone icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-8 shadow-lg"
                  >
                    <Smartphone className="w-14 h-14 text-primary" />
                  </motion.div>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
                  >
                    <Download className="w-3 h-3" />
                    Instalação rápida
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-2xl font-bold text-foreground mb-4"
                  >
                    Instale o Já Limpo
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground leading-relaxed mb-6"
                  >
                    Adicione o app à sua tela inicial para acesso rápido, notificações e funcionamento offline.
                  </motion.p>

                  {/* Device indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs text-muted-foreground/70"
                  >
                    {deviceInfo.isIOS && "Detectamos que você está no iPhone/iPad"}
                    {deviceInfo.isAndroid && "Detectamos que você está no Android"}
                    {!deviceInfo.isIOS && !deviceInfo.isAndroid && "Siga as instruções do seu navegador"}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm text-center"
                >
                  {/* Step icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <step.icon className="w-12 h-12 text-primary" />
                  </motion.div>

                  {/* Step indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-4"
                  >
                    {step.action}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-foreground mb-3"
                  >
                    {step.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="p-6 pb-10 safe-bottom">
            {/* Progress dots */}
            {!showIntro && (
              <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1,
                      backgroundColor:
                        index === currentStep
                          ? "hsl(var(--primary))"
                          : index < currentStep
                          ? "hsl(var(--primary) / 0.5)"
                          : "hsl(var(--border))",
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                ))}
              </div>
            )}

            <PrimaryButton fullWidth onClick={handleNext} className="group">
              {showIntro ? (
                <span className="flex items-center justify-center gap-2">
                  Ver como instalar
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              ) : isLastStep ? (
                "Entendi, continuar"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Próximo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </PrimaryButton>

            {showIntro && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-muted-foreground mt-4"
              >
                Leva menos de 30 segundos
              </motion.p>
            )}
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useTutorialComplete() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
    setIsComplete(completed);
  }, []);

  const markComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setIsComplete(true);
  };

  const reset = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setIsComplete(false);
  };

  return { isComplete, markComplete, reset };
}
