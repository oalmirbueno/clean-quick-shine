import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, User, Calendar, MapPin, Tag, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderAction {
  targetStatus: string;
  label: string;
  description: string;
  variant: "primary" | "outline";
  destructive?: boolean;
}

const getAvailableActions = (status: string | null): OrderAction[] => {
  const actions: OrderAction[] = [];

  if (status === "completed" || status === "rated") {
    actions.push({
      targetStatus: "in_review",
      label: "⚠️ Colocar em Análise",
      description: "Bloqueia o saldo da diarista. Use em caso de reclamação ou disputa. O valor fica indisponível para saque até resolução.",
      variant: "outline",
      destructive: true,
    });
  }

  if (status === "completed" || status === "in_review") {
    actions.push({
      targetStatus: "rated",
      label: "✅ Liberar Saldo",
      description: "Marca como avaliado e libera o valor (80%) para saque pela diarista. Use para liberar manualmente sem avaliação do cliente.",
      variant: "primary",
    });
  }

  if (status === "rated") {
    actions.push({
      targetStatus: "paid_out",
      label: "💰 Dar Baixa (Pago)",
      description: "Registra que o pagamento foi concluído. O valor sai definitivamente do saldo da diarista. Ação irreversível.",
      variant: "primary",
    });
  }

  return actions;
};

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<OrderAction | null>(null);

  const updateOrderStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === "paid_out") updates.completed_at = updates.completed_at || new Date().toISOString();
      const { error } = await supabase.from("orders").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: (_, newStatus) => {
      const msgs: Record<string, string> = {
        in_review: "Pedido em análise — saldo bloqueado",
        rated: "Saldo liberado para saque da diarista",
        paid_out: "Pedido marcado como pago — baixa registrada",
      };
      toast.success(msgs[newStatus] || `Status atualizado para ${newStatus}`);
      setConfirmAction(null);
      queryClient.invalidateQueries({ queryKey: ["admin_order_detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar pedido");
      setConfirmAction(null);
    },
  });

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin_order_detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, services(name), addresses(street, number, neighborhood, city, state)")
        .eq("id", id!)
        .single();
      if (!data) return null;
      const { data: clientProfile } = await supabase.from("profiles").select("full_name").eq("user_id", data.client_id).single();
      let proName = null;
      if (data.pro_id) {
        const { data: proProfile } = await supabase.from("profiles").select("full_name").eq("user_id", data.pro_id).single();
        proName = proProfile?.full_name;
      }
      return {
        ...data,
        clientName: clientProfile?.full_name || "Cliente",
        proName,
        serviceName: (data as any).services?.name || "Serviço",
        address: `${(data as any).addresses?.street}, ${(data as any).addresses?.number}`,
        city: `${(data as any).addresses?.neighborhood} - ${(data as any).addresses?.city}`,
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Pedido não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  const commission = order.total_price * 0.2;
  const proEarning = order.total_price - commission;
  const breakdownItems = [
    { label: "Subtotal", value: order.base_price },
    ...(order.discount && order.discount > 0 ? [{ label: "Desconto", value: order.discount, negative: true }] : []),
    ...(order.zone_fee && order.zone_fee > 0 ? [{ label: "Taxa de zona", value: order.zone_fee }] : []),
    { label: "Comissão (20%)", value: commission, highlight: true },
  ];

  const actions = getAvailableActions(order.status);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">Criado em {new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <StatusBadge status={order.status || "draft"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          {/* Order Info */}
          <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm">
            <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide text-muted-foreground">Informações do pedido</h3>
            <div className="space-y-4">
              {[
                { icon: User, label: "Cliente", value: order.clientName },
                ...(order.proName ? [{ icon: User, label: "Diarista", value: order.proName }] : []),
                { icon: Calendar, label: "Data e horário", value: `${order.scheduled_date} às ${order.scheduled_time}` },
                { icon: MapPin, label: "Endereço", value: order.address, sub: order.city },
                { icon: Tag, label: "Serviço", value: order.serviceName },
              ].map((item: any, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground text-sm">{item.value}</p>
                    {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">Ações do pedido</h3>
            {actions.length > 0 ? (
              <div className="space-y-3">
                {actions.map((action) => (
                  <div key={action.targetStatus} className="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <PrimaryButton
                      fullWidth
                      variant={action.variant}
                      onClick={() => setConfirmAction(action)}
                      loading={updateOrderStatus.isPending}
                    >
                      {action.label}
                    </PrimaryButton>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{action.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma ação disponível para o status atual.
              </p>
            )}

            {order.status === "paid_out" && (
              <div className="mt-4 p-4 bg-success/10 rounded-xl text-center border border-success/20">
                <p className="text-sm font-semibold text-success">✓ Pedido finalizado e pago</p>
              </div>
            )}

            {order.status === "in_review" && (
              <div className="mt-4 p-4 bg-warning/10 rounded-xl flex items-start gap-2 border border-warning/20">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-warning leading-relaxed">Saldo da diarista está bloqueado enquanto o pedido estiver em análise.</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial */}
        <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm h-fit">
          <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">Detalhes financeiros</h3>
          <MoneyBreakdown items={breakdownItems} total={order.total_price} totalLabel="Total cobrado" />
          <div className="mt-6 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-xl border border-success/15">
              <span className="text-sm text-muted-foreground">Valor para diarista (80%)</span>
              <span className="text-lg font-bold text-success">R$ {proEarning.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => updateOrderStatus.mutate(confirmAction.targetStatus)}
          title={confirmAction.label.replace(/[⚠️✅💰]\s?/g, "")}
          description={confirmAction.description}
          confirmText="Confirmar"
          loading={updateOrderStatus.isPending}
        />
      )}
    </AdminLayout>
  );
}
