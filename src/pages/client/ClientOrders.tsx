import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { OrderCard } from "@/components/ui/OrderCard";
import { cn } from "@/lib/utils";
import { useFlatClientOrders } from "@/hooks/useOrders";
import { useClientOrdersRealtime } from "@/hooks/useOrderRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ClipboardList, Radio, Search, X } from "lucide-react";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = "upcoming" | "completed";
type PeriodFilter = "week" | "month" | "all";

export default function ClientOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [search, setSearch] = useState("");
  const { orders, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useFlatClientOrders();

  // Enable realtime updates for client orders
  useClientOrdersRealtime(user?.id || null);

  const upcomingStatuses = ["draft", "scheduled", "matching", "confirmed", "en_route", "in_progress"];
  const completedStatuses = ["completed", "rated", "paid_out", "cancelled"];

  const filterByPeriod = (list: typeof orders) => {
    if (period === "all") return list;
    const cutoff = startOfDay(subDays(new Date(), period === "week" ? 7 : 30));
    return list.filter(o => isAfter(new Date(o.scheduled_date), cutoff));
  };

  const filterBySearch = (list: typeof orders) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(o => {
      const serviceName = (o.service?.name || "").toLowerCase();
      const addr = o.address
        ? `${o.address.street} ${o.address.number} ${o.address.neighborhood} ${o.address.city}`.toLowerCase()
        : "";
      return serviceName.includes(q) || addr.includes(q);
    });
  };

  const upcomingOrders = useMemo(
    () => filterBySearch(filterByPeriod(orders.filter(o => upcomingStatuses.includes(o.status || "")))),
    [orders, period, search]
  );

  const completedOrders = useMemo(
    () => filterBySearch(filterByPeriod(orders.filter(o => completedStatuses.includes(o.status || "")))),
    [orders, period, search]
  );

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
      <div className="fixed inset-0 bg-background flex flex-col safe-top">
        <header className="flex-shrink-0 bg-card border-b border-border p-4">
          <h1 className="text-xl font-semibold text-foreground">Meus pedidos</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav variant="client" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border p-4">
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
      <div className="flex-shrink-0 flex border-b border-border bg-card">
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

      {/* Period Filter */}
      <div className="flex-shrink-0 flex gap-2 px-4 py-2 bg-card border-b border-border">
        {([
          { value: "week" as PeriodFilter, label: "7 dias" },
          { value: "month" as PeriodFilter, label: "30 dias" },
          { value: "all" as PeriodFilter, label: "Todos" },
        ]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              period === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4 py-2 bg-card border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por serviço ou endereço..."
            maxLength={100}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg bg-muted border-none outline-none placeholder:text-muted-foreground text-foreground focus:ring-1 focus:ring-primary"
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
        {(search || period !== "all") && (
          <p className="mt-2 text-xs text-muted-foreground">
            {displayedOrders.length} {displayedOrders.length === 1 ? "resultado encontrado" : "resultados encontrados"}
          </p>
        )}
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-28 animate-fade-in">
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
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Carregar mais"
                )}
              </button>
            )}
          </div>
        )}
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
