import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Search, Building2, Calendar, Clock, MapPin, Eye, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminQuotes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: quotes = [] } = useQuery({
    queryKey: ["admin_quotes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("quotes")
        .select("*, companies(company_name)")
        .order("created_at", { ascending: false });
      return (data || []).map((q: any) => ({
        ...q,
        companyName: q.companies?.company_name || "Empresa",
        details: q.details || {},
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("quotes").update({ status }).eq("id", id);
    },
    onSuccess: () => { toast.success("Status atualizado!"); queryClient.invalidateQueries({ queryKey: ["admin_quotes"] }); },
  });

  const filteredQuotes = quotes.filter((quote: any) => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    const matchesSearch = !search || quote.companyName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusLabel = (status: string) => {
    switch (status) { case "pending": return "Pendente"; case "approved": return "Aprovado"; case "rejected": return "Rejeitado"; case "active": return "Ativo"; default: return status; }
  };

  const pendingCount = quotes.filter((q: any) => q.status === "pending").length;
  const approvedCount = quotes.filter((q: any) => q.status === "approved" || q.status === "active").length;
  const totalValue = quotes.filter((q: any) => q.status === "approved" || q.status === "active").reduce((sum: number, q: any) => sum + (q.estimated_value || 0), 0);

  return (
    <div className="min-h-screen bg-background flex safe-top">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-7 h-7 text-primary" />Orçamentos Comerciais</h1>
            <p className="text-muted-foreground">Gerencie solicitações de empresas</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-warning">{pendingCount}</p></div>
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Aprovados</p><p className="text-2xl font-bold text-success">{approvedCount}</p></div>
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Valor total</p><p className="text-2xl font-bold text-foreground">R$ {totalValue.toLocaleString()}</p></div>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Buscar empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "active", "rejected"].map(status => (
                <button key={status} onClick={() => setStatusFilter(status)} className={cn("px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap", statusFilter === status ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent")}>{status === "all" ? "Todos" : getStatusLabel(status)}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuotes.map((quote: any) => (
              <div key={quote.id} className="p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{quote.companyName}</h3>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium",
                        quote.status === "pending" && "bg-warning/20 text-warning",
                        quote.status === "approved" && "bg-success/20 text-success",
                        quote.status === "active" && "bg-primary/20 text-primary",
                        quote.status === "rejected" && "bg-destructive/20 text-destructive"
                      )}>{getStatusLabel(quote.status)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Solicitado em {new Date(quote.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor estimado</p>
                    <p className="text-xl font-bold text-foreground">R$ {(quote.estimated_value || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  {quote.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus.mutate({ id: quote.id, status: "approved" })} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm hover:opacity-90"><Check className="w-4 h-4" />Aprovar</button>
                      <button onClick={() => updateStatus.mutate({ id: quote.id, status: "rejected" })} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm hover:opacity-90"><X className="w-4 h-4" />Rejeitar</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredQuotes.length === 0 && (
            <div className="p-12 bg-card rounded-xl border border-border text-center"><Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Nenhum orçamento encontrado</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
