import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { QualityCard } from "@/components/ui/QualityBadge";
import { Clock, Target, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useProMetrics, useSlaRules } from "@/hooks/useProMetrics";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProQuality() {
  const { metrics, loading, error } = useProMetrics();
  const { data: slaRules } = useSlaRules();

  if (loading) {
    return (
      <div className="h-full bg-background flex flex-col safe-top">
        <ProPageHeader title="Qualidade e SLA" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
        <BottomNav variant="pro" />
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
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Qualidade e SLA" subtitle="Suas métricas de desempenho" />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          <motion.div variants={item}>
            <QualityCard
              level={displayMetrics.qualityLevel as "A" | "B" | "C" | "D"}
              metrics={{
                onTimeRate: displayMetrics.onTimeRate,
                cancelRate: displayMetrics.cancelRate,
                responseTimeAvg: displayMetrics.responseTimeAvg,
              }}
            />
          </motion.div>

          <motion.section variants={item}>
            <h3 className="text-sm font-bold text-foreground mb-2.5">Metas para subir de nível</h3>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center gap-3 shadow-sm",
                    tip.met ? "bg-success/5 border-success/25" : "bg-card border-border/60"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    tip.met ? "bg-success/15" : "bg-muted"
                  )}>
                    <tip.icon className={cn("w-4.5 h-4.5", tip.met ? "text-success" : "text-muted-foreground")} />
                  </div>
                  <p className={cn("text-sm", tip.met ? "text-success font-medium" : "text-muted-foreground")}>
                    {tip.met && "✓ "}{tip.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={item} className="p-4 bg-accent rounded-2xl border border-border/60">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Por que isso importa?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Profissionais com nível A recebem até 3x mais pedidos e têm prioridade no matching.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <h3 className="text-sm font-bold text-foreground mb-2.5">Histórico (últimos 30 dias)</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-4 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">{displayMetrics.last30dJobs}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-1">Serviços</p>
              </div>
              <div className="p-4 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">{displayMetrics.last7dCancels}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-1">Cancel. (7d)</p>
              </div>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Taxa de aceitação</span>
                <span className="text-base font-bold text-primary">{displayMetrics.acceptanceRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(displayMetrics.acceptanceRate, 100)}%` }}
                />
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
