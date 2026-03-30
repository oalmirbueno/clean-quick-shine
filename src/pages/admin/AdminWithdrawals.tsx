import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowDownToLine } from "lucide-react";

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

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saques</h1>
          <p className="text-muted-foreground">Gerencie solicitações de saque</p>
        </div>
        <ArrowDownToLine className="w-6 h-6 text-muted-foreground" />
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Diarista</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Método</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w: any) => (
                <tr
                  key={w.id}
                  onClick={() => navigate(`/admin/withdrawals/${w.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">#{w.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{w.proName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{fmt(w.amount)}</td>
                  <td className="px-4 py-3 text-sm text-foreground uppercase">{w.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.status || "pending"} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && withdrawals.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Nenhum saque encontrado</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
