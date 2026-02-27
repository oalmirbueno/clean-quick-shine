import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export function ServiceCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  className 
}: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-5 bg-card rounded-2xl border border-border/50",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "hover:border-primary/30 hover:bg-accent/50 active:scale-[0.98] hover-lift",
        "min-h-[110px] w-full text-center group",
        className
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {description && (
        <span className="text-xs text-muted-foreground mt-0.5">{description}</span>
      )}
    </button>
  );
}
