import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, User, Calendar, Banknote } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminWithdrawalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: withdrawal } = useQuery({
    queryKey: ["admin_withdrawal_detail", id],
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
    },
    onSuccess: (_, newStatus) => {
      toast.success(`Saque marcado como ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin_withdrawal_detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin_withdrawals"] });
    },
    onError: () => toast.error("Erro ao atualizar saque"),
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
            <div><p className="text-sm text-muted-foreground">Valor</p><p className="font-medium text-foreground">{fmt(withdrawal.amount)}</p></div>
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
            <div className="text-sm text-muted-foreground">Asaas ID: {withdrawal.asaas_transfer_id}</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Ações</h3>
          <div className="space-y-2">
            {withdrawal.status === "pending" && (
              <>
                <PrimaryButton fullWidth onClick={() => updateStatus.mutate("processing")} loading={updateStatus.isPending}>
                  Marcar como Processando
                </PrimaryButton>
                <PrimaryButton fullWidth variant="outline" onClick={() => updateStatus.mutate("rejected")} loading={updateStatus.isPending}>
                  Rejeitar Saque
                </PrimaryButton>
              </>
            )}
            {withdrawal.status === "processing" && (
              <>
                <PrimaryButton fullWidth onClick={() => updateStatus.mutate("completed")} loading={updateStatus.isPending}>
                  Marcar como Concluído
                </PrimaryButton>
                <PrimaryButton fullWidth variant="outline" onClick={() => updateStatus.mutate("rejected")} loading={updateStatus.isPending}>
                  Rejeitar Saque
                </PrimaryButton>
              </>
            )}
            {(withdrawal.status === "completed" || withdrawal.status === "rejected") && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Este saque já foi {withdrawal.status === "completed" ? "concluído" : "rejeitado"}.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
