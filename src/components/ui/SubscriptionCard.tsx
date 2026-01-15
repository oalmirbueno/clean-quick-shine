import { cn } from "@/lib/utils";
import { Calendar, Sparkles, Pause, Play, X } from "lucide-react";
import type { ClientSubscription, ClientPlan } from "@/lib/mockDataV3";

interface SubscriptionCardProps {
  subscription: ClientSubscription;
  plan: ClientPlan;
  onManage?: () => void;
  className?: string;
}

const statusConfig = {
  active: { label: "Ativa", color: "bg-success/10 text-success", icon: Play },
  paused: { label: "Pausada", color: "bg-warning/10 text-warning", icon: Pause },
  cancelled: { label: "Cancelada", color: "bg-muted text-muted-foreground", icon: X },
};

export function SubscriptionCard({ subscription, plan, onManage, className }: SubscriptionCardProps) {
  const status = statusConfig[subscription.status];
  const StatusIcon = status.icon;
  const creditsRemaining = subscription.creditsTotal - subscription.creditsUsed;

  return (
    <div className={cn("p-5 bg-card rounded-xl border border-border", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Plano {plan.name}</h3>
            <p className="text-sm text-muted-foreground">
              R$ {plan.monthlyPrice.toFixed(2).replace(".", ",")}/mês
            </p>
          </div>
        </div>
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Credits */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Créditos do mês</span>
          <span className="text-sm font-medium text-foreground">
            {subscription.creditsUsed}/{subscription.creditsTotal} usados
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(subscription.creditsUsed / subscription.creditsTotal) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {creditsRemaining} limpeza{creditsRemaining !== 1 ? "s" : ""} disponíve{creditsRemaining !== 1 ? "is" : "l"}
        </p>
      </div>

      {/* Benefits */}
      <div className="p-3 bg-secondary/50 rounded-lg mb-4">
        <p className="text-xs text-muted-foreground mb-2">Benefícios ativos:</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {plan.feeDiscountPercent}% off na taxa
          </span>
          {plan.priorityBoost > 0 && (
            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
              Prioridade +{plan.priorityBoost}
            </span>
          )}
        </div>
      </div>

      {/* Renewal */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Renova em {new Date(subscription.renewAt).toLocaleDateString("pt-BR")}</span>
        </div>
        <button
          onClick={onManage}
          className="text-primary font-medium hover:underline"
        >
          Gerenciar
        </button>
      </div>
    </div>
  );
}
