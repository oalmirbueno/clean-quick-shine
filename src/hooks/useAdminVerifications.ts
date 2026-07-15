import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/auditLog";

const REQUIRED = ["id_front", "id_back", "selfie"] as const;
const client = supabase as any;

export interface VerificationRow {
  userId: string;
  name: string;
  phone: string | null;
  requiredApproved: number;
  requiredTotal: number;
  requiredPending: number;
  hasRejected: boolean;
  verified: boolean;
  threadId: string | null;
  unreadAdmin: number;
  lastMessageAt: string | null;
  lastDocAt: string | null;
  latestDocs: Record<string, { id: string; status: string; file_url: string; created_at: string }>;
}

export function useAdminVerifications() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["admin_verifications"],
    queryFn: async (): Promise<VerificationRow[]> => {
      const { data: docs, error: docsErr } = await client
        .from("pro_documents")
        .select("id,user_id,doc_type,status,file_url,created_at")
        .order("created_at", { ascending: false });
      if (docsErr) throw docsErr;

      const userIds = Array.from(new Set((docs || []).map((d: any) => d.user_id)));
      if (userIds.length === 0) return [];

      const [{ data: profiles }, { data: proProfiles }, { data: threads }] = await Promise.all([
        client.from("profiles").select("user_id, full_name, phone").in("user_id", userIds),
        client.from("pro_profiles").select("user_id, verified").in("user_id", userIds),
        client.from("verification_threads").select("*").in("user_id", userIds),
      ]);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const proMap = new Map((proProfiles || []).map((p: any) => [p.user_id, p]));
      const threadMap = new Map((threads || []).map((t: any) => [t.user_id, t]));

      const grouped = new Map<string, any[]>();
      (docs || []).forEach((d: any) => {
        const arr = grouped.get(d.user_id) || [];
        arr.push(d);
        grouped.set(d.user_id, arr);
      });

      const rows: VerificationRow[] = [];
      grouped.forEach((userDocs, userId) => {
        // pick latest doc per type
        const latestByType: Record<string, any> = {};
        userDocs.forEach((d) => {
          if (!latestByType[d.doc_type]) latestByType[d.doc_type] = d;
        });
        const required = REQUIRED.map((t) => latestByType[t]).filter(Boolean);
        const requiredApproved = required.filter((d) => d.status === "approved").length;
        const requiredPending = required.filter((d) => d.status === "pending").length;
        const hasRejected = required.some((d) => d.status === "rejected");
        const profile = profileMap.get(userId) as any;
        const proProfile = proMap.get(userId) as any;
        const thread = threadMap.get(userId) as any;

        rows.push({
          userId,
          name: profile?.full_name || "Sem nome",
          phone: profile?.phone || null,
          requiredApproved,
          requiredTotal: REQUIRED.length,
          requiredPending,
          hasRejected,
          verified: !!proProfile?.verified,
          threadId: thread?.id || null,
          unreadAdmin: thread?.unread_admin || 0,
          lastMessageAt: thread?.last_message_at || null,
          lastDocAt: userDocs[0]?.created_at || null,
          latestDocs: latestByType,
        });
      });

      // Sort: pending first, then rejected, then verified last
      return rows.sort((a, b) => {
        const score = (r: VerificationRow) =>
          r.requiredPending > 0 ? 0 : r.hasRejected ? 1 : r.verified ? 3 : 2;
        const s = score(a) - score(b);
        if (s !== 0) return s;
        return (b.lastDocAt || "").localeCompare(a.lastDocAt || "");
      });
    },
  });

  const approve = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await client.rpc("admin_approve_verification", { p_user_id: userId });
      if (error) throw error;
      await logAdminAction({
        action: "pro_approved",
        targetType: "pro",
        targetId: userId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_verifications"] });
      qc.invalidateQueries({ queryKey: ["admin_documents"] });
      qc.invalidateQueries({ queryKey: ["admin_all_pros"] });
      toast.success("Verificação aprovada");
    },
    onError: (e: any) => toast.error("Erro ao aprovar: " + (e?.message || "")),
  });

  const reject = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await client.rpc("admin_reject_verification", {
        p_user_id: userId,
        p_reason: reason,
      });
      if (error) throw error;
      await logAdminAction({
        action: "pro_rejected",
        targetType: "pro",
        targetId: userId,
        reason,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_verifications"] });
      qc.invalidateQueries({ queryKey: ["admin_documents"] });
      qc.invalidateQueries({ queryKey: ["admin_all_pros"] });
      toast.success("Verificação recusada");
    },
    onError: (e: any) => toast.error("Erro ao recusar: " + (e?.message || "")),
  });

  const pendingCount = useMemo(
    () => (query.data || []).filter((r) => r.requiredPending > 0).length,
    [query.data]
  );

  return {
    rows: query.data || [],
    isLoading: query.isLoading,
    approve: approve.mutate,
    reject: reject.mutate,
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
    pendingCount,
  };
}
