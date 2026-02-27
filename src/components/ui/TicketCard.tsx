import { cn } from "@/lib/utils";
import { MessageCircle, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { TicketStatus, TicketPriority } from "@/lib/types";

interface TicketCardProps {
  id: string;
  subject: string;
  createdBy: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastMessage?: string;
  orderId?: string;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: "Aberto", color: "bg-warning/10 text-warning", icon: Clock },
  in_progress: { label: "Em andamento", color: "bg-primary/10 text-primary", icon: MessageCircle },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success", icon: CheckCircle2 },
  closed: { label: "Fechado", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-muted text-muted-foreground" },
  medium: { label: "Média", color: "bg-warning/10 text-warning" },
  high: { label: "Alta", color: "bg-destructive/10 text-destructive" },
};

export function TicketCard({
  subject,
  createdBy,
  status,
  priority,
  createdAt,
  lastMessage,
  orderId,
  onClick,
  className,
}: TicketCardProps) {
  const statusCfg = statusConfig[status] || statusConfig.open;
  const priorityCfg = priorityConfig[priority] || priorityConfig.low;
  const StatusIcon = statusCfg.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 bg-card rounded-xl border border-border text-left",
        "card-shadow hover:card-shadow-hover transition-all duration-200",
        "hover:border-primary/20 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-foreground line-clamp-1">{subject}</h3>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
          statusCfg.color
        )}>
          {statusCfg.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className="text-muted-foreground">{createdBy}</span>
        {orderId && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Pedido #{orderId}</span>
          </>
        )}
      </div>

      {lastMessage && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {lastMessage}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium",
          priorityCfg.color
        )}>
          {priorityCfg.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </button>
  );
}
