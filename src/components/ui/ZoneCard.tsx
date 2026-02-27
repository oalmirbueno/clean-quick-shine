import { cn } from "@/lib/utils";
import { MapPin, Users, TrendingUp, Settings } from "lucide-react";
import type { Zone, ZoneRule } from "@/lib/types";

interface ZoneCardProps {
  zone: Zone;
  rule?: ZoneRule;
  prosOnline?: number;
  onClick?: () => void;
  className?: string;
}

export function ZoneCard({ zone, rule, prosOnline = 0, onClick, className }: ZoneCardProps) {
  const hasCapacity = rule ? prosOnline >= rule.minProsOnline : true;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 bg-card rounded-xl border text-left transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md",
        !zone.active && "opacity-60",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            zone.active ? "bg-primary/10" : "bg-muted"
          )}>
            <MapPin className={cn("w-4 h-4", zone.active ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{zone.name}</h3>
            <p className="text-xs text-muted-foreground">Raio: {zone.radiusKm}km</p>
          </div>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          zone.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        )}>
          {zone.active ? "Ativa" : "Inativa"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-secondary/50 rounded-lg">
          <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className={cn("text-sm font-medium", hasCapacity ? "text-success" : "text-destructive")}>
            {prosOnline}
          </p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded-lg">
          <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-medium text-foreground">
            {rule?.surgeMultiplier ? `${rule.surgeMultiplier}x` : "1x"}
          </p>
          <p className="text-xs text-muted-foreground">Surge</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded-lg">
          <Settings className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-sm font-medium text-foreground">
            +R$ {(zone.feeExtra || 0).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">Taxa</p>
        </div>
      </div>
    </button>
  );
}
