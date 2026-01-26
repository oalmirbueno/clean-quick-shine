import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Sparkles, Shield, Clock, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const tutorialSteps = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao CleanQuick!",
    description: "O jeito mais fácil de contratar limpeza profissional para sua casa ou escritório.",
    highlight: "Vamos te mostrar como funciona",
  },
  {
    icon: Clock,
    title: "Agende em segundos",
    description: "Escolha o serviço, data e horário. Nós encontramos a melhor profissional disponível.",
    highlight: "Sem complicação",
  },
  {
    icon: Shield,
    title: "Pagamento seguro",
    description: "Seu pagamento fica protegido até o serviço ser concluído e aprovado por você.",
    highlight: "100% garantido",
  },
  {
    icon: Star,
    title: "Profissionais verificadas",
    description: "Todas as diaristas são avaliadas e verificadas. Veja reviews reais de outros clientes.",
    highlight: "Qualidade garantida",
  },
];

const TUTORIAL_STORAGE_KEY = "cleanquick_tutorial_completed";

interface WelcomeTutorialProps {
  onComplete: () => void;
}

export function WelcomeTutorial({ onComplete }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
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
    }, 300);
  };

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col safe-top"
        >
          {/* Header */}
          <header className="p-4 flex items-center justify-between">
            <div className="w-10" /> {/* Spacer */}
            <Logo size="sm" iconOnly />
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground px-2 transition-colors"
            >
              Pular
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-8 shadow-lg"
              >
                <step.icon className="w-14 h-14 text-primary" />
              </motion.div>

              {/* Highlight badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
              >
                <Sparkles className="w-3 h-3" />
                {step.highlight}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl font-bold text-foreground mb-4"
              >
                {step.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground leading-relaxed"
              >
                {step.description}
              </motion.p>
            </motion.div>
          </main>

          {/* Footer */}
          <footer className="p-6 pb-8">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {tutorialSteps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: index === currentStep ? 1.2 : 1,
                    backgroundColor: index === currentStep 
                      ? "hsl(var(--primary))" 
                      : index < currentStep 
                        ? "hsl(var(--primary) / 0.5)" 
                        : "hsl(var(--border))"
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all"
                  )}
                />
              ))}
            </div>

            <PrimaryButton 
              fullWidth 
              onClick={handleNext}
              className="group"
            >
              {isLastStep ? (
                "Começar a usar"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Continuar
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </PrimaryButton>
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
