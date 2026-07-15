import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ChevronLeft, Calendar, Clock, MapPin, User, MessageCircle, HelpCircle,
  Navigation, Loader2, Phone, CheckCircle2, Play, Flag, Wallet,
} from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useUpdateOrderStatus } from "@/hooks/useUpdateOrderStatus";
import { useProLocationTracking } from "@/hooks/useProLocationTracking";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function ProOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const { data: order, isLoading } = useOrder(id || null);
  const updateStatusMutation = useUpdateOrderStatus();

  const status = order?.status || "scheduled";

  useProLocationTracking({
    enabled: status === "en_route" || status === "in_progress",
    userId: user?.id,
    orderId: order?.id,
  });
  const proEarning = Number(order?.total_price || 0) * 0.8;

  const handleUpdateStatus = async (newStatus: "en_route" | "in_progress" | "completed") => {
    if (!order?.id) return;
    await updateStatusMutation.mutateAsync({ orderId: order.id, status: newStatus });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  };

  const formatTime = (time: string) => time.slice(0, 5);

  const getAddressString = () => {
    if (!order?.address) return "Endereço não disponível";
    const addr = order.address;
    return `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ""}, ${addr.neighborhood}, ${addr.city} - ${addr.state}`;
  };

  const openMaps = () => {
    const encoded = encodeURIComponent(getAddressString());
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
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
        <PrimaryButton onClick={() => navigate("/pro/agenda")}>Voltar à agenda</PrimaryButton>
      </div>
    );
  }

  const statusSteps = [
    { key: "confirmed", label: "Confirmado", icon: CheckCircle2 },
    { key: "en_route", label: "A caminho", icon: Navigation },
    { key: "in_progress", label: "Em andamento", icon: Play },
    { key: "completed", label: "Concluído", icon: Flag },
  ];
  const currentStepIndex = statusSteps.findIndex(s => s.key === status);

  const clientName = order.pro_profile?.full_name || "Cliente";
  const clientAvatar = order.pro_profile?.avatar_url;

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground leading-tight">Detalhes do serviço</h1>
            <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <StatusBadge status={status as any} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in">
        <div className="p-4 space-y-3">
          {/* Earnings hero */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/85 text-primary-foreground p-5 shadow-sm">
            <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-4 top-4 opacity-20">
              <Wallet className="w-16 h-16" />
            </div>
            <p className="text-xs uppercase tracking-wider opacity-80 font-medium">Você recebe</p>
            <p className="text-4xl font-bold leading-none mt-1.5">
              R$ {proEarning.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs opacity-80 mt-2">de R$ {Number(order.total_price).toFixed(2).replace(".", ",")} total · repasse em até 24h</p>
          </section>

          {/* Progress stepper */}
          {status !== "completed" && status !== "cancelled" && (
            <section className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Progresso</p>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-5 right-5 top-5 h-0.5 bg-border -z-0" />
                <div
                  className="absolute left-5 top-5 h-0.5 bg-primary -z-0 transition-all duration-500"
                  style={{ width: `calc((100% - 2.5rem) * ${Math.max(0, currentStepIndex) / (statusSteps.length - 1)})` }}
                />
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className={cn(
                        "size-10 rounded-full flex items-center justify-center transition-all ring-4 ring-card",
                        isCurrent
                          ? "bg-primary text-primary-foreground scale-110"
                          : isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        "text-[10px] text-center max-w-[64px] leading-tight",
                        isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Client */}
          <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/15">
                {clientAvatar ? (
                  <img src={clientAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{clientName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.notes ? "Com observações" : "Sem observações"}
                </p>
              </div>
              <button
                className="size-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                onClick={() => navigate(`/chat/order/${order.id}?as=pro`)}
                aria-label="Abrir chat"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
              </button>
              {order.pro_profile?.phone && (
                <a
                  href={`tel:${order.pro_profile.phone}`}
                  className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-colors"
                  aria-label="Ligar"
                >
                  <Phone className="w-5 h-5 text-foreground" />
                </a>
              )}
            </div>

            {order.notes && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
                <p className="text-sm text-foreground leading-relaxed">{order.notes}</p>
              </div>
            )}
          </section>

          {/* Service */}
          <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Serviço</p>
            <p className="font-semibold text-foreground text-lg leading-tight">{order.service?.name || "Serviço"}</p>
            {order.service?.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{order.service.description}</p>
            )}
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Duração estimada de <span className="text-foreground font-medium">~{order.duration_hours}h</span></span>
            </div>
          </section>

          {/* Date & Address */}
          <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Data e horário</p>
                <p className="text-foreground font-medium capitalize">{formatDate(order.scheduled_date)}</p>
                <p className="text-sm text-muted-foreground">às {formatTime(order.scheduled_time)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-border/50">
              <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Endereço</p>
                {order.address?.label && (
                  <p className="text-foreground font-medium">{order.address.label}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{getAddressString()}</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={openMaps}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Abrir no Google Maps
                </motion.button>
              </div>
            </div>
          </section>

          {/* Actions */}
          <button
            onClick={() => navigate(`/chat/order/${order.id}?as=pro`)}
            className="w-full p-4 rounded-2xl border border-border/60 bg-card flex items-center gap-3 hover:bg-secondary/60 transition-colors active:scale-[0.99]"
          >
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="font-medium text-foreground text-sm flex-1 text-left">Conversar com o cliente</span>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
          <button
            onClick={() => navigate("/pro/support")}
            className="w-full p-4 rounded-2xl border border-border/60 bg-card flex items-center gap-3 hover:bg-secondary/60 transition-colors active:scale-[0.99]"
          >
            <div className="size-9 rounded-full bg-secondary flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <span className="font-medium text-foreground text-sm flex-1 text-left">Precisa de ajuda?</span>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="p-4 bg-card/95 backdrop-blur-md border-t border-border/60 safe-bottom">
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
          >
            <Flag className="w-4 h-4 mr-2" />
            Finalizar serviço
          </PrimaryButton>
        )}

        {status === "completed" && (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              Serviço concluído
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando avaliação do cliente</p>
          </div>
        )}

        {status === "scheduled" && (
          <div className="text-center text-muted-foreground text-sm py-2">
            Aguardando confirmação do pedido
          </div>
        )}
      </div>
    </div>
  );
}

