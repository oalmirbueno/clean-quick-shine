import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TimelineStepper } from "@/components/ui/TimelineStepper";
import { ChevronLeft, MessageCircle, HelpCircle, X, Loader2, MapPin } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";

const statusToStep: Record<string, number> = {
  scheduled: 0,
  matching: 0,
  confirmed: 0,
  en_route: 1,
  in_progress: 2,
  completed: 3,
  rated: 4,
  paid_out: 4,
};

export default function ClientOrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId as string | null;

  const { data: order, isLoading } = useOrder(orderId);
  
  // Enable realtime updates for this order
  useOrderRealtime(orderId);

  const timelineSteps = useMemo(() => {
    const formatTime = (status: string) => {
      if (!order) return "—";
      // For completed steps, show actual time if available
      if (status === "completed" && order.completed_at) {
        return new Date(order.completed_at).toLocaleTimeString("pt-BR", { 
          hour: "2-digit", 
          minute: "2-digit" 
        });
      }
      if (status === "confirmed" && order.created_at) {
        return new Date(order.created_at).toLocaleTimeString("pt-BR", { 
          hour: "2-digit", 
          minute: "2-digit" 
        });
      }
      return "—";
    };

    return [
      { id: "confirmed", label: "Confirmado", time: formatTime("confirmed") },
      { id: "en_route", label: "Profissional a caminho", time: "—" },
      { id: "in_progress", label: "Em andamento", time: "—" },
      { id: "completed", label: "Concluído", time: formatTime("completed") },
      { id: "rated", label: "Avaliado", time: "—" },
    ];
  }, [order]);

  const currentStep = useMemo(() => {
    if (!order?.status) return 0;
    return statusToStep[order.status] ?? 0;
  }, [order?.status]);

  const handleComplete = () => {
    if (order) {
      navigate("/client/rating", { state: { orderId: order.id } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/client/orders")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Pedido não encontrado
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">Não foi possível carregar o pedido.</p>
        </main>
      </div>
    );
  }

  const proAvatar = order.pro_profile?.avatar_url || 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.pro_id}`;
  const proName = order.pro_profile?.full_name || "Profissional";
  const serviceName = order.service?.name || "Serviço";

  const formatAddress = () => {
    if (!order.address) return null;
    const addr = order.address;
    return `${addr.street}, ${addr.number}, ${addr.neighborhood}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/client/orders")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Acompanhar pedido
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Pro Info */}
        {order.pro_id && (
          <section className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={proAvatar}
                alt={proName}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{proName}</p>
                <p className="text-sm text-muted-foreground">{serviceName}</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>
        )}

        {/* Realtime Status Indicator */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span>Atualizações em tempo real</span>
          </div>
        </div>

        {/* Timeline */}
        <section className="p-4">
          <h2 className="font-medium text-foreground mb-6">Status do pedido</h2>
          <TimelineStepper steps={timelineSteps} currentStep={currentStep} />
        </section>

        {/* Estimated Time */}
        <section className="mx-4 p-4 bg-accent rounded-xl">
          <p className="text-sm text-muted-foreground">Duração estimada</p>
          <p className="text-2xl font-bold text-foreground">{order.duration_hours}h</p>
        </section>

        {/* Address */}
        {formatAddress() && (
          <section className="mx-4 mt-4 p-4 bg-card rounded-xl border border-border">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Local do serviço</p>
                <p className="text-sm text-muted-foreground">{formatAddress()}</p>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="p-4 mt-4 space-y-3">
          <button 
            onClick={() => navigate("/client/support")}
            className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>
          
          {order.status && ["confirmed", "en_route", "in_progress"].includes(order.status) && (
            <>
              <button 
                onClick={() => navigate(`/client/cancel/${order.id}`)}
                className="w-full p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center gap-3 hover:bg-destructive/10 transition-colors"
              >
                <X className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Cancelar pedido</span>
              </button>
              <p className="text-xs text-center text-muted-foreground">
                Cancelamentos podem ter taxa dependendo do horário.
              </p>
            </>
          )}
        </section>
      </main>

      {/* Bottom Action - Show when completed and not rated */}
      {order.status === "completed" && !order.client_rating && (
        <div className="p-4 bg-card border-t border-border">
          <PrimaryButton fullWidth onClick={handleComplete}>
            Avaliar serviço
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
