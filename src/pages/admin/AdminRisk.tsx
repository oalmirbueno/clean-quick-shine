import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  AlertTriangle, 
  Shield, 
  Search, 
  Filter,
  User,
  UserX,
  AlertCircle,
  Clock,
  XCircle,
  ThumbsDown,
  Ban,
  Eye
} from "lucide-react";
import { clients, pros, riskFlags, riskActions } from "@/lib/mockDataV3";
import { cn } from "@/lib/utils";

export default function AdminRisk() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"flags" | "actions">("flags");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "pro">("all");
  const [search, setSearch] = useState("");

  // Filter flags
  const filteredFlags = riskFlags.filter(flag => {
    const matchesRole = roleFilter === "all" || flag.userRole === roleFilter;
    const user = flag.userRole === "client" 
      ? clients.find(c => c.id === flag.userId)
      : pros.find(p => p.id === flag.userId);
    const matchesSearch = !search || user?.name.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filter actions
  const filteredActions = riskActions.filter(action => {
    const user = clients.find(c => c.id === action.userId) || pros.find(p => p.id === action.userId);
    return !search || user?.name.toLowerCase().includes(search.toLowerCase());
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

  const getUserName = (userId: string) => {
    return clients.find(c => c.id === userId)?.name || pros.find(p => p.id === userId)?.name || "Desconhecido";
  };

  // Stats
  const highSeverityCount = riskFlags.filter(f => f.severity === "high").length;
  const activeActionsCount = riskActions.filter(a => !a.endAt).length;
  const clientFlagsCount = riskFlags.filter(f => f.userRole === "client").length;
  const proFlagsCount = riskFlags.filter(f => f.userRole === "pro").length;

  return (
    <div className="min-h-screen bg-background flex safe-top">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Gestão de Risco
            </h1>
            <p className="text-muted-foreground">Monitore flags e ações antifraude</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-muted-foreground">Alta severidade</p>
              </div>
              <p className="text-2xl font-bold text-destructive">{highSeverityCount}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="w-4 h-4 text-warning" />
                <p className="text-sm text-muted-foreground">Ações ativas</p>
              </div>
              <p className="text-2xl font-bold text-warning">{activeActionsCount}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">Flags clientes</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{clientFlagsCount}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">Flags diaristas</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{proFlagsCount}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("flags")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                activeTab === "flags"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              )}
            >
              Flags ({riskFlags.length})
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                activeTab === "actions"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              )}
            >
              Ações ({riskActions.length})
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {activeTab === "flags" && (
              <div className="flex gap-2">
                {(["all", "client", "pro"] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-all",
                      roleFilter === role
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-accent"
                    )}
                  >
                    {role === "all" ? "Todos" : role === "client" ? "Clientes" : "Diaristas"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          {activeTab === "flags" ? (
            <div className="space-y-3">
              {filteredFlags.map(flag => {
                const Icon = getFlagIcon(flag.type);
                return (
                  <div
                    key={flag.id}
                    className="p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        flag.severity === "high" ? "bg-destructive/20" :
                        flag.severity === "medium" ? "bg-warning/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          flag.severity === "high" ? "text-destructive" :
                          flag.severity === "medium" ? "text-warning" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {getUserName(flag.userId)}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            flag.userRole === "client" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                          )}>
                            {flag.userRole === "client" ? "Cliente" : "Diarista"}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            flag.severity === "high" ? "bg-destructive/20 text-destructive" :
                            flag.severity === "medium" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                          )}>
                            {flag.severity === "high" ? "Alto" : flag.severity === "medium" ? "Médio" : "Baixo"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {getFlagLabel(flag.type)}
                        </p>
                        <p className="text-sm text-muted-foreground">{flag.notes}</p>
                        <p className="text-xs text-muted-foreground mt-2">{flag.createdAt}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/admin/risk/${flag.userId}`)}
                        className="p-2 rounded-lg hover:bg-accent"
                      >
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActions.map(action => (
                <div
                  key={action.id}
                  className="p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {getUserName(action.userId)}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          !action.endAt ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                        )}>
                          {action.endAt ? "Encerrada" : "Ativa"}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{getActionLabel(action.action)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Início: {action.startAt}
                        {action.endAt && ` • Fim: ${action.endAt}`}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent">
                      {action.endAt ? "Ver detalhes" : "Encerrar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
