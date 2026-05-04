import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/ui/AdminTable";
import { Search, Ban, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminClients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "blocked">("all");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin_all_clients_v2"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "client");
      if (!roles?.length) return [];
      const userIds = roles.map((r) => r.user_id);
      const [{ data: profiles }, { data: orders }, { data: blocks }] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", userIds),
        supabase.from("orders").select("client_id, total_price, status").in("client_id", userIds),
        supabase.from("risk_actions").select("user_id, action, active, end_at").in("user_id", userIds).eq("action", "block").eq("active", true),
      ]);
      const blocked = new Set((blocks || []).map((b) => b.user_id));
      const stats = new Map<string, { total: number; spent: number }>();
      (orders || []).forEach((o) => {
        const s = stats.get(o.client_id) || { total: 0, spent: 0 };
        s.total += 1;
        if (o.status !== "cancelled" && o.status !== "draft") s.spent += Number(o.total_price || 0);
        stats.set(o.client_id, s);
      });
      return (profiles || []).map((p) => ({
        ...p,
        blocked: blocked.has(p.user_id),
        ordersCount: stats.get(p.user_id)?.total || 0,
        spent: stats.get(p.user_id)?.spent || 0,
      }));
    },
  });

  const filtered = clients.filter((c: any) => {
    const matches =
      (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search);
    if (!matches) return false;
    if (filter === "blocked") return c.blocked;
    if (filter === "active") return !c.blocked;
    return true;
  });

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const columns = [
    {
      key: "full_name",
      header: "Nome",
      render: (c: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
            {(c.full_name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{c.full_name || "Sem nome"}</p>
            <p className="text-xs text-muted-foreground">{c.phone || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "ordersCount", header: "Pedidos", render: (c: any) => c.ordersCount },
    { key: "spent", header: "Gasto", render: (c: any) => <span className="font-medium">{fmt(c.spent)}</span> },
    {
      key: "status",
      header: "Status",
      render: (c: any) =>
        c.blocked ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <Ban className="w-3 h-3" /> Bloqueado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
            <ShieldCheck className="w-3 h-3" /> Ativo
          </span>
        ),
    },
    {
      key: "created_at",
      header: "Cadastro",
      hideOnMobile: true,
      render: (c: any) => new Date(c.created_at).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground">{clients.length} cadastrados • {clients.filter((c: any) => c.blocked).length} bloqueados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-2xl border border-border/60 p-8 text-center text-muted-foreground animate-pulse">
          Carregando…
        </div>
      ) : (
        <div className="md:bg-card md:rounded-2xl md:border md:border-border/60 md:shadow-sm md:overflow-hidden">
          <AdminTable
            columns={columns}
            data={filtered}
            keyField="id"
            onRowClick={(c) => navigate(`/admin/clients/${c.user_id}`)}
            emptyMessage="Nenhum cliente encontrado"
          />
        </div>
      )}
    </AdminLayout>
  );
}
