import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MetricCard } from "@/components/ui/MetricCard";
import { MiniChart } from "@/components/ui/MiniChart";
import { 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Users, 
  UserPlus,
  XCircle 
} from "lucide-react";
import { getMetrics, orders } from "@/lib/mockDataV2";

export default function AdminDashboard() {
  const metrics = getMetrics();

  // Mock chart data
  const ordersPerDay = [12, 18, 15, 22, 19, 25, 21, 28, 24, 30, 26, 32, 28, 35];
  const revenuePerDay = [250, 380, 320, 450, 400, 520, 480, 580, 510, 620, 550, 680, 600, 720];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do marketplace</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Pedidos hoje"
              value={metrics.ordersToday}
              icon={ClipboardList}
              trend={12}
              trendLabel="vs ontem"
            />
            <MetricCard
              title="Pedidos no mês"
              value={metrics.ordersMonth}
              icon={ClipboardList}
              trend={8}
              trendLabel="vs mês anterior"
            />
            <MetricCard
              title="GMV Total"
              value={metrics.totalGMV}
              icon={DollarSign}
              format="currency"
              trend={15}
            />
            <MetricCard
              title="Receita (Comissões)"
              value={metrics.totalCommission}
              icon={TrendingUp}
              format="currency"
              trend={18}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Ticket Médio"
              value={metrics.avgTicket}
              format="currency"
            />
            <MetricCard
              title="Taxa Cancelamento"
              value={metrics.cancelRate}
              format="percent"
              trend={-5}
            />
            <MetricCard
              title="Novas Diaristas (7d)"
              value={metrics.newPros7Days}
              icon={UserPlus}
            />
            <MetricCard
              title="Clientes Ativos"
              value={20}
              icon={Users}
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Pedidos por dia</h3>
              <MiniChart data={ordersPerDay} height={120} />
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>01/01</span>
                <span>07/01</span>
                <span>14/01</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Receita por dia (R$)</h3>
              <MiniChart data={revenuePerDay} height={120} color="bg-success" />
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>01/01</span>
                <span>07/01</span>
                <span>14/01</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-xl border border-border card-shadow">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Pedidos recentes</h3>
            </div>
            <div className="divide-y divide-border">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      R$ {order.totalPrice.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
