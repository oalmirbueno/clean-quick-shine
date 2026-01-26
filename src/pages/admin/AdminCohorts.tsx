import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChevronLeft, Users, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminCohorts() {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"retention" | "revenue">("retention");

  // Mock cohort data - retention percentages by week
  const cohortData = [
    { cohort: "Jan S1", users: 245, weeks: [100, 68, 52, 45, 38, 32, 28, 25] },
    { cohort: "Jan S2", users: 312, weeks: [100, 72, 58, 48, 42, 35, 30, null] },
    { cohort: "Jan S3", users: 289, weeks: [100, 65, 50, 43, 36, 30, null, null] },
    { cohort: "Jan S4", users: 356, weeks: [100, 70, 55, 46, 40, null, null, null] },
    { cohort: "Fev S1", users: 398, weeks: [100, 75, 60, 50, null, null, null, null] },
    { cohort: "Fev S2", users: 421, weeks: [100, 72, 56, null, null, null, null, null] },
    { cohort: "Fev S3", users: 445, weeks: [100, 68, null, null, null, null, null, null] },
    { cohort: "Fev S4", users: 478, weeks: [100, null, null, null, null, null, null, null] },
  ];

  // Revenue cohort data
  const revenueCohortData = [
    { cohort: "Jan S1", users: 245, weeks: [150, 120, 95, 85, 72, 65, 58, 52] },
    { cohort: "Jan S2", users: 312, weeks: [165, 135, 108, 92, 80, 70, 62, null] },
    { cohort: "Jan S3", users: 289, weeks: [145, 115, 90, 78, 68, 58, null, null] },
    { cohort: "Jan S4", users: 356, weeks: [175, 145, 115, 98, 85, null, null, null] },
    { cohort: "Fev S1", users: 398, weeks: [185, 155, 125, 108, null, null, null, null] },
    { cohort: "Fev S2", users: 421, weeks: [195, 165, 135, null, null, null, null, null] },
    { cohort: "Fev S3", users: 445, weeks: [205, 175, null, null, null, null, null, null] },
    { cohort: "Fev S4", users: 478, weeks: [215, null, null, null, null, null, null, null] },
  ];

  const data = viewType === "retention" ? cohortData : revenueCohortData;
  const weekLabels = ["Sem 0", "Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7"];

  const getRetentionColor = (value: number | null) => {
    if (value === null) return "bg-muted/30";
    if (viewType === "revenue") {
      if (value >= 150) return "bg-success text-white";
      if (value >= 100) return "bg-success/70 text-white";
      if (value >= 70) return "bg-success/50";
      if (value >= 50) return "bg-warning/50";
      return "bg-destructive/30";
    }
    if (value >= 60) return "bg-success text-white";
    if (value >= 45) return "bg-success/70 text-white";
    if (value >= 30) return "bg-success/50";
    if (value >= 20) return "bg-warning/50";
    return "bg-destructive/30";
  };

  // Calculate averages
  const avgRetention = {
    week1: (cohortData.reduce((sum, c) => sum + (c.weeks[1] || 0), 0) / cohortData.filter(c => c.weeks[1]).length).toFixed(1),
    week4: (cohortData.filter(c => c.weeks[4]).reduce((sum, c) => sum + (c.weeks[4] || 0), 0) / cohortData.filter(c => c.weeks[4]).length).toFixed(1),
    week8: (cohortData.filter(c => c.weeks[7]).reduce((sum, c) => sum + (c.weeks[7] || 0), 0) / cohortData.filter(c => c.weeks[7]).length).toFixed(1),
  };

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
                <Users className="w-7 h-7 text-primary" />
                Análise de Cohorts
              </h1>
              <p className="text-muted-foreground">Retenção e comportamento por grupos</p>
            </div>
            <div className="flex bg-card rounded-lg border border-border p-1">
              <button
                onClick={() => setViewType("retention")}
                className={cn(
                  "px-3 py-1.5 rounded text-sm transition-all",
                  viewType === "retention"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Retenção
              </button>
              <button
                onClick={() => setViewType("revenue")}
                className={cn(
                  "px-3 py-1.5 rounded text-sm transition-all",
                  viewType === "revenue"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Retenção Semana 1</p>
              <p className="text-2xl font-bold text-foreground">{avgRetention.week1}%</p>
              <p className="text-xs text-success mt-1">+2.3% vs mês anterior</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Retenção Semana 4</p>
              <p className="text-2xl font-bold text-foreground">{avgRetention.week4}%</p>
              <p className="text-xs text-success mt-1">+1.5% vs mês anterior</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Retenção Semana 8</p>
              <p className="text-2xl font-bold text-foreground">{avgRetention.week8}%</p>
              <p className="text-xs text-warning mt-1">-0.5% vs mês anterior</p>
            </div>
          </div>

          {/* Cohort Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {viewType === "retention" ? "Tabela de Retenção (%)" : "Receita Média por Usuário (R$)"}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cohort</th>
                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">Usuários</th>
                    {weekLabels.map((label) => (
                      <th key={label} className="text-center p-3 text-sm font-medium text-muted-foreground">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.cohort} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">{row.cohort}</td>
                      <td className="p-3 text-center text-muted-foreground">{row.users}</td>
                      {row.weeks.map((value, i) => (
                        <td key={i} className="p-1">
                          <div className={cn(
                            "p-2 text-center text-sm font-medium rounded",
                            getRetentionColor(value)
                          )}>
                            {value !== null ? (viewType === "revenue" ? `R$${value}` : `${value}%`) : "-"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Tendências Positivas
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Cohorts de Fevereiro mostram melhor retenção inicial (+7%)</li>
                <li>• Usuários que usam cupons na primeira compra retêm 15% mais</li>
                <li>• Assinantes têm retenção 3x maior após 4 semanas</li>
              </ul>
            </div>
            
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-warning" />
                Pontos de Atenção
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Queda significativa entre semana 2 e 3 (-12% em média)</li>
                <li>• Usuários de São Paulo retêm menos que Curitiba (-5%)</li>
                <li>• Horário matutino tem menor retenção que tarde</li>
              </ul>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-accent rounded-xl">
            <p className="text-sm font-medium text-foreground mb-2">Legenda de cores</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success" />
                <span className="text-muted-foreground">Excelente ({viewType === "retention" ? ">60%" : ">R$150"})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/70" />
                <span className="text-muted-foreground">Bom ({viewType === "retention" ? "45-60%" : "R$100-150"})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/50" />
                <span className="text-muted-foreground">Regular ({viewType === "retention" ? "30-45%" : "R$70-100"})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning/50" />
                <span className="text-muted-foreground">Atenção ({viewType === "retention" ? "20-30%" : "R$50-70"})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/30" />
                <span className="text-muted-foreground">Crítico ({viewType === "retention" ? "<20%" : "<R$50"})</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
