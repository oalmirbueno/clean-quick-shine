import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, User, Calendar, MapPin, Tag, AlertTriangle } from "lucide-react";
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

  const { data: order } = useQuery({
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

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
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
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">Criado em {new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <StatusBadge status={order.status || "draft"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Informações do pedido</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div><p className="text-sm text-muted-foreground">Cliente</p><p className="font-medium text-foreground">{order.clientName}</p></div>
              </div>
              {order.proName && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div><p className="text-sm text-muted-foreground">Diarista</p><p className="font-medium text-foreground">{order.proName}</p></div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div><p className="text-sm text-muted-foreground">Data e horário</p><p className="font-medium text-foreground">{order.scheduled_date} às {order.scheduled_time}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div><p className="text-sm text-muted-foreground">Endereço</p><p className="font-medium text-foreground">{order.address}</p><p className="text-sm text-muted-foreground">{order.city}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div><p className="text-sm text-muted-foreground">Serviço</p><p className="font-medium text-foreground">{order.serviceName}</p></div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Ações do pedido</h3>
            {actions.length > 0 ? (
              <div className="space-y-3">
                {actions.map((action) => (
                  <div key={action.targetStatus}>
                    <PrimaryButton
                      fullWidth
                      variant={action.variant}
                      onClick={() => setConfirmAction(action)}
                      loading={updateOrderStatus.isPending}
                    >
                      {action.label}
                    </PrimaryButton>
                    <p className="text-xs text-muted-foreground mt-1 ml-1">{action.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma ação disponível para o status atual.
              </p>
            )}

            {order.status === "paid_out" && (
              <div className="mt-3 p-3 bg-success/10 rounded-lg text-center">
                <p className="text-sm font-medium text-success">✓ Pedido finalizado e pago</p>
              </div>
            )}

            {order.status === "in_review" && (
              <div className="mt-3 p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-warning">Saldo da diarista está bloqueado enquanto o pedido estiver em análise.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Detalhes financeiros</h3>
          <MoneyBreakdown items={breakdownItems} total={order.total_price} totalLabel="Total cobrado" />
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor para diarista (80%)</span>
              <span className="text-lg font-semibold text-success">R$ {proEarning.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => updateOrderStatus.mutate(confirmAction.targetStatus)}
          title={confirmAction.label.replace(/[⚠️✅💰]\s?/g, "")}
          description={confirmAction.description}
          confirmLabel="Confirmar"
          loading={updateOrderStatus.isPending}
        />
      )}
    </AdminLayout>
  );
}
