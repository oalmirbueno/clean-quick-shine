import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { QualityCard } from "@/components/ui/QualityBadge";
import { ChevronRight, Clock, Target, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useProMetrics, useSlaRules } from "@/hooks/useProMetrics";

export default function ProQuality() {
  const navigate = useNavigate();
  const { metrics, loading, error } = useProMetrics();
  const { data: slaRules } = useSlaRules();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Default values when no metrics exist yet
  const displayMetrics = {
    onTimeRate: metrics?.on_time_rate ?? 100,
    cancelRate: metrics?.cancel_rate ?? 0,
    responseTimeAvg: metrics?.response_time_avg ?? 0,
    qualityLevel: metrics?.quality_level ?? "A",
    last30dJobs: metrics?.last_30d_jobs ?? 0,
    last7dCancels: metrics?.last_7d_cancels ?? 0,
    acceptanceRate: metrics?.acceptance_rate ?? 100,
  };

  const tips = [
    { 
      icon: Clock, 
      text: `Responda aos pedidos em até ${slaRules?.response_time_target_min ?? 15} minutos`, 
      met: displayMetrics.responseTimeAvg <= (slaRules?.response_time_target_min ?? 15) 
    },
    { 
      icon: Target, 
      text: `Mantenha pontualidade acima de ${slaRules?.on_time_target_percent ?? 95}%`, 
      met: displayMetrics.onTimeRate >= (slaRules?.on_time_target_percent ?? 95) 
    },
    { 
      icon: TrendingUp, 
      text: `Taxa de cancelamento abaixo de ${slaRules?.cancel_rate_max_percent ?? 5}%`, 
      met: displayMetrics.cancelRate <= (slaRules?.cancel_rate_max_percent ?? 5) 
    },
  ];

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Qualidade e SLA</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 animate-fade-in">
        <QualityCard
          level={displayMetrics.qualityLevel as "A" | "B" | "C" | "D"}
          metrics={{
            onTimeRate: displayMetrics.onTimeRate,
            cancelRate: displayMetrics.cancelRate,
            responseTimeAvg: displayMetrics.responseTimeAvg,
          }}
        />

        <section>
          <h3 className="font-semibold text-foreground mb-3">Metas para subir de nível</h3>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  tip.met ? "bg-success/5 border-success/20" : "bg-card border-border"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tip.met ? "bg-success/10" : "bg-secondary"
                }`}>
                  <tip.icon className={`w-5 h-5 ${tip.met ? "text-success" : "text-muted-foreground"}`} />
                </div>
                <p className={`text-sm ${tip.met ? "text-success" : "text-muted-foreground"}`}>
                  {tip.met && "✓ "}{tip.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-4 bg-accent rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Por que isso importa?</h4>
              <p className="text-sm text-muted-foreground">
                Profissionais com nível A recebem até 3x mais pedidos e têm prioridade no matching.
                Mantenha boas métricas para aumentar seus ganhos!
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-3">Histórico (últimos 30 dias)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <p className="text-3xl font-bold text-foreground">{displayMetrics.last30dJobs}</p>
              <p className="text-sm text-muted-foreground">Serviços</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <p className="text-3xl font-bold text-foreground">{displayMetrics.last7dCancels}</p>
              <p className="text-sm text-muted-foreground">Cancelamentos (7d)</p>
            </div>
          </div>
        </section>

        {/* Acceptance Rate Card */}
        <section>
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Taxa de aceitação</span>
              <span className="text-lg font-bold text-primary">{displayMetrics.acceptanceRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${Math.min(displayMetrics.acceptanceRate, 100)}%` }} 
              />
            </div>
          </div>
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
