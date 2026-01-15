import { cn } from "@/lib/utils";

type OrderStatus = 
  | "draft" 
  | "scheduled" 
  | "matching" 
  | "confirmed" 
  | "in_progress" 
  | "completed" 
  | "rated";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: string }> = {
  draft: { label: "Rascunho", variant: "bg-muted text-muted-foreground" },
  scheduled: { label: "Agendado", variant: "bg-accent text-accent-foreground" },
  matching: { label: "Buscando", variant: "bg-warning/10 text-warning" },
  confirmed: { label: "Confirmado", variant: "bg-primary/10 text-primary" },
  in_progress: { label: "Em andamento", variant: "bg-warning/10 text-warning" },
  completed: { label: "Concluído", variant: "bg-success/10 text-success" },
  rated: { label: "Avaliado", variant: "bg-success/10 text-success" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.variant,
        className
      )}
    >
      {config.label}
    </span>
  );
}
