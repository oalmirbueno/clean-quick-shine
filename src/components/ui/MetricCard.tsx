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
      "p-4 sm:p-5 bg-card rounded-2xl border border-border shadow-sm",
      className
    )}>
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</span>
        {Icon && (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-xl sm:text-3xl font-bold text-foreground tracking-tight break-words">{formatValue()}</p>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3 text-xs sm:text-sm font-medium",
          trend >= 0 ? "text-success" : "text-destructive"
        )}>
          {trend >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
          <span>{trend >= 0 ? "+" : ""}{trend}%</span>
          {trendLabel && <span className="text-muted-foreground font-normal">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
