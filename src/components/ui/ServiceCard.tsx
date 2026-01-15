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
        "flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border",
        "card-shadow hover:card-shadow-hover transition-all duration-200",
        "hover:border-primary/20 active:scale-[0.98]",
        "min-h-[100px] w-full text-center",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
      {description && (
        <span className="text-xs text-muted-foreground mt-1">{description}</span>
      )}
    </button>
  );
}
