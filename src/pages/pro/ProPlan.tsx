import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Check, Crown, Zap, Sparkles, Building2, Clock, Star, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { proPlans, pros } from "@/lib/mockDataV3";

export default function ProPlan() {
  const navigate = useNavigate();
  const pro = pros[0];
  const [currentPlan] = useState(pro.plan);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    setLoading(planName);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Assinatura ${planName} ativada!`);
    setLoading(null);
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      icon: Star,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-border",
      features: [
        "Até 5 pedidos/dia",
        "Comissão padrão de 20%",
        "Suporte básico por chat",
        "Acesso a limpeza residencial",
      ],
      limitations: [
        "Sem prioridade no matching",
        "Sem destaque no ranking",
      ]
    },
    {
      id: "pro",
      name: "PRO",
      price: 49.90,
      icon: Crown,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary",
      recommended: true,
      features: [
        "Pedidos ilimitados",
        "Prioridade no matching",
        "Destaque no ranking",
        "Comissão reduzida de 15%",
        "Suporte prioritário",
        "Badge PRO no perfil",
        "Acesso a pós-obra",
      ],
    },
    {
      id: "elite",
      name: "ELITE",
      price: 99.90,
      icon: Sparkles,
      color: "text-amber-500",
      bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
      borderColor: "border-amber-400",
      gradient: true,
      features: [
        "Máxima prioridade no matching",
        "Selo ELITE exclusivo",
        "Acesso a clientes comerciais",
        "Comissão mínima de 12%",
        "Suporte VIP 24h",
        "Antecipação de pagamentos",
        "Primeiro nos novos pedidos",
        "Dashboard de analytics",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
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

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 animate-fade-in">
        {/* Current Plan */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Seu plano atual</p>
          <p className="text-xl font-bold text-foreground capitalize">
            {currentPlan === "elite" ? "ELITE" : currentPlan === "pro" ? "PRO" : "Free"}
          </p>
        </div>

        {/* Plans */}
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const canUpgrade = 
            (plan.id === "pro" && currentPlan === "free") ||
            (plan.id === "elite" && currentPlan !== "elite");

          return (
            <div 
              key={plan.id}
              className={cn(
                "p-5 rounded-xl border relative overflow-hidden",
                isCurrentPlan ? `${plan.bgColor} ${plan.borderColor}` : "bg-card border-border",
                plan.gradient && !isCurrentPlan && "border-amber-200"
              )}
            >
              {/* Recommended badge */}
              {plan.recommended && currentPlan === "free" && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Recomendado
                </div>
              )}

              {/* Elite badge */}
              {plan.id === "elite" && currentPlan !== "elite" && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Premium
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  plan.id === "elite" ? "bg-gradient-to-r from-amber-500 to-yellow-400" : plan.bgColor
                )}>
                  <Icon className={cn("w-5 h-5", plan.id === "elite" ? "text-white" : plan.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <p className="text-2xl font-bold text-foreground">Grátis</p>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-foreground">R$ {plan.price.toFixed(2).replace(".", ",")}</p>
                        <span className="text-sm text-muted-foreground">/mês</span>
                      </>
                    )}
                  </div>
                </div>
                {isCurrentPlan && (
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    plan.id === "elite" 
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white"
                      : "bg-primary text-primary-foreground"
                  )}>
                    Atual
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className={cn("w-4 h-4", plan.id === "elite" ? "text-amber-500" : "text-success")} />
                    {feature}
                  </li>
                ))}
                {plan.limitations?.map((limitation, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                    {limitation}
                  </li>
                ))}
              </ul>

              {canUpgrade && (
                <PrimaryButton 
                  fullWidth 
                  loading={loading === plan.id} 
                  onClick={() => handleUpgrade(plan.name)}
                  className={cn(
                    plan.id === "elite" && "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500"
                  )}
                >
                  {plan.id === "elite" ? <Sparkles className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  {plan.id === "elite" ? "Seja ELITE" : "Assinar PRO"}
                </PrimaryButton>
              )}

              {isCurrentPlan && plan.id !== "free" && (
                <div className="text-center text-sm text-muted-foreground">
                  Renova em 15/02/2025
                </div>
              )}
            </div>
          );
        })}

        {/* Benefits comparison */}
        <div className="p-4 bg-accent rounded-xl">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Por que fazer upgrade?
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">PRO recebe 3x mais</p>
                <p className="text-muted-foreground">Prioridade no matching = mais pedidos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">ELITE domina a cidade</p>
                <p className="text-muted-foreground">Acesso a comercial e máxima prioridade</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Clientes comerciais</p>
                <p className="text-muted-foreground">Empresas pagam mais e contratos recorrentes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Elite Benefits Card */}
        {currentPlan !== "elite" && (
          <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold text-foreground">Exclusivo ELITE</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-foreground">Antecipação de pagamentos em 24h</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span className="text-foreground">Acesso a serviços comerciais premium</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-foreground">Suporte VIP 24 horas</span>
              </li>
            </ul>
          </div>
        )}
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
