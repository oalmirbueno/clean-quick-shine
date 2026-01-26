import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MiniChart } from "@/components/ui/MiniChart";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Target,
  Repeat
} from "lucide-react";
import { orders, clients, pros } from "@/lib/mockDataV3";
import { cn } from "@/lib/utils";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  // Calculate metrics
  const totalRevenue = orders.filter(o => o.status === "paid_out").reduce((sum, o) => sum + o.commissionValue, 0);
  const totalGMV = orders.filter(o => o.status === "paid_out").reduce((sum, o) => sum + o.totalPrice, 0);
  const avgTicket = totalGMV / orders.filter(o => o.status === "paid_out").length || 0;
  const conversionRate = (orders.filter(o => o.status !== "cancelled").length / orders.length * 100) || 0;

  // Mock chart data
  const revenueData = [12500, 15800, 14200, 18900, 22100, 19800, 25600];
  const ordersData = [45, 52, 48, 61, 72, 65, 78];
  const usersData = [120, 145, 138, 162, 185, 172, 198];

  // Top metrics
  const topZones = [
    { name: "Jardins", orders: 45, revenue: 8500 },
    { name: "Pinheiros", orders: 38, revenue: 7200 },
    { name: "Moema", orders: 32, revenue: 6100 },
    { name: "Batel", orders: 28, revenue: 5400 },
    { name: "Itaim Bibi", orders: 25, revenue: 4800 },
  ];

  const topServices = [
    { name: "Limpeza Padrão", orders: 120, percentage: 48 },
    { name: "Limpeza Pesada", orders: 65, percentage: 26 },
    { name: "Pós-Obra", orders: 40, percentage: 16 },
    { name: "Comercial", orders: 25, percentage: 10 },
  ];

  return (
    <div className="min-h-screen bg-background flex safe-top">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-primary" />
                Analytics
              </h1>
              <p className="text-muted-foreground">Métricas e performance do marketplace</p>
            </div>
            <div className="flex gap-2">
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
              <button className="p-2 rounded-lg border border-border bg-card hover:bg-accent">
                <Download className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <span className="flex items-center text-xs text-success">
                  <ArrowUpRight className="w-3 h-3" /> +18%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Receita (comissões)</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <span className="flex items-center text-xs text-success">
                  <ArrowUpRight className="w-3 h-3" /> +12%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">GMV Total</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalGMV.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <span className="flex items-center text-xs text-success">
                  <ArrowUpRight className="w-3 h-3" /> +5%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Ticket médio</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {avgTicket.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-foreground" />
                </div>
                <span className="flex items-center text-xs text-destructive">
                  <ArrowDownRight className="w-3 h-3" /> -2%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Taxa conversão</p>
              <p className="text-2xl font-bold text-foreground">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Receita por dia</h3>
              <MiniChart data={revenueData} color="success" height={150} />
              <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
            </div>

            {/* Orders Chart */}
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Pedidos por dia</h3>
              <MiniChart data={ordersData} color="primary" height={150} />
              <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
            </div>
          </div>

          {/* Top Lists */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Zones */}
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Top Zonas</h3>
              <div className="space-y-3">
                {topZones.map((zone, i) => (
                  <div key={zone.name} className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      i === 0 ? "bg-amber-100 text-amber-600" :
                      i === 1 ? "bg-slate-100 text-slate-600" :
                      i === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">{zone.orders} pedidos</p>
                    </div>
                    <span className="text-sm font-medium text-success">
                      R$ {zone.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Services */}
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4">Serviços mais populares</h3>
              <div className="space-y-4">
                {topServices.map((service) => (
                  <div key={service.name}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <span className="text-sm text-muted-foreground">{service.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate("/admin/funnel")}
              className="flex-1 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors text-left"
            >
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Funil de Conversão</h4>
              <p className="text-sm text-muted-foreground">Análise do funil de vendas</p>
            </button>
            <button
              onClick={() => navigate("/admin/cohorts")}
              className="flex-1 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors text-left"
            >
              <Users className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Cohorts</h4>
              <p className="text-sm text-muted-foreground">Análise de retenção</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
