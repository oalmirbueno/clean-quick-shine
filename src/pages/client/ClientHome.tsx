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

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 24 } },
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
        className="h-full flex flex-col relative overflow-hidden"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
          background:
            "linear-gradient(180deg, hsl(var(--accent) / 0.72) 0%, hsl(var(--background)) 42%, hsl(var(--background)) 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--card) / 0.4) 48%, hsl(var(--secondary) / 0.46))",
          }}
        />

        {/* ── Header ── */}
        <header className="relative shrink-0 px-5 pt-3 pb-4 z-10">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-foreground leading-tight tracking-tight">
                Olá, {userName}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <NotificationsDropdown />
              <ThemeToggle />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-9 h-9 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/60 flex items-center justify-center text-primary font-semibold text-sm shadow-sm"
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
            className="mx-auto w-full max-w-lg px-5 pb-6 space-y-4"
          >
            {/* Hero Glass CTA */}
            <motion.div variants={item}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/client/service")}
                className="relative w-full p-5 rounded-2xl overflow-hidden text-left group border border-primary/20 backdrop-blur-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--card) / 0.82), hsl(var(--primary) / 0.18))",
                  boxShadow:
                    "0 20px 45px -24px hsl(var(--primary) / 0.55), inset 0 1px 0 hsl(var(--primary-foreground) / 0.16)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px pointer-events-none"
                  style={{ background: "hsl(var(--primary-foreground) / 0.34)" }}
                />

                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                    <CalendarClock className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-[18px] leading-tight tracking-tight">
                      Agendar limpeza
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary shrink-0 group-active:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            </motion.div>

            {/* Services Grid - Glass cards */}
            <motion.div variants={item}>
              <h2 className="text-[13px] font-semibold text-foreground/90 tracking-tight mb-2.5 px-1">
                Serviços
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {(services || []).map((service) => {
                  const IconComp = iconMap[service.icon || "Home"] || Home;
                  return (
                    <motion.button
                      key={service.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/client/service")}
                      className="relative flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl hover:border-primary/40 hover:bg-card/90 transition-all text-left overflow-hidden"
                      style={{
                        boxShadow:
                          "0 1px 0 hsl(var(--primary-foreground) / 0.08) inset, 0 10px 24px -18px hsl(var(--foreground) / 0.2)",
                      }}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-primary/12 border border-primary/15 flex items-center justify-center shrink-0">
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
                className="w-full p-4 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl flex items-center gap-3 text-left hover:bg-card/90 transition-colors"
                style={{
                  boxShadow:
                    "0 1px 0 hsl(var(--primary-foreground) / 0.08) inset, 0 10px 24px -18px hsl(var(--foreground) / 0.2)",
                }}
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/12 border border-primary/15 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-foreground truncate tracking-tight">
                    Meus agendamentos
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
