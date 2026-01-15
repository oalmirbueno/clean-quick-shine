import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Calendar, Trophy, Wallet, MapPin, Clock, Check, X } from "lucide-react";
import { mockPro, mockProProfile, mockProOrders } from "@/lib/mockData";

export default function ProHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img 
              src={mockProProfile.avatar} 
              alt={mockPro.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Olá, {mockPro.name.split(" ")[0]} 👋
        </h1>
      </header>

      <main className="p-4 space-y-4 animate-fade-in">
        {/* Balance Card */}
        <div className="p-5 bg-primary rounded-xl text-primary-foreground">
          <p className="text-sm opacity-90">Saldo disponível</p>
          <p className="text-3xl font-bold mt-1">R$ 320,00</p>
          <button 
            onClick={() => navigate("/pro/earnings")}
            className="mt-3 text-sm font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            Ver ganhos →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => {}}
            className="flex flex-col items-center p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <Check className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Aceitar novos</span>
          </button>
          
          <button 
            onClick={() => navigate("/pro/agenda")}
            className="flex flex-col items-center p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Minha agenda</span>
          </button>
          
          <button 
            onClick={() => navigate("/pro/ranking")}
            className="flex flex-col items-center p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">Meu ranking</span>
          </button>
        </div>

        {/* Available Orders */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Pedidos disponíveis
          </h2>
          
          <div className="space-y-3">
            {mockProOrders.map((order) => (
              <div 
                key={order.id}
                className="p-4 bg-card rounded-xl border border-border card-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{order.serviceName}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{order.address.split(" - ")[1]}</span>
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
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
