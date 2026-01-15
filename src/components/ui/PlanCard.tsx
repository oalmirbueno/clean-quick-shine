import { cn } from "@/lib/utils";
import { Check, Crown, Star, Sparkles } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: number;
  period?: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
  onSelect?: () => void;
  className?: string;
}

const planIcons: Record<string, typeof Crown> = {
  Free: Star,
  Basic: Star,
  PRO: Crown,
  Plus: Crown,
  ELITE: Sparkles,
  Premium: Sparkles,
};

export function PlanCard({
  name,
  price,
  period = "/mês",
  features,
  popular = false,
  current = false,
  onSelect,
  className,
}: PlanCardProps) {
  const Icon = planIcons[name] || Star;

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl border-2 transition-all duration-200",
        popular ? "border-primary bg-primary/5" : "border-border bg-card",
        current && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          Mais popular
        </div>
      )}

      {current && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-success text-white text-xs font-medium rounded-full">
          Atual
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          popular ? "bg-primary/20" : "bg-secondary"
        )}>
          <Icon className={cn("w-5 h-5", popular ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold text-foreground">
          {price === 0 ? "Grátis" : `R$ ${price.toFixed(2).replace(".", ",")}`}
        </span>
        {price > 0 && <span className="text-muted-foreground">{period}</span>}
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className={cn("w-4 h-4 mt-0.5 flex-shrink-0", popular ? "text-primary" : "text-success")} />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={current}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-all",
          current
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : popular
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-secondary text-foreground hover:bg-secondary/80"
        )}
      >
        {current ? "Plano atual" : price === 0 ? "Continuar grátis" : "Assinar agora"}
      </button>
    </div>
  );
}
