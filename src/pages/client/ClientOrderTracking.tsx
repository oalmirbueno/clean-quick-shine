import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TimelineStepper } from "@/components/ui/TimelineStepper";
import { ChevronLeft, MessageCircle, HelpCircle, X } from "lucide-react";
import { pros, orders } from "@/lib/mockDataV2";

const timelineSteps = [
  { id: "confirmed", label: "Confirmado", time: "14:00" },
  { id: "en_route", label: "Profissional a caminho", time: "14:25" },
  { id: "in_progress", label: "Em andamento", time: "14:30" },
  { id: "completed", label: "Concluído", time: "—" },
  { id: "rated", label: "Avaliado", time: "—" },
];

export default function ClientOrderTracking() {
  const navigate = useNavigate();
  const order = orders[0];
  const pro = pros[0];
  const [currentStep, setCurrentStep] = useState(2); // in_progress

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
              src={pro.avatar}
              alt={pro.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{pro.name}</p>
              <p className="text-sm text-muted-foreground">{order.serviceName}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Timeline */}
        <section className="p-4">
          <h2 className="font-medium text-foreground mb-6">Status do pedido</h2>
          <TimelineStepper steps={timelineSteps} currentStep={currentStep} />
        </section>

        {/* Estimated Time */}
        <section className="mx-4 p-4 bg-accent rounded-xl">
          <p className="text-sm text-muted-foreground">Tempo estimado</p>
          <p className="text-2xl font-bold text-foreground">2h 30min</p>
        </section>

        {/* Actions */}
        <section className="p-4 mt-4 space-y-3">
          <button 
            onClick={() => navigate("/client/support")}
            className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>
          
          <button 
            onClick={() => navigate(`/client/cancel/${order.id}`)}
            className="w-full p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center gap-3 hover:bg-destructive/10 transition-colors"
          >
            <X className="w-5 h-5 text-destructive" />
            <span className="font-medium text-destructive">Cancelar pedido</span>
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Cancelamentos podem ter taxa dependendo do horário.
          </p>
        </section>
      </main>

      {/* Bottom Action - Show when in_progress */}
      {currentStep === 2 && (
        <div className="p-4 bg-card border-t border-border">
          <PrimaryButton fullWidth onClick={handleComplete}>
            Serviço concluído
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
