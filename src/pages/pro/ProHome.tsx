import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QualityBadge } from "@/components/ui/QualityBadge";
import { MapMock } from "@/components/ui/MapMock";
import { Calendar, Trophy, Wallet, MapPin, Clock, Check, X, Shield, Crown, Bell, Sparkles, Radio, Activity, Star } from "lucide-react";
import { pros, orders as allOrders, proPlans } from "@/lib/mockDataV3";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProHome() {
  const navigate = useNavigate();
  const pro = pros[0]; // Mock current pro (Ana Paula - ELITE)
  const [isAvailable, setIsAvailable] = useState(pro.isAvailableNow || false);
  const [showMap, setShowMap] = useState(false);

  // Get plan details
  const currentPlan = proPlans.find(p => p.name.toLowerCase() === pro.plan);

  // Filter available orders (scheduled, not assigned)
  const mockAvailableOrders = [
    { id: "new1", serviceName: "Limpeza Padrão", city: "Jardim Paulista", date: "Hoje", time: "15:00", proEarning: 103.92, distance: 1.2 },
    { id: "new2", serviceName: "Limpeza Pesada", city: "Pinheiros", date: "Amanhã", time: "09:00", proEarning: 143.92, distance: 2.8 },
    { id: "new3", serviceName: "Comercial", city: "Itaim Bibi", date: "Amanhã", time: "14:00", proEarning: 159.92, distance: 3.5, eliteOnly: true },
  ];

  // Filter orders based on plan
  const availableForPlan = mockAvailableOrders.filter(o => 
    pro.plan === "elite" || !o.eliteOnly
  );

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    toast.success(isAvailable ? "Você está offline agora" : "Você está disponível para pedidos!");
  };

  const getPlanBadge = () => {
    if (pro.plan === "elite") {
      return (
        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-full text-xs font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> ELITE
        </span>
      );
    }
    if (pro.plan === "pro") {
      return (
        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1">
          <Crown className="w-3 h-3" /> PRO
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {getPlanBadge()}
            <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={pro.avatar} 
                alt={pro.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Olá, {pro.name.split(" ")[0]} 👋
          </h1>
          {pro.metrics && (
            <QualityBadge level={pro.metrics.qualityLevel} size="sm" />
          )}
        </div>
        {pro.verifiedStatus === "pending" && (
          <button 
            onClick={() => navigate("/pro/verification")}
            className="mt-2 flex items-center gap-2 text-sm text-warning"
          >
            <Shield className="w-4 h-4" />
            Complete sua verificação para receber pedidos
          </button>
        )}
      </header>

      <main className="p-4 space-y-4 animate-fade-in">
        {/* Live Availability Toggle */}
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isAvailable ? "bg-success/20" : "bg-muted"
              )}>
                <Radio className={cn(
                  "w-5 h-5 transition-colors",
                  isAvailable ? "text-success animate-pulse" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isAvailable ? "Disponível agora" : "Offline"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? "Recebendo pedidos próximos" : "Ative para receber pedidos"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                isAvailable 
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {isAvailable ? "Desativar" : "Ativar"}
            </button>
          </div>
          
          {/* Mini Map Toggle */}
          {isAvailable && (
            <div className="mt-3 pt-3 border-t border-border">
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <MapPin className="w-4 h-4" />
                {showMap ? "Ocultar mapa" : "Ver minha posição no mapa"}
              </button>
              {showMap && (
                <div className="mt-3 h-40 rounded-lg overflow-hidden">
                  <MapMock 
                    markers={[{
                      lat: pro.currentLat || -23.5634,
                      lng: pro.currentLng || -46.6542,
                      label: "Você"
                    }]}
                    radiusKm={pro.radiusKm}
                    height="100%"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div 
          className="p-5 bg-primary rounded-xl text-primary-foreground cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => navigate("/pro/earnings")}
        >
          <p className="text-sm opacity-90">Saldo disponível</p>
          <p className="text-3xl font-bold mt-1">R$ {pro.balance.toFixed(2).replace(".", ",")}</p>
          <button className="mt-3 text-sm font-medium underline underline-offset-2 opacity-90 hover:opacity-100">
            Ver ganhos →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => navigate("/pro/quality")}
            className="flex flex-col items-center p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">SLA</span>
          </button>
          
          <button 
            onClick={() => navigate("/pro/agenda")}
            className="flex flex-col items-center p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Agenda</span>
          </button>
          
          <button 
            onClick={() => navigate("/pro/ranking")}
            className="flex flex-col items-center p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Ranking</span>
          </button>

          <button 
            onClick={() => navigate("/pro/plan")}
            className="flex flex-col items-center p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Planos</span>
          </button>
        </div>

        {/* SLA Quality Card */}
        {pro.metrics && (
          <div 
            onClick={() => navigate("/pro/quality")}
            className="p-4 bg-card rounded-xl border border-border cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Sua qualidade hoje</h3>
              <QualityBadge level={pro.metrics.qualityLevel} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{pro.metrics.onTimeRate}%</p>
                <p className="text-xs text-muted-foreground">Pontualidade</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{pro.metrics.responseTimeAvg}min</p>
                <p className="text-xs text-muted-foreground">Resposta</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{pro.metrics.cancelRate}%</p>
                <p className="text-xs text-muted-foreground">Cancelamentos</p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Upgrade Banner */}
        {pro.plan !== "elite" && (
          <button
            onClick={() => navigate("/pro/plan")}
            className={cn(
              "w-full p-4 rounded-xl border flex items-center gap-3 transition-colors",
              pro.plan === "free" 
                ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                : "border-amber-400/50 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100"
            )}
          >
            {pro.plan === "free" ? (
              <>
                <Crown className="w-6 h-6 text-primary" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">Seja PRO</p>
                  <p className="text-sm text-muted-foreground">Receba 3x mais pedidos</p>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-amber-500" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">Upgrade para ELITE</p>
                  <p className="text-sm text-muted-foreground">Máxima prioridade + comercial</p>
                </div>
              </>
            )}
            <span className="text-primary font-medium">→</span>
          </button>
        )}

        {/* Available Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Pedidos disponíveis
            </h2>
            {pro.plan === "elite" && (
              <span className="text-xs text-amber-600 font-medium">
                ✨ Acesso a comercial
              </span>
            )}
          </div>
          
          {pro.verifiedStatus !== "approved" ? (
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
          ) : availableForPlan.length === 0 ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <p className="text-muted-foreground">
                Não há pedidos disponíveis no momento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableForPlan.map((order) => (
                <div 
                  key={order.id}
                  className={cn(
                    "p-4 bg-card rounded-xl border card-shadow",
                    order.eliteOnly 
                      ? "border-amber-300 bg-gradient-to-r from-amber-50/50 to-yellow-50/50" 
                      : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{order.serviceName}</h3>
                        {order.eliteOnly && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-xs font-medium">
                            ELITE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{order.city}</span>
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
                    <button className="flex-1 py-2.5 px-4 rounded-lg border border-border text-muted-foreground font-medium
                      hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                      <X className="w-4 h-4" />
                      Recusar
                    </button>
                    <button 
                      onClick={() => navigate(`/pro/order/${order.id}`)}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg font-medium button-shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2",
                        order.eliteOnly
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white"
                          : "bg-primary text-primary-foreground"
                      )}>
                      <Check className="w-4 h-4" />
                      Aceitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
