import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProOrders, mockOrders } from "@/lib/mockData";

const allOrders = [...mockProOrders, ...mockOrders.filter(o => o.proId)];

export default function ProAgenda() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

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
  const ordersForDay = allOrders.filter(order => {
    const orderDate = new Date(order.dateTime);
    return (
      orderDate.getDate() === selectedDay &&
      orderDate.getMonth() === currentDate.getMonth() &&
      orderDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const daysWithOrders = allOrders
    .filter(order => {
      const orderDate = new Date(order.dateTime);
      return (
        orderDate.getMonth() === currentDate.getMonth() &&
        orderDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .map(order => new Date(order.dateTime).getDate());

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-xl font-semibold text-foreground">
          Minha agenda
        </h1>
      </header>

      <main className="p-4 animate-fade-in">
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
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
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
            <div className="text-center py-8 text-muted-foreground">
              Nenhum serviço agendado para este dia
            </div>
          ) : (
            <div className="space-y-3">
              {ordersForDay.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/pro/order/${order.id}`)}
                  className="w-full p-4 bg-card rounded-xl border border-border card-shadow
                    hover:card-shadow-hover transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{order.serviceName}</h4>
                    <span className="text-sm font-medium text-success">
                      R$ {order.proEarning.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{order.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{order.address.split(" - ")[1]}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
