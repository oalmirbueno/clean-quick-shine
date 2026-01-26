import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MetricCard } from "@/components/ui/MetricCard";
import { MiniChart } from "@/components/ui/MiniChart";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedSection } from "@/components/ui/AnimatedCard";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Users, 
  UserPlus,
} from "lucide-react";
import { getMetrics, orders } from "@/lib/mockDataV2";

export default function AdminDashboard() {
  const metrics = getMetrics();

  const ordersPerDay = [12, 18, 15, 22, 19, 25, 21, 28, 24, 30, 26, 32, 28, 35];
  const revenuePerDay = [250, 380, 320, 450, 400, 520, 480, 580, 510, 620, 550, 680, 600, 720];

  return (
    <div className="min-h-screen bg-background safe-top">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do marketplace</p>
            </div>
            <ThemeToggle />
          </motion.div>

          {/* Metrics Grid */}
          <AnimatedSection delay={1}>
            <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedListItem>
                <MetricCard
                  title="Pedidos hoje"
                  value={metrics.ordersToday}
                  icon={ClipboardList}
                  trend={12}
                  trendLabel="vs ontem"
                />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard
                  title="Pedidos no mês"
                  value={metrics.ordersMonth}
                  icon={ClipboardList}
                  trend={8}
                  trendLabel="vs mês anterior"
                />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard
                  title="GMV Total"
                  value={metrics.totalGMV}
                  icon={DollarSign}
                  format="currency"
                  trend={15}
                />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard
                  title="Receita (Comissões)"
                  value={metrics.totalCommission}
                  icon={TrendingUp}
                  format="currency"
                  trend={18}
                />
              </AnimatedListItem>
            </AnimatedList>
          </AnimatedSection>

          <AnimatedSection delay={2}>
            <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedListItem>
                <MetricCard
                  title="Ticket Médio"
                  value={metrics.avgTicket}
                  format="currency"
                />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard
                  title="Taxa Cancelamento"
                  value={metrics.cancelRate}
                  format="percent"
                  trend={-5}
                />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard
                  title="Novas Diaristas (7d)"
                  value={metrics.newPros7Days}
                  icon={UserPlus}
                />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard
                  title="Clientes Ativos"
                  value={20}
                  icon={Users}
                />
              </AnimatedListItem>
            </AnimatedList>
          </AnimatedSection>

          {/* Charts */}
          <AnimatedSection delay={3}>
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-card rounded-xl border border-border p-4 card-shadow"
              >
                <h3 className="font-semibold text-foreground mb-4">Pedidos por dia</h3>
                <MiniChart data={ordersPerDay} height={120} />
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span>01/01</span>
                  <span>07/01</span>
                  <span>14/01</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-card rounded-xl border border-border p-4 card-shadow"
              >
                <h3 className="font-semibold text-foreground mb-4">Receita por dia (R$)</h3>
                <MiniChart data={revenuePerDay} height={120} color="bg-success" />
                <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                  <span>01/01</span>
                  <span>07/01</span>
                  <span>14/01</span>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Recent Orders */}
          <AnimatedSection delay={4} className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Pedidos recentes</h3>
            </div>
            <div className="divide-y divide-border">
              {orders.slice(0, 5).map((order, index) => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                  className="p-4 flex items-center justify-between transition-colors"
                >
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
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
