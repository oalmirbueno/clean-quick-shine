import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, User, Calendar, MapPin, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

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

          {order.status === "in_review" && (
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Ações de mediação</h3>
              <div className="space-y-2">
                <PrimaryButton fullWidth variant="outline">Reembolso parcial</PrimaryButton>
                <PrimaryButton fullWidth variant="outline">Reembolso total</PrimaryButton>
                <PrimaryButton fullWidth>Liberar pagamento</PrimaryButton>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Detalhes financeiros</h3>
          <MoneyBreakdown items={breakdownItems} total={order.total_price} totalLabel="Total cobrado" />
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor para diarista</span>
              <span className="text-lg font-semibold text-success">R$ {proEarning.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
