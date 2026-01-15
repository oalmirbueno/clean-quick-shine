import { useNavigate, useParams } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, User, Calendar, MapPin, CreditCard, Tag } from "lucide-react";
import { orders } from "@/lib/mockDataV2";

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pedido não encontrado</p>
      </div>
    );
  }

  const breakdownItems = [
    { label: "Subtotal", value: order.subtotal },
    ...(order.discount > 0 ? [{ label: `Desconto (${order.couponCode})`, value: order.discount, negative: true }] : []),
    { label: "Taxa de serviço", value: order.fee },
    { label: `Comissão (${order.commissionPercent}%)`, value: order.commissionValue, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Pedido #{order.id}</h1>
              <p className="text-muted-foreground">Criado em {order.createdAt}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4 card-shadow">
                <h3 className="font-semibold text-foreground mb-4">Informações do pedido</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium text-foreground">{order.clientName}</p>
                    </div>
                  </div>

                  {order.proName && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Diarista</p>
                        <p className="font-medium text-foreground">{order.proName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data e horário</p>
                      <p className="font-medium text-foreground">{order.date} às {order.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium text-foreground">{order.address}</p>
                      <p className="text-sm text-muted-foreground">{order.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                      <p className="font-medium text-foreground">{order.serviceName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status === "in_review" && (
                <div className="bg-card rounded-xl border border-border p-4 card-shadow">
                  <h3 className="font-semibold text-foreground mb-4">Ações de mediação</h3>
                  <div className="space-y-2">
                    <PrimaryButton fullWidth variant="outline">
                      Reembolso parcial
                    </PrimaryButton>
                    <PrimaryButton fullWidth variant="outline">
                      Reembolso total
                    </PrimaryButton>
                    <PrimaryButton fullWidth>
                      Liberar pagamento
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </div>

            {/* Financial */}
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Detalhes financeiros</h3>
              
              <MoneyBreakdown
                items={breakdownItems}
                total={order.totalPrice}
                totalLabel="Total cobrado"
              />

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valor para diarista</span>
                  <span className="text-lg font-semibold text-success">
                    R$ {order.proEarning.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
