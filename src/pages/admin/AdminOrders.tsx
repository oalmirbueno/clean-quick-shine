import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin_all_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, total_price, base_price, discount, zone_fee, status, scheduled_date, scheduled_time,
          client_id, pro_id, service_id,
          services(name),
          addresses(street, number, city)
        `)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) console.error("admin_all_orders error:", error);
      return data || [];
    },
  });

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.id.includes(search) ||
      (order.services?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: "id", header: "ID", render: (o: any) => `#${o.id.slice(0, 8)}` },
    { key: "service", header: "Serviço", render: (o: any) => o.services?.name || "—" },
    { 
      key: "totalPrice", 
      header: "Total", 
      render: (o: any) => `R$ ${Number(o.total_price).toFixed(2).replace(".", ",")}` 
    },
    { 
      key: "status", 
      header: "Status", 
      render: (o: any) => <StatusBadge status={o.status} /> 
    },
    { key: "date", header: "Data", render: (o: any) => o.scheduled_date },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">Gerenciar todos os pedidos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por ID ou serviço..."
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
