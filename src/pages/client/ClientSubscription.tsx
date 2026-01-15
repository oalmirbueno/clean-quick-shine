import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { SubscriptionCard } from "@/components/ui/SubscriptionCard";
import { PlanCard } from "@/components/ui/PlanCard";
import { clientPlans, clientSubscriptions, mockUser } from "@/lib/mockDataV3";
import { Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function ClientSubscription() {
  const navigate = useNavigate();
  const currentSub = clientSubscriptions.find(s => s.clientId === mockUser.id && s.status === "active");
  const currentPlan = currentSub ? clientPlans.find(p => p.id === currentSub.planId) : null;

  const handleSelectPlan = (planId: string) => {
    toast.success("Assinatura ativada com sucesso!");
    navigate("/client/home");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Assinatura</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        {currentSub && currentPlan ? (
          <>
            <SubscriptionCard
              subscription={currentSub}
              plan={currentPlan}
              onManage={() => navigate("/client/subscription/manage")}
            />

            <div className="p-4 bg-accent rounded-xl">
              <h3 className="font-medium text-foreground mb-2">Próximas limpezas</h3>
              <p className="text-sm text-muted-foreground">
                Você tem {currentSub.creditsTotal - currentSub.creditsUsed} créditos disponíveis este mês.
              </p>
              <button
                onClick={() => navigate("/client/subscription/schedule")}
                className="mt-3 text-primary font-medium text-sm hover:underline"
              >
                Agendar com crédito →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Economize com uma assinatura</h2>
              <p className="text-muted-foreground">
                Limpezas recorrentes com desconto e prioridade no agendamento.
              </p>
            </div>

            <div className="space-y-4">
              {clientPlans.filter(p => p.active).map((plan) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.monthlyPrice}
                  features={plan.features}
                  popular={plan.name === "Plus"}
                  onSelect={() => handleSelectPlan(plan.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
