import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPros() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: pros = [], isLoading } = useQuery({
    queryKey: ["admin_all_pros"],
    queryFn: async () => {
      const { data: proProfiles, error } = await supabase
        .from("pro_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("admin_all_pros error:", error);
        return [];
      }
      if (!proProfiles || proProfiles.length === 0) return [];

      const userIds = proProfiles.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, phone")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      return proProfiles.map(pro => ({
        ...pro,
        profiles: profileMap.get(pro.user_id) || null,
      }));
    },
  });

  const filteredPros = pros.filter((pro: any) => {
    const name = pro.profiles?.full_name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "pending" && !pro.verified && pro.status === "pending") ||
      (statusFilter === "approved" && pro.verified) ||
      (statusFilter === "suspended" && pro.status === "suspended");
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: "name", 
      header: "Nome",
      render: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
            {(p.profiles?.full_name || "?")[0]}
          </div>
          <span>{p.profiles?.full_name || "Sem nome"}</span>
        </div>
      )
    },
    { 
      key: "rating", 
      header: "Avaliação",
      render: (p: any) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-warning text-warning" />
          <span>{Number(p.rating || 0).toFixed(1)}</span>
        </div>
      )
    },
    { key: "jobs_done", header: "Serviços", render: (p: any) => p.jobs_done || 0 },
    { 
      key: "verified", 
      header: "Verificação",
      render: (p: any) => <StatusBadge status={p.verified ? "approved" : "pending"} />
    },
    { 
      key: "status", 
      header: "Status",
      render: (p: any) => <StatusBadge status={p.status || "pending"} />
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Diaristas</h1>
        <p className="text-muted-foreground">Gerenciar profissionais cadastradas</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
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
          <option value="all">Todos</option>
          <option value="pending">Verificação pendente</option>
          <option value="approved">Aprovadas</option>
          <option value="suspended">Suspensas</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground animate-pulse">
          Carregando diaristas...
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
          <AdminTable
            columns={columns}
            data={filteredPros}
            keyField="id"
            onRowClick={(pro) => navigate(`/admin/pros/${pro.user_id}`)}
          />
        </div>
      )}
    </AdminLayout>
  );
}
