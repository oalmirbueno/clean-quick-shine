import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MiniChart } from "@/components/ui/MiniChart";
import { 
  TrendingUp, Users, ShoppingCart, DollarSign,
  BarChart3, Target, Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const { data: metrics = { totalRevenue: 0, totalGMV: 0, avgTicket: 0, conversionRate: 0 } } = useQuery({
    queryKey: ["admin_analytics_metrics"],
    queryFn: async () => {
      const { data: allOrders } = await supabase.from("orders").select("total_price, status");
      const paidOrders = allOrders?.filter(o => ["completed", "rated", "paid_out"].includes(o.status || "")) || [];
      const totalGMV = paidOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
      const totalRevenue = totalGMV * 0.2;
      const avgTicket = paidOrders.length > 0 ? totalGMV / paidOrders.length : 0;
      const total = allOrders?.length || 0;
      const notCancelled = allOrders?.filter(o => o.status !== "cancelled").length || 0;
      const conversionRate = total > 0 ? (notCancelled / total * 100) : 0;
      return { totalRevenue, totalGMV, avgTicket, conversionRate };
    },
  });

  const revenueData = [12500, 15800, 14200, 18900, 22100, 19800, 25600];
  const ordersData = [45, 52, 48, 61, 72, 65, 78];

  const { data: topServices = [] } = useQuery({
    queryKey: ["admin_top_services"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("service_id, services(name)");
      const serviceCounts: Record<string, { name: string; count: number }> = {};
      data?.forEach((o: any) => {
        const name = o.services?.name || "Desconhecido";
        if (!serviceCounts[name]) serviceCounts[name] = { name, count: 0 };
        serviceCounts[name].count++;
      });
      const sorted = Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 4);
      const total = sorted.reduce((s, v) => s + v.count, 0);
      return sorted.map(s => ({ name: s.name, orders: s.count, percentage: total > 0 ? Math.round(s.count / total * 100) : 0 }));
    },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" /> Analytics
          </h1>
          <p className="text-muted-foreground">Métricas e performance do marketplace</p>
        </div>
        <div className="flex bg-card rounded-xl border border-border p-1">
          {(["7d", "30d", "90d"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-1.5 rounded-lg text-sm transition-all", period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-2"><DollarSign className="w-5 h-5 text-success" /></div>
          <p className="text-sm text-muted-foreground">Receita (comissões)</p>
          <p className="text-2xl font-bold text-foreground">R$ {metrics.totalRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2"><ShoppingCart className="w-5 h-5 text-primary" /></div>
          <p className="text-sm text-muted-foreground">GMV Total</p>
          <p className="text-2xl font-bold text-foreground">R$ {metrics.totalGMV.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center mb-2"><Target className="w-5 h-5 text-warning" /></div>
          <p className="text-sm text-muted-foreground">Ticket médio</p>
          <p className="text-2xl font-bold text-foreground">R$ {metrics.avgTicket.toFixed(2).replace(".", ",")}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2"><Repeat className="w-5 h-5 text-foreground" /></div>
          <p className="text-sm text-muted-foreground">Taxa conversão</p>
          <p className="text-2xl font-bold text-foreground">{metrics.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-4">Receita por dia</h3>
          <MiniChart data={revenueData} color="success" height={150} />
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-4">Pedidos por dia</h3>
          <MiniChart data={ordersData} color="primary" height={150} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-4">Serviços mais populares</h3>
          <div className="space-y-4">
            {topServices.map((service: any) => (
              <div key={service.name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">{service.name}</p>
                  <span className="text-sm text-muted-foreground">{service.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${service.percentage}%` }} />
                </div>
              </div>
            ))}
            {topServices.length === 0 && <p className="text-muted-foreground text-sm">Sem dados suficientes</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => navigate("/admin/funnel")} className="flex-1 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors text-left">
          <TrendingUp className="w-6 h-6 text-primary mb-2" />
          <h4 className="font-medium text-foreground">Funil de Conversão</h4>
          <p className="text-sm text-muted-foreground">Análise do funil de vendas</p>
        </button>
        <button onClick={() => navigate("/admin/cohorts")} className="flex-1 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors text-left">
          <Users className="w-6 h-6 text-primary mb-2" />
          <h4 className="font-medium text-foreground">Cohorts</h4>
          <p className="text-sm text-muted-foreground">Análise de retenção</p>
        </button>
      </div>
    </AdminLayout>
  );
}
