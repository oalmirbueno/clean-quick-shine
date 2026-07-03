/**
 * Máquina de estados de pedidos — espelho da trava aplicada no banco (C1).
 *
 * FONTE DE VERDADE = trigger `validate_order_change()` em public.orders
 * (migration de 2026-07-02). Esta função replica a MESMA lógica em TS para:
 *  - documentar de forma executável quais UPDATEs são permitidos;
 *  - permitir pré-validar no cliente antes de bater no banco (melhor UX);
 *  - travar por testes qualquer regressão na regra.
 *
 * Se a regra do banco mudar, ESTE arquivo e seus testes devem mudar junto.
 */

export type OrderStatus =
  | "draft" | "scheduled" | "matching" | "confirmed" | "en_route"
  | "in_progress" | "completed" | "rated" | "paid_out" | "cancelled" | "in_review";

export interface OrderUpdateContext {
  /** admin ou service role (edge functions/webhook): passa livre */
  privileged: boolean;
  /** id do usuário executando o UPDATE (auth.uid()) */
  uid: string;
  /** dono do pedido (OLD.client_id) */
  clientId: string;
  /** OLD.pro_id */
  oldProId: string | null;
  /** NEW.pro_id */
  newProId: string | null;
  /** has_role(uid, 'pro') */
  hasProRole: boolean;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  /** colunas efetivamente alteradas, EXCLUINDO updated_at */
  changed: string[];
  /** NEW.client_rating (para a ação de avaliar) */
  clientRating?: number | null;
}

const CLIENT_CANCELLABLE: OrderStatus[] = [
  "draft", "scheduled", "matching", "confirmed", "en_route", "in_progress",
];

/** true se todas as colunas alteradas estão dentro do conjunto permitido */
function changedSubsetOf(changed: string[], allowed: string[]): boolean {
  return changed.every((c) => allowed.includes(c));
}

/**
 * Retorna true se o UPDATE é permitido pela máquina de estados.
 * Deny-by-default: qualquer caso não previsto retorna false.
 */
export function isOrderUpdateAllowed(ctx: OrderUpdateContext): boolean {
  // Admin / service role: bypass total
  if (ctx.privileged) return true;

  // Nenhuma coluna mudou (no-op): permitido
  if (ctx.changed.length === 0) return true;

  // AÇÃO 1 — Cliente cancela (só a coluna status)
  if (
    ctx.uid === ctx.clientId &&
    ctx.newStatus === "cancelled" &&
    CLIENT_CANCELLABLE.includes(ctx.oldStatus) &&
    changedSubsetOf(ctx.changed, ["status"])
  ) {
    return true;
  }

  // AÇÃO 2 — Cliente avalia: completed → rated (status + avaliação, nota 1..5)
  if (
    ctx.uid === ctx.clientId &&
    ctx.oldStatus === "completed" &&
    ctx.newStatus === "rated" &&
    changedSubsetOf(ctx.changed, ["status", "client_rating", "client_review"]) &&
    ctx.clientRating != null &&
    ctx.clientRating >= 1 &&
    ctx.clientRating <= 5
  ) {
    return true;
  }

  // AÇÃO 3 — Diarista (role pro) aceita pedido sem dono (pro_id + status)
  if (
    ctx.oldProId === null &&
    ctx.newProId === ctx.uid &&
    ctx.hasProRole &&
    (ctx.oldStatus === "scheduled" || ctx.oldStatus === "matching") &&
    ctx.newStatus === "confirmed" &&
    changedSubsetOf(ctx.changed, ["pro_id", "status"])
  ) {
    return true;
  }

  // AÇÃO 4 — Diarista atribuída progride
  if (ctx.uid === ctx.oldProId) {
    if (
      ctx.oldStatus === "confirmed" && ctx.newStatus === "en_route" &&
      changedSubsetOf(ctx.changed, ["status"])
    ) return true;
    if (
      ctx.oldStatus === "en_route" && ctx.newStatus === "in_progress" &&
      changedSubsetOf(ctx.changed, ["status"])
    ) return true;
    if (
      ctx.oldStatus === "in_progress" && ctx.newStatus === "completed" &&
      changedSubsetOf(ctx.changed, ["status", "completed_at"])
    ) return true;
  }

  // Deny-by-default
  return false;
}
