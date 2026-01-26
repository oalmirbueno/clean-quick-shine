import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { pros } from "@/lib/mockDataV2";
import type { Pro } from "@/lib/mockDataV2";
import { Search, Star } from "lucide-react";

export default function AdminPros() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPros = pros.filter(pro => {
    const matchesSearch = 
      pro.name.toLowerCase().includes(search.toLowerCase()) ||
      pro.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      pro.verifiedStatus === statusFilter ||
      pro.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: "name", 
      header: "Nome",
      render: (p: Pro) => (
        <div className="flex items-center gap-3">
          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
          <span>{p.name}</span>
        </div>
      )
    },
    { key: "city", header: "Cidade" },
    { 
      key: "ratingAvg", 
      header: "Avaliação",
      render: (p: Pro) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-warning text-warning" />
          <span>{p.ratingAvg.toFixed(1)}</span>
        </div>
      )
    },
    { key: "jobsDone", header: "Serviços" },
    { 
      key: "verifiedStatus", 
      header: "Verificação",
      render: (p: Pro) => <StatusBadge status={p.verifiedStatus} />
    },
    { 
      key: "plan", 
      header: "Plano",
      render: (p: Pro) => <StatusBadge status={p.plan} />
    },
    { 
      key: "status", 
      header: "Status",
      render: (p: Pro) => <StatusBadge status={p.status} />
    },
  ];

  return (
    <div className="min-h-screen bg-background safe-top">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diaristas</h1>
            <p className="text-muted-foreground">Gerenciar profissionais cadastradas</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
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
              <option value="all">Todos</option>
              <option value="pending">Verificação pendente</option>
              <option value="approved">Aprovadas</option>
              <option value="rejected">Rejeitadas</option>
              <option value="suspended">Suspensas</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
            <AdminTable
              columns={columns}
              data={filteredPros}
              keyField="id"
              onRowClick={(pro) => navigate(`/admin/pros/${pro.id}`)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
