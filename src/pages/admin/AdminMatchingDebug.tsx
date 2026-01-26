import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { 
  ChevronLeft, 
  Cpu, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  TrendingUp,
  User,
  Check,
  X,
  Crown,
  Sparkles
} from "lucide-react";
import { matchingLogs, orders, pros } from "@/lib/mockDataV3";
import { cn } from "@/lib/utils";

export default function AdminMatchingDebug() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<string | null>(matchingLogs[0]?.id || null);

  // Filter logs
  const filteredLogs = matchingLogs.filter(log => {
    const order = orders.find(o => o.id === log.orderId);
    return !search || 
      order?.clientName.toLowerCase().includes(search.toLowerCase()) ||
      log.orderId.includes(search);
  });

  const selectedLogData = matchingLogs.find(l => l.id === selectedLog);
  const selectedOrder = selectedLogData ? orders.find(o => o.id === selectedLogData.orderId) : null;

  const getPlanBadge = (plan: string) => {
    if (plan === "elite") {
      return (
        <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded text-xs font-medium flex items-center gap-0.5">
          <Sparkles className="w-3 h-3" /> ELITE
        </span>
      );
    }
    if (plan === "pro") {
      return (
        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-0.5">
          <Crown className="w-3 h-3" /> PRO
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">FREE</span>
    );
  };

  return (
    <div className="min-h-screen bg-background flex safe-top">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/orders")}
              className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Cpu className="w-7 h-7 text-primary" />
                Matching Debug
              </h1>
              <p className="text-muted-foreground">Visualize o algoritmo de distribuição de pedidos</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Logs List */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar pedido..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredLogs.map((log) => {
                    const order = orders.find(o => o.id === log.orderId);
                    return (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLog(log.id)}
                        className={cn(
                          "w-full p-4 text-left border-b border-border transition-colors",
                          selectedLog === log.id ? "bg-accent" : "hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">
                            #{log.orderId.slice(0, 8)}
                          </span>
                          <span className="text-xs text-muted-foreground">{log.createdAt}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order?.clientName} • {order?.serviceName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-primary font-medium">
                            {log.candidates.length} candidatos
                          </span>
                          {log.chosenProId && (
                            <span className="text-xs text-success">✓ Atribuído</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Log Details */}
            <div className="lg:col-span-2">
              {selectedLogData && selectedOrder ? (
                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold text-foreground mb-3">Informações do Pedido</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium text-foreground">{selectedOrder.clientName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Serviço</p>
                        <p className="font-medium text-foreground">{selectedOrder.serviceName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Local</p>
                        <p className="font-medium text-foreground">{selectedOrder.neighborhood}, {selectedOrder.city}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Horário</p>
                        <p className="font-medium text-foreground">{selectedOrder.date} às {selectedOrder.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Matching Result */}
                  <div className="p-4 bg-accent rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Resultado do matching</p>
                        <p className="font-semibold text-foreground">{selectedLogData.reason}</p>
                      </div>
                      {selectedLogData.chosenProId && (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-success" />
                          <span className="text-success font-medium">Sucesso</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidates Ranking */}
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold text-foreground">Ranking de Candidatos</h3>
                      <p className="text-sm text-muted-foreground">Ordenados por score de matching</p>
                    </div>
                    <div className="divide-y divide-border">
                      {selectedLogData.candidates
                        .sort((a, b) => b.score - a.score)
                        .map((candidate, index) => {
                          const pro = pros.find(p => p.id === candidate.proId);
                          const isChosen = candidate.proId === selectedLogData.chosenProId;
                          
                          return (
                            <div 
                              key={candidate.proId}
                              className={cn(
                                "p-4 flex items-center gap-4",
                                isChosen && "bg-success/10"
                              )}
                            >
                              {/* Rank */}
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                index === 0 ? "bg-amber-100 text-amber-600" :
                                index === 1 ? "bg-slate-100 text-slate-600" :
                                index === 2 ? "bg-orange-100 text-orange-600" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {index + 1}
                              </div>

                              {/* Pro Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground">{candidate.proName}</span>
                                  {getPlanBadge(candidate.plan)}
                                  {isChosen && (
                                    <span className="px-2 py-0.5 bg-success text-success-foreground rounded text-xs font-medium">
                                      Escolhida
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {candidate.distanceKm.toFixed(1)} km
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {candidate.rating.toFixed(1)}
                                  </span>
                                </div>
                              </div>

                              {/* Score Breakdown */}
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{candidate.score}</p>
                                <p className="text-xs text-muted-foreground">score</p>
                              </div>

                              {/* Accept/Reject */}
                              <div className="w-20 text-center">
                                {candidate.accepted === true && (
                                  <span className="text-success text-sm font-medium">Aceitou</span>
                                )}
                                {candidate.accepted === false && (
                                  <span className="text-destructive text-sm font-medium">Recusou</span>
                                )}
                                {candidate.accepted === undefined && (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Score Explanation */}
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h4 className="font-medium text-foreground mb-3">Como o score é calculado</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-muted-foreground mb-1">Distância</p>
                        <p className="font-medium text-foreground">25 pts max</p>
                        <p className="text-xs text-muted-foreground">Menor distância = maior score</p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-muted-foreground mb-1">Rating</p>
                        <p className="font-medium text-foreground">20 pts max</p>
                        <p className="text-xs text-muted-foreground">Baseado na média de avaliações</p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-muted-foreground mb-1">Plano</p>
                        <p className="font-medium text-foreground">30 pts max</p>
                        <p className="text-xs text-muted-foreground">ELITE: 30 • PRO: 20 • Free: 0</p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-muted-foreground mb-1">SLA</p>
                        <p className="font-medium text-foreground">25 pts max</p>
                        <p className="text-xs text-muted-foreground">Pontualidade + taxa de aceite</p>
                      </div>
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
        </div>
      </main>
    </div>
  );
}
