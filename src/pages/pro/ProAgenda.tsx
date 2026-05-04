import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { ChevronLeft, ChevronRight, MapPin, Clock, Loader2, Radio, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlatProOrders } from "@/hooks/useOrders";
import { useProOrdersRealtime } from "@/hooks/useOrderRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, isAfter, startOfDay } from "date-fns";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type PeriodFilter = "week" | "month" | "all";

export default function ProAgenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [search, setSearch] = useState("");
  
  const { orders, isLoading } = useFlatProOrders();

  // Enable realtime updates for pro orders
  useProOrdersRealtime(user?.id || null);

  // Filter only confirmed/active orders, then by period and search
  const activeOrders = useMemo(() => {
    let filtered = orders.filter(order => 
      ["confirmed", "en_route", "in_progress", "scheduled"].includes(order.status || "")
    );

    if (period !== "all") {
      const cutoff = startOfDay(subDays(new Date(), period === "week" ? 7 : 30));
      filtered = filtered.filter(o => isAfter(new Date(o.scheduled_date), cutoff));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(o => {
        const serviceName = (o.service?.name || "").toLowerCase();
        const addr = o.address
          ? `${o.address.street} ${o.address.number} ${o.address.neighborhood} ${o.address.city}`.toLowerCase()
          : "";
        const clientName = ((o as any).client_profile?.full_name || "").toLowerCase();
        return serviceName.includes(q) || addr.includes(q) || clientName.includes(q);
      });
    }

    return filtered;
  }, [orders, period, search]);

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
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader
        title="Minha agenda"
        subtitle={`${activeOrders.length} ${activeOrders.length === 1 ? "serviço agendado" : "serviços agendados"}`}
        rightAction={
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-2 py-1 rounded-full bg-success/10">
            <Radio className="w-3 h-3 text-success animate-pulse" />
            <span className="text-success font-medium">Ao vivo</span>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          {/* Filters */}
          <motion.div variants={item} className="space-y-2">
            <div className="flex gap-2">
              {([
                { value: "week" as PeriodFilter, label: "7 dias" },
                { value: "month" as PeriodFilter, label: "30 dias" },
                { value: "all" as PeriodFilter, label: "Todos" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                    period === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por serviço, endereço ou cliente..."
                maxLength={100}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl bg-muted/60 border-none outline-none placeholder:text-muted-foreground text-foreground focus:ring-1 focus:ring-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Calendar nav */}
          <motion.div variants={item} className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="font-semibold text-foreground capitalize">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-2 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
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
                      "aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors relative",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : isToday
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    {day}
                    {hasOrders && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {Array.from({ length: Math.min(orderCount, 3) }).map((_, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "w-1 h-1 rounded-full",
                              isSelected ? "bg-primary-foreground" : "bg-primary"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Orders for Selected Day */}
          <motion.section variants={item}>
            <h3 className="text-sm font-bold text-foreground mb-2.5">
              Serviços em {currentDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
            </h3>

            {ordersForDay.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground bg-card rounded-2xl border border-border/60 shadow-sm">
                Nenhum serviço agendado para este dia
              </div>
            ) : (
              <div className="space-y-2">
                {ordersForDay.map((order) => {
                  const proEarning = Number(order.total_price) * 0.8;
                  return (
                    <motion.button
                      key={order.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/pro/order/${order.id}`)}
                      className="w-full p-4 bg-card rounded-2xl border border-border/60 shadow-sm hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {order.service?.name || "Serviço"}
                          </h4>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0",
                            getStatusColor(order.status)
                          )}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-success shrink-0">
                          R$ {proEarning.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(order.scheduled_time)}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {order.address?.neighborhood}, {order.address?.city}
                          </span>
                        </div>
                      </div>
                      {order.client_profile && (
                        <div className="mt-2 pt-2 border-t border-border/60">
                          <p className="text-xs text-muted-foreground">
                            Cliente: <span className="text-foreground font-medium">{order.client_profile.full_name}</span>
                          </p>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
