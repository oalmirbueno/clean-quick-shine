import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Bell, CheckCircle2, Clock, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Notif = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  recipientName?: string;
};

const typeIcon = (t: string) => {
  switch (t) {
    case "success": return <CheckCircle2 className="w-4 h-4 text-primary" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "new_order": return <Bell className="w-4 h-4 text-primary" />;
    default: return <Info className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function AdminNotifications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sent">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: notifications = [], isLoading } = useQuery<Notif[]>({
    queryKey: ["admin_notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, title, message, type, read, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const userIds = Array.from(new Set((data || []).map((n) => n.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      return (data || []).map((n) => ({ ...n, recipientName: nameMap.get(n.user_id) || "Usuário" }));
    },
    refetchInterval: 30_000,
  });

  const types = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n) => n.type && set.add(n.type));
    return Array.from(set);
  }, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (statusFilter === "pending" && n.read) return false;
      if (statusFilter === "sent" && !n.read) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.message.toLowerCase().includes(q) &&
          !(n.recipientName || "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [notifications, statusFilter, typeFilter, search]);

  const counts = useMemo(() => ({
    all: notifications.length,
    pending: notifications.filter((n) => !n.read).length,
    sent: notifications.filter((n) => n.read).length,
  }), [notifications]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm text-muted-foreground">Mensagens enviadas a clientes e diaristas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total" value={counts.all} icon={<Bell className="w-4 h-4" />} />
          <StatCard label="Pendentes" value={counts.pending} icon={<Clock className="w-4 h-4 text-amber-500" />} />
          <StatCard label="Lidas" value={counts.sent} icon={<CheckCircle2 className="w-4 h-4 text-primary" />} />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por título, mensagem ou destinatário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "sent"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {s === "all" ? "Todas" : s === "pending" ? "Pendentes" : "Lidas"}
              </button>
            ))}
            <div className="w-px bg-border/60 mx-1" />
            <button
              onClick={() => setTypeFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                typeFilter === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/60 text-muted-foreground hover:bg-muted"
              )}
            >
              Todos os tipos
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                  typeFilter === t
                    ? "bg-foreground text-background border-foreground"
                    : "border-border/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {t}
              </button>
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
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card shadow-sm transition-colors",
                  !n.read && "border-primary/30 bg-primary/[0.02]"
                )}
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{n.title}</p>
                    <span className={cn(
                      "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 font-medium",
                      n.read ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    )}>
                      {n.read ? "Lida" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    <span className="truncate">→ {n.recipientName}</span>
                    <span>·</span>
                    <span className="capitalize">{n.type}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
