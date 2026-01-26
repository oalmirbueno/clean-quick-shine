import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChevronLeft, TrendingUp, Users, ShoppingCart, CreditCard, Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminFunnel() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  // Mock funnel data
  const funnelData = [
    { stage: "Visitantes", icon: Users, count: 15420, rate: 100, color: "bg-slate-500" },
    { stage: "Cadastros", icon: Users, count: 3856, rate: 25, color: "bg-blue-500" },
    { stage: "Primeiro pedido", icon: ShoppingCart, count: 1542, rate: 40, color: "bg-primary" },
    { stage: "Pagamento", icon: CreditCard, count: 1388, rate: 90, color: "bg-success" },
    { stage: "Concluído", icon: Star, count: 1318, rate: 95, color: "bg-amber-500" },
    { stage: "Avaliado", icon: Star, count: 1054, rate: 80, color: "bg-purple-500" },
  ];

  // Mock conversion metrics
  const conversionMetrics = [
    { from: "Visita → Cadastro", rate: 25.0, change: +2.3 },
    { from: "Cadastro → Pedido", rate: 40.0, change: +5.1 },
    { from: "Pedido → Pagamento", rate: 90.0, change: -1.2 },
    { from: "Pagamento → Conclusão", rate: 95.0, change: +0.5 },
    { from: "Conclusão → Avaliação", rate: 80.0, change: +3.8 },
  ];

  // Mock drop-off reasons
  const dropOffReasons = [
    { stage: "Cadastro → Pedido", reasons: [
      { reason: "Não encontrou horário disponível", percentage: 35 },
      { reason: "Preço alto", percentage: 28 },
      { reason: "Sem diarista na região", percentage: 22 },
      { reason: "Desistiu no checkout", percentage: 15 },
    ]},
    { stage: "Pedido → Pagamento", reasons: [
      { reason: "Problema no pagamento", percentage: 45 },
      { reason: "Mudou de ideia", percentage: 30 },
      { reason: "Encontrou alternativa", percentage: 25 },
    ]},
  ];

  return (
    <div className="min-h-screen bg-background flex safe-top">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/analytics")}
              className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-primary" />
                Funil de Conversão
              </h1>
              <p className="text-muted-foreground">Análise detalhada do funil de vendas</p>
            </div>
            <div className="flex bg-card rounded-lg border border-border p-1">
              {(["7d", "30d", "90d"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm transition-all",
                    period === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
                </button>
              ))}
            </div>
          </div>

          {/* Funnel Visualization */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-6">Funil completo</h3>
            <div className="space-y-3">
              {funnelData.map((stage, i) => {
                const Icon = stage.icon;
                const width = 100 - (i * 12);
                return (
                  <div key={stage.stage} className="relative">
                    <div 
                      className={cn(
                        "h-16 rounded-lg flex items-center justify-between px-4 transition-all",
                        stage.color
                      )}
                      style={{ width: `${width}%`, marginLeft: `${(100 - width) / 2}%` }}
                    >
                      <div className="flex items-center gap-3 text-white">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="text-right text-white">
                        <p className="font-bold">{stage.count.toLocaleString()}</p>
                        {i > 0 && (
                          <p className="text-xs opacity-80">{stage.rate}% conversão</p>
                        )}
                      </div>
                    </div>
                    {i < funnelData.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Conversion Rates */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Taxas de Conversão</h3>
              <div className="space-y-4">
                {conversionMetrics.map((metric) => (
                  <div key={metric.from} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <span className="text-sm text-foreground">{metric.from}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">{metric.rate}%</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        metric.change > 0 
                          ? "bg-success/20 text-success" 
                          : "bg-destructive/20 text-destructive"
                      )}>
                        {metric.change > 0 ? "+" : ""}{metric.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall conversion */}
              <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Conversão geral (Visita → Avaliado)</p>
                <p className="text-3xl font-bold text-primary">6.8%</p>
                <p className="text-xs text-success mt-1">+0.8% vs período anterior</p>
              </div>
            </div>

            {/* Drop-off Analysis */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Análise de Drop-off</h3>
              <div className="space-y-6">
                {dropOffReasons.map((stage) => (
                  <div key={stage.stage}>
                    <p className="text-sm font-medium text-foreground mb-3">{stage.stage}</p>
                    <div className="space-y-2">
                      {stage.reasons.map((reason) => (
                        <div key={reason.reason}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{reason.reason}</span>
                            <span className="font-medium text-foreground">{reason.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-destructive/60 rounded-full"
                              style={{ width: `${reason.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-accent rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-3">Recomendações</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Cadastro → Pedido:</strong> Melhorar visibilidade de horários alternativos quando não há disponibilidade imediata</li>
              <li>• <strong>Checkout:</strong> Implementar recuperação de carrinho abandonado com desconto</li>
              <li>• <strong>Avaliação:</strong> Enviar lembrete de avaliação 2h após conclusão do serviço</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
