import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { MapMock } from "@/components/ui/MapMock";
import { QualityCard } from "@/components/ui/QualityBadge";
import { ChevronRight, Clock, Target, TrendingUp, AlertCircle } from "lucide-react";
import { mockPro, slaRules } from "@/lib/mockDataV3";

export default function ProQuality() {
  const navigate = useNavigate();
  const pro = mockPro;
  const metrics = pro.metrics!;

  const tips = [
    { icon: Clock, text: "Responda aos pedidos em até 5 minutos", met: metrics.responseTimeAvg <= 5 },
    { icon: Target, text: "Mantenha pontualidade acima de 95%", met: metrics.onTimeRate >= 95 },
    { icon: TrendingUp, text: "Taxa de cancelamento abaixo de 5%", met: metrics.cancelRate <= 5 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Qualidade e SLA</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        <QualityCard
          level={metrics.qualityLevel}
          metrics={{
            onTimeRate: metrics.onTimeRate,
            cancelRate: metrics.cancelRate,
            responseTimeAvg: metrics.responseTimeAvg,
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
              <p className="text-3xl font-bold text-foreground">{metrics.last30dJobs}</p>
              <p className="text-sm text-muted-foreground">Serviços</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <p className="text-3xl font-bold text-foreground">{metrics.last7dCancels}</p>
              <p className="text-sm text-muted-foreground">Cancelamentos (7d)</p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
