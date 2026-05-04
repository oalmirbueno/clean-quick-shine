import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Bell, CheckCircle2, AlertTriangle, XCircle, MinusCircle, Smartphone, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DispatchLog = {
  id: string;
  user_id: string | null;
  channel: "in_app" | "push";
  title: string | null;
  message: string | null;
  type: string | null;
  status: "success" | "failed" | "partial" | "skipped";
  endpoint: string | null;
  error: string | null;
  payload: any;
  caller_id: string | null;
  created_at: string;
  recipientName?: string;
};

const statusMeta: Record<DispatchLog["status"], { label: string; cls: string; icon: React.ReactNode }> = {
  success: { label: "Sucesso", cls: "bg-primary/15 text-primary", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  failed:  { label: "Falha",   cls: "bg-destructive/15 text-destructive", icon: <XCircle className="w-3.5 h-3.5" /> },
  partial: { label: "Parcial", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  skipped: { label: "Ignorado",cls: "bg-muted text-muted-foreground", icon: <MinusCircle className="w-3.5 h-3.5" /> },
};

export default function AdminNotificationLogs() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "in_app" | "push">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DispatchLog["status"]>("all");

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery<DispatchLog[]>({
    queryKey: ["admin_notification_dispatch_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_dispatch_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const userIds = Array.from(new Set((data || []).map((l: any) => l.user_id).filter(Boolean)));
      if (userIds.length === 0) return (data as any) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const map = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      return (data || []).map((l: any) => ({ ...l, recipientName: map.get(l.user_id) || "—" }));
    },
    refetchInterval: 30_000,
  });

  const counts = useMemo(() => ({
    all: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    failed: logs.filter((l) => l.status === "failed").length,
    partial: logs.filter((l) => l.status === "partial").length,
    skipped: logs.filter((l) => l.status === "skipped").length,
  }), [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (channelFilter !== "all" && l.channel !== channelFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [l.title, l.message, l.error, l.recipientName, l.endpoint, l.type].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, channelFilter, statusFilter, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Histórico de envios</h1>
            <p className="text-sm text-muted-foreground">Push e in-app — detecte falhas e endpoints inválidos</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border border-border/60 text-xs font-medium hover:bg-muted flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="Total" value={counts.all} icon={<Bell className="w-4 h-4" />} />
          <Stat label="Sucesso" value={counts.success} icon={<CheckCircle2 className="w-4 h-4 text-primary" />} />
          <Stat label="Falhas" value={counts.failed} icon={<XCircle className="w-4 h-4 text-destructive" />} highlight={counts.failed > 0} />
          <Stat label="Parcial" value={counts.partial} icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} />
          <Stat label="Ignorado" value={counts.skipped} icon={<MinusCircle className="w-4 h-4 text-muted-foreground" />} />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por título, erro, destinatário ou endpoint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ["all", "Todos canais"],
              ["in_app", "In-app"],
              ["push", "Push"],
            ] as const).map(([k, label]) => (
              <Chip key={k} active={channelFilter === k} onClick={() => setChannelFilter(k as any)}>{label}</Chip>
            ))}
            <div className="w-px bg-border/60 mx-1" />
            {(["all", "success", "failed", "partial", "skipped"] as const).map((s) => (
              <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {s === "all" ? "Todos status" : statusMeta[s as DispatchLog["status"]]?.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((l) => {
              const meta = statusMeta[l.status];
              return (
                <div
                  key={l.id}
                  className={cn(
                    "p-4 rounded-2xl border bg-card shadow-sm transition-colors",
                    l.status === "failed" ? "border-destructive/40" : "border-border/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      {l.channel === "push" ? <Smartphone className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{l.title || "(sem título)"}</p>
                        <span className={cn("text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1", meta.cls)}>
                          {meta.icon}{meta.label}
                        </span>
                      </div>
                      {l.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{l.message}</p>}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground flex-wrap">
                        <span className="uppercase tracking-wide font-medium">{l.channel === "push" ? "Push" : "In-app"}</span>
                        <span>·</span>
                        <span className="truncate">→ {l.recipientName}</span>
                        {l.type && (<><span>·</span><span className="capitalize">{l.type}</span></>)}
                        <span>·</span>
                        <span title={format(new Date(l.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}>
                          {formatDistanceToNow(new Date(l.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      {l.error && (
                        <p className="mt-2 text-xs text-destructive bg-destructive/10 rounded-lg px-2 py-1.5 break-all">
                          {l.error}
                        </p>
                      )}
                      {l.endpoint && (
                        <p className="mt-1 text-[10px] text-muted-foreground/80 truncate font-mono">
                          {l.endpoint}
                        </p>
                      )}
                    </div>
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

function Stat({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("p-4 rounded-2xl border bg-card shadow-sm", highlight ? "border-destructive/40" : "border-border/60")}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
        active ? "bg-foreground text-background border-foreground" : "border-border/60 text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
