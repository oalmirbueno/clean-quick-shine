import { useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Check, Crown, Zap, Sparkles, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: currentSub } = useQuery({
    queryKey: ["pro_subscription", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("pro_subscriptions").select("*, pro_plans(type)").eq("user_id", user!.id).eq("status", "active").maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const currentPlan = (currentSub as any)?.pro_plans?.type || "free";

  const handleUpgrade = async (planName: string) => {
    setLoading(planName);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Assinatura ${planName} ativada!`);
    setLoading(null);
  };

  const plans = [
    { id: "free", name: "Free", price: 0, icon: Star, color: "text-muted-foreground", bgColor: "bg-muted/50", borderColor: "border-border",
      features: ["Até 5 pedidos/dia", "Comissão padrão de 20%", "Suporte básico por chat", "Acesso a limpeza residencial"],
      limitations: ["Sem prioridade no matching", "Sem destaque no ranking"] },
    { id: "pro", name: "PRO", price: 49.90, icon: Crown, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary", recommended: true,
      features: ["Pedidos ilimitados", "Prioridade no matching", "Destaque no ranking", "Comissão reduzida de 15%", "Suporte prioritário", "Badge PRO no perfil", "Acesso a pós-obra"] },
    { id: "elite", name: "ELITE", price: 99.90, icon: Sparkles, color: "text-amber-500", bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50", borderColor: "border-amber-400", gradient: true,
      features: ["Máxima prioridade no matching", "Selo ELITE exclusivo", "Acesso a clientes comerciais", "Comissão mínima de 12%", "Suporte VIP 24h", "Antecipação de pagamentos", "Primeiro nos novos pedidos", "Dashboard de analytics"] },
  ];

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Planos" subtitle={`Atual: ${currentPlan === "elite" ? "ELITE" : currentPlan === "pro" ? "PRO" : "Free"}`} />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            const canUpgrade = (plan.id === "pro" && currentPlan === "free") || (plan.id === "elite" && currentPlan !== "elite");

            return (
              <motion.div
                variants={item}
                key={plan.id}
                className={cn(
                  "p-5 rounded-2xl border relative overflow-hidden shadow-sm",
                  isCurrentPlan ? `${plan.bgColor} ${plan.borderColor}` : "bg-card border-border/60"
                )}
              >
                {plan.recommended && currentPlan === "free" && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-2xl tracking-wide">
                    RECOMENDADO
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    plan.id === "elite" ? "bg-gradient-to-r from-amber-500 to-yellow-400" : plan.bgColor
                  )}>
                    <Icon className={cn("w-5 h-5", plan.id === "elite" ? "text-white" : plan.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <p className="text-xl font-bold text-foreground">Grátis</p>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-foreground">R$ {plan.price.toFixed(2).replace(".", ",")}</p>
                          <span className="text-xs text-muted-foreground">/mês</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isCurrentPlan && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shrink-0">ATUAL</span>
                  )}
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                      <Check className={cn("w-3.5 h-3.5 shrink-0", plan.id === "elite" ? "text-amber-500" : "text-success")} />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground line-through">{limitation}</li>
                  ))}
                </ul>
                {canUpgrade && (
                  <PrimaryButton
                    fullWidth
                    loading={loading === plan.id}
                    onClick={() => handleUpgrade(plan.name)}
                    className={cn(plan.id === "elite" && "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500")}
                  >
                    {plan.id === "elite" ? <><Sparkles className="w-4 h-4 mr-2" />Seja ELITE</> : <><Zap className="w-4 h-4 mr-2" />Assinar PRO</>}
                  </PrimaryButton>
                )}
              </motion.div>
            );
          })}

          <motion.div variants={item} className="p-4 bg-accent rounded-2xl border border-border/60">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Por que fazer upgrade?
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">PRO recebe 3x mais</p>
                  <p className="text-muted-foreground">Prioridade no matching = mais pedidos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">ELITE domina a cidade</p>
                  <p className="text-muted-foreground">Acesso a comercial e máxima prioridade</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
