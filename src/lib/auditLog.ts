import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "client_blocked"
  | "client_unblocked"
  | "pro_approved"
  | "pro_rejected"
  | "pro_suspended"
  | "pro_reactivated"
  | "doc_approved"
  | "doc_rejected"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_completed"
  | "notification_sent"
  | "notification_marked_read";

export type AuditTarget = "client" | "pro" | "withdrawal" | "document" | "order" | "notification";

interface LogParams {
  action: AuditAction;
  targetType: AuditTarget;
  targetId?: string | null;
  targetName?: string | null;
  reason?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Records an admin action in the audit log.
 * Fails silently (logs to console) so audit failures never block the main mutation.
 */
export async function logAdminAction(params: LogParams) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const adminId = auth.user?.id;
    if (!adminId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", adminId)
      .maybeSingle();

    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      admin_name: profile?.full_name || auth.user?.email || "Admin",
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId ?? null,
      target_name: params.targetName ?? null,
      reason: params.reason ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.warn("[audit] failed to log admin action", err);
  }
}
