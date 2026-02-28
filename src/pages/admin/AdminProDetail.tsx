import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, Star, MapPin, Phone, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminProDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const { data: pro } = useQuery({
    queryKey: ["admin_pro_detail", id],
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", id!).single();
      const { data: proProfile } = await supabase.from("pro_profiles").select("*").eq("user_id", id!).single();
      const { data: metrics } = await supabase.from("pro_metrics").select("*").eq("user_id", id!).single();
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
      const { data } = await supabase.from("orders").select("*, services(name)").eq("pro_id", id!).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("pro_profiles").update({ verified: true, status: "active" }).eq("user_id", id!);
    },
    onSuccess: () => { toast.success("Profissional aprovada!"); queryClient.invalidateQueries({ queryKey: ["admin_pro_detail", id] }); },
  });

  const suspendMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("pro_profiles").update({ status: "suspended", available_now: false }).eq("user_id", id!);
    },
    onSuccess: () => { setShowSuspendModal(false); toast.warning("Profissional suspensa"); queryClient.invalidateQueries({ queryKey: ["admin_pro_detail", id] }); },
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
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{pro.full_name || "Profissional"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={pro.verified ? "approved" : "pending"} />
            <StatusBadge status={pro.status || "pending"} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-3xl font-bold text-primary">
                {(pro.full_name || "P").charAt(0)}
              </div>
              <h2 className="font-semibold text-foreground">{pro.full_name}</h2>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span>{(pro.rating || 5).toFixed(1)}</span>
                <span className="text-muted-foreground">({pro.jobs_done || 0} serviços)</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {pro.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span>{pro.phone}</span></div>}
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /><span>{pro.radius_km || 10}km raio</span></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div><p className="text-2xl font-bold text-foreground">{pro.jobs_done || 0}</p><p className="text-xs text-muted-foreground">Serviços</p></div>
              <div><p className="text-2xl font-bold text-foreground">{pro.metrics?.acceptance_rate?.toFixed(0) || 100}%</p><p className="text-xs text-muted-foreground">Aceitação</p></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 card-shadow space-y-2">
            <h3 className="font-semibold text-foreground mb-3">Ações</h3>
            {!pro.verified && (
              <>
                <PrimaryButton fullWidth onClick={() => approveMutation.mutate()}><CheckCircle2 className="w-4 h-4 mr-2" />Aprovar verificação</PrimaryButton>
                <PrimaryButton fullWidth variant="outline" onClick={() => toast.error("Profissional rejeitada")}><XCircle className="w-4 h-4 mr-2" />Reprovar</PrimaryButton>
              </>
            )}
            {pro.status === "active" && (
              <PrimaryButton fullWidth variant="outline" onClick={() => setShowSuspendModal(true)} className="text-destructive border-destructive/20 hover:bg-destructive/10">
                <AlertTriangle className="w-4 h-4 mr-2" />Suspender
              </PrimaryButton>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Documentos</h3>
            {docs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum documento enviado</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground capitalize">{doc.doc_type.replace("_", " ")}</p>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Pedidos recentes</h3>
            {proOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum pedido realizado</p>
            ) : (
              <div className="space-y-3">
                {proOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{order.services?.name || "Serviço"}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={order.status || "draft"} />
                      <p className="text-sm text-muted-foreground mt-1">{new Date(order.scheduled_date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={() => suspendMutation.mutate()}
        title="Suspender profissional"
        description={`Tem certeza que deseja suspender ${pro.full_name}? Ela não receberá mais pedidos até ser reativada.`}
        confirmText="Suspender"
        variant="danger"
      />
    </AdminLayout>
  );
}
