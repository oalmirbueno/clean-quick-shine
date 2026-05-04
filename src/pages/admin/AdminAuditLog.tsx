import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShieldCheck, Ban, CheckCircle2, XCircle, AlertTriangle, ArrowDownToLine, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTION_LABELS: Record<string, { label: string; icon: any; tone: string }> = {
  client_blocked: { label: "Cliente bloqueado", icon: Ban, tone: "text-destructive" },
  client_unblocked: { label: "Cliente reativado", icon: ShieldCheck, tone: "text-primary" },
  pro_approved: { label: "Diarista aprovada", icon: CheckCircle2, tone: "text-primary" },
  pro_rejected: { label: "Diarista reprovada", icon: XCircle, tone: "text-destructive" },
  pro_suspended: { label: "Diarista suspensa", icon: AlertTriangle, tone: "text-amber-500" },
  pro_reactivated: { label: "Diarista reativada", icon: ShieldCheck, tone: "text-primary" },
  doc_approved: { label: "Documento aprovado", icon: FileText, tone: "text-primary" },
  doc_rejected: { label: "Documento rejeitado", icon: FileText, tone: "text-destructive" },
  withdrawal_approved: { label: "Saque aprovado", icon: ArrowDownToLine, tone: "text-primary" },
  withdrawal_rejected: { label: "Saque rejeitado", icon: ArrowDownToLine, tone: "text-destructive" },
  withdrawal_completed: { label: "Saque concluído", icon: ArrowDownToLine, tone: "text-primary" },
  notification_sent: { label: "Notificação enviada", icon: User, tone: "text-muted-foreground" },
};

export default function AdminAuditLog() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin_audit_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30_000,
  });

  const filtered = useMemo(() => {
    return logs.filter((l: any) => {
      if (filter !== "all" && l.action !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(l.admin_name || "").toLowerCase().includes(q) &&
          !(l.target_name || "").toLowerCase().includes(q) &&
          !(l.action || "").toLowerCase().includes(q) &&
          !(l.reason || "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [logs, search, filter]);

  const actions = useMemo(() => Array.from(new Set(logs.map((l: any) => l.action))), [logs]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Auditoria</h1>
          <p className="text-sm text-muted-foreground">Histórico de ações administrativas</p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por admin, alvo ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:bg-muted"
              )}
            >
              Todas ({logs.length})
            </button>
            {actions.map((a) => (
              <button
                key={a}
                onClick={() => setFilter(a)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  filter === a ? "bg-foreground text-background border-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {ACTION_LABELS[a]?.label || a}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log: any) => {
              const meta = ACTION_LABELS[log.action] || { label: log.action, icon: ShieldCheck, tone: "text-muted-foreground" };
              const Icon = meta.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className={cn("w-4 h-4", meta.tone)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{meta.label}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground">{log.admin_name || "Admin"}</span>
                      {log.target_name && (
                        <>
                          {" → "}
                          <span>{log.target_name}</span>
                        </>
                      )}
                    </p>
                    {log.reason && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{log.reason}"</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
