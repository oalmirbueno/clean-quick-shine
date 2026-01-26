import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Search, Shield, Star, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    title: "Escolha o serviço em segundos",
    description: "Selecione o tipo de limpeza, data e horário. Encontramos a melhor profissional pra você.",
  },
  {
    icon: Shield,
    title: "Pagamento protegido",
    description: "Seu dinheiro fica seguro até o serviço ser concluído e você confirmar.",
  },
  {
    icon: Star,
    title: "Profissionais avaliadas",
    description: "Todas as diaristas passam por verificação. Veja avaliações reais de outros clientes.",
  },
];

export default function OnboardingClient() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/register");
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => currentStep === 0 ? navigate("/onboarding") : setCurrentStep(currentStep - 1)}
          className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <Logo size="sm" iconOnly />
        <button
          onClick={() => navigate("/register")}
          className="text-sm text-muted-foreground hover:text-foreground px-2"
        >
          Pular
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center animate-fade-in" key={currentStep}>
          <div className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-8">
            <step.icon className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {step.title}
          </h1>
          
          <p className="text-muted-foreground">
            {step.description}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentStep ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>

        <PrimaryButton fullWidth onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Começar" : "Continuar"}
        </PrimaryButton>
      </footer>
    </div>
  );
}
