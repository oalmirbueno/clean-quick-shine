import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CalendarCheck, Wallet, TrendingUp, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: CalendarCheck,
    title: "Receba pedidos todo dia",
    description: "Clientes precisam de limpeza diariamente. Você escolhe quando e onde trabalhar.",
  },
  {
    icon: Wallet,
    title: "Pagamento garantido",
    description: "Receba seu dinheiro direto na sua conta após cada serviço. Sem complicação.",
  },
  {
    icon: TrendingUp,
    title: "Ranking que te dá mais trabalho",
    description: "Quanto melhor seu atendimento, mais pedidos você recebe. Subir de nível vale a pena.",
  },
];

export default function OnboardingPro() {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => currentStep === 0 ? navigate("/onboarding") : setCurrentStep(currentStep - 1)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <Logo size="sm" />
        <button
          onClick={() => navigate("/register")}
          className="text-sm text-muted-foreground hover:text-foreground"
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
          {currentStep === steps.length - 1 ? "Cadastrar e trabalhar" : "Continuar"}
        </PrimaryButton>
      </footer>
    </div>
  );
}
