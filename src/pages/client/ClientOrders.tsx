import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { OrderCard } from "@/components/ui/OrderCard";
import { cn } from "@/lib/utils";
import { useFlatClientOrders } from "@/hooks/useOrders";
import { useClientOrdersRealtime } from "@/hooks/useOrderRealtime";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2,
  ClipboardList,
  Radio,
  Search,
  X,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = "upcoming" | "completed";
type PeriodFilter = "week" | "month" | "all";

const UPCOMING = ["draft", "scheduled", "matching", "confirmed", "en_route", "in_progress"];
const COMPLETED = ["completed", "rated", "paid_out", "cancelled"];

export default function ClientOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { orders, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFlatClientOrders();

  useClientOrdersRealtime(user?.id || null);

  const applyFilters = (statuses: string[]) => {
    const cutoff =
      period === "all"
        ? null
        : startOfDay(subDays(new Date(), period === "week" ? 7 : 30));
    const q = search.trim().toLowerCase();

    return orders.filter((o) => {
      if (!statuses.includes(o.status || "")) return false;
      if (cutoff && !isAfter(new Date(o.scheduled_date), cutoff)) return false;
      if (!q) return true;
      const serviceName = (o.service?.name || "").toLowerCase();
      const addr = o.address
        ? `${o.address.street} ${o.address.number} ${o.address.neighborhood} ${o.address.city}`.toLowerCase()
        : "";
      return serviceName.includes(q) || addr.includes(q);
    });
  };

  const upcomingOrders = useMemo(() => applyFilters(UPCOMING), [orders, period, search]);
  const completedOrders = useMemo(() => applyFilters(COMPLETED), [orders, period, search]);
  const displayedOrders = activeTab === "upcoming" ? upcomingOrders : completedOrders;

  const formatOrderDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatAddress = (address: (typeof displayedOrders)[0]["address"]) =>
    address
      ? `${address.street}, ${address.number} - ${address.neighborhood}`
      : "Endereço não informado";

  const hasActiveFilters = period !== "all" || search.length > 0;

  return (
    <div className="h-full bg-background flex flex-col relative safe-top">
      {/* Header */}
      <header
        className="shrink-0 px-5 pt-3 pb-4"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground leading-none mb-1.5">
              Meus
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-tight">
              Pedidos
            </h1>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm">
            <Radio className="w-3 h-3 text-success animate-pulse" />
            Ao vivo
          </div>
        </div>
      </header>

      {/* Segmented control */}
      <div className="shrink-0 px-5">
        <div className="mx-auto max-w-lg">
          <div className="relative flex p-1 rounded-2xl bg-secondary/60 border border-border/60">
            {(["upcoming", "completed"] as const).map((tab) => {
              const active = activeTab === tab;
              const count = tab === "upcoming" ? upcomingOrders.length : completedOrders.length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-1 py-2 text-[13px] font-medium rounded-xl transition-colors"
                >
                  {active && (
                    <motion.div
                      layoutId="orders-tab-pill"
                      className="absolute inset-0 bg-card rounded-xl shadow-sm border border-border/60"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex items-center gap-1.5",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {tab === "upcoming" ? "Próximos" : "Concluídos"}
                    {count > 0 && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[10px] font-semibold rounded-full leading-none",
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="shrink-0 px-5 mt-3">
        <div className="mx-auto max-w-lg flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar serviço ou endereço"
              maxLength={100}
              className="w-full h-10 pl-9 pr-9 text-[13px] rounded-2xl bg-secondary/60 border border-border/60 outline-none placeholder:text-muted-foreground text-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "relative h-10 w-10 rounded-2xl border flex items-center justify-center transition-colors",
              filtersOpen || period !== "all"
                ? "border-primary/40 bg-primary/5 text-primary"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
            )}
            aria-label="Filtros"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {period !== "all" && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-lg overflow-hidden"
            >
              <div className="flex gap-2 pt-3">
                {(
                  [
                    { value: "week" as PeriodFilter, label: "7 dias" },
                    { value: "month" as PeriodFilter, label: "30 dias" },
                    { value: "all" as PeriodFilter, label: "Todos" },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    className={cn(
                      "px-3 h-8 rounded-full text-[12px] font-medium transition-colors border",
                      period === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border/60 hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasActiveFilters && (
          <p className="mx-auto max-w-lg mt-2 text-[11px] text-muted-foreground">
            {displayedOrders.length}{" "}
            {displayedOrders.length === 1 ? "resultado" : "resultados"}
          </p>
        )}
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto min-h-0 px-5 pt-4 pb-24">
        <div className="mx-auto max-w-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : displayedOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-secondary/60 border border-border/60 flex items-center justify-center mx-auto mb-5">
                <ClipboardList className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground mb-1">
                {activeTab === "upcoming"
                  ? "Nenhum pedido em andamento"
                  : "Nenhum pedido concluído"}
              </h3>
              <p className="text-[13px] text-muted-foreground mb-6 max-w-[260px] mx-auto leading-relaxed">
                {activeTab === "upcoming"
                  ? "Quando você agendar uma limpeza, ela aparece aqui."
                  : "Seus pedidos finalizados vão aparecer nesta aba."}
              </p>
              {activeTab === "upcoming" && (
                <button
                  onClick={() => navigate("/client/service")}
                  className="inline-flex items-center gap-2 px-5 h-11 bg-primary text-primary-foreground rounded-2xl font-semibold text-[14px] hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Agendar serviço
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
              className="space-y-3"
            >
              {displayedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <OrderCard
                    id={order.id}
                    service={order.service?.name || "Serviço"}
                    date={formatOrderDate(order.scheduled_date)}
                    time={order.scheduled_time.slice(0, 5)}
                    address={formatAddress(order.address)}
                    status={order.status || "scheduled"}
                    price={Number(order.total_price)}
                    onClick={() => navigate(`/client/orders/${order.id}`)}
                  />
                </motion.div>
              ))}
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full py-3 text-[13px] font-medium text-primary hover:bg-primary/5 rounded-2xl transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Carregar mais"
                  )}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
