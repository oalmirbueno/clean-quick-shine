import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TimelineStepper } from "@/components/ui/TimelineStepper";
import { MapView } from "@/components/ui/MapView";
import { ChevronLeft, MessageCircle, HelpCircle, X, Loader2, MapPin, Clock, Calendar, Check } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import { supabase } from "@/integrations/supabase/client";

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
  const [searchParams] = useSearchParams();
  const orderId = location.state?.orderId || searchParams.get("orderId");

  const { data: order, isLoading } = useOrder(orderId);
  useOrderRealtime(orderId);

  const [proLocation, setProLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Poll pro location when en_route
  useEffect(() => {
    if (order?.status !== "en_route" || !order?.pro_id) return;

    const fetchProLocation = async () => {
      const { data } = await supabase
        .from("pro_profiles")
        .select("current_lat, current_lng")
        .eq("user_id", order.pro_id!)
        .maybeSingle();

      if (data?.current_lat && data?.current_lng) {
        setProLocation({ lat: Number(data.current_lat), lng: Number(data.current_lng) });
      }
    };

    fetchProLocation();
    const interval = setInterval(fetchProLocation, 15000);
    return () => clearInterval(interval);
  }, [order?.status, order?.pro_id]);

  const timelineSteps = useMemo(() => {
    const formatTime = (status: string) => {
      if (!order) return "—";
      if (status === "completed" && order.completed_at) {
        return new Date(order.completed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      }
      if (status === "confirmed" && order.created_at) {
        return new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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

  const addressLat = order?.address?.lat ? Number(order.address.lat) : null;
  const addressLng = order?.address?.lng ? Number(order.address.lng) : null;
  const hasMapCoords = addressLat !== null && addressLng !== null;

  const mapMarkers = useMemo(() => {
    const m: { lat: number; lng: number; color: "green" | "blue"; label: string }[] = [];
    if (hasMapCoords) {
      m.push({ lat: addressLat!, lng: addressLng!, color: "green", label: "Local do serviço" });
    }
    if (proLocation && (order?.status === "en_route" || order?.status === "in_progress")) {
      m.push({ lat: proLocation.lat, lng: proLocation.lng, color: "blue", label: order?.pro_profile?.full_name || "Profissional" });
    }
    return m;
  }, [hasMapCoords, addressLat, addressLng, proLocation, order?.status, order?.pro_profile?.full_name]);

  const mapCenter = useMemo(() => {
    if (proLocation && order?.status === "en_route") return proLocation;
    if (hasMapCoords) return { lat: addressLat!, lng: addressLng! };
    return { lat: -25.4284, lng: -49.2733 };
  }, [proLocation, order?.status, hasMapCoords, addressLat, addressLng]);

  const handleComplete = () => {
    if (order) navigate("/client/rating", { state: { orderId: order.id } });
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
            <button onClick={() => navigate("/client/orders")} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Pedido não encontrado</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">Não foi possível carregar o pedido.</p>
        </main>
      </div>
    );
  }

  const proAvatar = order.pro_profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.pro_id}`;
  const proName = order.pro_profile?.full_name || "Profissional";
  const serviceName = order.service?.name || "Serviço";

  const statusLabel = (() => {
    switch (order.status) {
      case "confirmed": return "Aguardando profissional";
      case "en_route": return "Profissional a caminho";
      case "in_progress": return "Serviço em andamento";
      case "completed": return "Serviço concluído";
      default: return "";
    }
  })();

  const formatAddress = () => {
    if (!order.address) return null;
    const addr = order.address;
    return `${addr.street}, ${addr.number}, ${addr.neighborhood}`;
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/client/orders")} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Acompanhar pedido</h1>
            {statusLabel && <p className="text-sm text-muted-foreground">{statusLabel}</p>}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Map */}
        {hasMapCoords && order.status !== "completed" && order.status !== "rated" && order.status !== "paid_out" && (
          <div className="relative">
            <MapView
              center={mapCenter}
              zoom={14}
              markers={mapMarkers}
              height="300px"
              showUserLocation
              className="rounded-none"
            />
            {/* Status overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-foreground">{statusLabel}</span>
              </div>
            </div>
          </div>
        )}

        {/* Completed map state */}
        {hasMapCoords && (order.status === "completed" || order.status === "rated" || order.status === "paid_out") && (
          <div className="mx-4 mt-4 p-6 bg-success/5 rounded-2xl border border-success/20 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-7 h-7 text-success" />
            </div>
            <p className="font-semibold text-foreground">Serviço concluído!</p>
            <p className="text-sm text-muted-foreground text-center">O serviço foi finalizado com sucesso.</p>
          </div>
        )}

        {/* Pro Info */}
        {order.pro_id && (
          <section className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={proAvatar} alt={proName} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{proName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{serviceName}</span>
                  {order.pro_profile?.rating && (
                    <>
                      <span>•</span>
                      <span>⭐ {Number(order.pro_profile.rating).toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
              {order.pro_profile?.phone && (
                <a
                  href={`https://wa.me/55${order.pro_profile.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center hover:bg-success/20 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-success" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* Realtime indicator */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Atualizações em tempo real</span>
          </div>
        </div>

        {/* Timeline */}
        <section className="p-4">
          <h2 className="font-medium text-foreground mb-6">Status do pedido</h2>
          <TimelineStepper steps={timelineSteps} currentStep={currentStep} />
        </section>

        {/* Service Details */}
        <section className="mx-4 p-4 bg-card rounded-xl border border-border space-y-3">
          <h3 className="font-medium text-foreground text-sm">Detalhes do serviço</h3>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Duração estimada: <span className="text-foreground font-medium">{order.duration_hours}h</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {new Date(order.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} às {order.scheduled_time?.slice(0, 5)}
            </span>
          </div>
          {formatAddress() && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{formatAddress()}</span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">R$ {Number(order.total_price).toFixed(2).replace(".", ",")}</span>
          </div>
        </section>

        {/* Actions */}
        <section className="p-4 mt-2 space-y-3">
          <button
            onClick={() => navigate("/client/support")}
            className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>

          {order.status && ["confirmed", "en_route"].includes(order.status) && (
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

        <div className="h-4" />
      </main>

      {/* Bottom Action */}
      {order.status === "completed" && !order.client_rating && (
        <div className="flex-shrink-0 p-4 bg-card border-t border-border safe-bottom">
          <PrimaryButton fullWidth onClick={handleComplete}>
            Avaliar serviço
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
