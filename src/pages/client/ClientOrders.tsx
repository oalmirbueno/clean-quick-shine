import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { OrderCard } from "@/components/ui/OrderCard";
import { cn } from "@/lib/utils";
import { mockOrders } from "@/lib/mockData";

type Tab = "upcoming" | "completed";

export default function ClientOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const upcomingOrders = mockOrders.filter(o => 
    ["scheduled", "confirmed", "in_progress"].includes(o.status)
  );
  
  const completedOrders = mockOrders.filter(o => 
    ["completed", "rated"].includes(o.status)
  );

  const orders = activeTab === "upcoming" ? upcomingOrders : completedOrders;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-xl font-semibold text-foreground">
          Meus pedidos
        </h1>
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
          {activeTab === "completed" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <main className="p-4 animate-fade-in">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeTab === "upcoming" 
                ? "Você não tem pedidos agendados" 
                : "Você ainda não concluiu nenhum pedido"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                service={order.serviceName}
                date={order.date}
                time={order.time}
                address={order.address}
                status={order.status}
                price={order.totalPrice}
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
