import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, Star, MapPin, Phone, FileText, CheckCircle2, XCircle, AlertTriangle, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminProDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<null | "suspend" | "reactivate" | "reject">(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");

  const { data: pro, isLoading } = useQuery({
    queryKey: ["admin_pro_detail", id],
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
    queryKey: ["admin_pro_docs", id],
    queryFn: async () => {
      const { data } = await supabase.from("pro_documents").select("*").eq("user_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: proOrders = [] } = useQuery({
    queryKey: ["admin_pro_orders", id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, services(name)").eq("pro_id", id!).order("created_at", { ascending: false }).limit(8);
      return data || [];
    },
    enabled: !!id,
  });

  const notifyPro = async (title: string, message: string, type: "info" | "success" | "warning" = "info") => {
    await supabase.from("notifications").insert({ user_id: id!, title, message, type });
  };

  const approve = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pro_profiles").update({ verified: true, status: "active" }).eq("user_id", id!);
      if (error) throw error;
      await notifyPro("Cadastro aprovado! 🎉", "Sua verificação foi concluída. Você já pode receber pedidos.", "success");
    },
    onSuccess: () => { toast.success("Diarista aprovada"); qc.invalidateQueries({ queryKey: ["admin_pro_detail", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async () => {
      if (!rejectReason.trim()) throw new Error("Informe o motivo da reprovação");
      const { error } = await supabase.from("pro_profiles").update({ verified: false, status: "rejected", available_now: false }).eq("user_id", id!);
      if (error) throw error;
      await supabase.from("pro_documents").update({ status: "rejected", rejection_reason: rejectReason.trim() }).eq("user_id", id!).eq("status", "pending");
      await notifyPro("Verificação reprovada", `Motivo: ${rejectReason.trim()}. Reenvie seus documentos para uma nova análise.`, "warning");
    },
    onSuccess: () => {
      toast.warning("Diarista reprovada");
      setConfirm(null); setRejectReason("");
      qc.invalidateQueries({ queryKey: ["admin_pro_detail", id] });
      qc.invalidateQueries({ queryKey: ["admin_pro_docs", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const suspend = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pro_profiles").update({ status: "suspended", available_now: false }).eq("user_id", id!);
      if (error) throw error;
      await notifyPro("Conta suspensa", "Sua conta foi suspensa pela equipe Já Limpo. Entre em contato com o suporte.", "warning");
    },
    onSuccess: () => { toast.warning("Suspensa"); setConfirm(null); qc.invalidateQueries({ queryKey: ["admin_pro_detail", id] }); },
  });

  const reactivate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pro_profiles").update({ status: "active" }).eq("user_id", id!);
      if (error) throw error;
      await notifyPro("Conta reativada", "Sua conta foi reativada. Bem-vinda de volta!", "success");
    },
    onSuccess: () => { toast.success("Reativada"); setConfirm(null); qc.invalidateQueries({ queryKey: ["admin_pro_detail", id] }); },
  });

  const sendNotify = useMutation({
    mutationFn: async () => {
      if (!notifyTitle.trim() || !notifyMsg.trim()) throw new Error("Preencha título e mensagem");
      await notifyPro(notifyTitle.trim(), notifyMsg.trim(), "info");
    },
    onSuccess: () => { toast.success("Mensagem enviada"); setNotifyOpen(false); setNotifyTitle(""); setNotifyMsg(""); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!pro) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Profissional não encontrada</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3">
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
