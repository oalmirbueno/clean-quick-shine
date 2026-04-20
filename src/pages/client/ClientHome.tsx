import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion } from "framer-motion";
import { Home, Sparkles, HardHat, Zap, ArrowRight, CalendarClock, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Home, Sparkles, HardHat, Zap,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
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
        className="h-full bg-background flex flex-col"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        {/* ── Header ── */}
        <header className="shrink-0 px-5 pt-3 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground tracking-tight">Bem-vindo de volta</p>
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
                className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm"
              >
                {userName.charAt(0).toUpperCase()}
              </motion.div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="px-5 pb-4 space-y-5"
          >
            {/* CTA Banner */}
            <motion.div variants={item}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/client/service")}
                className="w-full p-4 rounded-2xl bg-primary text-primary-foreground flex items-center gap-4 shadow-md shadow-primary/20"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[15px] leading-tight">Agendar limpeza</p>
                  <p className="text-xs opacity-80 mt-0.5">Profissionais verificadas, em poucos toques</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-70 shrink-0" />
              </motion.button>
            </motion.div>

            {/* Services Grid */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">Serviços</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(services || []).map((service) => {
                  const IconComp = iconMap[service.icon || "Home"] || Home;
                  return (
                    <motion.button
                      key={service.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/client/service")}
                      className="flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border/40 hover:border-primary/30 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                        {service.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Next Appointment */}
            <motion.div variants={item}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/client/orders")}
                className="w-full p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">Próximo agendamento</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">Nenhum agendamento</p>
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
