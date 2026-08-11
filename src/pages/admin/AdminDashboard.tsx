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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { AdminDateFilter, presetToRange, type DatePreset, type DateRange } from "@/components/admin/AdminDateFilter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";

type DailyPoint = { day: string; label: string; pedidos: number; faturamento: number };

interface RangeAgg {
  totalOrders: number;
  gmv: number;
  commission: number;
  avgTicket: number;
  cancelRate: number;
  daily: DailyPoint[];
}

const EMPTY_AGG: RangeAgg = { totalOrders: 0, gmv: 0, commission: 0, avgTicket: 0, cancelRate: 0, daily: [] };

function aggregateOrders(rows: { status: string; total_price: number; created_at: string }[]): RangeAgg {
  const valid = rows.filter((o) => o.status !== "cancelled" && o.status !== "draft");
  const gmv = valid.reduce((s, o) => s + Number(o.total_price), 0);
  const cancelled = rows.filter((o) => o.status === "cancelled").length;
  const byDay = new Map<string, DailyPoint>();
  for (const o of valid) {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const point =
      byDay.get(key) ||
      ({ day: key, label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), pedidos: 0, faturamento: 0 } as DailyPoint);
    point.pedidos += 1;
    point.faturamento += Number(o.total_price);
    byDay.set(key, point);
  }
  return {
    totalOrders: valid.length,
    gmv,
    commission: gmv * 0.2,
    avgTicket: valid.length ? gmv / valid.length : 0,
    cancelRate: rows.length ? (cancelled / rows.length) * 100 : 0,
    daily: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
  };
}

// Uma única query traz status/valor/data e o resto é derivado localmente —
// métricas, taxa de cancelamento e a série diária dos gráficos.
async function fetchRangeOrders(from: string | null, to: string | null): Promise<RangeAgg> {
  let q = supabase.from("orders").select("status, total_price, created_at").limit(10000);
  if (from) q = q.gte("created_at", new Date(`${from}T00:00:00`).toISOString());
  if (to) q = q.lte("created_at", new Date(`${to}T23:59:59.999`).toISOString());
  const { data, error } = await q;
  if (error) {
    console.error("admin_range_orders error:", error);
    return EMPTY_AGG;
  }
  return aggregateOrders((data as { status: string; total_price: number; created_at: string }[]) || []);
}

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const now = new Date();
  // Limites no fuso LOCAL convertidos para instantes UTC — usar a data ISO
  // crua ("YYYY-MM-DD") contra timestamptz deslocava o dia em 3h no Brasil.
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = startOfToday.toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  // Filtro de período: escopa as métricas de pedidos, financeiro,
  // pagamentos, saques e entregas (dia a dia ou intervalo custom).
  const [datePreset, setDatePreset] = useState<DatePreset>("tudo");
  const [dateRange, setDateRange] = useState<DateRange>(presetToRange("tudo"));

  // Aplica o período sobre uma coluna timestamptz respeitando o dia local
  // (T00:00:00/T23:59:59.999 sem offset seriam lidos como UTC pelo Postgres)
  const applyCreatedRange = <T extends { gte: (c: string, v: string) => T; lte: (c: string, v: string) => T }>(q: T): T => {
    let out = q;
    if (dateRange.from) out = out.gte("created_at", new Date(`${dateRange.from}T00:00:00`).toISOString());
    if (dateRange.to) out = out.lte("created_at", new Date(`${dateRange.to}T23:59:59.999`).toISOString());
    return out;
  };

  // Tempo real: mudanças em pedidos/pagamentos/saques atualizam o dashboard
  // na hora; refetch periódico de 30s como retaguarda.
  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("admin_") });
    };
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, invalidate)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: ordersToday = 0 } = useQuery({
    queryKey: ["admin_orders_today", today],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today);
      if (error) console.error("admin_orders_today error:", error);
      return count || 0;
    },
  });

  const { data: ordersMonth = 0 } = useQuery({
    queryKey: ["admin_orders_month"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", monthStart);
      if (error) console.error("admin_orders_month error:", error);
      return count || 0;
    },
  });

  // ---- Período anterior de mesmo tamanho (para os comparativos) ----
  const bounded = !!(dateRange.from && dateRange.to);
  const prevRange = useMemo(() => {
    if (!bounded) return null;
    const from = new Date(`${dateRange.from}T00:00:00`);
    const to = new Date(`${dateRange.to}T00:00:00`);
    const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    return {
      from: isoDay(new Date(from.getTime() - days * 86400000)),
      to: isoDay(new Date(from.getTime() - 86400000)),
      days,
    };
  }, [bounded, dateRange.from, dateRange.to]);

  // Métricas do período em UMA query (status/valor/data → derivação local)
  const { data: financials = EMPTY_AGG } = useQuery({
    queryKey: ["admin_financials", dateRange.from, dateRange.to],
    refetchInterval: 30000,
    queryFn: () => fetchRangeOrders(dateRange.from, dateRange.to),
  });

  const { data: prevFinancials } = useQuery({
    enabled: !!prevRange,
    queryKey: ["admin_financials_prev", prevRange?.from, prevRange?.to],
    refetchInterval: 30000,
    queryFn: () => fetchRangeOrders(prevRange!.from, prevRange!.to),
  });

  // Série dos gráficos: com "Tudo" selecionado mostra os últimos 30 dias
  const { data: chartAgg } = useQuery({
    enabled: !bounded,
    queryKey: ["admin_chart_30d"],
    refetchInterval: 30000,
    queryFn: () => {
      const r = presetToRange("30d");
      return fetchRangeOrders(r.from, r.to);
    },
  });
  const dailySeries = bounded ? financials.daily : chartAgg?.daily || [];

  // Variação % vs período anterior (undefined esconde o badge)
  const delta = (cur: number, prev?: number | null): number | undefined =>
    prev == null || prev === 0 ? undefined : Math.round(((cur - prev) / prev) * 100);

  // Payments data
  const { data: paymentsData = { total: 0, confirmed: 0, pending: 0 } } = useQuery({
    queryKey: ["admin_payments_summary", dateRange.from, dateRange.to],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await applyCreatedRange(
        supabase.from("payments").select("amount, status, asaas_status")
      );
      if (error) console.error("admin_payments error:", error);
      const total = data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const confirmed = data?.filter(p => p.status === "confirmed" || p.asaas_status === "RECEIVED" || p.asaas_status === "CONFIRMED").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pending = data?.filter(p => p.status === "pending" && p.asaas_status !== "RECEIVED").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return { total, confirmed, pending };
    },
  });

  // Withdrawals data
  const { data: withdrawalsData = { total: 0, pending: 0, processed: 0 } } = useQuery({
    queryKey: ["admin_withdrawals_summary", dateRange.from, dateRange.to],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await applyCreatedRange(
        supabase.from("withdrawals").select("amount, status")
      );
      if (error) console.error("admin_withdrawals error:", error);
      const total = data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const pending = data?.filter(w => w.status === "pending").reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const processed = data?.filter(w => w.status === "completed" || w.status === "processing").reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      return { total, pending, processed };
    },
  });

  // Entregas: serviços concluídos com data agendada dentro do período
  const { data: deliveredInRange = 0 } = useQuery({
    queryKey: ["admin_delivered_range", dateRange.from, dateRange.to],
    refetchInterval: 30000,
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["completed", "paid_out"]);
      if (dateRange.from) query = query.gte("scheduled_date", dateRange.from);
      if (dateRange.to) query = query.lte("scheduled_date", dateRange.to);
      const { count, error } = await query;
      if (error) console.error("admin_delivered_range error:", error);
      return count || 0;
    },
  });

  // Entregas do período anterior (comparativo)
  const { data: prevDelivered = 0 } = useQuery({
    enabled: !!prevRange,
    queryKey: ["admin_delivered_prev", prevRange?.from, prevRange?.to],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["completed", "paid_out"])
        .gte("scheduled_date", prevRange!.from)
        .lte("scheduled_date", prevRange!.to);
      if (error) console.error("admin_delivered_prev error:", error);
      return count || 0;
    },
  });

  const cancelRate = financials.cancelRate;

  const { data: newPros7d = 0 } = useQuery({
    queryKey: ["admin_new_pros_7d"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count } = await supabase.from("pro_profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo);
      return count || 0;
    },
  });

  const { data: activeClients = 0 } = useQuery({
    queryKey: ["admin_active_clients"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "client");
      return count || 0;
    },
  });

  const { data: totalPros = 0 } = useQuery({
    queryKey: ["admin_total_pros"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count } = await supabase.from("pro_profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin_recent_orders"],
    refetchInterval: 30000,
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
    refetchInterval: 30000,
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

      {/* Filtro por período — escopa pedidos, financeiro, pagamentos, saques e entregas */}
      <AdminDateFilter
        preset={datePreset}
        range={dateRange}
        onChange={(p, r) => {
          setDatePreset(p);
          setDateRange(r);
        }}
      />

      {/* Métricas de Pedidos */}
      <AnimatedSection delay={1}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pedidos</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatedListItem>
            <MetricCard title="Pedidos hoje" value={ordersToday} icon={ClipboardList} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Pedidos no mês" value={ordersMonth} icon={ClipboardList} />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard
              title="Pedidos no período"
              value={financials.totalOrders}
              icon={ClipboardList}
              trend={delta(financials.totalOrders, prevFinancials?.totalOrders)}
              trendLabel="vs anterior"
            />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard
              title="Entregas no período"
              value={deliveredInRange}
              icon={ClipboardList}
              trend={delta(deliveredInRange, prevRange ? prevDelivered : null)}
              trendLabel="vs anterior"
            />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Taxa Cancelamento" value={cancelRate} format="percent" />
          </AnimatedListItem>
        </AnimatedList>
      </AnimatedSection>

      {/* Comparativo dia a dia */}
      {dailySeries.length > 0 && (
        <AnimatedSection delay={2}>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Dia a dia {!bounded && "(últimos 30 dias)"}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">Pedidos por dia</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailySeries} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [v, "Pedidos"]}
                  />
                  <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">Faturamento por dia</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailySeries} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [`R$ ${Number(v).toFixed(2).replace(".", ",")}`, "Faturamento"]}
                  />
                  <Bar dataKey="faturamento" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Métricas Financeiras */}
      <AnimatedSection delay={2}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Financeiro</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatedListItem>
            <MetricCard
              title="GMV no período"
              value={financials.gmv}
              icon={DollarSign}
              format="currency"
              trend={delta(financials.gmv, prevFinancials?.gmv)}
              trendLabel="vs anterior"
            />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard
              title="Receita (20%)"
              value={financials.commission}
              icon={TrendingUp}
              format="currency"
              trend={delta(financials.commission, prevFinancials?.commission)}
              trendLabel="vs anterior"
            />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard
              title="Ticket Médio"
              value={financials.avgTicket}
              format="currency"
              trend={delta(financials.avgTicket, prevFinancials?.avgTicket)}
              trendLabel="vs anterior"
            />
          </AnimatedListItem>
          <AnimatedListItem>
            <MetricCard title="Pgtos Confirmados" value={paymentsData.confirmed} icon={CreditCard} format="currency" />
          </AnimatedListItem>
        </AnimatedList>
      </AnimatedSection>

      {/* Pagamentos & Saques */}
      <AnimatedSection delay={3}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pagamentos & Saques</h3>
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <AnimatedList className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
