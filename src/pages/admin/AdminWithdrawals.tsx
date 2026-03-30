import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowDownToLine, Loader2 } from "lucide-react";

export default function AdminWithdrawals() {
  const navigate = useNavigate();

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ["admin_withdrawals_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];
      const userIds = [...new Set(data.map(w => w.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const map = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      return data.map(w => ({ ...w, proName: map.get(w.user_id) || "Diarista" }));
    },
  });

  const fmt = (v: number) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

  const pendingCount = withdrawals.filter((w: any) => w.status === "pending").length;
  const processingCount = withdrawals.filter((w: any) => w.status === "processing").length;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saques</h1>
          <p className="text-sm text-muted-foreground">Gerencie solicitações de saque das diaristas</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ArrowDownToLine className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Summary pills */}
      {(pendingCount > 0 || processingCount > 0) && (
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <div className="px-4 py-2 rounded-xl bg-warning/10 border border-warning/20">
              <span className="text-sm font-medium text-warning">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
            </div>
          )}
          {processingCount > 0 && (
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">{processingCount} em processamento</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <ArrowDownToLine className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">Nenhum saque</p>
            <p className="text-sm text-muted-foreground mt-1">Solicitações de saque aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diarista</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Método</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w: any) => (
                  <tr
                    key={w.id}
                    onClick={() => navigate(`/admin/withdrawals/${w.id}`)}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 text-sm font-mono font-medium text-foreground">#{w.id.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{w.proName}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-foreground">{fmt(w.amount)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground uppercase">{w.method}</td>
                    <td className="px-5 py-4"><StatusBadge status={w.status || "pending"} /></td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
