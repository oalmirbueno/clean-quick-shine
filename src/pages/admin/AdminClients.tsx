import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/ui/AdminTable";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Search, Ban } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin_all_clients"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "client");
      
      if (rolesError) {
        console.error("admin_all_clients roles error:", rolesError);
        return [];
      }
      if (!roles || roles.length === 0) return [];
      
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
      
      if (profilesError) {
        console.error("admin_all_clients profiles error:", profilesError);
        return [];
      }
      
      return profiles || [];
    },
  });

  const filteredClients = clients.filter((client: any) => 
    (client.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (client.phone || "").includes(search)
  );

  const handleBlock = () => {
    toast.success(`Cliente ${selectedClient?.full_name} bloqueado`);
    setShowBlockModal(false);
    setSelectedClient(null);
  };

  const columns = [
    { key: "full_name", header: "Nome", render: (c: any) => c.full_name || "Sem nome" },
    { key: "phone", header: "Telefone", render: (c: any) => c.phone || "—" },
    { 
      key: "created_at", 
      header: "Cadastro",
      render: (c: any) => new Date(c.created_at).toLocaleDateString("pt-BR")
    },
    {
      key: "actions",
      header: "",
      render: (c: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedClient(c);
            setShowBlockModal(true);
          }}
          className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
        >
          <Ban className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">Gerenciar clientes cadastrados</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <AdminTable columns={columns} data={filteredClients} keyField="id" />
      </div>

      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
        title="Bloquear cliente"
        description={`Tem certeza que deseja bloquear ${selectedClient?.full_name}?`}
        confirmText="Bloquear"
        variant="danger"
      />
    </AdminLayout>
  );
}
