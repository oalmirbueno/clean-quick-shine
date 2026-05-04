import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowDownToLine, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<null | "approve" | "reject" | "complete">(null);

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ["admin_withdrawals_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [];
      const userIds = [...new Set(data.map((w) => w.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const map = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);
      return data.map((w) => ({ ...w, proName: map.get(w.user_id) || "Diarista" }));
    },
  });

  const fmt = (v: number) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
  const pendingCount = withdrawals.filter((w: any) => w.status === "pending").length;
  const processingCount = withdrawals.filter((w: any) => w.status === "processing").length;

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const bulkUpdate = useMutation({
    mutationFn: async (action: "approve" | "reject" | "complete") => {
      const ids = Array.from(selected);
      const newStatus = action === "approve" ? "processing" : action === "reject" ? "rejected" : "completed";
      const updates: any = { status: newStatus };
      if (newStatus === "completed") updates.processed_at = new Date().toISOString();
      const { error } = await supabase.from("withdrawals").update(updates).in("id", ids);
      if (error) throw error;
      // Notify pros
      const affected = withdrawals.filter((w: any) => selected.has(w.id));
      const notifs = affected.map((w: any) => ({
        user_id: w.user_id,
        title: action === "approve" ? "Saque em processamento" : action === "complete" ? "Saque concluído ✅" : "Saque rejeitado",
        message: action === "approve" ? `Seu saque de ${fmt(w.amount)} está sendo processado.` : action === "complete" ? `Saque de ${fmt(w.amount)} concluído.` : `Saque de ${fmt(w.amount)} rejeitado. Valor devolvido ao saldo.`,
        type: action === "reject" ? "warning" : "success",
      }));
      if (notifs.length) await supabase.from("notifications").insert(notifs);
    },
    onSuccess: (_, action) => {
      const labels: any = { approve: "aprovados", reject: "rejeitados", complete: "concluídos" };
      toast.success(`${selected.size} saques ${labels[action]}`);
      setSelected(new Set());
      setBulkConfirm(null);
      qc.invalidateQueries({ queryKey: ["admin_withdrawals_list"] });
      qc.invalidateQueries({ queryKey: ["admin_withdrawals"] });
      qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
    },
    onError: (e: any) => { toast.error(e.message); setBulkConfirm(null); },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Saques</h1>
          <p className="text-sm text-muted-foreground">Gerencie solicitações</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ArrowDownToLine className="w-5 h-5 text-primary" />
        </div>
      </div>

      {(pendingCount > 0 || processingCount > 0) && (
        <div className="flex gap-2 flex-wrap">
          {pendingCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/20">
              <span className="text-xs font-medium text-warning">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
            </div>
          )}
          {processingCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">{processingCount} em processamento</span>
            </div>
          )}
        </div>
      )}

      {selected.size > 0 && (
        <div className="sticky top-2 z-10 bg-card border border-border/60 rounded-2xl p-3 shadow-md flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium mr-auto">{selected.size} selecionado(s)</span>
          <PrimaryButton size="sm" onClick={() => setBulkConfirm("approve")}>
            <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
          </PrimaryButton>
          <PrimaryButton size="sm" variant="success" onClick={() => setBulkConfirm("complete")}>
            Concluir
          </PrimaryButton>
          <PrimaryButton size="sm" variant="outline" onClick={() => setBulkConfirm("reject")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <XCircle className="w-4 h-4 mr-1" /> Rejeitar
          </PrimaryButton>
          <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground underline">Limpar</button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-card rounded-2xl border border-border/60 p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/60 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <ArrowDownToLine className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhum saque</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(w.id)}
                    onChange={() => toggle(w.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-4 h-4 accent-primary"
                  />
                  <div className="flex-1 min-w-0" onClick={() => navigate(`/admin/withdrawals/${w.id}`)}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">{w.proName}</span>
                      <StatusBadge status={w.status || "pending"} />
                    </div>
                    <p className="text-lg font-bold text-foreground">{fmt(w.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{w.method?.toUpperCase()} • {new Date(w.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Diarista</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Método</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w: any) => (
                    <tr key={w.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(w.id)} onChange={() => toggle(w.id)} className="w-4 h-4 accent-primary" />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium cursor-pointer" onClick={() => navigate(`/admin/withdrawals/${w.id}`)}>{w.proName}</td>
                      <td className="px-4 py-3 text-sm font-semibold cursor-pointer" onClick={() => navigate(`/admin/withdrawals/${w.id}`)}>{fmt(w.amount)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground uppercase">{w.method}</td>
                      <td className="px-4 py-3"><StatusBadge status={w.status || "pending"} /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!bulkConfirm}
        onClose={() => setBulkConfirm(null)}
        onConfirm={() => bulkConfirm && bulkUpdate.mutate(bulkConfirm)}
        title={
          bulkConfirm === "approve" ? "Aprovar saques selecionados" :
          bulkConfirm === "complete" ? "Concluir saques selecionados" :
          "Rejeitar saques selecionados"
        }
        description={`${selected.size} saque(s) serão atualizados e os profissionais notificados.`}
        confirmText="Confirmar"
        variant={bulkConfirm === "reject" ? "danger" : "default"}
        loading={bulkUpdate.isPending}
      />
    </AdminLayout>
  );
}
