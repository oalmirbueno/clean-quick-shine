import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Calendar, Trophy, Wallet, MapPin, Clock, Check, X, Shield, Crown, Bell } from "lucide-react";
import { pros, orders as allOrders } from "@/lib/mockDataV2";

export default function ProHome() {
  const navigate = useNavigate();
  const pro = pros[0]; // Mock current pro

  // Filter available orders (scheduled, not assigned)
  const availableOrders = allOrders.filter(o => o.status === "scheduled" && !o.proId).slice(0, 3);
  
  // Add some mock available orders
  const mockAvailableOrders = [
    { id: "new1", serviceName: "Limpeza Padrão", city: "Jardim Paulista", date: "Hoje", time: "15:00", proEarning: 103.92 },
    { id: "new2", serviceName: "Limpeza Pesada", city: "Pinheiros", date: "Amanhã", time: "09:00", proEarning: 143.92 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {pro.plan === "pro" && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" /> PRO
              </span>
            )}
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
        <h1 className="text-xl font-semibold text-foreground">
          Olá, {pro.name.split(" ")[0]} 👋
        </h1>
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
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate("/pro/verification")}
            className="flex flex-col items-center p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Verificação</span>
          </button>
          
          <button 
            onClick={() => navigate("/pro/agenda")}
            className="flex flex-col items-center p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Agenda</span>
          </button>
          
          <button 
            onClick={() => navigate("/pro/ranking")}
            className="flex flex-col items-center p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Ranking</span>
          </button>
        </div>

        {/* Plan Banner */}
        {pro.plan === "free" && (
          <button
            onClick={() => navigate("/pro/plan")}
            className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3
              hover:bg-primary/10 transition-colors"
          >
            <Crown className="w-6 h-6 text-primary" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Seja PRO</p>
              <p className="text-sm text-muted-foreground">Receba 3x mais pedidos</p>
            </div>
            <span className="text-primary font-medium">→</span>
          </button>
        )}

        {/* Available Orders */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Pedidos disponíveis
          </h2>
          
          {pro.verifiedStatus !== "approved" ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Complete sua verificação para receber pedidos
              </p>
            </div>
          ) : mockAvailableOrders.length === 0 ? (
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <p className="text-muted-foreground">
                Não há pedidos disponíveis no momento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockAvailableOrders.map((order) => (
                <div 
                  key={order.id}
                  className="p-4 bg-card rounded-xl border border-border card-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{order.serviceName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{order.city}</span>
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
                      className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium
                        button-shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
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
