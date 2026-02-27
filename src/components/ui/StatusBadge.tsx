import { cn } from "@/lib/utils";
import type { OrderStatus, ProVerifiedStatus, WithdrawalStatus, PaymentStatus, TicketStatus } from "@/lib/types";

type BadgeStatus = OrderStatus | ProVerifiedStatus | WithdrawalStatus | PaymentStatus | TicketStatus | "active" | "suspended" | "blocked" | "free" | "pro";

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  // Order statuses
  draft: { label: "Rascunho", variant: "bg-muted text-muted-foreground" },
  scheduled: { label: "Agendado", variant: "bg-accent text-accent-foreground" },
  matching: { label: "Buscando", variant: "bg-warning/10 text-warning" },
  confirmed: { label: "Confirmado", variant: "bg-primary/10 text-primary" },
  en_route: { label: "A caminho", variant: "bg-primary/10 text-primary" },
  in_progress: { label: "Em andamento", variant: "bg-warning/10 text-warning" },
  completed: { label: "Concluído", variant: "bg-success/10 text-success" },
  rated: { label: "Avaliado", variant: "bg-success/10 text-success" },
  paid_out: { label: "Pago", variant: "bg-success/10 text-success" },
  cancelled: { label: "Cancelado", variant: "bg-destructive/10 text-destructive" },
  in_review: { label: "Em análise", variant: "bg-warning/10 text-warning" },
  
  // Verification statuses
  pending: { label: "Pendente", variant: "bg-warning/10 text-warning" },
  approved: { label: "Aprovado", variant: "bg-success/10 text-success" },
  rejected: { label: "Reprovado", variant: "bg-destructive/10 text-destructive" },
  
  // User statuses
  active: { label: "Ativo", variant: "bg-success/10 text-success" },
  suspended: { label: "Suspenso", variant: "bg-warning/10 text-warning" },
  blocked: { label: "Bloqueado", variant: "bg-destructive/10 text-destructive" },
  
  // Plan
  free: { label: "Free", variant: "bg-muted text-muted-foreground" },
  pro: { label: "PRO", variant: "bg-primary/10 text-primary" },
  
  // Payment
  authorized: { label: "Autorizado", variant: "bg-primary/10 text-primary" },
  held: { label: "Retido", variant: "bg-warning/10 text-warning" },
  released: { label: "Liberado", variant: "bg-success/10 text-success" },
  refunded: { label: "Reembolsado", variant: "bg-destructive/10 text-destructive" },
  
  // Withdrawal
  requested: { label: "Solicitado", variant: "bg-warning/10 text-warning" },
  paid: { label: "Pago", variant: "bg-success/10 text-success" },

  // Ticket
  open: { label: "Aberto", variant: "bg-warning/10 text-warning" },
  resolved: { label: "Resolvido", variant: "bg-success/10 text-success" },
  closed: { label: "Fechado", variant: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "bg-muted text-muted-foreground" };
  
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
