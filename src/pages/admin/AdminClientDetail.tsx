import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, Phone, Mail, Calendar, Ban, ShieldCheck, MessageSquareWarning, ShoppingBag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<null | "block" | "unblock">(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");

  const { data: client, isLoading } = useQuery({
    queryKey: ["admin_client_detail", id],
    queryFn: async () => {
      const [{ data: profile }, { data: orders }, { data: blocks }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", id!).maybeSingle(),
        supabase.from("orders").select("*, services(name)").eq("client_id", id!).order("created_at", { ascending: false }).limit(20),
        supabase.from("risk_actions").select("*").eq("user_id", id!).eq("action", "block").eq("active", true),
      ]);
      const blocked = (blocks || []).length > 0;
      const totalSpent = (orders || []).filter((o) => !["cancelled", "draft"].includes(o.status || "")).reduce((s, o) => s + Number(o.total_price || 0), 0);
      return { profile, orders: orders || [], blocked, totalSpent };
    },
    enabled: !!id,
  });

  const optimisticBlock = async (blocked: boolean) => {
    await qc.cancelQueries({ queryKey: ["admin_client_detail", id] });
    const prevDetail = qc.getQueryData<any>(["admin_client_detail", id]);
    const prevList = qc.getQueryData<any[]>(["admin_all_clients_v2"]);
    if (prevDetail) qc.setQueryData(["admin_client_detail", id], { ...prevDetail, blocked });
    if (prevList) qc.setQueryData<any[]>(["admin_all_clients_v2"], prevList.map((c) => (c.user_id === id ? { ...c, blocked } : c)));
    return { prevDetail, prevList };
  };

  const rollback = (ctx: any) => {
    if (ctx?.prevDetail) qc.setQueryData(["admin_client_detail", id], ctx.prevDetail);
    if (ctx?.prevList) qc.setQueryData(["admin_all_clients_v2"], ctx.prevList);
  };

  const settledClient = () => {
    qc.invalidateQueries({ queryKey: ["admin_client_detail", id] });
    qc.invalidateQueries({ queryKey: ["admin_all_clients_v2"] });
    qc.invalidateQueries({ queryKey: ["admin_risk_actions"] });
    qc.invalidateQueries({ queryKey: ["admin_risk_flags"] });
    qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
  };

  const block = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("risk_actions").insert({
        user_id: id!,
        action: "block",
        reason: "Bloqueado pelo administrador",
        active: true,
      });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: id!,
        title: "Conta bloqueada",
        message: "Sua conta foi bloqueada pela equipe Já Limpo. Entre em contato com o suporte.",
        type: "warning",
      });
    },
    onMutate: () => optimisticBlock(true),
    onSuccess: () => { toast.success("Cliente bloqueado e notificado"); setConfirm(null); },
    onError: (e: any, _v, ctx: any) => { rollback(ctx); toast.error(e.message || "Erro ao bloquear"); },
    onSettled: settledClient,
  });

  const unblock = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("risk_actions")
        .update({ active: false, end_at: new Date().toISOString() })
        .eq("user_id", id!)
        .eq("action", "block")
        .eq("active", true);
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: id!,
        title: "Conta reativada",
        message: "Sua conta foi reativada. Bem-vindo de volta!",
        type: "success",
      });
    },
    onMutate: () => optimisticBlock(false),
    onSuccess: () => { toast.success("Cliente desbloqueado"); setConfirm(null); },
    onError: (e: any, _v, ctx: any) => { rollback(ctx); toast.error(e.message || "Erro"); },
    onSettled: settledClient,
  });

  const sendNotify = useMutation({
    mutationFn: async () => {
      if (!notifyTitle.trim() || !notifyMsg.trim()) throw new Error("Preencha título e mensagem");
      const { error } = await supabase.from("notifications").insert({
        user_id: id!,
        title: notifyTitle.trim(),
        message: notifyMsg.trim(),
        type: "info",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensagem enviada ao cliente");
      setNotifyOpen(false);
      setNotifyTitle("");
      setNotifyMsg("");
    },
    onError: (e: any) => toast.error(e.message || "Erro"),
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-5 w-40 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-32 rounded-2xl bg-card border border-border/60 animate-pulse" />
            <div className="h-24 rounded-2xl bg-card border border-border/60 animate-pulse" />
          </div>
          <div className="lg:col-span-2 h-64 rounded-2xl bg-card border border-border/60 animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (!client?.profile) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Cliente</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const p = client.profile;

  return (
    <AdminLayout>
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground truncate">{p.full_name || "Cliente"}</h1>
          {client.blocked ? (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
              <Ban className="w-3 h-3" /> Bloqueado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
              <ShieldCheck className="w-3 h-3" /> Ativo
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNotifyOpen(true)}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card hover:bg-muted text-sm font-medium inline-flex items-center gap-1.5"
          >
            <MessageSquareWarning className="w-4 h-4" /> Notificar
          </button>
          {client.blocked ? (
            <button
              onClick={() => setConfirm("unblock")}
              className="h-10 px-3 rounded-xl bg-success text-success-foreground hover:opacity-90 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Desbloquear
            </button>
          ) : (
            <button
              onClick={() => setConfirm("block")}
              className="h-10 px-3 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Ban className="w-4 h-4" /> Bloquear
            </button>
          )}
        </div>
      </div>

      {/* Mobile quick actions */}
      <div className="sm:hidden grid grid-cols-2 gap-2">
        <button
          onClick={() => setNotifyOpen(true)}
          className="h-10 rounded-xl border border-border/60 bg-card hover:bg-muted text-sm font-medium inline-flex items-center justify-center gap-1.5"
        >
          <MessageSquareWarning className="w-4 h-4" /> Notificar
        </button>
        {client.blocked ? (
          <button
            onClick={() => setConfirm("unblock")}
            className="h-10 rounded-xl bg-success text-success-foreground hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Desbloquear
          </button>
        ) : (
          <button
            onClick={() => setConfirm("block")}
            className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            <Ban className="w-4 h-4" /> Bloquear
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-foreground">Contato</h3>
            {p.phone && (
              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{p.phone}</span></div>
            )}
            {p.cpf && (
              <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span>CPF: {p.cpf}</span></div>
            )}
            <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" /><span>Cadastrado em {new Date(p.created_at).toLocaleDateString("pt-BR")}</span></div>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-foreground">{client.orders.length}</p>
                <p className="text-xs text-muted-foreground">Pedidos</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{fmt(client.totalSpent)}</p>
                <p className="text-xs text-muted-foreground">Total gasto</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm space-y-2">
            <h3 className="font-semibold text-foreground mb-2">Ações</h3>
            <PrimaryButton fullWidth variant="outline" onClick={() => setNotifyOpen(true)}>
              <MessageSquareWarning className="w-4 h-4 mr-2" /> Enviar mensagem
            </PrimaryButton>
            {client.blocked ? (
              <PrimaryButton fullWidth variant="success" onClick={() => setConfirm("unblock")}>
                <ShieldCheck className="w-4 h-4 mr-2" /> Desbloquear
              </PrimaryButton>
            ) : (
              <PrimaryButton fullWidth variant="outline" onClick={() => setConfirm("block")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Ban className="w-4 h-4 mr-2" /> Bloquear
              </PrimaryButton>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Pedidos recentes
          </h3>
          {client.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum pedido</p>
          ) : (
            <div className="space-y-2">
              {client.orders.map((o: any) => (
                <button
                  key={o.id}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted text-left transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">#{o.id.slice(0, 8)} • {o.services?.name || "Serviço"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.scheduled_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{fmt(Number(o.total_price))}</p>
                    <StatusBadge status={o.status || "draft"} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm === "block"}
        onClose={() => setConfirm(null)}
        onConfirm={() => block.mutate()}
        title="Bloquear cliente"
        description={`Tem certeza que deseja bloquear ${p.full_name}? Ele será notificado e não poderá criar novos pedidos.`}
        confirmText="Bloquear"
        variant="danger"
        loading={block.isPending}
      />
      <ConfirmModal
        isOpen={confirm === "unblock"}
        onClose={() => setConfirm(null)}
        onConfirm={() => unblock.mutate()}
        title="Desbloquear cliente"
        description={`Tem certeza que deseja reativar ${p.full_name}?`}
        confirmText="Desbloquear"
        loading={unblock.isPending}
      />

      {notifyOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setNotifyOpen(false)} />
          <div className="relative bg-card rounded-2xl border border-border/60 p-5 w-full max-w-md shadow-lg space-y-3">
            <h3 className="font-semibold text-foreground">Enviar mensagem ao cliente</h3>
            <input
              value={notifyTitle}
              onChange={(e) => setNotifyTitle(e.target.value)}
              placeholder="Título"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={notifyMsg}
              onChange={(e) => setNotifyMsg(e.target.value)}
              placeholder="Mensagem"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <PrimaryButton variant="outline" fullWidth onClick={() => setNotifyOpen(false)}>Cancelar</PrimaryButton>
              <PrimaryButton fullWidth onClick={() => sendNotify.mutate()} loading={sendNotify.isPending}>Enviar</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
