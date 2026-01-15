import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  format?: "number" | "currency" | "percent";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel,
  format = "number",
  className 
}: MetricCardProps) {
  const formatValue = () => {
    if (format === "currency") {
      return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }
    if (format === "percent") {
      return `${Number(value).toFixed(1)}%`;
    }
    return value.toLocaleString("pt-BR");
  };

  return (
    <div className={cn(
      "p-4 bg-card rounded-xl border border-border card-shadow",
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{formatValue()}</p>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-sm",
          trend >= 0 ? "text-success" : "text-destructive"
        )}>
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{trend >= 0 ? "+" : ""}{trend}%</span>
          {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
