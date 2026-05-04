import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, User, Calendar, Banknote, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { adminKeys, useAdminInvalidate, beginMutation, isLatestMutation, mutationScopes } from "@/hooks/useAdminQueryKeys";
import { logAdminAction, type AuditAction } from "@/lib/auditLog";

const statusActionMap: Record<string, { label: string; description: string; variant?: "primary" | "outline" }[]> = {
  pending: [
    {
      label: "Aprovar e Processar",
      description: "Marca o saque como em processamento. A transferência Pix será iniciada.",
      variant: "primary",
    },
    {
      label: "Rejeitar Saque",
      description: "O valor será devolvido ao saldo disponível da diarista.",
      variant: "outline",
    },
  ],
  processing: [
    {
      label: "Confirmar Transferência",
      description: "Confirma que o Pix foi concluído. O valor sai do saldo da diarista definitivamente.",
      variant: "primary",
    },
    {
      label: "Rejeitar Saque",
      description: "A transferência falhou. O valor retorna ao saldo disponível da diarista.",
      variant: "outline",
    },
  ],
};

const statusTargetMap: Record<string, string[]> = {
  pending: ["processing", "rejected"],
  processing: ["completed", "rejected"],
};

export default function AdminWithdrawalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { qc: queryClient, withdrawals: invalidateWithdrawals } = useAdminInvalidate();
  const [confirmAction, setConfirmAction] = useState<{ status: string; label: string; description: string } | null>(null);

  const { data: withdrawal } = useQuery({
    queryKey: adminKeys.withdrawalDetail(id),
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").eq("id", id!).single();
      if (!data) return null;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", data.user_id).single();
      return { ...data, proName: profile?.full_name || "Diarista" };
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus };
      if (newStatus === "completed") updates.processed_at = new Date().toISOString();
      const { error } = await supabase.from("withdrawals").update(updates).eq("id", id!);
      if (error) throw error;
      const auditAction: AuditAction = newStatus === "processing" ? "withdrawal_approved" : newStatus === "completed" ? "withdrawal_completed" : "withdrawal_rejected";
      await logAdminAction({
        action: auditAction,
        targetType: "withdrawal",
        targetId: id!,
        targetName: withdrawal?.proName,
        metadata: { amount: withdrawal?.amount, user_id: withdrawal?.user_id, new_status: newStatus },
      });
      if (withdrawal?.user_id) {
        const title = newStatus === "processing" ? "Saque em processamento" : newStatus === "completed" ? "Saque concluído ✅" : "Saque rejeitado";
        const amount = withdrawal.amount ? `R$ ${Number(withdrawal.amount).toFixed(2).replace(".", ",")}` : "";
        const message = newStatus === "processing"
          ? `Seu saque de ${amount} está sendo processado.`
          : newStatus === "completed"
            ? `Saque de ${amount} concluído.`
            : `Saque de ${amount} rejeitado. Valor devolvido ao saldo.`;
        const type = newStatus === "rejected" ? "warning" : "success";
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: { userId: withdrawal.user_id, title, message, type },
          });
        } catch {
          await supabase.from("notifications").insert({ user_id: withdrawal.user_id, title, message, type });
        }
      }
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.withdrawalDetail(id) });
      const prevDetail = queryClient.getQueryData<any>(adminKeys.withdrawalDetail(id));
      const prevList = queryClient.getQueryData<any[]>(adminKeys.withdrawalsList());
      const patch = { status: newStatus, processed_at: newStatus === "completed" ? new Date().toISOString() : prevDetail?.processed_at };
      if (prevDetail) queryClient.setQueryData(adminKeys.withdrawalDetail(id), { ...prevDetail, ...patch });
      if (prevList) queryClient.setQueryData<any[]>(adminKeys.withdrawalsList(), prevList.map((w) => (w.id === id ? { ...w, ...patch } : w)));
      return { prevDetail, prevList };
    },
    onSuccess: (_, newStatus) => {
      const msgs: Record<string, string> = {
        processing: "Saque aprovado e em processamento",
        completed: "Transferência confirmada com sucesso",
        rejected: "Saque rejeitado — saldo devolvido à diarista",
      };
      toast.success(msgs[newStatus] || `Status atualizado para ${newStatus}`);
      setConfirmAction(null);
    },
    onError: (_e, _newStatus, ctx: any) => {
      if (ctx?.prevDetail) queryClient.setQueryData(adminKeys.withdrawalDetail(id), ctx.prevDetail);
      if (ctx?.prevList) queryClient.setQueryData(adminKeys.withdrawalsList(), ctx.prevList);
      toast.error("Erro ao atualizar saque");
      setConfirmAction(null);
    },
    onSettled: () => invalidateWithdrawals(id),
  });

  if (!withdrawal) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Saque não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  const fmt = (v: number) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
  const actions = statusActionMap[withdrawal.status || ""] || [];
  const targets = statusTargetMap[withdrawal.status || ""] || [];

  return (
    <AdminLayout>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Saque #{withdrawal.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">Criado em {new Date(withdrawal.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <StatusBadge status={withdrawal.status || "pending"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-4 card-shadow space-y-4">
          <h3 className="font-semibold text-foreground">Informações</h3>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div><p className="text-sm text-muted-foreground">Diarista</p><p className="font-medium text-foreground">{withdrawal.proName}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div><p className="text-sm text-muted-foreground">Valor solicitado</p><p className="text-xl font-bold text-foreground">{fmt(withdrawal.amount)}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div><p className="text-sm text-muted-foreground">Método</p><p className="font-medium text-foreground uppercase">{withdrawal.method}</p></div>
          </div>
          {withdrawal.processed_at && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div><p className="text-sm text-muted-foreground">Processado em</p><p className="font-medium text-foreground">{new Date(withdrawal.processed_at).toLocaleDateString("pt-BR")}</p></div>
            </div>
          )}
          {withdrawal.asaas_transfer_id && (
            <div className="text-sm text-muted-foreground">ID transferência: {withdrawal.asaas_transfer_id}</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Ações</h3>

          {actions.length > 0 ? (
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div key={idx}>
                  <PrimaryButton
                    fullWidth
                    variant={action.variant || "primary"}
                    onClick={() => setConfirmAction({ status: targets[idx], label: action.label, description: action.description })}
                    loading={updateStatus.isPending}
                  >
                    {action.label}
                  </PrimaryButton>
                  <p className="text-xs text-muted-foreground mt-1 ml-1">{action.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Este saque já foi {withdrawal.status === "completed" ? "concluído ✓" : "rejeitado ✗"}.
              </p>
              {withdrawal.status === "rejected" && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  O valor foi devolvido ao saldo da diarista
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => updateStatus.mutate(confirmAction.status)}
          title={confirmAction.label}
          description={confirmAction.description}
          confirmText="Confirmar"
          loading={updateStatus.isPending}
        />
      )}
    </AdminLayout>
  );
}
