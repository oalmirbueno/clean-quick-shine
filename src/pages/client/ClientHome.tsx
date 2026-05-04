import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion, type Variants } from "framer-motion";
import { Home, Sparkles, HardHat, Zap, ArrowRight, CalendarClock, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";

const iconMap: Record<string, any> = {
  Home, Sparkles, HardHat, Zap,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 24 } },
};

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showTutorial, completeTutorial } = useAppTutorial("client");
  const { data: services } = useServices();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const userName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário";

  return (
    <>
      {showTutorial && (
        <AppTutorial variant="client" onComplete={completeTutorial} />
      )}

      <div
        className="h-full bg-background flex flex-col relative overflow-hidden"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        {/* Ambient gradient backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-primary/25 blur-[120px]" />
          <div className="absolute top-40 -right-24 w-[340px] h-[340px] rounded-full bg-primary/15 blur-[110px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[360px] h-[260px] rounded-full bg-primary/10 blur-[100px]" />
        </div>

        {/* ── Header ── */}
        <header className="relative shrink-0 px-5 pt-3 pb-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground tracking-tight">Bem-vindo de volta</p>
              <h1 className="text-[22px] font-semibold text-foreground leading-tight tracking-tight mt-0.5">
                {userName}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationsDropdown />
              <ThemeToggle />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-9 h-9 rounded-full bg-primary/15 backdrop-blur-md border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm"
              >
                {userName.charAt(0).toUpperCase()}
              </motion.div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="relative flex-1 overflow-y-auto min-h-0 z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="px-5 pb-6 space-y-4"
          >
            {/* Hero Glass CTA */}
            <motion.div variants={item}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/client/service")}
                className="relative w-full p-5 rounded-3xl overflow-hidden text-left group"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.75))",
                  boxShadow:
                    "0 20px 40px -20px hsl(var(--primary) / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
                }}
              >
                {/* Glass shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />

                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                    <CalendarClock className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/70 font-semibold">
                      Chamou, tá limpo
                    </p>
                    <p className="font-semibold text-white text-[16px] leading-tight tracking-tight mt-1">
                      Agendar limpeza
                    </p>
                    <p className="text-[12px] text-white/80 mt-0.5 leading-snug">
                      Profissionais verificadas em poucos toques
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 group-active:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* Services Grid - Glass cards */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h2 className="text-[13px] font-semibold text-foreground/90 tracking-tight">
                  Serviços
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  {services?.length || 0} disponíveis
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(services || []).map((service) => {
                  const IconComp = iconMap[service.icon || "Home"] || Home;
                  return (
                    <motion.button
                      key={service.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/client/service")}
                      className="relative flex items-center gap-3 p-3.5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl hover:border-primary/40 hover:bg-card/80 transition-all text-left overflow-hidden"
                      style={{
                        boxShadow:
                          "0 1px 0 hsl(0 0% 100% / 0.04) inset, 0 8px 24px -16px hsl(var(--foreground) / 0.15)",
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/15 flex items-center justify-center shrink-0">
                        <IconComp className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
                      </div>
                      <span className="text-[12.5px] font-medium text-foreground leading-tight line-clamp-2 tracking-tight">
                        {service.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Next Appointment - Glass */}
            <motion.div variants={item}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/client/orders")}
                className="w-full p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl flex items-center gap-3 text-left hover:bg-card/80 transition-colors"
                style={{
                  boxShadow:
                    "0 1px 0 hsl(0 0% 100% / 0.04) inset, 0 8px 24px -16px hsl(var(--foreground) / 0.15)",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/15 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.1em]">
                    Próximo agendamento
                  </p>
                  <p className="text-[13.5px] font-medium text-foreground mt-0.5 truncate tracking-tight">
                    Nenhum agendamento
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            </motion.div>
          </motion.div>
        </main>

        <BottomNav variant="client" />
      </div>
    </>
  );
}
