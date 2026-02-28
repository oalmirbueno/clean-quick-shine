import { AdminLayout } from "@/components/admin/AdminLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedSection } from "@/components/ui/AnimatedCard";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Users, 
  UserPlus,
  CreditCard,
  ArrowDownToLine,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const { data: ordersToday = 0 } = useQuery({
    queryKey: ["admin_orders_today", today],
    queryFn: async () => {
      const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today);
      if (error) console.error("admin_orders_today error:", error);
      return count || 0;
    },
  });

  const { data: ordersMonth = 0 } = useQuery({
    queryKey: ["admin_orders_month"],
    queryFn: async () => {
      const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", monthStart);
      if (error) console.error("admin_orders_month error:", error);
      return count || 0;
    },
  });

  // Financial data from ALL non-cancelled orders
  const { data: financials = { gmv: 0, commission: 0, avgTicket: 0, totalOrders: 0 } } = useQuery({
    queryKey: ["admin_financials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("total_price, status")
        .neq("status", "cancelled")
        .neq("status", "draft");
      if (error) console.error("admin_financials error:", error);
      const gmv = data?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0;
      const commission = gmv * 0.2;
      const totalOrders = data?.length || 0;
      const avgTicket = totalOrders > 0 ? gmv / totalOrders : 0;
      return { gmv, commission, avgTicket, totalOrders };
    },
  });

  // Payments data
  const { data: paymentsData = { total: 0, confirmed: 0, pending: 0 } } = useQuery({
    queryKey: ["admin_payments_summary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("amount, status, asaas_status");
      if (error) console.error("admin_payments error:", error);
      const total = data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const confirmed = data?.filter(p => p.status === "confirmed" || p.asaas_status === "RECEIVED" || p.asaas_status === "CONFIRMED").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pending = data?.filter(p => p.status === "pending" && p.asaas_status !== "RECEIVED").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return { total, confirmed, pending };
    },
  });

  // Withdrawals data
  const { data: withdrawalsData = { total: 0, pending: 0, processed: 0 } } = useQuery({
    queryKey: ["admin_withdrawals_summary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawals").select("amount, status");
      if (error) console.error("admin_withdrawals error:", error);
      const total = data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const pending = data?.filter(w => w.status === "pending").reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const processed = data?.filter(w => w.status === "processed" || w.status === "paid").reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      return { total, pending, processed };
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

  const { data: totalPros = 0 } = useQuery({
    queryKey: ["admin_total_pros"],
    queryFn: async () => {
      const { count } = await supabase.from("pro_profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin_recent_orders"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_price, scheduled_date, client_id, status, pro_id")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!orders || orders.length === 0) return [];
      const clientIds = [...new Set(orders.map(o => o.client_id))];
      const proIds = [...new Set(orders.filter(o => o.pro_id).map(o => o.pro_id!))];
      const allIds = [...new Set([...clientIds, ...proIds])];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", allIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      return orders.map(o => ({ 
        ...o, 
        clientName: profileMap.get(o.client_id) || "Cliente",
        proName: o.pro_id ? (profileMap.get(o.pro_id) || "Diarista") : "—",
      }));
    },
  });

  // Recent payments
  const { data: recentPayments = [] } = useQuery({
    queryKey: ["admin_recent_payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, method, status, asaas_status, created_at, user_id, order_id")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!data || data.length === 0) return [];
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      return data.map(p => ({
        ...p,
        clientName: profileMap.get(p.user_id) || "Cliente",
        displayStatus: p.asaas_status === "RECEIVED" || p.status === "confirmed" ? "Confirmado" : p.status === "pending" ? "Pendente" : p.status || "—",
      }));
    },
  });

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

  return (
    <AdminLayout>
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

      {/* Métricas de Pedidos */}
      <AnimatedSection delay={1}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pedidos</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedListItem>
            <MetricCard title="Pedidos hoje" value={ordersToday} icon={ClipboardList} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Pedidos no mês" value={ordersMonth} icon={ClipboardList} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Total de pedidos" value={financials.totalOrders} icon={ClipboardList} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Taxa Cancelamento" value={cancelRate} format="percent" />
          </AnimatedListItem>
        </AnimatedList>
      </AnimatedSection>

      {/* Métricas Financeiras */}
      <AnimatedSection delay={2}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Financeiro</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedListItem>
            <MetricCard title="GMV Total" value={financials.gmv} icon={DollarSign} format="currency" />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Receita (20%)" value={financials.commission} icon={TrendingUp} format="currency" />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Ticket Médio" value={financials.avgTicket} format="currency" />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Pgtos Confirmados" value={paymentsData.confirmed} icon={CreditCard} format="currency" />
          </AnimatedListItem>
        </AnimatedList>
      </AnimatedSection>

      {/* Pagamentos & Saques */}
      <AnimatedSection delay={3}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pagamentos & Saques</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedListItem>
            <MetricCard title="Pgtos Pendentes" value={paymentsData.pending} icon={CreditCard} format="currency" />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Total Pagamentos" value={paymentsData.total} icon={CreditCard} format="currency" />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Saques Pendentes" value={withdrawalsData.pending} icon={ArrowDownToLine} format="currency" />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Saques Processados" value={withdrawalsData.processed} icon={ArrowDownToLine} format="currency" />
          </AnimatedListItem>
        </AnimatedList>
      </AnimatedSection>

      {/* Usuários */}
      <AnimatedSection delay={4}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Usuários</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatedListItem>
            <MetricCard title="Clientes Ativos" value={activeClients} icon={Users} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Total Diaristas" value={totalPros} icon={Star} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Novas Diaristas (7d)" value={newPros7d} icon={UserPlus} />
          </AnimatedListItem>
        </AnimatedList>
      </AnimatedSection>

      {/* Pedidos recentes */}
      <AnimatedSection delay={5} className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Pedidos recentes</h3>
          <button 
            onClick={() => navigate("/admin/orders")}
            className="text-sm text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Pedido</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Diarista</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any, index: number) => (
                <motion.tr 
                  key={order.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.clientName}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.proName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{formatCurrency(Number(order.total_price))}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{order.scheduled_date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Nenhum pedido encontrado</div>
          )}
        </div>
      </AnimatedSection>

      {/* Pagamentos recentes */}
      <AnimatedSection delay={6} className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Pagamentos recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Método</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment: any, index: number) => (
                <motion.tr 
                  key={payment.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-foreground">{payment.clientName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{formatCurrency(Number(payment.amount))}</td>
                  <td className="px-4 py-3 text-sm text-foreground uppercase">{payment.method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      payment.displayStatus === "Confirmado" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    }`}>
                      {payment.displayStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {recentPayments.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Nenhum pagamento encontrado</div>
          )}
        </div>
      </AnimatedSection>
    </AdminLayout>
  );
}
