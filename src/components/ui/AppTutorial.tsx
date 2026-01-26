import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { 
  Home, Calendar, Star, User, MapPin, Search, 
  Briefcase, Wallet, Trophy, Clock, CheckCircle2,
  ChevronRight, X, Sparkles, Shield, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLIENT_TUTORIAL_KEY = "jalimpo_client_tutorial_completed";
const PRO_TUTORIAL_KEY = "jalimpo_pro_tutorial_completed";

interface TutorialStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight?: string;
}

const clientSteps: TutorialStep[] = [
  {
    icon: Search,
    title: "Encontre o serviço ideal",
    description: "Escolha entre limpeza residencial, comercial, pós-obra ou faxina pesada. Temos profissionais verificadas para cada necessidade.",
    highlight: "Serviços",
  },
  {
    icon: MapPin,
    title: "Informe o local",
    description: "Adicione o endereço onde deseja o serviço. Você pode salvar vários endereços para facilitar futuros agendamentos.",
    highlight: "Endereço",
  },
  {
    icon: Calendar,
    title: "Escolha data e horário",
    description: "Agende para hoje, amanhã ou qualquer dia da semana. Você decide o melhor horário.",
    highlight: "Agenda",
  },
  {
    icon: Star,
    title: "Profissionais verificadas",
    description: "Todas as diaristas são verificadas com documento e antecedentes. Veja avaliações de outros clientes antes de confirmar.",
    highlight: "Confiança",
  },
  {
    icon: Bell,
    title: "Acompanhe em tempo real",
    description: "Receba notificações quando a profissional confirmar, estiver a caminho e iniciar o serviço.",
    highlight: "Notificações",
  },
];

const proSteps: TutorialStep[] = [
  {
    icon: Shield,
    title: "Complete sua verificação",
    description: "Envie seus documentos (RG/CNH) para ser verificada. Isso aumenta sua credibilidade e permite receber pedidos.",
    highlight: "Verificação",
  },
  {
    icon: MapPin,
    title: "Defina sua área de atuação",
    description: "Configure as zonas onde você deseja trabalhar. Você receberá pedidos apenas dessas regiões.",
    highlight: "Zonas",
  },
  {
    icon: Clock,
    title: "Ative sua disponibilidade",
    description: "Quando estiver pronta para trabalhar, ative o botão 'Disponível'. Os pedidos chegarão automaticamente.",
    highlight: "Disponível",
  },
  {
    icon: Wallet,
    title: "Ganhe 80% do valor",
    description: "Você fica com 80% de cada serviço realizado. O saldo é liberado após a conclusão e pode ser sacado via PIX.",
    highlight: "Ganhos",
  },
  {
    icon: Trophy,
    title: "Evolua no ranking",
    description: "Mantenha boas avaliações, pontualidade e baixo cancelamento para subir no ranking e receber mais pedidos.",
    highlight: "Qualidade",
  },
];

interface AppTutorialProps {
  variant: "client" | "pro";
  onComplete: () => void;
}

export function AppTutorial({ variant, onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  
  const steps = variant === "client" ? clientSteps : proSteps;
  const totalSteps = steps.length;
  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const storageKey = variant === "client" ? CLIENT_TUTORIAL_KEY : PRO_TUTORIAL_KEY;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
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
    localStorage.setItem(storageKey, "true");
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col safe-top overflow-hidden"
        >
          {/* Close button */}
          <header className="p-4 flex items-center justify-between">
            <Logo size="sm" iconOnly />
            <button
              onClick={handleSkip}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Fechar tutorial"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </header>

          {/* Progress bar */}
          <div className="px-6">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {currentStep + 1} de {totalSteps}
            </p>
          </div>

          {/* Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  className={cn(
                    "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg",
                    variant === "client" 
                      ? "bg-gradient-to-br from-primary/20 to-primary/5" 
                      : "bg-gradient-to-br from-success/20 to-success/5"
                  )}
                >
                  <step.icon className={cn(
                    "w-12 h-12",
                    variant === "client" ? "text-primary" : "text-success"
                  )} />
                </motion.div>

                {/* Badge */}
                {step.highlight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4",
                      variant === "client" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-success/10 text-success"
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    {step.highlight}
                  </motion.div>
                )}

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-foreground mb-4"
                >
                  {step.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-muted-foreground leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="p-6 pb-10 safe-bottom">
            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className="p-1"
                  aria-label={`Ir para passo ${index + 1}`}
                >
                  <motion.div
                    animate={{
                      scale: index === currentStep ? 1.3 : 1,
                      backgroundColor:
                        index === currentStep
                          ? variant === "client" 
                            ? "hsl(var(--primary))" 
                            : "hsl(var(--success))"
                          : index < currentStep
                          ? variant === "client"
                            ? "hsl(var(--primary) / 0.5)"
                            : "hsl(var(--success) / 0.5)"
                          : "hsl(var(--border))",
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-2 h-2 rounded-full"
                  />
                </button>
              ))}
            </div>

            <PrimaryButton 
              fullWidth 
              onClick={handleNext} 
              className="group"
              variant={variant === "pro" ? "success" : "primary"}
            >
              {isLastStep ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Começar a usar
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Próximo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </PrimaryButton>

            <button
              onClick={handleSkip}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular tutorial
            </button>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useAppTutorial(variant: "client" | "pro") {
  const [showTutorial, setShowTutorial] = useState(false);
  const storageKey = variant === "client" ? CLIENT_TUTORIAL_KEY : PRO_TUTORIAL_KEY;

  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === "true";
    if (!completed) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const completeTutorial = () => {
    localStorage.setItem(storageKey, "true");
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(storageKey);
    setShowTutorial(true);
  };

  return { showTutorial, completeTutorial, resetTutorial };
}
