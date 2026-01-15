import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Calendar, Clock, MapPin, User, MessageCircle, HelpCircle, Navigation } from "lucide-react";
import { mockProOrders } from "@/lib/mockData";

export default function ProOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = mockProOrders.find(o => o.id === id) || mockProOrders[0];
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const handleStartService = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatus("in_progress");
    setLoading(false);
  };

  const handleFinishService = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatus("completed");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <p className="text-sm text-muted-foreground">#{order.id}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Earnings */}
        <section className="p-4 border-b border-border bg-success/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Você receberá</span>
            <span className="text-2xl font-bold text-success">
              R$ {order.proEarning.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </section>

        {/* Client Info */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Cliente</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Cliente LimpaJá</p>
              <p className="text-sm text-muted-foreground">Primeiro serviço</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Service Details */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Serviço</h2>
          <p className="font-semibold text-foreground text-lg">{order.serviceName}</p>
        </section>

        {/* Date & Time */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Data e horário</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{order.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{order.time}</span>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Endereço</h2>
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-foreground">{order.address}</p>
          </div>
          <button className="flex items-center gap-2 text-primary font-medium text-sm">
            <Navigation className="w-4 h-4" />
            Abrir no mapa
          </button>
        </section>

        {/* Support */}
        <section className="p-4">
          <button className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>
        </section>
      </main>

      {/* Bottom Actions */}
      <div className="p-4 bg-card border-t border-border">
        {status === "scheduled" && (
          <PrimaryButton fullWidth loading={loading} onClick={handleStartService}>
            Iniciar serviço
          </PrimaryButton>
        )}
        {status === "in_progress" && (
          <PrimaryButton fullWidth loading={loading} onClick={handleFinishService}>
            Finalizar serviço
          </PrimaryButton>
        )}
        {status === "completed" && (
          <div className="text-center text-success font-medium">
            ✓ Serviço concluído! Aguardando avaliação do cliente.
          </div>
        )}
      </div>
    </div>
  );
}
