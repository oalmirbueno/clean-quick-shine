import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { QualityBadge } from "@/components/ui/QualityBadge";
import { MapView } from "@/components/ui/MapView";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedSection } from "@/components/ui/AnimatedCard";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion } from "framer-motion";
import { Calendar, Trophy, MapPin, Clock, Check, X, Shield, Crown, Sparkles, Radio, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCurrentProData, useAvailableOrdersForPro, useAssignedOrders, useToggleProAvailability, useAcceptOrder, useDeclineOrder } from "@/hooks/useProData";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function ProHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showMap, setShowMap] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { showTutorial, completeTutorial } = useAppTutorial("pro");

  const { data: proData, isLoading: isLoadingPro } = useCurrentProData();
  const { data: availableOrders = [], isLoading: isLoadingOrders } = useAvailableOrdersForPro();
  const { data: assignedOrders = [], isLoading: isLoadingAssigned } = useAssignedOrders();
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

  // Request push permission when pro goes available
  useEffect(() => {
    if (isAvailable && pushSupported && pushPermission === "default") {
      pushSubscribe();
    }
  }, [isAvailable, pushSupported, pushPermission]);

  // Show local notification when new orders arrive while app is in background
  useEffect(() => {
    if (!availableOrders || availableOrders.length === 0) {
      prevOrderCountRef.current = 0;
      return;
    }
    if (availableOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0 && document.hidden) {
      const latestOrder = availableOrders[0] as any;
      showLocalNotification("Novo pedido disponível! 🧹", {
        body: `${latestOrder?.serviceName || "Serviço"} - R$ ${latestOrder?.totalPrice?.toFixed(2).replace(".", ",")}`,
        data: { url: "/pro/home" },
        tag: "new-order",
      } as any);
    }
    prevOrderCountRef.current = availableOrders.length;
  }, [availableOrders?.length]);

  // Update pro location in DB every 60s when available
  useEffect(() => {
    if (!isAvailable || !user?.id) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setProLocation({ lat: latitude, lng: longitude });
          await supabase
            .from("pro_profiles")
            .update({
              current_lat: latitude,
              current_lng: longitude,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        },
        (err) => console.warn("Geo error:", err),
        { enableHighAccuracy: true }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 60000);
    return () => clearInterval(interval);
  }, [isAvailable, user?.id]);

  // Build order markers for the map
  const orderMarkers = availableOrders
    ?.filter((o: any) => o.address?.lat && o.address?.lng)
    .map((o: any) => ({
      lat: Number(o.address.lat),
      lng: Number(o.address.lng),
      color: "orange" as const,
      popup: `${o.serviceName || "Serviço"} - R$ ${o.proEarning?.toFixed(2).replace(".", ",")}`,
    })) || [];

  const mapCenter = proLocation || {
    lat: Number(proData?.proProfile?.current_lat) || -25.4284,
    lng: Number(proData?.proProfile?.current_lng) || -49.2733,
  };

  const proMarker = {
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    color: "blue" as const,
    popup: "Você está aqui",
  };

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability(isAvailable);
      queryClient.invalidateQueries({ queryKey: ["current_pro_data"] });
      toast.success(isAvailable ? "Você está offline agora" : "Você está disponível para pedidos!");
    } catch (error) {
      toast.error("Erro ao alterar disponibilidade");
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      await acceptOrderMutation.mutateAsync(orderId);
      navigate(`/pro/order/${orderId}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      await declineOrderMutation.mutateAsync(orderId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getPlanBadge = () => {
    if (planType === "elite") {
      return (
        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-full text-xs font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> ELITE
        </span>
      );
    }
    if (planType === "pro") {
      return (
        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1">
          <Crown className="w-3 h-3" /> PRO
        </span>
      );
    }
    return null;
  };

  if (isLoadingPro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {showTutorial && (
        <AppTutorial variant="pro" onComplete={completeTutorial} />
      )}
      
      <div className="h-full bg-background flex flex-col safe-top">
        {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 glass border-b border-border/30 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <Logo size="lg" iconOnly />
          <div className="flex items-center gap-2">
            {getPlanBadge()}
            <ThemeToggle />
            <NotificationsDropdown />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              className="w-10 h-10 rounded-full overflow-hidden bg-muted"
            >
              {proAvatar ? (
                <img 
                  src={proAvatar} 
                  alt={proName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                  {proName.charAt(0)}
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-xl font-semibold text-foreground">
            Olá, {proName.split(" ")[0]}
          </h1>
          {metrics?.quality_level && (
            <QualityBadge level={metrics.quality_level} size="sm" />
          )}
        </motion.div>
        {!isVerified && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">Verificação pendente</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Envie seus documentos para começar a receber pedidos. Sem verificação, seu perfil fica invisível para clientes.
                </p>
                <button
                  onClick={() => navigate("/pro/verification")}
                  className="mt-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Enviar documentos agora
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Live Availability Toggle */}
        <AnimatedSection delay={1} className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ scale: isAvailable ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: isAvailable ? Infinity : 0, duration: 2 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isAvailable ? "bg-success/20" : "bg-muted"
                )}
              >
                <Radio className={cn(
                  "w-5 h-5 transition-colors",
                  isAvailable ? "text-success" : "text-muted-foreground"
                )} />
              </motion.div>
              <div>
                <p className="font-medium text-foreground">
                  {isAvailable ? "Disponível agora" : "Offline"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? "Recebendo pedidos próximos" : "Ative para receber pedidos"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleAvailability}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                isAvailable 
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {isAvailable ? "Desativar" : "Ativar"}
            </motion.button>
          </div>
          
          {isAvailable && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-border"
            >
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <MapPin className="w-4 h-4" />
                {showMap ? "Ocultar mapa" : "Ver minha posição no mapa"}
              </button>
              {showMap && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 rounded-lg overflow-hidden"
                >
                  <MapView
                    center={mapCenter}
                    zoom={13}
                    markers={[proMarker, ...orderMarkers]}
                    showUserLocation
                    height="200px"
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatedSection>

        {/* Balance Card */}
        <AnimatedSection delay={2}>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="p-5 bg-gradient-to-br from-primary to-primary/80 rounded-xl text-primary-foreground cursor-pointer shadow-lg"
            onClick={() => navigate("/pro/earnings")}
          >
            <p className="text-sm opacity-90">Saldo disponível</p>
            <p className="text-3xl font-bold mt-1">R$ {balance.toFixed(2).replace(".", ",")}</p>
            <button className="mt-3 text-sm font-medium underline underline-offset-2 opacity-90 hover:opacity-100">
              Ver ganhos
            </button>
          </motion.div>
        </AnimatedSection>

        {/* Quick Actions */}
        <AnimatedSection delay={3}>
          <AnimatedList className="grid grid-cols-4 gap-2">
            {[
              { icon: Activity, label: "SLA", path: "/pro/quality", color: "bg-success/10", iconColor: "text-success" },
              { icon: Calendar, label: "Agenda", path: "/pro/agenda", color: "bg-accent", iconColor: "text-primary" },
              { icon: Trophy, label: "Ranking", path: "/pro/ranking", color: "bg-warning/10", iconColor: "text-warning" },
              { icon: Crown, label: "Planos", path: "/pro/plan", color: "bg-primary/10", iconColor: "text-primary" },
            ].map((action) => (
              <AnimatedListItem key={action.label}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors w-full"
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", action.color)}>
                    <action.icon className={cn("w-5 h-5", action.iconColor)} />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
                </motion.button>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </AnimatedSection>

        {/* SLA Quality Card */}
        {metrics && (
          <AnimatedSection delay={4}>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate("/pro/quality")}
              className="p-4 bg-card rounded-xl border border-border cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Sua qualidade hoje</h3>
                {metrics.quality_level && <QualityBadge level={metrics.quality_level} />}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{Number(metrics.on_time_rate || 0).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Pontualidade</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{metrics.response_time_avg || 0}min</p>
                  <p className="text-xs text-muted-foreground">Resposta</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{Number(metrics.cancel_rate || 0).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Cancelamentos</p>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        )}

        {/* Plan Upgrade Banner */}
        {planType !== "elite" && (
          <AnimatedSection delay={5}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/pro/plan")}
              className={cn(
                "w-full p-4 rounded-xl border flex items-center gap-3 transition-colors",
                planType === "free" 
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                  : "border-warning/50 bg-warning/5 hover:bg-warning/10"
              )}
            >
              {planType === "free" ? (
                <>
                  <Crown className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Seja PRO</p>
                    <p className="text-sm text-muted-foreground">Receba 3x mais pedidos</p>
                  </div>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-warning" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Upgrade para ELITE</p>
                    <p className="text-sm text-muted-foreground">Máxima prioridade + comercial</p>
                  </div>
                </>
              )}
              <span className="text-primary font-medium">→</span>
            </motion.button>
          </AnimatedSection>
        )}

        {/* Active/Assigned Orders */}
        {assignedOrders.length > 0 && (
          <AnimatedSection delay={6}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">
                Meus pedidos ativos
              </h2>
              <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
                {assignedOrders.length}
              </span>
            </div>
            <AnimatedList className="space-y-3">
              {assignedOrders.map((order) => {
                const statusLabel: Record<string, string> = {
                  confirmed: "Confirmado",
                  en_route: "A caminho",
                  in_progress: "Em andamento",
                };
                const statusColor: Record<string, string> = {
                  confirmed: "bg-primary/10 text-primary",
                  en_route: "bg-warning/10 text-warning",
                  in_progress: "bg-success/10 text-success",
                };
                return (
                  <AnimatedListItem key={order.id}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => navigate(`/pro/order/${order.id}`)}
                      className="p-4 bg-card rounded-xl border border-primary/30 card-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{order.serviceName}</h3>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[order.status] || "bg-muted text-muted-foreground")}>
                              {statusLabel[order.status] || order.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Cliente: {order.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-success">
                            R$ {order.proEarning.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{order.street}, {order.number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{order.date} • {order.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          </AnimatedSection>
        )}

        {/* Available Orders */}
        <AnimatedSection delay={6}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Pedidos disponíveis
            </h2>
            {planType === "elite" && (
              <span className="text-xs text-warning font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Acesso comercial
              </span>
            )}
          </div>
          
          {!isVerified ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Complete sua verificação para receber pedidos
              </p>
            </div>
          ) : !isAvailable ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Ative sua disponibilidade para ver pedidos
              </p>
            </div>
          ) : isLoadingOrders ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <p className="text-muted-foreground">
                Não há pedidos disponíveis no momento
              </p>
            </div>
          ) : (
            <AnimatedList className="space-y-3">
              {availableOrders.map((order, index) => (
                <AnimatedListItem key={order.id}>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "p-4 bg-card rounded-xl border card-shadow",
                      order.eliteOnly 
                        ? "border-warning bg-warning/5" 
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{order.serviceName}</h3>
                          {order.eliteOnly && (
                            <span className="px-1.5 py-0.5 bg-warning text-warning-foreground rounded text-xs font-medium">
                              ELITE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{order.neighborhood}, {order.city}</span>
                          <span className="text-xs">• {order.distance} km</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">
                          R$ {order.proEarning.toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-muted-foreground">Você recebe</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{order.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{order.time}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeclineOrder(order.id)}
                        disabled={processingOrderId === order.id}
                        className="flex-1 py-2.5 px-4 rounded-lg border border-border text-muted-foreground font-medium
                          hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingOrderId === order.id && declineOrderMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Recusar
                      </motion.button>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={processingOrderId === order.id}
                        className={cn(
                          "flex-1 py-2.5 px-4 rounded-lg font-medium button-shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50",
                          order.eliteOnly
                            ? "bg-warning text-warning-foreground"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {processingOrderId === order.id && acceptOrderMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Aceitar
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          )}
        </AnimatedSection>
      </main>

      <BottomNav variant="pro" />
    </div>
    </>
  );
}
