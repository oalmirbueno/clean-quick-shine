import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminDateFilter, presetToRange, type DatePreset, type DateRange } from "@/components/admin/AdminDateFilter";

/** Qual data o filtro de período usa */
type DateField = "created_at" | "scheduled_date";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("tudo");
  const [dateRange, setDateRange] = useState<DateRange>(presetToRange("tudo"));
  const [dateField, setDateField] = useState<DateField>("scheduled_date");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin_all_orders", dateField, dateRange.from, dateRange.to],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          id, total_price, base_price, discount, zone_fee, status, scheduled_date, scheduled_time,
          created_at, client_id, pro_id, service_id,
          services(name),
          addresses(street, number, city)
        `)
        .order("created_at", { ascending: false })
        .limit(500);
      // created_at é timestamptz; scheduled_date é date — os limites do dia
      // precisam de tratamento diferente para incluir o dia inteiro.
      if (dateRange.from) {
        query = dateField === "created_at"
          ? query.gte("created_at", new Date(`${dateRange.from}T00:00:00`).toISOString())
          : query.gte("scheduled_date", dateRange.from);
      }
      if (dateRange.to) {
        query = dateField === "created_at"
          ? query.lte("created_at", new Date(`${dateRange.to}T23:59:59.999`).toISOString())
          : query.lte("scheduled_date", dateRange.to);
      }
      const { data, error } = await query;
      if (error) console.error("admin_all_orders error:", error);
      return data || [];
    },
  });

  const clientIds = useMemo(
    () => Array.from(new Set((orders as any[]).map((o) => o.client_id).filter(Boolean))),
    [orders]
  );

  const { data: clientMap = {} } = useQuery({
    queryKey: ["admin_orders_clients", clientIds],
    enabled: clientIds.length > 0,
    queryFn: async () => {
      const [profilesRes, emailsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", clientIds as string[]),
        supabase.rpc("get_users_emails", { _user_ids: clientIds as string[] }),
      ]);
      const map: Record<string, { name: string; email: string }> = {};
      (profilesRes.data || []).forEach((p: any) => {
        map[p.user_id] = { name: p.full_name || "", email: map[p.user_id]?.email || "" };
      });
      (emailsRes.data || []).forEach((e: any) => {
        map[e.user_id] = { name: map[e.user_id]?.name || "", email: e.email || "" };
      });
      return map;
    },
  });

  const filteredOrders = (orders as any[]).filter((order: any) => {
    const c = clientMap[order.client_id] || { name: "", email: "" };
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      (order.services?.name || "").toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Resumo do período filtrado (respeita busca/status/período)
  const summary = useMemo(() => {
    const valid = filteredOrders.filter((o: any) => o.status !== "cancelled" && o.status !== "draft");
    const revenue = valid.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
    const delivered = filteredOrders.filter((o: any) => o.status === "completed" || o.status === "paid_out").length;
    const cancelled = filteredOrders.filter((o: any) => o.status === "cancelled").length;
    return { count: filteredOrders.length, revenue, delivered, cancelled };
  }, [filteredOrders]);

  const columns = [
    { key: "id", header: "Pedido", render: (o: any) => `#${o.id.slice(0, 8)}` },
    { key: "service", header: "Serviço", render: (o: any) => o.services?.name || "—" },
    {
      key: "client",
      header: "Cliente",
      render: (o: any) => clientMap[o.client_id]?.name || "—",
    },
    {
      key: "email",
      header: "Email",
      render: (o: any) => (
        <span className="text-xs text-muted-foreground">{clientMap[o.client_id]?.email || "—"}</span>
      ),
    },
    {
      key: "totalPrice",
      header: "Total",
      render: (o: any) => `R$ ${Number(o.total_price).toFixed(2).replace(".", ",")}`,
    },
    {
      key: "status",
      header: "Status",
      render: (o: any) => <StatusBadge status={o.status} />,
    },
    { key: "date", header: "Data", render: (o: any) => o.scheduled_date },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">Gerenciar todos os pedidos</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AdminDateFilter
            preset={datePreset}
            range={dateRange}
            onChange={(p, r) => {
              setDatePreset(p);
              setDateRange(r);
            }}
          />
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value as DateField)}
            className="px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            aria-label="Campo de data do filtro"
          >
            <option value="scheduled_date">Data do serviço (entrega)</option>
            <option value="created_at">Data do pedido (criação)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por pedido, serviço, cliente ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendado</option>
          <option value="confirmed">Confirmado</option>
          <option value="en_route">A caminho</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluído</option>
          <option value="paid_out">Pago</option>
          <option value="cancelled">Cancelado</option>
          <option value="in_review">Em análise</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Pedidos no período</p>
          <p className="text-lg font-bold text-foreground">{summary.count}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Faturamento</p>
          <p className="text-lg font-bold text-foreground">
            R$ {summary.revenue.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Entregas concluídas</p>
          <p className="text-lg font-bold text-foreground">{summary.delivered}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Cancelados</p>
          <p className="text-lg font-bold text-foreground">{summary.cancelled}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <AdminTable
          columns={columns}
          data={filteredOrders}
          keyField="id"
          onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
        />
      </div>
    </AdminLayout>
  );
}
