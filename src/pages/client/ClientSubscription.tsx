import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { SubscriptionCard } from "@/components/ui/SubscriptionCard";
import { PlanCard } from "@/components/ui/PlanCard";
import { Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

  const handleSelectPlan = (planId: string) => {
    toast.success("Assinatura ativada com sucesso!");
    navigate("/client/home");
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></button>
          <h1 className="text-lg font-semibold">Assinatura</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 animate-fade-in">
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
            <div className="p-4 bg-accent rounded-xl">
              <h3 className="font-medium text-foreground mb-2">Próximas limpezas</h3>
              <p className="text-sm text-muted-foreground">
                Você tem {(credits?.credits_total || currentPlan.cleanings_per_month) - (credits?.credits_used || 0)} créditos disponíveis este mês.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Economize com uma assinatura</h2>
              <p className="text-muted-foreground">Limpezas recorrentes com desconto e prioridade no agendamento.</p>
            </div>
            <div className="space-y-4">
              {plans.map((plan: any) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.monthly_price}
                  features={Array.isArray(plan.features) ? plan.features : []}
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
