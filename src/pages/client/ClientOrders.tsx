import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { OrderCard } from "@/components/ui/OrderCard";
import { cn } from "@/lib/utils";
import { useClientOrders } from "@/hooks/useOrders";
import { useClientOrdersRealtime } from "@/hooks/useOrderRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ClipboardList, Radio } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = "upcoming" | "completed";

export default function ClientOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const { data: orders, isLoading } = useClientOrders();

  // Enable realtime updates for client orders
  useClientOrdersRealtime(user?.id || null);

  const upcomingStatuses = ["draft", "scheduled", "matching", "confirmed", "en_route", "in_progress"];
  const completedStatuses = ["completed", "rated", "paid_out", "cancelled"];

  const upcomingOrders = orders?.filter(o => 
    upcomingStatuses.includes(o.status || "")
  ) || [];
  
  const completedOrders = orders?.filter(o => 
    completedStatuses.includes(o.status || "")
  ) || [];

  const displayedOrders = activeTab === "upcoming" ? upcomingOrders : completedOrders;

  const formatOrderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "dd 'de' MMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatAddress = (address: typeof displayedOrders[0]["address"]) => {
    if (!address) return "Endereço não informado";
    return `${address.street}, ${address.number} - ${address.neighborhood}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-4">
          <h1 className="text-xl font-semibold text-foreground">Meus pedidos</h1>
        </header>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav variant="client" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Meus pedidos
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="w-3 h-3 text-success animate-pulse" />
            <span>Ao vivo</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === "upcoming" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Próximos
          {upcomingOrders.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {upcomingOrders.length}
            </span>
          )}
          {activeTab === "upcoming" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === "completed" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Concluídos
          {completedOrders.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              {completedOrders.length}
            </span>
          )}
          {activeTab === "completed" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <main className="p-4 animate-fade-in">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {activeTab === "upcoming" 
                ? "Você não tem pedidos agendados" 
                : "Você ainda não concluiu nenhum pedido"}
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => navigate("/client/service")}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Agendar serviço
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                service={order.service?.name || "Serviço"}
                date={formatOrderDate(order.scheduled_date)}
                time={order.scheduled_time.slice(0, 5)}
                address={formatAddress(order.address)}
                status={order.status || "scheduled"}
                price={Number(order.total_price)}
                onClick={() => navigate(`/client/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
