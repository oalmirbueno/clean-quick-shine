import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, Star, MapPin, Phone, FileText, CheckCircle2, XCircle, AlertTriangle, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminKeys, useAdminInvalidate, beginMutation, isLatestMutation, mutationScopes } from "@/hooks/useAdminQueryKeys";
import { logAdminAction } from "@/lib/auditLog";

export default function AdminProDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { qc, pro: invalidateProGroup } = useAdminInvalidate();
  const [confirm, setConfirm] = useState<null | "suspend" | "reactivate" | "reject">(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");

  const { data: pro, isLoading } = useQuery({
    queryKey: adminKeys.proDetail(id),
    queryFn: async () => {
      const [{ data: profile }, { data: proProfile }, { data: metrics }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", id!).maybeSingle(),
        supabase.from("pro_profiles").select("*").eq("user_id", id!).maybeSingle(),
        supabase.from("pro_metrics").select("*").eq("user_id", id!).maybeSingle(),
      ]);
      if (!profile || !proProfile) return null;
      return { ...profile, ...proProfile, metrics };
    },
    enabled: !!id,
  });

  const { data: docs = [] } = useQuery({
    queryKey: adminKeys.proDocs(id),
    queryFn: async () => {
      const { data } = await supabase.from("pro_documents").select("*").eq("user_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: proOrders = [] } = useQuery({
    queryKey: adminKeys.proOrders(id),
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, services(name)").eq("pro_id", id!).order("created_at", { ascending: false }).limit(8);
      return data || [];
    },
    enabled: !!id,
  });

  const notifyPro = async (title: string, message: string, type: "info" | "success" | "warning" = "info") => {
    // Always persist in-app notification, and fire push in parallel.
    // The push function also writes to the table, but we guarantee in-app delivery even if it fails.
    const inApp = supabase
      .from("notifications")
      .insert({ user_id: id!, title, message, type })
      .then(({ error }) => { if (error) console.error("[notifyPro] in-app insert failed", error); });
    const push = supabase.functions
      .invoke("send-push-notification", { body: { userId: id!, title, message, type, skipDbInsert: true } })
      .catch((e) => console.warn("[notifyPro] push failed", e));
    await Promise.allSettled([inApp, push]);
  };

  const invalidatePro = () => invalidateProGroup(id);
  const proScope = () => mutationScopes.pro(id);

  const optimisticPro = async (patch: Record<string, any>) => {
    const token = beginMutation(proScope());
    await qc.cancelQueries({ queryKey: adminKeys.proDetail(id) });
    const prevDetail = qc.getQueryData<any>(adminKeys.proDetail(id));
    const prevList = qc.getQueryData<any[]>(adminKeys.allPros());
    if (prevDetail) qc.setQueryData(adminKeys.proDetail(id), { ...prevDetail, ...patch });
    if (prevList) qc.setQueryData<any[]>(adminKeys.allPros(), prevList.map((p) => (p.user_id === id ? { ...p, ...patch } : p)));
    return { prevDetail, prevList, token };
  };

  const rollbackPro = (ctx: any) => {
    // Drop stale rollback if a newer mutation already started
    if (!ctx?.token || !isLatestMutation(proScope(), ctx.token)) return;
    if (ctx?.prevDetail) qc.setQueryData(adminKeys.proDetail(id), ctx.prevDetail);
    if (ctx?.prevList) qc.setQueryData(adminKeys.allPros(), ctx.prevList);
  };

  const settledPro = (ctx?: any) => {
    // Only the latest mutation refetches, so older responses don't clobber newer optimistic state
    if (ctx?.token && !isLatestMutation(proScope(), ctx.token)) return;
    invalidatePro();
  };

  const approve = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pro_profiles").update({ verified: true, status: "active" }).eq("user_id", id!);
      if (error) throw error;
      await logAdminAction({ action: "pro_approved", targetType: "pro", targetId: id!, targetName: pro?.full_name });
      await notifyPro("Cadastro aprovado! 🎉", "Sua verificação foi concluída. Você já pode receber pedidos.", "success");
    },
    onMutate: () => optimisticPro({ verified: true, status: "active" }),
    onSuccess: () => { toast.success("Diarista aprovada"); },
    onError: (e: any, _v, ctx: any) => { rollbackPro(ctx); toast.error(e.message); },
    onSettled: (_d, _e, _v, ctx: any) => settledPro(ctx),
  });

  const reject = useMutation({
    mutationFn: async () => {
      if (!rejectReason.trim()) throw new Error("Informe o motivo da reprovação");
      const { error } = await supabase.from("pro_profiles").update({ verified: false, status: "rejected", available_now: false }).eq("user_id", id!);
      if (error) throw error;
      await supabase.from("pro_documents").update({ status: "rejected", rejection_reason: rejectReason.trim() }).eq("user_id", id!).eq("status", "pending");
      await logAdminAction({ action: "pro_rejected", targetType: "pro", targetId: id!, targetName: pro?.full_name, reason: rejectReason.trim() });
      await notifyPro("Verificação reprovada", `Motivo: ${rejectReason.trim()}. Reenvie seus documentos para uma nova análise.`, "warning");
    },
    onMutate: () => optimisticPro({ verified: false, status: "rejected", available_now: false }),
    onSuccess: () => {
      toast.warning("Diarista reprovada");
      setConfirm(null); setRejectReason("");
    },
    onError: (e: any, _v, ctx: any) => { rollbackPro(ctx); toast.error(e.message); },
    onSettled: (_d, _e, _v, ctx: any) => settledPro(ctx),
  });

  const suspend = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pro_profiles").update({ status: "suspended", available_now: false }).eq("user_id", id!);
      if (error) throw error;
      await logAdminAction({ action: "pro_suspended", targetType: "pro", targetId: id!, targetName: pro?.full_name });
      await notifyPro("Conta suspensa", "Sua conta foi suspensa pela equipe Já Limpo. Entre em contato com o suporte.", "warning");
    },
    onMutate: () => optimisticPro({ status: "suspended", available_now: false }),
    onSuccess: () => { toast.warning("Suspensa"); setConfirm(null); },
    onError: (e: any, _v, ctx: any) => { rollbackPro(ctx); toast.error(e.message); },
    onSettled: (_d, _e, _v, ctx: any) => settledPro(ctx),
  });

  const reactivate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pro_profiles").update({ status: "active" }).eq("user_id", id!);
      if (error) throw error;
      await logAdminAction({ action: "pro_reactivated", targetType: "pro", targetId: id!, targetName: pro?.full_name });
      await notifyPro("Conta reativada", "Sua conta foi reativada. Bem-vinda de volta!", "success");
    },
    onMutate: () => optimisticPro({ status: "active" }),
    onSuccess: () => { toast.success("Reativada"); setConfirm(null); },
    onError: (e: any, _v, ctx: any) => { rollbackPro(ctx); toast.error(e.message); },
    onSettled: (_d, _e, _v, ctx: any) => settledPro(ctx),
  });

  const sendNotify = useMutation({
    mutationFn: async () => {
      if (!notifyTitle.trim() || !notifyMsg.trim()) throw new Error("Preencha título e mensagem");
      await notifyPro(notifyTitle.trim(), notifyMsg.trim(), "info");
    },
    onSuccess: () => { toast.success("Mensagem enviada"); setNotifyOpen(false); setNotifyTitle(""); setNotifyMsg(""); },
    onError: (e: any) => toast.error(e.message),
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
            <div className="h-40 rounded-2xl bg-card border border-border/60 animate-pulse" />
            <div className="h-32 rounded-2xl bg-card border border-border/60 animate-pulse" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 rounded-2xl bg-card border border-border/60 animate-pulse" />
            <div className="h-40 rounded-2xl bg-card border border-border/60 animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!pro) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Profissional</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Profissional não encontrada</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground truncate">{pro.full_name || "Profissional"}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={pro.verified ? "approved" : "pending"} />
            <StatusBadge status={pro.status || "pending"} />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNotifyOpen(true)}
            className="h-10 px-3 rounded-xl border border-border/60 bg-card hover:bg-muted text-sm font-medium inline-flex items-center gap-1.5"
          >
            <MessageSquareWarning className="w-4 h-4" /> Notificar
          </button>
          {!pro.verified ? (
            <>
              <button
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
                className="h-10 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" /> Aprovar
              </button>
              <button
                onClick={() => setConfirm("reject")}
                className="h-10 px-3 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reprovar
              </button>
            </>
          ) : pro.status === "suspended" ? (
            <button
              onClick={() => setConfirm("reactivate")}
              className="h-10 px-3 rounded-xl bg-success text-success-foreground hover:opacity-90 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Reativar
            </button>
          ) : (
            <button
              onClick={() => setConfirm("suspend")}
              className="h-10 px-3 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> Suspender
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
        {!pro.verified ? (
          <button
            onClick={() => approve.mutate()}
            disabled={approve.isPending}
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" /> Aprovar
          </button>
        ) : pro.status === "suspended" ? (
          <button
            onClick={() => setConfirm("reactivate")}
            className="h-10 rounded-xl bg-success text-success-foreground hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Reativar
          </button>
        ) : (
          <button
            onClick={() => setConfirm("suspend")}
            className="h-10 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" /> Suspender
          </button>
        )}
        {!pro.verified && (
          <button
            onClick={() => setConfirm("reject")}
            className="col-span-2 h-10 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reprovar com motivo
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <div className="flex flex-col items-center text-center mb-3">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-2xl font-bold text-primary">
                {(pro.full_name || "P").charAt(0)}
              </div>
              <h2 className="font-semibold text-foreground">{pro.full_name}</h2>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span>{(pro.rating || 5).toFixed(1)}</span>
                <span className="text-muted-foreground">({pro.jobs_done || 0} serviços)</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {pro.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span>{pro.phone}</span></div>}
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /><span>{pro.radius_km || 10}km de raio</span></div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Métricas</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div><p className="text-xl font-bold">{pro.jobs_done || 0}</p><p className="text-xs text-muted-foreground">Serviços</p></div>
              <div><p className="text-xl font-bold">{pro.metrics?.acceptance_rate?.toFixed(0) || 100}%</p><p className="text-xs text-muted-foreground">Aceitação</p></div>
              <div><p className="text-xl font-bold">{pro.metrics?.on_time_rate?.toFixed(0) || 100}%</p><p className="text-xs text-muted-foreground">Pontualidade</p></div>
              <div><p className="text-xl font-bold">{pro.metrics?.cancel_rate?.toFixed(0) || 0}%</p><p className="text-xs text-muted-foreground">Cancelamento</p></div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm space-y-2">
            <h3 className="font-semibold text-foreground mb-2">Ações</h3>
            <PrimaryButton fullWidth variant="outline" onClick={() => setNotifyOpen(true)}>
              <MessageSquareWarning className="w-4 h-4 mr-2" /> Enviar mensagem
            </PrimaryButton>
            {!pro.verified && (
              <>
                <PrimaryButton fullWidth onClick={() => approve.mutate()} loading={approve.isPending}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar verificação
                </PrimaryButton>
                <PrimaryButton fullWidth variant="outline" onClick={() => setConfirm("reject")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="w-4 h-4 mr-2" /> Reprovar com motivo
                </PrimaryButton>
              </>
            )}
            {pro.status === "active" && (
              <PrimaryButton fullWidth variant="outline" onClick={() => setConfirm("suspend")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <AlertTriangle className="w-4 h-4 mr-2" /> Suspender
              </PrimaryButton>
            )}
            {pro.status === "suspended" && (
              <PrimaryButton fullWidth variant="success" onClick={() => setConfirm("reactivate")}>
                <ShieldCheck className="w-4 h-4 mr-2" /> Reativar
              </PrimaryButton>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Documentos</h3>
            {docs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum documento enviado</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground capitalize truncate">{doc.doc_type.replace(/_/g, " ")}</p>
                      <StatusBadge status={doc.status} />
                      {doc.rejection_reason && <p className="text-xs text-destructive mt-1 truncate">{doc.rejection_reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Pedidos recentes</h3>
            {proOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum pedido</p>
            ) : (
              <div className="space-y-2">
                {proOrders.map((order: any) => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="w-full flex items-center justify-between p-3 bg-muted/40 hover:bg-muted rounded-xl text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">#{order.id.slice(0, 8)} • {order.services?.name || "Serviço"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.scheduled_date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <StatusBadge status={order.status || "draft"} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm === "suspend"}
        onClose={() => setConfirm(null)}
        onConfirm={() => suspend.mutate()}
        title="Suspender profissional"
        description={`Tem certeza que deseja suspender ${pro.full_name}? Ela não receberá mais pedidos até ser reativada.`}
        confirmText="Suspender"
        variant="danger"
        loading={suspend.isPending}
      />
      <ConfirmModal
        isOpen={confirm === "reactivate"}
        onClose={() => setConfirm(null)}
        onConfirm={() => reactivate.mutate()}
        title="Reativar profissional"
        description={`Reativar ${pro.full_name}? Ela voltará a receber pedidos.`}
        confirmText="Reativar"
        loading={reactivate.isPending}
      />

      {confirm === "reject" && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-card rounded-2xl border border-border/60 p-5 w-full max-w-md shadow-lg space-y-3">
            <h3 className="font-semibold text-foreground">Reprovar verificação</h3>
            <p className="text-sm text-muted-foreground">Informe o motivo. A diarista será notificada.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex.: Documento ilegível, foto fora do padrão..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <PrimaryButton variant="outline" fullWidth onClick={() => setConfirm(null)}>Cancelar</PrimaryButton>
              <PrimaryButton fullWidth onClick={() => reject.mutate()} loading={reject.isPending} className="bg-destructive hover:bg-destructive/90">
                Reprovar
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {notifyOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setNotifyOpen(false)} />
          <div className="relative bg-card rounded-2xl border border-border/60 p-5 w-full max-w-md shadow-lg space-y-3">
            <h3 className="font-semibold text-foreground">Enviar mensagem</h3>
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
