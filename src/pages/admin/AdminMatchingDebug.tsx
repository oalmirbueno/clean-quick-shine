import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ChevronLeft, Cpu, Search, MapPin, Star, Check, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminMatchingDebug() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const { data: matchingLogs = [] } = useQuery({
    queryKey: ["admin_matching_logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("matching_logs")
        .select("*, orders(scheduled_date, scheduled_time, client_id, services(name))")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const selectedLogData = matchingLogs.find((l: any) => l.id === selectedLog) || matchingLogs[0];

  const getPlanBadge = (plan: string) => {
    if (plan === "elite") return <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded text-xs font-medium flex items-center gap-0.5"><Sparkles className="w-3 h-3" /> ELITE</span>;
    if (plan === "pro") return <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-0.5"><Crown className="w-3 h-3" /> PRO</span>;
    return <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">FREE</span>;
  };

  return (
    <AdminLayout>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/orders")} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-7 h-7 text-primary" />Matching Debug
          </h1>
          <p className="text-muted-foreground">Visualize o algoritmo de distribuição de pedidos</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Buscar pedido..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {matchingLogs.map((log: any) => (
                <button key={log.id} onClick={() => setSelectedLog(log.id)} className={cn("w-full p-4 text-left border-b border-border transition-colors", selectedLog === log.id ? "bg-accent" : "hover:bg-accent/50")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">#{log.order_id.slice(0, 8)}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{(log as any).orders?.services?.name || "Serviço"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-primary font-medium">{Array.isArray(log.candidates) ? log.candidates.length : 0} candidatos</span>
                    {log.chosen_pro_id && <span className="text-xs text-success">✓ Atribuído</span>}
                  </div>
                </button>
              ))}
              {matchingLogs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">Nenhum log de matching encontrado</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedLogData ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado do matching</p>
                    <p className="font-semibold text-foreground">{selectedLogData.reason || "Sem detalhes"}</p>
                  </div>
                  {selectedLogData.chosen_pro_id && (
                    <div className="flex items-center gap-2"><Check className="w-5 h-5 text-success" /><span className="text-success font-medium">Sucesso</span></div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Ranking de Candidatos</h3>
                </div>
                <div className="divide-y divide-border">
                  {Array.isArray(selectedLogData.candidates) && (selectedLogData.candidates as any[])
                    .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                    .map((candidate: any, index: number) => {
                      const isChosen = candidate.proId === selectedLogData.chosen_pro_id;
                      return (
                        <div key={candidate.proId || index} className={cn("p-4 flex items-center gap-4", isChosen && "bg-success/10")}>
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", index === 0 ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground")}>{index + 1}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{candidate.proName || "Pro"}</span>
                              {candidate.plan && getPlanBadge(candidate.plan)}
                              {isChosen && <span className="px-2 py-0.5 bg-success text-success-foreground rounded text-xs font-medium">Escolhida</span>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(candidate.distanceKm || 0).toFixed(1)} km</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{(candidate.rating || 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{candidate.score || 0}</p>
                            <p className="text-xs text-muted-foreground">score</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-card rounded-xl border border-border text-center">
              <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione um log para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
