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
  Radio, Loader2, ChevronRight, Wallet, Activity, TrendingUp, Star,
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showMap, setShowMap] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { showTutorial, completeTutorial } = useAppTutorial("pro", user?.id);

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
  const rating = Number((proData?.proProfile as any)?.rating_avg || 0);
  const jobsDone = Number(metrics?.last_30d_jobs || 0);
  const [proLocation, setProLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isAvailable && pushSupported && pushPermission === "default") pushSubscribe();
  }, [isAvailable, pushSupported, pushPermission]);

  useEffect(() => {
    if (!availableOrders || availableOrders.length === 0) { prevOrderCountRef.current = 0; return; }
    if (availableOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0 && document.hidden) {
      const o = availableOrders[0] as any;
      showLocalNotification("Novo pedido disponível", {
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
      {showTutorial && <AppTutorial variant="pro" userId={user?.id} onComplete={completeTutorial} />}

      <div className="h-full bg-background flex flex-col safe-top">
        {/* ── Header ── */}
        <header className="shrink-0 px-5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-muted ring-2 ring-border/60">
                  {proAvatar ? (
                    <img src={proAvatar} alt={proName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold">
                      {proName.charAt(0)}
                    </div>
                  )}
                </div>
                {isAvailable && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-background" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] text-muted-foreground tracking-tight">Olá,</p>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-[17px] font-semibold text-foreground leading-tight tracking-tight truncate">
                    {proName.split(" ")[0]}
                  </h1>
                  {planType === "elite" && (
                    <span className="px-1.5 py-0.5 bg-warning/15 text-warning rounded-full text-[10px] font-semibold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> ELITE
                    </span>
                  )}
                  {planType === "pro" && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">

            {/* HERO: Saldo + Disponibilidade */}
            <motion.div
              variants={item}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 shadow-sm"
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute right-4 top-4 opacity-20">
                <Wallet className="w-20 h-20" />
              </div>

              <p className="text-xs uppercase tracking-wider opacity-80 font-medium">Saldo disponível</p>
              <p className="text-[34px] font-bold leading-none mt-1.5">
                R$ {balance.toFixed(2).replace(".", ",")}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/pro/earnings")}
                  className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-semibold hover:bg-white/25 transition-colors"
                >
                  Ver ganhos
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleToggle}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors",
                    isAvailable
                      ? "bg-white text-destructive"
                      : "bg-white text-primary"
                  )}
                >
                  <Radio className="w-4 h-4" />
                  {isAvailable ? "Pausar" : "Ficar online"}
                </motion.button>
              </div>
            </motion.div>

            {/* Verification Banner */}
            {!isVerified && (
              <motion.div variants={item} className="p-3.5 bg-warning/10 border border-warning/25 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">Verificação pendente</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Envie documentos para receber pedidos</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/pro/verification")}
                    className="px-3 py-2 bg-warning text-warning-foreground rounded-lg text-xs font-semibold shrink-0"
                  >
                    Enviar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Stats em destaque */}
            <motion.div variants={item} className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 bg-card rounded-2xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Nota</span>
                </div>
                <p className="text-lg font-bold text-foreground leading-none">
                  {rating > 0 ? rating.toFixed(1) : "—"}
                </p>
              </div>
              <div className="p-3.5 bg-card rounded-2xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Serviços</span>
                </div>
                <p className="text-lg font-bold text-foreground leading-none">{jobsDone}</p>
              </div>
              <div className="p-3.5 bg-card rounded-2xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Pontual.</span>
                </div>
                <p className="text-lg font-bold text-foreground leading-none">
                  {Number(metrics?.on_time_rate || 0).toFixed(0)}%
                </p>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div variants={item} className="grid grid-cols-4 gap-2">
              {[
                { icon: Calendar, label: "Agenda", color: "text-primary", bg: "bg-primary/10", path: "/pro/agenda" },
                { icon: Activity, label: "Qualidade", color: "text-success", bg: "bg-success/10", path: "/pro/quality" },
                { icon: Trophy, label: "Ranking", color: "text-warning", bg: "bg-warning/10", path: "/pro/ranking" },
                { icon: Crown, label: "Planos", color: "text-primary", bg: "bg-primary/10", path: "/pro/plan" },
              ].map((q) => (
                <motion.button
                  key={q.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(q.path)}
                  className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-2xl border border-border/60 shadow-sm"
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", q.bg)}>
                    <q.icon className={cn("w-4.5 h-4.5", q.color)} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">{q.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Map toggle (quando online) */}
            {isAvailable && (
              <motion.div variants={item}>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-between px-1 py-1 text-xs text-primary font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {showMap ? "Ocultar mapa" : "Ver mapa de pedidos"}
                  </span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", showMap && "rotate-90")} />
                </button>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 rounded-2xl overflow-hidden border border-border/60"
                  >
                    <MapView
                      center={mapCenter} zoom={13}
                      markers={[{ lat: mapCenter.lat, lng: mapCenter.lng, color: "blue" as const, popup: "Você" }, ...orderMarkers]}
                      showUserLocation height="180px"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Assigned Orders */}
            {assignedOrders.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-sm font-bold text-foreground">Meus pedidos</h2>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {assignedOrders.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {assignedOrders.map((order) => {
                    const statusLabel: Record<string, string> = { confirmed: "Confirmado", en_route: "A caminho", in_progress: "Em andamento" };
                    const statusColor: Record<string, string> = { confirmed: "bg-primary/10 text-primary", en_route: "bg-warning/10 text-warning", in_progress: "bg-success/10 text-success" };
                    return (
                      <motion.button
                        key={order.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/pro/order/${order.id}`)}
                        className="w-full p-4 bg-card rounded-2xl border border-primary/30 shadow-sm text-left flex items-center gap-3"
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
                <div className="p-8 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Verificação pendente</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete a verificação para receber pedidos</p>
                </div>
              ) : !isAvailable ? (
                <div className="p-8 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Radio className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Você está offline</p>
                  <p className="text-xs text-muted-foreground mt-1">Ative sua disponibilidade para receber</p>
                </div>
              ) : isLoadingOrders ? (
                <div className="p-8 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="p-8 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <Radio className="w-6 h-6 text-success animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Aguardando pedidos</p>
                  <p className="text-xs text-muted-foreground mt-1">Avisaremos assim que chegar</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {availableOrders.map((order) => (
                    <div
                      key={order.id}
                      className={cn(
                        "p-4 bg-card rounded-2xl border shadow-sm",
                        order.eliteOnly ? "border-warning/40 bg-warning/5" : "border-border/60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2.5">
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
                          className="flex-1 py-2.5 rounded-xl border border-border/60 text-muted-foreground text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
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
                            "flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50",
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
