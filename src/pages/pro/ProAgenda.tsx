import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ChevronLeft, ChevronRight, MapPin, Clock, Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlatProOrders } from "@/hooks/useOrders";
import { useProOrdersRealtime } from "@/hooks/useOrderRealtime";
import { useAuth } from "@/contexts/AuthContext";

export default function ProAgenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { orders, isLoading } = useFlatProOrders();

  // Enable realtime updates for pro orders
  useProOrdersRealtime(user?.id || null);

  // Filter only confirmed/active orders
  const activeOrders = useMemo(() => {
    return orders.filter(order => 
      ["confirmed", "en_route", "in_progress", "scheduled"].includes(order.status || "")
    );
  }, [orders]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get orders for selected day
  const selectedDay = currentDate.getDate();
  const ordersForDay = useMemo(() => {
    return activeOrders.filter(order => {
      const orderDate = new Date(order.scheduled_date);
      return (
        orderDate.getDate() === selectedDay &&
        orderDate.getMonth() === currentDate.getMonth() &&
        orderDate.getFullYear() === currentDate.getFullYear()
      );
    }).sort((a, b) => {
      // Sort by time
      return a.scheduled_time.localeCompare(b.scheduled_time);
    });
  }, [activeOrders, selectedDay, currentDate]);

  const daysWithOrders = useMemo(() => {
    return activeOrders
      .filter(order => {
        const orderDate = new Date(order.scheduled_date);
        return (
          orderDate.getMonth() === currentDate.getMonth() &&
          orderDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .map(order => new Date(order.scheduled_date).getDate());
  }, [activeOrders, currentDate]);

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:MM
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return "bg-primary/10 text-primary";
      case "en_route":
        return "bg-warning/10 text-warning";
      case "in_progress":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "en_route":
        return "A caminho";
      case "in_progress":
        return "Em andamento";
      case "scheduled":
        return "Agendado";
      default:
        return status || "Pendente";
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Minha agenda
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeOrders.length} {activeOrders.length === 1 ? "serviço agendado" : "serviços agendados"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="w-3 h-3 text-success animate-pulse" />
            <span>Ao vivo</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20 animate-fade-in">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="font-semibold text-foreground capitalize">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4 card-shadow">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const hasOrders = daysWithOrders.includes(day);
              const orderCount = daysWithOrders.filter(d => d === day).length;
              const isToday = 
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  {day}
                  {hasOrders && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {orderCount > 2 ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      ) : (
                        Array.from({ length: Math.min(orderCount, 2) }).map((_, idx) => (
                          <div key={idx} className="w-1 h-1 rounded-full bg-primary" />
                        ))
                      )}
                    </div>
                  )}
                  {hasOrders && isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {Array.from({ length: Math.min(orderCount, 3) }).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 rounded-full bg-primary-foreground" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders for Selected Day */}
        <section>
          <h3 className="font-semibold text-foreground mb-3">
            Serviços em {currentDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
          </h3>

          {ordersForDay.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-border">
              Nenhum serviço agendado para este dia
            </div>
          ) : (
            <div className="space-y-3">
              {ordersForDay.map((order) => {
                const proEarning = Number(order.total_price) * 0.8; // Pro gets ~80%
                
                return (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/pro/order/${order.id}`)}
                    className="w-full p-4 bg-card rounded-xl border border-border card-shadow
                      hover:card-shadow-hover transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {order.service?.name || "Serviço"}
                        </h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          getStatusColor(order.status)
                        )}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-success">
                        R$ {proEarning.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(order.scheduled_time)}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {order.address?.neighborhood}, {order.address?.city}
                        </span>
                      </div>
                    </div>
                    {order.client_profile && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          Cliente: <span className="text-foreground">{order.client_profile.full_name}</span>
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
