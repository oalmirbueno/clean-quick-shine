import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { QualityBadge } from "@/components/ui/QualityBadge";
import { MapView } from "@/components/ui/MapView";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion } from "framer-motion";
import {
  Calendar, Trophy, MapPin, Clock, Check, X, Shield, Crown, Sparkles,
  Radio, Loader2, ChevronRight, Wallet, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCurrentProData, useAvailableOrdersForPro, useAssignedOrders,
  useToggleProAvailability, useAcceptOrder, useDeclineOrder,
} from "@/hooks/useProData";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showMap, setShowMap] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { showTutorial, completeTutorial } = useAppTutorial("pro");

  const { data: proData, isLoading: isLoadingPro } = useCurrentProData();
  const { data: availableOrders = [], isLoading: isLoadingOrders } = useAvailableOrdersForPro();
  const { data: assignedOrders = [] } = useAssignedOrders();
  const { toggleAvailability } = useToggleProAvailability();
  const acceptOrderMutation = useAcceptOrder();
  const declineOrderMutation = useDeclineOrder();
  const { isSupported: pushSupported, permission: pushPermission, subscribe: pushSubscribe, showLocalNotification } = usePushNotifications();
  const prevOrderCountRef = useRef(0);

  const isAvailable = proData?.proProfile?.available_now || false;
  const isVerified = proData?.proProfile?.verified || false;
  const proName = proData?.profile?.full_name || "Profissional";
  const proAvatar = proData?.profile?.avatar_url;
  const balance = proData?.balance || 0;
  const planType = proData?.plan?.type || "free";
  const metrics = proData?.metrics;
  const [proLocation, setProLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isAvailable && pushSupported && pushPermission === "default") pushSubscribe();
  }, [isAvailable, pushSupported, pushPermission]);

  useEffect(() => {
    if (!availableOrders || availableOrders.length === 0) { prevOrderCountRef.current = 0; return; }
    if (availableOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0 && document.hidden) {
      const o = availableOrders[0] as any;
      showLocalNotification("Novo pedido disponível! 🧹", {
        body: `${o?.serviceName || "Serviço"} - R$ ${o?.totalPrice?.toFixed(2).replace(".", ",")}`,
        data: { url: "/pro/home" }, tag: "new-order",
      } as any);
    }
    prevOrderCountRef.current = availableOrders.length;
  }, [availableOrders?.length]);

  useEffect(() => {
    if (!isAvailable || !user?.id) return;
    const update = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setProLocation({ lat: latitude, lng: longitude });
          await supabase.from("pro_profiles").update({
            current_lat: latitude, current_lng: longitude, updated_at: new Date().toISOString(),
          }).eq("user_id", user.id);
        },
        (err) => console.warn("Geo error:", err),
        { enableHighAccuracy: true },
      );
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [isAvailable, user?.id]);

  const orderMarkers = availableOrders
    ?.filter((o: any) => o.address?.lat && o.address?.lng)
    .map((o: any) => ({
      lat: Number(o.address.lat), lng: Number(o.address.lng), color: "orange" as const,
      popup: `${o.serviceName || "Serviço"} - R$ ${o.proEarning?.toFixed(2).replace(".", ",")}`,
    })) || [];

  const mapCenter = proLocation || {
    lat: Number(proData?.proProfile?.current_lat) || -25.4284,
    lng: Number(proData?.proProfile?.current_lng) || -49.2733,
  };

  const handleToggle = async () => {
    try {
      await toggleAvailability(isAvailable);
      queryClient.invalidateQueries({ queryKey: ["current_pro_data"] });
      toast.success(isAvailable ? "Você está offline" : "Disponível para pedidos!");
    } catch { toast.error("Erro ao alterar disponibilidade"); }
  };

  const handleAccept = async (id: string) => {
    setProcessingOrderId(id);
    try { await acceptOrderMutation.mutateAsync(id); navigate(`/pro/order/${id}`); }
    finally { setProcessingOrderId(null); }
  };

  const handleDecline = async (id: string) => {
    setProcessingOrderId(id);
    try { await declineOrderMutation.mutateAsync(id); }
    finally { setProcessingOrderId(null); }
  };

  if (isLoadingPro) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {showTutorial && <AppTutorial variant="pro" onComplete={completeTutorial} />}

      <div className="h-full bg-background flex flex-col safe-top">
        {/* ── Header ── */}
        <header className="shrink-0 px-5 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                {proAvatar ? (
                  <img src={proAvatar} alt={proName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                    {proName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Olá,</p>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground leading-tight">
                    {proName.split(" ")[0]}
                  </h1>
                  {metrics?.quality_level && <QualityBadge level={metrics.quality_level} size="sm" />}
                  {planType === "elite" && (
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-full text-[10px] font-bold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> ELITE
                    </span>
                  )}
                  {planType === "pro" && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-4 space-y-4">

            {/* Verification Banner */}
            {!isVerified && (
              <motion.div variants={item} className="p-3.5 bg-warning/10 border border-warning/25 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                    <Shield className="w-4.5 h-4.5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">Verificação pendente</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">Envie documentos para receber pedidos</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/pro/verification")}
                    className="px-3 py-1.5 bg-warning text-warning-foreground rounded-lg text-xs font-semibold shrink-0"
                  >
                    Enviar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Availability Toggle */}
            <motion.div variants={item} className="flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border/40">
              <motion.div
                animate={{ scale: isAvailable ? [1, 1.15, 1] : 1 }}
                transition={{ repeat: isAvailable ? Infinity : 0, duration: 2 }}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  isAvailable ? "bg-success/15" : "bg-muted"
                )}
              >
                <Radio className={cn("w-4.5 h-4.5", isAvailable ? "text-success" : "text-muted-foreground")} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{isAvailable ? "Disponível" : "Offline"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isAvailable ? "Recebendo pedidos" : "Ative para receber"}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                  isAvailable
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {isAvailable ? "Pausar" : "Ativar"}
              </motion.button>
            </motion.div>

            {/* Map toggle */}
            {isAvailable && (
              <motion.div variants={item}>
                <button onClick={() => setShowMap(!showMap)} className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {showMap ? "Ocultar mapa" : "Ver mapa"}
                </button>
                {showMap && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 rounded-xl overflow-hidden">
                    <MapView
                      center={mapCenter} zoom={13}
                      markers={[{ lat: mapCenter.lat, lng: mapCenter.lng, color: "blue" as const, popup: "Você" }, ...orderMarkers]}
                      showUserLocation height="160px"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Balance + Quick Actions Row */}
            <motion.div variants={item} className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/pro/earnings")}
                className="p-4 rounded-xl bg-primary text-primary-foreground text-left"
              >
                <Wallet className="w-5 h-5 opacity-80 mb-2" />
                <p className="text-[22px] font-bold leading-none">R$ {balance.toFixed(2).replace(".", ",")}</p>
                <p className="text-xs opacity-70 mt-1">Saldo disponível</p>
              </motion.button>

              <div className="grid grid-rows-2 gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/pro/agenda")}
                  className="flex items-center gap-2.5 p-3 bg-card rounded-xl border border-border/40"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Agenda</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/pro/quality")}
                  className="flex items-center gap-2.5 p-3 bg-card rounded-xl border border-border/40"
                >
                  <Activity className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-foreground">Qualidade</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick links row */}
            <motion.div variants={item} className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/pro/ranking")}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-card rounded-xl border border-border/40 text-sm font-medium text-foreground">
                <Trophy className="w-4 h-4 text-warning" /> Ranking
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/pro/plan")}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-card rounded-xl border border-border/40 text-sm font-medium text-foreground">
                <Crown className="w-4 h-4 text-primary" /> Planos
              </motion.button>
            </motion.div>

            {/* SLA Summary */}
            {metrics && (
              <motion.div variants={item}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/pro/quality")}
                  className="w-full p-3.5 bg-card rounded-xl border border-border/40 text-left"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qualidade</span>
                    {metrics.quality_level && <QualityBadge level={metrics.quality_level} size="sm" />}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-base font-bold text-foreground">{Number(metrics.on_time_rate || 0).toFixed(0)}%</p>
                      <p className="text-[10px] text-muted-foreground">Pontualidade</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">{metrics.response_time_avg || 0}min</p>
                      <p className="text-[10px] text-muted-foreground">Resposta</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">{Number(metrics.cancel_rate || 0).toFixed(0)}%</p>
                      <p className="text-[10px] text-muted-foreground">Cancelam.</p>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Assigned Orders */}
            {assignedOrders.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-sm font-bold text-foreground mb-2.5">Meus pedidos</h2>
                <div className="space-y-2">
                  {assignedOrders.map((order) => {
                    const statusLabel: Record<string, string> = { confirmed: "Confirmado", en_route: "A caminho", in_progress: "Em andamento" };
                    const statusColor: Record<string, string> = { confirmed: "bg-primary/10 text-primary", en_route: "bg-warning/10 text-warning", in_progress: "bg-success/10 text-success" };
                    return (
                      <motion.button
                        key={order.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/pro/order/${order.id}`)}
                        className="w-full p-3.5 bg-card rounded-xl border border-primary/25 text-left flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">{order.serviceName}</span>
                            <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0", statusColor[order.status] || "bg-muted text-muted-foreground")}>
                              {statusLabel[order.status] || order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{order.date} • {order.time} — {order.clientName}</p>
                        </div>
                        <p className="text-sm font-bold text-success shrink-0">R$ {order.proEarning.toFixed(2).replace(".", ",")}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Available Orders */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-bold text-foreground">Pedidos disponíveis</h2>
                {availableOrders.length > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {availableOrders.length}
                  </span>
                )}
              </div>

              {!isVerified ? (
                <div className="p-6 bg-card rounded-xl border border-border/40 text-center">
                  <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Complete a verificação para receber pedidos</p>
                </div>
              ) : !isAvailable ? (
                <div className="p-6 bg-card rounded-xl border border-border/40 text-center">
                  <Radio className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Ative sua disponibilidade</p>
                </div>
              ) : isLoadingOrders ? (
                <div className="p-6 bg-card rounded-xl border border-border/40 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="p-6 bg-card rounded-xl border border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum pedido no momento</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {availableOrders.map((order) => (
                    <div
                      key={order.id}
                      className={cn(
                        "p-3.5 bg-card rounded-xl border",
                        order.eliteOnly ? "border-warning/40 bg-warning/5" : "border-border/40"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-foreground truncate">{order.serviceName}</span>
                            {order.eliteOnly && (
                              <span className="px-1.5 py-0.5 bg-warning text-warning-foreground rounded text-[10px] font-bold shrink-0">ELITE</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" />{order.neighborhood}</span>
                            <span>{order.distance} km</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-base font-bold text-success">R$ {order.proEarning.toFixed(2).replace(".", ",")}</p>
                          <p className="text-[10px] text-muted-foreground">Você recebe</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{order.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{order.time}</span>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDecline(order.id)}
                          disabled={processingOrderId === order.id}
                          className="flex-1 py-2 rounded-lg border border-border/60 text-muted-foreground text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {processingOrderId === order.id && declineOrderMutation.isPending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <X className="w-3.5 h-3.5" />}
                          Recusar
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAccept(order.id)}
                          disabled={processingOrderId === order.id}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50",
                            order.eliteOnly ? "bg-warning text-warning-foreground" : "bg-primary text-primary-foreground"
                          )}
                        >
                          {processingOrderId === order.id && acceptOrderMutation.isPending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Check className="w-3.5 h-3.5" />}
                          Aceitar
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>

        <BottomNav variant="pro" />
      </div>
    </>
  );
}
