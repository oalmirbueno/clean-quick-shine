import { useQueryClient } from "@tanstack/react-query";

/**
 * Concurrency control: monotonic version tokens per scope.
 * When multiple admin actions hit the same entity in quick succession,
 * only the LAST started mutation may rollback or trigger invalidation —
 * stale responses are dropped to preserve the most recent optimistic state.
 */
const mutationVersions = new Map<string, number>();
let _seq = 0;

export function beginMutation(scope: string): number {
  const token = ++_seq;
  mutationVersions.set(scope, token);
  return token;
}

export function isLatestMutation(scope: string, token: number): boolean {
  return mutationVersions.get(scope) === token;
}

/** Convenience scope builders to avoid typos across callers. */
export const mutationScopes = {
  pro: (id?: string) => `pro:${id ?? "_"}`,
  client: (id?: string) => `client:${id ?? "_"}`,
  withdrawal: (id?: string) => `withdrawal:${id ?? "_"}`,
  withdrawalsBulk: () => `withdrawals:bulk`,
};


/**
 * Centralizes all React Query keys used in the Admin panel.
 * Use these instead of inline string arrays to keep lists, details
 * and dashboard stats in sync after mutations.
 */
export const adminKeys = {
  dashboard: () => ["admin_dashboard_stats"] as const,
  notifications: () => ["admin_notifications"] as const,

  // Clients
  allClients: () => ["admin_all_clients_v2"] as const,
  clientDetail: (id?: string) => ["admin_client_detail", id] as const,

  // Pros
  allPros: () => ["admin_all_pros"] as const,
  proDetail: (id?: string) => ["admin_pro_detail", id] as const,
  proDocs: (id?: string) => ["admin_pro_docs", id] as const,
  proOrders: (id?: string) => ["admin_pro_orders", id] as const,
  pendingDocs: () => ["admin_pending_docs"] as const,

  // Withdrawals
  withdrawalsList: () => ["admin_withdrawals_list"] as const,
  withdrawalsLegacy: () => ["admin_withdrawals"] as const,
  withdrawalDetail: (id?: string) => ["admin_withdrawal_detail", id] as const,

  // Orders
  allOrders: () => ["admin_all_orders"] as const,
  orderDetail: (id?: string) => ["admin_order_detail", id] as const,

  // Risk
  riskActions: () => ["admin_risk_actions"] as const,
  riskFlags: () => ["admin_risk_flags"] as const,
} as const;

/**
 * Hook returning grouped invalidators that refresh every related cache
 * after admin mutations — keeps lists, details and dashboard consistent.
 */
export function useAdminInvalidate() {
  const qc = useQueryClient();

  return {
    qc,
    /** Invalidate everything tied to a specific client + global lists */
    client: (id?: string) => {
      qc.invalidateQueries({ queryKey: adminKeys.clientDetail(id) });
      qc.invalidateQueries({ queryKey: adminKeys.allClients() });
      qc.invalidateQueries({ queryKey: adminKeys.riskActions() });
      qc.invalidateQueries({ queryKey: adminKeys.riskFlags() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
    /** Invalidate everything tied to a specific pro (diarista) */
    pro: (id?: string) => {
      qc.invalidateQueries({ queryKey: adminKeys.proDetail(id) });
      qc.invalidateQueries({ queryKey: adminKeys.proDocs(id) });
      qc.invalidateQueries({ queryKey: adminKeys.proOrders(id) });
      qc.invalidateQueries({ queryKey: adminKeys.allPros() });
      qc.invalidateQueries({ queryKey: adminKeys.pendingDocs() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
    /** Invalidate withdrawals list + optional detail */
    withdrawals: (id?: string) => {
      if (id) qc.invalidateQueries({ queryKey: adminKeys.withdrawalDetail(id) });
      qc.invalidateQueries({ queryKey: adminKeys.withdrawalsList() });
      qc.invalidateQueries({ queryKey: adminKeys.withdrawalsLegacy() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
    /** Invalidate orders list + optional detail */
    orders: (id?: string) => {
      if (id) qc.invalidateQueries({ queryKey: adminKeys.orderDetail(id) });
      qc.invalidateQueries({ queryKey: adminKeys.allOrders() });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
    /** Notifications tab */
    notifications: () => {
      qc.invalidateQueries({ queryKey: adminKeys.notifications() });
    },
  };
}
