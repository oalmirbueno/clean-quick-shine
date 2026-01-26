import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { orders } from "@/lib/mockDataV2";
import type { Order } from "@/lib/mockDataV2";
import { Search, Filter } from "lucide-react";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.includes(search) ||
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (order.proName && order.proName.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: "id", header: "ID", render: (o: Order) => `#${o.id}` },
    { key: "clientName", header: "Cliente" },
    { key: "proName", header: "Diarista", render: (o: Order) => o.proName || "—" },
    { key: "serviceName", header: "Serviço" },
    { 
      key: "totalPrice", 
      header: "Total", 
      render: (o: Order) => `R$ ${o.totalPrice.toFixed(2).replace(".", ",")}` 
    },
    { 
      key: "commissionValue", 
      header: "Comissão", 
      render: (o: Order) => `R$ ${o.commissionValue.toFixed(2).replace(".", ",")}` 
    },
    { 
      key: "status", 
      header: "Status", 
      render: (o: Order) => <StatusBadge status={o.status} /> 
    },
    { key: "date", header: "Data" },
  ];

  return (
    <div className="min-h-screen bg-background safe-top">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Gerenciar todos os pedidos</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente ou diarista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-input bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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

          {/* Table */}
          <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
            <AdminTable
              columns={columns}
              data={filteredOrders}
              keyField="id"
              onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
