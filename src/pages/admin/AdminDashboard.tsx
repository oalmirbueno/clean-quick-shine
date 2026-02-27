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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: ordersToday = 0 } = useQuery({
    queryKey: ["admin_orders_today"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today);
      return count || 0;
    },
  });

  const { data: ordersMonth = 0 } = useQuery({
    queryKey: ["admin_orders_month"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", monthStart);
      return count || 0;
    },
  });

  const { data: financials = { gmv: 0, commission: 0, avgTicket: 0 } } = useQuery({
    queryKey: ["admin_financials"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total_price, status").in("status", ["completed", "rated", "paid_out"]);
      const gmv = data?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0;
      const commission = gmv * 0.2; // 20% commission
      const avgTicket = data && data.length > 0 ? gmv / data.length : 0;
      return { gmv, commission, avgTicket };
    },
  });

  const { data: cancelRate = 0 } = useQuery({
    queryKey: ["admin_cancel_rate"],
    queryFn: async () => {
      const { count: total } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: cancelled } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled");
      return total && total > 0 ? ((cancelled || 0) / total * 100) : 0;
    },
  });

  const { data: newPros7d = 0 } = useQuery({
    queryKey: ["admin_new_pros_7d"],
    queryFn: async () => {
      const { count } = await supabase.from("pro_profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo);
      return count || 0;
    },
  });

  const { data: activeClients = 0 } = useQuery({
    queryKey: ["admin_active_clients"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "client");
      return count || 0;
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin_recent_orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total_price, scheduled_date, client_id, profiles!orders_client_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const ordersPerDay = [12, 18, 15, 22, 19, 25, 21, 28, 24, 30, 26, 32, 28, 35];
  const revenuePerDay = [250, 380, 320, 450, 400, 520, 480, 580, 510, 620, 550, 680, 600, 720];

  return (
    <div className="min-h-screen bg-background safe-top">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6">
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

          <AnimatedSection delay={1}>
            <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedListItem>
                <MetricCard title="Pedidos hoje" value={ordersToday} icon={ClipboardList} />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard title="Pedidos no mês" value={ordersMonth} icon={ClipboardList} />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard title="GMV Total" value={financials.gmv} icon={DollarSign} format="currency" />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard title="Receita (Comissões)" value={financials.commission} icon={TrendingUp} format="currency" />
              </AnimatedListItem>
            </AnimatedList>
          </AnimatedSection>

          <AnimatedSection delay={2}>
            <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedListItem>
                <MetricCard title="Ticket Médio" value={financials.avgTicket} format="currency" />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard title="Taxa Cancelamento" value={cancelRate} format="percent" />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard title="Novas Diaristas (7d)" value={newPros7d} icon={UserPlus} />
              </AnimatedListItem>
              <AnimatedListItem>
                <MetricCard title="Clientes Ativos" value={activeClients} icon={Users} />
              </AnimatedListItem>
            </AnimatedList>
          </AnimatedSection>

          <AnimatedSection delay={3}>
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div whileHover={{ scale: 1.01 }} className="bg-card rounded-xl border border-border p-4 card-shadow">
                <h3 className="font-semibold text-foreground mb-4">Pedidos por dia</h3>
                <MiniChart data={ordersPerDay} height={120} />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} className="bg-card rounded-xl border border-border p-4 card-shadow">
                <h3 className="font-semibold text-foreground mb-4">Receita por dia (R$)</h3>
                <MiniChart data={revenuePerDay} height={120} color="bg-success" />
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={4} className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Pedidos recentes</h3>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.map((order: any, index: number) => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                  className="p-4 flex items-center justify-between transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{order.profiles?.full_name || "Cliente"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      R$ {Number(order.total_price).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.scheduled_date}</p>
                  </div>
                </motion.div>
              ))}
              {recentOrders.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">Nenhum pedido encontrado</div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
