import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion, type Variants } from "framer-motion";
import {
  Home,
  Sparkles,
  HardHat,
  Zap,
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Tag,
  HelpCircle,
  ShieldCheck,
  PlayCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = { Home, Sparkles, HardHat, Zap };

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 240, damping: 26 },
  },
};

export default function ClientHome() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const { showTutorial, completeTutorial } = useAppTutorial("client", user?.id);
  const { data: services } = useServices();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Próximo pedido ativo (se houver)
  const { data: nextOrder } = useQuery({
    queryKey: ["next_order", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("orders")
        .select("id, status, scheduled_date, scheduled_time, services(name)")
        .eq("client_id", user.id)
        .in("status", ["confirmed", "scheduled", "matching", "en_route", "in_progress"])
        .order("scheduled_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
  });

  const userName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const statusLabel: Record<string, string> = {
    matching: "Procurando profissional",
    scheduled: "Agendado",
    confirmed: "Confirmado",
    en_route: "A caminho",
    in_progress: "Em andamento",
  };

  return (
    <>
      {showTutorial && (
        <AppTutorial variant="client" userId={user?.id} onComplete={completeTutorial} />
      )}

      <div
        className="h-full flex flex-col relative overflow-hidden bg-background"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        {/* Glow sutil de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
          style={{
            background:
              "radial-gradient(100% 70% at 50% 0%, hsl(var(--primary) / 0.14) 0%, hsl(var(--primary) / 0.04) 50%, transparent 80%)",
          }}
        />

        {/* Header */}
        <header className="relative shrink-0 px-5 pt-3 pb-3 z-10">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between">
            <div className="min-w-0">
              <p className="text-[12px] text-muted-foreground leading-none mb-1.5">
                {greeting}
              </p>
              <h1 className="text-[22px] font-semibold text-foreground leading-tight tracking-tight truncate">
                {userName}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationsDropdown />
              <ThemeToggle />
              <motion.button
                onClick={() => navigate("/client/profile")}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
                className="w-9 h-9 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-primary font-semibold text-sm shadow-sm"
                aria-label="Perfil"
              >
                {userName.charAt(0).toUpperCase()}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1 overflow-y-auto min-h-0 z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-lg px-5 pb-5 flex flex-col gap-3 min-h-full"
          >
            {/* Hero CTA — mais leve */}
            <motion.div variants={item} className="shrink-0">
              <motion.button
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate("/client/service")}
                className="relative w-full overflow-hidden text-left rounded-3xl p-5 border border-primary/20"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.80) 100%)",
                  boxShadow:
                    "0 18px 40px -22px hsl(var(--primary) / 0.45), inset 0 1px 0 hsl(0 0% 100% / 0.18)",
                  minHeight: 148,
                }}
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 w-44 h-44 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(0 0% 100% / 0.16), transparent 70%)",
                  }}
                />

                <div className="relative h-full flex flex-col justify-between gap-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                      Verificadas
                    </span>
                  </div>

                  <div>
                    <p className="text-primary-foreground/85 text-[13px] mb-1">
                      Chamou, tá limpo
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-primary-foreground font-bold text-[24px] leading-tight tracking-tight">
                        Agendar limpeza
                      </h2>
                      <div className="w-10 h-10 rounded-full bg-primary-foreground text-primary flex items-center justify-center shrink-0 shadow-sm">
                        <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* Próximo pedido (se houver) */}
            {nextOrder && (
              <motion.button
                variants={item}
                onClick={() =>
                  navigate("/client/order-tracking", {
                    state: { orderId: nextOrder.id },
                  })
                }
                whileTap={{ scale: 0.99 }}
                className="shrink-0 w-full text-left rounded-2xl border border-primary/30 bg-primary/5 p-3.5 flex items-center gap-3"
              >
                <span className="relative flex w-2.5 h-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-muted-foreground leading-none mb-1">
                    {statusLabel[nextOrder.status] || "Pedido ativo"}
                  </p>
                  <p className="text-[14px] font-semibold text-foreground leading-tight truncate">
                    {(nextOrder as any).services?.name || "Limpeza"} •{" "}
                    {nextOrder.scheduled_time?.slice(0, 5)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            )}

            {/* Serviços */}
            <motion.div variants={item} className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
                  Serviços
                </h2>
                <button
                  onClick={() => navigate("/client/service")}
                  className="text-[12px] font-medium text-primary"
                >
                  Ver todos
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 flex-1 auto-rows-fr">
                {(services || []).slice(0, 4).map((service, idx) => {
                  const IconComp = iconMap[service.icon || "Home"] || Home;
                  const featured = idx === 0;
                  return (
                    <motion.button
                      key={service.id}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -2 }}
                      onClick={() => navigate("/client/service")}
                      className={cn(
                        "relative flex flex-col items-start justify-between gap-3 p-4 rounded-2xl border transition-colors text-left shadow-sm h-full min-h-[104px] overflow-hidden",
                        featured
                          ? "col-span-2 border-primary/30 bg-primary/5 hover:border-primary/50 min-h-[124px]"
                          : "border-border/60 bg-card hover:border-primary/40",
                      )}
                    >
                      {featured && (
                        <div
                          aria-hidden
                          className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)",
                          }}
                        />
                      )}
                      <div
                        className={cn(
                          "relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          featured ? "bg-primary/15" : "bg-primary/10",
                        )}
                      >
                        <IconComp className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
                      </div>
                      <div className="relative">
                        <span
                          className={cn(
                            "block font-semibold text-foreground leading-tight tracking-tight line-clamp-2",
                            featured ? "text-[15px]" : "text-[13.5px]",
                          )}
                        >
                          {service.name}
                        </span>
                        {featured && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-primary">
                            Mais pedido <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Ações rápidas */}
            <motion.div variants={item} className="grid grid-cols-2 gap-2.5 shrink-0">
              <button
                onClick={() => navigate("/client/orders")}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-card text-left shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-[17px] h-[17px] text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">Pedidos</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Histórico</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/client/referral")}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-card text-left shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Tag className="w-[17px] h-[17px] text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">Indique</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Ganhe créditos</p>
                </div>
              </button>
            </motion.div>

            {/* Modo demo (apenas admin) */}
            {isAdmin && (
              <motion.button
                variants={item}
                onClick={() => navigate("/client/demo")}
                className="w-full p-3 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-3 text-left shadow-sm hover:bg-primary/10 transition-colors shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    Ver simulação do app
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Home → busca → tempo real
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            )}

            {/* Suporte */}
            <motion.button
              variants={item}
              onClick={() => navigate("/client/support")}
              className="w-full p-3 rounded-2xl border border-border/60 bg-card flex items-center gap-3 text-left shadow-sm hover:border-primary/40 transition-colors shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground leading-tight">
                  Precisa de ajuda?
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.button>
          </motion.div>
        </main>

        <BottomNav variant="client" />
      </div>
    </>
  );
}
