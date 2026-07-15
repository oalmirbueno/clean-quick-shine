import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { SubscriptionCard } from "@/components/ui/SubscriptionCard";
import { PlanCard } from "@/components/ui/PlanCard";
import { Sparkles, ChevronLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const benefits = [
  "Preço fixo mensal, sem surpresas",
  "Prioridade no agendamento",
  "Desconto em taxas por serviço",
  "Cancele quando quiser",
];

export default function ClientSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: plans = [] } = useQuery({
    queryKey: ["client_plans"],
    queryFn: async () => {
      const { data } = await supabase.from("client_plans").select("*").eq("active", true).order("monthly_price");
      return data || [];
    },
  });

  const { data: subscription } = useQuery({
    queryKey: ["client_subscription", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("client_subscriptions").select("*, client_plans(*)").eq("user_id", user!.id).eq("status", "active").maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ["client_credits", subscription?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscription_credits").select("*").eq("subscription_id", subscription!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!subscription,
  });

  const currentPlan = subscription ? (subscription as any).client_plans : null;

  const handleSelectPlan = (_planId: string) => {
    toast.success("Assinatura ativada com sucesso!");
    navigate("/client/home");
  };

  const remainingCredits = credits && currentPlan
    ? (credits.credits_total || currentPlan.cleanings_per_month) - (credits.credits_used || 0)
    : currentPlan?.cleanings_per_month || 0;

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground leading-tight">Assinatura</h1>
            <p className="text-xs text-muted-foreground">
              {subscription ? "Seu plano ativo" : "Economize com planos recorrentes"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in">
        <div className="p-4 space-y-4">
          {subscription && currentPlan ? (
            <>
              <SubscriptionCard
                subscription={{
                  id: subscription.id,
                  clientId: subscription.user_id,
                  planId: subscription.plan_id,
                  status: (subscription.status as "active" | "paused" | "cancelled") || "active",
                  startAt: subscription.start_at,
                  renewAt: subscription.renew_at || "",
                  creditsTotal: credits?.credits_total || currentPlan.cleanings_per_month,
                  creditsUsed: credits?.credits_used || 0,
                }}
                plan={{
                  id: currentPlan.id,
                  name: currentPlan.name,
                  monthlyPrice: currentPlan.monthly_price,
                  cleaningsPerMonth: currentPlan.cleanings_per_month,
                  feeDiscountPercent: currentPlan.fee_discount_percent || 0,
                  priorityBoost: currentPlan.priority_boost || 0,
                  features: Array.isArray(currentPlan.features) ? currentPlan.features : [],
                  active: currentPlan.active ?? true,
                }}
                onManage={() => navigate("/client/subscription/manage")}
              />

              <section className="p-5 bg-gradient-to-br from-primary/10 to-primary/[0.03] rounded-2xl border border-primary/15">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Próximas limpezas</p>
                    <p className="text-xs text-muted-foreground">Créditos disponíveis este mês</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-3xl font-bold text-foreground">{remainingCredits}</span>
                  <span className="text-sm text-muted-foreground">
                    de {credits?.credits_total || currentPlan.cleanings_per_month} restantes
                  </span>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Hero */}
              <section className="p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-3xl border border-primary/20 text-center">
                <div className="size-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Assine e economize</h2>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Limpezas recorrentes com desconto, prioridade e sem preocupação.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-2 text-left max-w-sm mx-auto">
                  {benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2.5 text-sm text-foreground">
                      <div className="size-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Plans */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground px-1">Escolha seu plano</h3>
                {plans.map((plan: any, i: number) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <PlanCard
                      name={plan.name}
                      price={plan.monthly_price}
                      features={Array.isArray(plan.features) ? plan.features : []}
                      popular={plan.name === "Plus"}
                      onSelect={() => handleSelectPlan(plan.id)}
                    />
                  </motion.div>
                ))}
              </section>
            </>
          )}
        </div>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}

