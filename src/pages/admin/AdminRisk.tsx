import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AlertTriangle, Shield, Search, User, UserX, AlertCircle, Clock, XCircle, ThumbsDown, Ban, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminRisk() {
  const [activeTab, setActiveTab] = useState<"flags" | "actions">("flags");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "pro">("all");
  const [search, setSearch] = useState("");

  const { data: riskFlags = [] } = useQuery({
    queryKey: ["admin_risk_flags"],
    queryFn: async () => {
      const { data } = await supabase.from("risk_flags").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(f => f.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        return data.map(f => ({ ...f, userName: profileMap.get(f.user_id) || "Desconhecido" }));
      }
      return [];
    },
  });

  const { data: riskActions = [] } = useQuery({
    queryKey: ["admin_risk_actions"],
    queryFn: async () => {
      const { data } = await supabase.from("risk_actions").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(a => a.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        return data.map(a => ({ ...a, userName: profileMap.get(a.user_id) || "Desconhecido" }));
      }
      return [];
    },
  });

  const filteredFlags = riskFlags.filter((flag: any) => {
    const matchesRole = roleFilter === "all" || flag.role === roleFilter;
    const matchesSearch = !search || flag.userName?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredActions = riskActions.filter((action: any) => {
    return !search || action.userName?.toLowerCase().includes(search.toLowerCase());
  });

  const getFlagIcon = (type: string) => {
    switch (type) {
      case "cancellations": return XCircle;
      case "complaints": return ThumbsDown;
      case "no_show": return UserX;
      case "low_rating": return ThumbsDown;
      case "refusals": return Ban;
      case "late": return Clock;
      default: return AlertCircle;
    }
  };

  const getFlagLabel = (type: string) => {
    switch (type) {
      case "cancellations": return "Cancelamentos";
      case "complaints": return "Reclamações";
      case "no_show": return "No-show";
      case "low_rating": return "Rating baixo";
      case "refusals": return "Recusas excessivas";
      case "late": return "Atrasos";
      default: return type;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "priority_reduced": return "Prioridade reduzida";
      case "confirmation_required": return "Confirmação extra";
      case "temp_blocked": return "Bloqueio temporário";
      case "review_required": return "Revisão pendente";
      default: return action;
    }
  };

  const highSeverityCount = riskFlags.filter((f: any) => f.severity === "high").length;
  const activeActionsCount = riskActions.filter((a: any) => !a.end_at).length;
  const clientFlagsCount = riskFlags.filter((f: any) => f.role === "client").length;
  const proFlagsCount = riskFlags.filter((f: any) => f.role === "pro").length;

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Shield className="w-7 h-7 text-primary" />Gestão de Risco</h1>
        <p className="text-muted-foreground">Monitore flags e ações antifraude</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-destructive" /><p className="text-sm text-muted-foreground">Alta severidade</p></div><p className="text-2xl font-bold text-destructive">{highSeverityCount}</p></div>
        <div className="p-4 bg-card rounded-xl border border-border"><div className="flex items-center gap-2 mb-1"><Ban className="w-4 h-4 text-warning" /><p className="text-sm text-muted-foreground">Ações ativas</p></div><p className="text-2xl font-bold text-warning">{activeActionsCount}</p></div>
        <div className="p-4 bg-card rounded-xl border border-border"><div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-primary" /><p className="text-sm text-muted-foreground">Flags clientes</p></div><p className="text-2xl font-bold text-foreground">{clientFlagsCount}</p></div>
        <div className="p-4 bg-card rounded-xl border border-border"><div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-primary" /><p className="text-sm text-muted-foreground">Flags diaristas</p></div><p className="text-2xl font-bold text-foreground">{proFlagsCount}</p></div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("flags")} className={cn("px-4 py-2 rounded-xl font-medium transition-all text-sm", activeTab === "flags" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>Flags ({riskFlags.length})</button>
        <button onClick={() => setActiveTab("actions")} className={cn("px-4 py-2 rounded-xl font-medium transition-all text-sm", activeTab === "actions" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>Ações ({riskActions.length})</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Buscar usuário..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        {activeTab === "flags" && (
          <div className="flex gap-2">
            {(["all", "client", "pro"] as const).map(role => (
              <button key={role} onClick={() => setRoleFilter(role)} className={cn("px-3 py-2 rounded-xl text-sm transition-all", roleFilter === role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {role === "all" ? "Todos" : role === "client" ? "Clientes" : "Diaristas"}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "flags" ? (
        <div className="space-y-3">
          {filteredFlags.map((flag: any) => {
            const Icon = getFlagIcon(flag.type);
            return (
              <div key={flag.id} className="p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", flag.severity === "high" ? "bg-destructive/20" : flag.severity === "medium" ? "bg-warning/20" : "bg-muted")}>
                    <Icon className={cn("w-5 h-5", flag.severity === "high" ? "text-destructive" : flag.severity === "medium" ? "text-warning" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground">{flag.userName}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs", flag.role === "client" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{flag.role === "client" ? "Cliente" : "Diarista"}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", flag.severity === "high" ? "bg-destructive/20 text-destructive" : flag.severity === "medium" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground")}>{flag.severity === "high" ? "Alto" : flag.severity === "medium" ? "Médio" : "Baixo"}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{getFlagLabel(flag.type)}</p>
                    <p className="text-sm text-muted-foreground">{flag.notes}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(flag.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-accent"><Eye className="w-5 h-5 text-muted-foreground" /></button>
                </div>
              </div>
            );
          })}
          {filteredFlags.length === 0 && <div className="p-12 bg-card rounded-xl border border-border text-center"><p className="text-muted-foreground">Nenhuma flag encontrada</p></div>}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action: any) => (
            <div key={action.id} className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{action.userName}</span>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", !action.end_at ? "bg-warning/20 text-warning" : "bg-success/20 text-success")}>{action.end_at ? "Encerrada" : "Ativa"}</span>
                  </div>
                  <p className="text-sm text-foreground">{getActionLabel(action.action)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Início: {new Date(action.start_at).toLocaleDateString("pt-BR")}{action.end_at && ` • Fim: ${new Date(action.end_at).toLocaleDateString("pt-BR")}`}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredActions.length === 0 && <div className="p-12 bg-card rounded-xl border border-border text-center"><p className="text-muted-foreground">Nenhuma ação encontrada</p></div>}
        </div>
      )}
    </AdminLayout>
  );
}
