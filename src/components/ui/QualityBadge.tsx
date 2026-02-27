import { cn } from "@/lib/utils";
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { QualityLevel } from "@/lib/types";

interface QualityBadgeProps {
  level: QualityLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const levelConfig: Record<QualityLevel, { 
  label: string; 
  bgColor: string; 
  textColor: string;
  borderColor: string;
  icon: typeof TrendingUp;
  description: string;
}> = {
  A: { 
    label: "Excelente", 
    bgColor: "bg-success/10", 
    textColor: "text-success",
    borderColor: "border-success/30",
    icon: TrendingUp,
    description: "Máxima prioridade"
  },
  B: { 
    label: "Bom", 
    bgColor: "bg-primary/10", 
    textColor: "text-primary",
    borderColor: "border-primary/30",
    icon: TrendingUp,
    description: "Prioridade normal"
  },
  C: { 
    label: "Regular", 
    bgColor: "bg-warning/10", 
    textColor: "text-warning",
    borderColor: "border-warning/30",
    icon: Minus,
    description: "Melhore sua pontuação"
  },
  D: { 
    label: "Atenção", 
    bgColor: "bg-destructive/10", 
    textColor: "text-destructive",
    borderColor: "border-destructive/30",
    icon: TrendingDown,
    description: "Risco de suspensão"
  },
};

const sizeConfig = {
  sm: { badge: "w-6 h-6 text-sm", icon: "w-3 h-3" },
  md: { badge: "w-8 h-8 text-base", icon: "w-4 h-4" },
  lg: { badge: "w-12 h-12 text-xl", icon: "w-5 h-5" },
};

export function QualityBadge({ level, showLabel = false, size = "md", className }: QualityBadgeProps) {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold border-2",
          config.bgColor,
          config.textColor,
          config.borderColor,
          sizes.badge
        )}
      >
        {level}
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-medium text-sm", config.textColor)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {config.description}
          </span>
        </div>
      )}
    </div>
  );
}

export function QualityCard({ level, metrics }: { level: QualityLevel; metrics: { onTimeRate: number; cancelRate: number; responseTimeAvg: number } }) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-xl border-2", config.bgColor, config.borderColor)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl", config.bgColor, config.textColor)}>
            {level}
          </div>
          <div>
            <p className={cn("font-semibold", config.textColor)}>{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Icon className={cn("w-6 h-6", config.textColor)} />
      </div>
      
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{metrics.onTimeRate}%</p>
          <p className="text-xs text-muted-foreground">Pontualidade</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{metrics.cancelRate}%</p>
          <p className="text-xs text-muted-foreground">Cancelamentos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{metrics.responseTimeAvg}min</p>
          <p className="text-xs text-muted-foreground">Resposta</p>
        </div>
      </div>
    </div>
  );
}
