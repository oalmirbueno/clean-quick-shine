import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Check, Crown, Zap, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProPlan() {
  const navigate = useNavigate();
  const [currentPlan] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Assinatura PRO ativada!");
    setLoading(false);
  };

  const freeBenefits = [
    "Receba pedidos limitados por dia",
    "Comissão padrão de 20%",
    "Suporte por chat",
  ];

  const proBenefits = [
    "Pedidos ilimitados",
    "Prioridade na distribuição",
    "Destaque no ranking",
    "Comissão reduzida de 15%",
    "Suporte prioritário",
    "Badge PRO no perfil",
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Planos</h1>
        </div>
      </header>

      <main className="p-4 space-y-4 animate-fade-in">
        {/* Current Plan */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Seu plano atual</p>
          <p className="text-xl font-bold text-foreground">
            {currentPlan === "pro" ? "PRO" : "Free"}
          </p>
        </div>

        {/* Free Plan */}
        <div className={cn(
          "p-5 rounded-xl border",
          currentPlan === "free" 
            ? "border-primary bg-accent" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Plano Free</h3>
              <p className="text-2xl font-bold text-foreground">Grátis</p>
            </div>
            {currentPlan === "free" && (
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                Atual
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {freeBenefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* PRO Plan */}
        <div className={cn(
          "p-5 rounded-xl border relative overflow-hidden",
          currentPlan === "pro" 
            ? "border-primary bg-accent" 
            : "border-primary/50 bg-card"
        )}>
          {/* Recommended badge */}
          {currentPlan === "free" && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              Recomendado
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-warning" />
            <div>
              <h3 className="font-semibold text-foreground">Plano PRO</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-foreground">R$ 49,90</p>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
            </div>
          </div>

          <ul className="space-y-2 mb-4">
            {proBenefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-success" />
                {benefit}
              </li>
            ))}
          </ul>

          {currentPlan === "free" ? (
            <PrimaryButton fullWidth loading={loading} onClick={handleUpgrade}>
              <Zap className="w-4 h-4 mr-2" />
              Assinar PRO
            </PrimaryButton>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Você já é PRO! 🎉
            </div>
          )}
        </div>

        {/* Benefits explanation */}
        <div className="p-4 bg-accent rounded-xl">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Por que ser PRO?
          </h4>
          <p className="text-sm text-muted-foreground">
            Profissionais PRO recebem em média <strong>3x mais pedidos</strong> e ganham 
            <strong> 25% mais</strong> por mês. O investimento se paga em apenas 2 serviços.
          </p>
        </div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
