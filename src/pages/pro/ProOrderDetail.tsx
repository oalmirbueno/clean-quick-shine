import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Calendar, Clock, MapPin, User, MessageCircle, HelpCircle, Navigation, Loader2, Phone, CheckCircle2, Play, Flag } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useUpdateOrderStatus } from "@/hooks/useUpdateOrderStatus";
import { cn } from "@/lib/utils";

export default function ProOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: order, isLoading } = useOrder(id || null);
  const updateStatusMutation = useUpdateOrderStatus();

  const status = order?.status || "scheduled";
  const proEarning = Number(order?.total_price || 0) * 0.8;

  const handleUpdateStatus = async (newStatus: "en_route" | "in_progress" | "completed") => {
    if (!order?.id) return;
    await updateStatusMutation.mutateAsync({ orderId: order.id, status: newStatus });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getAddressString = () => {
    if (!order?.address) return "Endereço não disponível";
    const addr = order.address;
    return `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ""}, ${addr.neighborhood}, ${addr.city} - ${addr.state}`;
  };

  const openMaps = () => {
    const address = getAddressString();
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Pedido não encontrado</p>
        <PrimaryButton onClick={() => navigate("/pro/agenda")}>
          Voltar à agenda
        </PrimaryButton>
      </div>
    );
  }

  // Status flow steps
  const statusSteps = [
    { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
    { key: "en_route", label: "A caminho", icon: Navigation },
    { key: "in_progress", label: "Em andamento", icon: Play },
    { key: "completed", label: "Concluído", icon: Flag },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === status);

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
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
              Detalhes do serviço
            </h1>
            <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <StatusBadge status={status as any} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Status Progress */}
        {status !== "completed" && status !== "cancelled" && (
          <section className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = step.key === status;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors",
                      isCurrent 
                        ? "bg-primary text-primary-foreground" 
                        : isActive 
                        ? "bg-success/20 text-success" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-xs text-center",
                      isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <div className={cn(
                        "absolute h-0.5 w-full top-5",
                        isActive ? "bg-success" : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Earnings */}
        <section className="p-4 border-b border-border bg-success/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Você receberá</span>
            <span className="text-2xl font-bold text-success">
              R$ {proEarning.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </section>

        {/* Client Info */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Cliente</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {order.pro_profile?.avatar_url ? (
                <img 
                  src={order.pro_profile.avatar_url} 
                  alt="" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {order.pro_profile?.full_name || "Cliente"}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.notes ? "Com observações" : "Sem observações"}
              </p>
            </div>
            <button 
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              onClick={() => navigate("/pro/support")}
            >
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </button>
            {order.pro_profile?.phone && (
              <a 
                href={`tel:${order.pro_profile.phone}`}
                className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center hover:bg-success/20 transition-colors"
              >
                <Phone className="w-5 h-5 text-success" />
              </a>
            )}
          </div>
          
          {order.notes && (
            <div className="mt-3 p-3 bg-warning/10 rounded-lg">
              <p className="text-sm text-warning-foreground">
                <strong>Observações:</strong> {order.notes}
              </p>
            </div>
          )}
        </section>

        {/* Service Details */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Serviço</h2>
          <p className="font-semibold text-foreground text-lg">{order.service?.name || "Serviço"}</p>
          {order.service?.description && (
            <p className="text-sm text-muted-foreground mt-1">{order.service.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Duração estimada: ~{order.duration_hours}h
          </p>
        </section>

        {/* Date & Time */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Data e horário</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground capitalize">{formatDate(order.scheduled_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{formatTime(order.scheduled_time)}</span>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Endereço</h2>
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{order.address?.label || "Endereço"}</p>
              <p className="text-muted-foreground text-sm">{getAddressString()}</p>
            </div>
          </div>
          <button 
            onClick={openMaps}
            className="flex items-center gap-2 text-primary font-medium text-sm hover:underline"
          >
            <Navigation className="w-4 h-4" />
            Abrir no Google Maps
          </button>
        </section>

        {/* Support */}
        <section className="p-4">
          <button 
            onClick={() => navigate("/pro/support")}
            className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Precisa de ajuda?</span>
          </button>
        </section>
      </main>

      {/* Bottom Actions */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        {status === "confirmed" && (
          <PrimaryButton 
            fullWidth 
            loading={updateStatusMutation.isPending} 
            onClick={() => handleUpdateStatus("en_route")}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Estou a caminho
          </PrimaryButton>
        )}
        
        {status === "en_route" && (
          <PrimaryButton 
            fullWidth 
            loading={updateStatusMutation.isPending} 
            onClick={() => handleUpdateStatus("in_progress")}
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar serviço
          </PrimaryButton>
        )}
        
        {status === "in_progress" && (
          <PrimaryButton 
            fullWidth 
            loading={updateStatusMutation.isPending} 
            onClick={() => handleUpdateStatus("completed")}
            className="bg-success hover:bg-success/90"
          >
            <Flag className="w-4 h-4 mr-2" />
            Finalizar serviço
          </PrimaryButton>
        )}
        
        {status === "completed" && (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 text-success font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Serviço concluído!
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Aguardando avaliação do cliente
            </p>
          </div>
        )}

        {status === "scheduled" && (
          <div className="text-center text-muted-foreground text-sm">
            Aguardando confirmação do pedido
          </div>
        )}
      </div>
    </div>
  );
}
