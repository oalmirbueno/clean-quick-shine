import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, MessageCircle, HelpCircle, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProProfile, mockOrders } from "@/lib/mockData";

const steps = [
  { id: "confirmed", label: "Confirmado", time: "14:00" },
  { id: "in_progress", label: "Em andamento", time: "14:30" },
  { id: "completed", label: "Concluído", time: "—" },
];

export default function ClientOrderTracking() {
  const navigate = useNavigate();
  const order = mockOrders[0];
  const [currentStep, setCurrentStep] = useState(1);

  const handleComplete = () => {
    navigate("/client/rating", { state: { orderId: order.id } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/client/orders")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Acompanhar pedido
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Pro Info */}
        <section className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={mockProProfile.avatar}
              alt={mockProProfile.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{mockProProfile.name}</p>
              <p className="text-sm text-muted-foreground">{order.serviceName}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="p-4">
          <h2 className="font-medium text-foreground mb-6">Status do pedido</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />
            <div 
              className="absolute left-[15px] top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => {
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                      "transition-all duration-300",
                      isComplete ? "bg-primary" : isCurrent ? "bg-primary animate-pulse-soft" : "bg-secondary border-2 border-border"
                    )}>
                      {isComplete ? (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isCurrent ? "bg-primary-foreground" : "bg-muted-foreground"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={cn(
                        "font-medium",
                        isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Estimated Time */}
        <section className="mx-4 p-4 bg-accent rounded-xl">
          <p className="text-sm text-muted-foreground">Tempo estimado</p>
          <p className="text-2xl font-bold text-foreground">2h 30min</p>
        </section>

        {/* Actions */}
        <section className="p-4 mt-4 space-y-3">
          <button className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>
          
          <button className="w-full p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center gap-3 hover:bg-destructive/10 transition-colors">
            <X className="w-5 h-5 text-destructive" />
            <span className="font-medium text-destructive">Cancelar pedido</span>
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Cancelamentos com menos de 2h de antecedência podem ter taxa.
          </p>
        </section>
      </main>

      {/* Bottom Action - Show when in_progress */}
      {currentStep === 1 && (
        <div className="p-4 bg-card border-t border-border">
          <PrimaryButton fullWidth onClick={handleComplete}>
            Serviço concluído
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
