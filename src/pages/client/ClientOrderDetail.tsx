import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Calendar, Clock, MapPin, CreditCard, MessageCircle, HelpCircle } from "lucide-react";
import { mockOrders, mockProProfile } from "@/lib/mockData";

export default function ClientOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id) || mockOrders[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Detalhes do pedido
            </h1>
            <p className="text-sm text-muted-foreground">#{order.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Pro Info */}
        {order.proId && (
          <section className="p-4 border-b border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Profissional</h2>
            <div className="flex items-center gap-3">
              <img
                src={mockProProfile.avatar}
                alt={mockProProfile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{mockProProfile.name}</p>
                <p className="text-sm text-muted-foreground">⭐ {mockProProfile.ratingAvg} • Verificada</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>
        )}

        {/* Service Details */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Serviço</h2>
          <p className="font-semibold text-foreground text-lg">{order.serviceName}</p>
        </section>

        {/* Date & Time */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Data e horário</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{order.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{order.time}</span>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Endereço</h2>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-foreground">{order.address}</p>
          </div>
        </section>

        {/* Payment */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Pagamento</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Pix</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              R$ {order.totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </section>

        {/* Support */}
        <section className="p-4">
          <button className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>
        </section>
      </main>

      {/* Bottom Action - Show for confirmed/in_progress */}
      {["confirmed", "in_progress"].includes(order.status) && (
        <div className="p-4 bg-card border-t border-border">
          <PrimaryButton
            fullWidth
            onClick={() => navigate("/client/order-tracking", { state: { orderId: order.id } })}
          >
            Acompanhar pedido
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
