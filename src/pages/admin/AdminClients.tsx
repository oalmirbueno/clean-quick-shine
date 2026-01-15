import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { clients } from "@/lib/mockDataV2";
import type { User } from "@/lib/mockDataV2";
import { Search, Ban } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleBlock = () => {
    toast.success(`Cliente ${selectedClient?.name} bloqueado`);
    setShowBlockModal(false);
    setSelectedClient(null);
  };

  const columns = [
    { key: "name", header: "Nome" },
    { key: "email", header: "E-mail" },
    { key: "totalOrders", header: "Pedidos" },
    { 
      key: "totalSpent", 
      header: "Gasto total",
      render: (c: User) => `R$ ${(c.totalSpent || 0).toFixed(2).replace(".", ",")}`
    },
    { 
      key: "riskLevel", 
      header: "Risco",
      render: (c: User) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          c.riskLevel === "low" && "bg-success/10 text-success",
          c.riskLevel === "medium" && "bg-warning/10 text-warning",
          c.riskLevel === "high" && "bg-destructive/10 text-destructive"
        )}>
          {c.riskLevel === "low" ? "Baixo" : c.riskLevel === "medium" ? "Médio" : "Alto"}
        </span>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (c: User) => <StatusBadge status={c.status} />
    },
    {
      key: "actions",
      header: "",
      render: (c: User) => c.status === "active" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedClient(c);
            setShowBlockModal(true);
          }}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
        >
          <Ban className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gerenciar clientes cadastrados</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background
                text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
            <AdminTable
              columns={columns}
              data={filteredClients}
              keyField="id"
            />
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
        title="Bloquear cliente"
        description={`Tem certeza que deseja bloquear ${selectedClient?.name}? O cliente não poderá mais fazer pedidos.`}
        confirmText="Bloquear"
        variant="danger"
      />
    </div>
  );
}
