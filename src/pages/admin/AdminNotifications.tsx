import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Bell, CheckCircle2, Clock, AlertTriangle, Info, CheckCheck, User as UserIcon, Send, Hash, Calendar, FileText, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/auditLog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Notif = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: any;
  recipientName?: string;
  recipientEmail?: string;
};

const extractOrderId = (n: { data?: any; message?: string }): string => {
  const d = n.data || {};
  const fromData = d.order_id || d.orderId || d.order?.id || d.orderID;
  if (fromData) return String(fromData);
  const m = (n.message || "").match(/#([a-f0-9-]{6,})/i);
  return m ? m[1] : "";
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
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sent">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);

  // Debounce da busca para reduzir requests
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const PAGE_SIZE = 50;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["admin_notifications", { statusFilter, typeFilter, debouncedSearch }],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase
        .from("notifications")
        .select("id, user_id, title, message, type, read, created_at, data")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (statusFilter === "pending") q = q.eq("read", false);
      if (statusFilter === "sent") q = q.eq("read", true);
      if (typeFilter !== "all") q = q.eq("type", typeFilter);
      if (debouncedSearch) {
        // Busca server-side em título/mensagem; nome do destinatário é filtrado em cliente abaixo.
        const safe = debouncedSearch.replace(/[%,]/g, " ");
        q = q.or(`title.ilike.%${safe}%,message.ilike.%${safe}%`);
      }
      const { data: rows, error } = await q;
      if (error) throw error;
      const userIds = Array.from(new Set((rows || []).map((n: any) => n.user_id)));
      let nameMap = new Map<string, string>();
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      }
      const items: Notif[] = ((rows || []) as any[]).map((n) => ({
        ...n,
        recipientName: nameMap.get(n.user_id) || "Usuário",
      }));
      return { items, nextPage: items.length < PAGE_SIZE ? null : (pageParam as number) + 1 };
    },
    getNextPageParam: (last) => last.nextPage,
    refetchInterval: 30_000,
  });

  const notifications = useMemo<Notif[]>(
    () => (data?.pages || []).flatMap((p) => p.items),
    [data]
  );

  // Contagens globais (server-side, independentes da paginação/filtros)
  const { data: globalCounts } = useQuery({
    queryKey: ["admin_notifications_counts"],
    queryFn: async () => {
      const [all, pending] = await Promise.all([
        supabase.from("notifications").select("id", { count: "exact", head: true }),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
      ]);
      const total = all.count ?? 0;
      const pend = pending.count ?? 0;
      return { all: total, pending: pend, sent: Math.max(0, total - pend) };
    },
    refetchInterval: 60_000,
  });

  // Tipos: lista distintos a partir das páginas já carregadas (ampliada conforme rola).
  const types = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n) => n.type && set.add(n.type));
    return Array.from(set);
  }, [notifications]);

  // Filtragem client-side só para refinar busca por nome do destinatário (server já filtrou o resto).
  const filtered = useMemo(() => {
    if (!debouncedSearch) return notifications;
    const q = debouncedSearch.toLowerCase();
    return notifications.filter((n) =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.recipientName || "").toLowerCase().includes(q)
    );
  }, [notifications, debouncedSearch]);

  const counts = useMemo(() => globalCounts || { all: 0, pending: 0, sent: 0 }, [globalCounts]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) throw new Error("Nenhuma notificação selecionada");
      const targets = notifications.filter((n) => ids.includes(n.id) && !n.read);
      if (targets.length === 0) return { count: 0 };
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", targets.map((t) => t.id));
      if (error) throw error;
      await Promise.allSettled(
        targets.map((t) =>
          logAdminAction({
            action: "notification_marked_read",
            targetType: "notification",
            targetId: t.id,
            targetName: t.title,
            metadata: { recipient_user_id: t.user_id, bulk: targets.length > 1 },
          })
        )
      );
      return { count: targets.length };
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: ["admin_notifications"] });
      const prev = qc.getQueriesData<any>({ queryKey: ["admin_notifications"] });
      // Atualiza otimisticamente todas as páginas em cache
      qc.setQueriesData<any>({ queryKey: ["admin_notifications"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            items: p.items.map((n: Notif) => (ids.includes(n.id) ? { ...n, read: true } : n)),
          })),
        };
      });
      return { prev };
    },
    onError: (e: any, _v, ctx: any) => {
      if (ctx?.prev) ctx.prev.forEach(([key, val]: any) => qc.setQueryData(key, val));
      toast.error(e.message || "Erro ao marcar como lida");
    },
    onSuccess: (res) => {
      const c = (res as any)?.count ?? 0;
      if (c === 0) toast.info("Nenhuma notificação pendente na seleção");
      else toast.success(c === 1 ? "Notificação marcada como lida" : `${c} notificações marcadas como lidas`);
      setSelected(new Set());
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin_notifications"] });
      qc.invalidateQueries({ queryKey: ["admin_notifications_counts"] });
    },
  });

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((n) => selected.has(n.id));
  const toggleAll = () => {
    setSelected((s) => {
      if (allFilteredSelected) {
        const n = new Set(s);
        filtered.forEach((f) => n.delete(f.id));
        return n;
      }
      const n = new Set(s);
      filtered.forEach((f) => n.add(f.id));
      return n;
    });
  };

  const selectedPendingCount = useMemo(
    () => notifications.filter((n) => selected.has(n.id) && !n.read).length,
    [notifications, selected]
  );

  // ===================== EXPORT =====================
  const [exporting, setExporting] = useState<null | "csv" | "pdf">(null);

  const fetchAllForExport = async (): Promise<Notif[]> => {
    const all: any[] = [];
    const PAGE = 1000;
    let from = 0;
    // Itera em páginas de 1000 (limite default) até esgotar.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let q = supabase
        .from("notifications")
        .select("id, user_id, title, message, type, read, created_at, data")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (statusFilter === "pending") q = q.eq("read", false);
      if (statusFilter === "sent") q = q.eq("read", true);
      if (typeFilter !== "all") q = q.eq("type", typeFilter);
      if (debouncedSearch) {
        const safe = debouncedSearch.replace(/[%,]/g, " ");
        q = q.or(`title.ilike.%${safe}%,message.ilike.%${safe}%`);
      }
      const { data: rows, error } = await q;
      if (error) throw error;
      const batch = rows || [];
      all.push(...batch);
      if (batch.length < PAGE) break;
      from += PAGE;
      if (all.length >= 20000) break; // hard safety cap
    }
    const userIds = Array.from(new Set(all.map((n) => n.user_id)));
    let nameMap = new Map<string, string>();
    let emailMap = new Map<string, string>();
    if (userIds.length) {
      const [{ data: profiles }, { data: emails }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
        supabase.rpc("get_users_emails", { _user_ids: userIds }),
      ]);
      nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      emailMap = new Map((emails || []).map((e: any) => [e.user_id, e.email]));
    }
    let items: Notif[] = all.map((n) => ({
      ...n,
      recipientName: nameMap.get(n.user_id) || "Usuário",
      recipientEmail: emailMap.get(n.user_id) || "",
    }));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.recipientName || "").toLowerCase().includes(q) ||
        (n.recipientEmail || "").toLowerCase().includes(q)
      );
    }
    return items;
  };

  const filterSuffix = () => {
    const parts = [statusFilter, typeFilter];
    return parts.filter((p) => p && p !== "all").join("_") || "todas";
  };

  const exportCSV = async () => {
    try {
      setExporting("csv");
      const items = await fetchAllForExport();
      if (items.length === 0) { toast.info("Nenhuma notificação para exportar"); return; }
      const headers = ["ID", "Data/Hora", "Status", "Tipo", "Destinatário", "Email", "ID do usuário", "Pedido", "Título", "Mensagem", "Payload"];
      const escape = (v: any) => {
        const s = v == null ? "" : String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = items.map((n) => [
        n.id,
        format(new Date(n.created_at), "yyyy-MM-dd HH:mm:ss"),
        n.read ? "Lida" : "Pendente",
        n.type,
        n.recipientName || "",
        n.recipientEmail || "",
        n.user_id,
        extractOrderId(n),
        n.title,
        n.message,
        n.data ? JSON.stringify(n.data) : "",
      ].map(escape).join(","));
      const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jalimpo_notificacoes_${filterSuffix()}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await logAdminAction({
        action: "notification_marked_read", // reutiliza canal de auditoria; metadata diferencia
        targetType: "notification",
        targetName: "Exportação CSV",
        metadata: { export: "csv", count: items.length, filters: { status: statusFilter, type: typeFilter, search: debouncedSearch } },
      }).catch(() => {});
      toast.success(`${items.length} notificações exportadas (CSV)`);
    } catch (e: any) {
      toast.error(e.message || "Falha ao exportar CSV");
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    try {
      setExporting("pdf");
      const items = await fetchAllForExport();
      if (items.length === 0) { toast.info("Nenhuma notificação para exportar"); return; }
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 32;
      let y = margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Já Limpo — Auditoria de Notificações", margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      const filtersTxt = `Filtros: status=${statusFilter} · tipo=${typeFilter} · busca="${debouncedSearch || "—"}"  ·  Total: ${items.length}  ·  Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
      doc.text(filtersTxt, margin, y);
      y += 14;
      doc.setTextColor(0);

      // Cabeçalho da tabela
      const cols = [
        { label: "Data/Hora", w: 100 },
        { label: "Status", w: 55 },
        { label: "Tipo", w: 70 },
        { label: "Destinatário", w: 130 },
        { label: "Título", w: 160 },
        { label: "Mensagem", w: pageW - margin * 2 - 100 - 55 - 70 - 130 - 160 },
      ];
      const drawHeader = () => {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, pageW - margin * 2, 18, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        let x = margin + 4;
        cols.forEach((c) => { doc.text(c.label, x, y + 12); x += c.w; });
        y += 22;
        doc.setFont("helvetica", "normal");
      };
      drawHeader();

      doc.setFontSize(8);
      items.forEach((n) => {
        const cells = [
          format(new Date(n.created_at), "dd/MM/yy HH:mm"),
          n.read ? "Lida" : "Pendente",
          n.type || "",
          n.recipientName || "",
          n.title || "",
          n.message || "",
        ];
        const wrapped = cells.map((txt, i) => doc.splitTextToSize(String(txt), cols[i].w - 8));
        const rowH = Math.max(...wrapped.map((w) => w.length)) * 10 + 6;
        if (y + rowH > pageH - margin) {
          doc.addPage();
          y = margin;
          drawHeader();
        }
        let x = margin + 4;
        wrapped.forEach((lines, i) => { doc.text(lines, x, y + 10); x += cols[i].w; });
        // separador
        doc.setDrawColor(230);
        doc.line(margin, y + rowH - 2, pageW - margin, y + rowH - 2);
        y += rowH;
      });

      // Rodapé com paginação
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Página ${i}/${pages}`, pageW - margin, pageH - 12, { align: "right" });
      }

      doc.save(`jalimpo_notificacoes_${filterSuffix()}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
      await logAdminAction({
        action: "notification_marked_read",
        targetType: "notification",
        targetName: "Exportação PDF",
        metadata: { export: "pdf", count: items.length, filters: { status: statusFilter, type: typeFilter, search: debouncedSearch } },
      }).catch(() => {});
      toast.success(`${items.length} notificações exportadas (PDF)`);
    } catch (e: any) {
      toast.error(e.message || "Falha ao exportar PDF");
    } finally {
      setExporting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Notificações</h1>
            <p className="text-sm text-muted-foreground">Mensagens enviadas a clientes e diaristas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={!!exporting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-border/60 bg-card hover:bg-muted transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {exporting === "csv" ? "Exportando…" : "Exportar CSV"}
            </button>
            <button
              onClick={exportPDF}
              disabled={!!exporting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              {exporting === "pdf" ? "Gerando…" : "Exportar PDF"}
            </button>
          </div>
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

        {/* Bulk action bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/60 bg-card shadow-sm">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAll}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-muted-foreground">
                {selected.size > 0 ? `${selected.size} selecionada(s)` : "Selecionar todas"}
              </span>
            </label>
            <div className="flex items-center gap-2">
              {counts.pending > 0 && (
                <button
                  onClick={async () => {
                    const { data: pend, error } = await supabase
                      .from("notifications").select("id").eq("read", false).limit(5000);
                    if (error) { toast.error("Erro ao buscar pendentes"); return; }
                    markRead.mutate((pend || []).map((p: any) => p.id));
                  }}
                  disabled={markRead.isPending}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-border/60 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Marcar todas como lidas ({counts.pending})
                </button>
              )}
              <button
                onClick={() => markRead.mutate(Array.from(selected))}
                disabled={markRead.isPending || selectedPendingCount === 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar selecionadas como lidas
                {selectedPendingCount > 0 && ` (${selectedPendingCount})`}
              </button>
            </div>
          </div>
        )}

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
                role="button"
                tabIndex={0}
                onClick={() => setDetailId(n.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetailId(n.id); } }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card shadow-sm transition-colors cursor-pointer hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30",
                  !n.read && "border-primary/30 bg-primary/[0.02]",
                  selected.has(n.id) && "ring-2 ring-primary/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(n.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggle(n.id)}
                  className="mt-1.5 w-4 h-4 accent-primary shrink-0"
                  aria-label="Selecionar notificação"
                />
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
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead.mutate([n.id]); }}
                    disabled={markRead.isPending}
                    className="self-center text-[11px] font-medium px-2.5 py-1 rounded-full border border-border/60 hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
                  >
                    Marcar lida
                  </button>
                )}
              </div>
            ))}

            {/* Sentinel + load more */}
            <div ref={sentinelRef} />
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 rounded-2xl border border-border/60 bg-card text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? "Carregando…" : "Carregar mais"}
              </button>
            )}
            {!hasNextPage && notifications.length > 0 && (
              <p className="text-center text-[11px] text-muted-foreground py-4">
                Fim da lista · {notifications.length} carregadas
              </p>
            )}
          </div>
        )}
      </div>

      <NotificationDetailDialog
        notif={notifications.find((n) => n.id === detailId) || null}
        onClose={() => setDetailId(null)}
        onMarkRead={(id) => markRead.mutate([id])}
        marking={markRead.isPending}
      />
    </AdminLayout>
  );
}

function NotificationDetailDialog({
  notif,
  onClose,
  onMarkRead,
  marking,
}: {
  notif: Notif | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  marking: boolean;
}) {
  const open = !!notif;
  const data = notif?.data;
  const hasPayload = data && typeof data === "object" && Object.keys(data as any).length > 0;
  const payloadStr = hasPayload ? JSON.stringify(data, null, 2) : null;

  const copyPayload = async () => {
    if (!payloadStr) return;
    try {
      await navigator.clipboard.writeText(payloadStr);
      toast.success("Payload copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        {notif && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                {notif.title}
                <span className={cn(
                  "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium",
                  notif.read ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}>
                  {notif.read ? "Lida" : "Pendente"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-1.5">
                <Send className="w-3 h-3" />
                Enviada por sistema Já Limpo · <span className="capitalize">{notif.type}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{notif.message}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <DetailRow icon={<UserIcon className="w-3.5 h-3.5" />} label="Destinatário" value={notif.recipientName || "Usuário"} />
                <DetailRow icon={<Hash className="w-3.5 h-3.5" />} label="ID do usuário" value={notif.user_id} mono />
                <DetailRow icon={<Hash className="w-3.5 h-3.5" />} label="ID da notificação" value={notif.id} mono />
                <DetailRow
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Enviada em"
                  value={`${format(new Date(notif.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} (${formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })})`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payload</span>
                  {payloadStr && (
                    <button onClick={copyPayload} className="text-[11px] font-medium text-primary hover:underline">
                      Copiar
                    </button>
                  )}
                </div>
                {payloadStr ? (
                  <pre className="text-[11px] leading-relaxed bg-muted/50 border border-border/60 rounded-xl p-3 overflow-auto max-h-48 font-mono">
                    {payloadStr}
                  </pre>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sem payload adicional.</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <button
                onClick={onClose}
                className="text-sm font-medium px-4 py-2 rounded-xl border border-border/60 hover:bg-muted transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => { onMarkRead(notif.id); onClose(); }}
                disabled={notif.read || marking}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-4 h-4" />
                {notif.read ? "Já lida" : "Marcar como lida"}
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border border-border/60">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <p className={cn("text-xs break-all", mono && "font-mono")}>{value}</p>
      </div>
    </div>
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
