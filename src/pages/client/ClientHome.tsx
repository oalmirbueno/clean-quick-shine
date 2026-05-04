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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";

const iconMap: Record<string, any> = {
  Home,
  Sparkles,
  HardHat,
  Zap,
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
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

  const userName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário";

  return (
    <>
      {showTutorial && (
        <AppTutorial variant="client" onComplete={completeTutorial} />
      )}

      <div
        className="h-full flex flex-col relative overflow-hidden bg-background"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
        }}
      >
        {/* Background orgânico */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, hsl(var(--primary) / 0.22) 0%, hsl(var(--primary) / 0.06) 45%, transparent 75%)",
          }}
        />

        {/* Header */}
        <header className="relative shrink-0 px-5 pt-3 pb-3 z-10">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between">
            <div className="min-w-0">
              <p className="text-[12px] text-muted-foreground leading-none mb-1">
                Bem-vindo
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-9 h-9 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-primary font-semibold text-sm shadow-sm"
              >
                {userName.charAt(0).toUpperCase()}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Content - flex column que preenche toda a altura disponível */}
        <main className="relative flex-1 overflow-y-auto min-h-0 z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-lg px-5 pb-5 flex flex-col gap-3.5 min-h-full"
          >
            {/* Hero CTA */}
            <motion.div variants={item} className="shrink-0">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/client/service")}
                className="relative w-full overflow-hidden text-left rounded-3xl border border-primary/25 p-5"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)",
                  boxShadow:
                    "0 24px 50px -22px hsl(var(--primary) / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
                  minHeight: 160,
                }}
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 w-44 h-44 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(0 0% 100% / 0.18), transparent 70%)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute -left-8 -bottom-12 w-40 h-40 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(0 0% 100% / 0.12), transparent 70%)",
                  }}
                />

                <div className="relative h-full flex flex-col justify-between gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <CalendarClock
                        className="w-6 h-6 text-primary-foreground"
                        strokeWidth={2}
                      />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80 bg-white/15 px-2 py-1 rounded-full">
                      Rápido
                    </span>
                  </div>

                  <div>
                    <p className="text-primary-foreground/80 text-[13px] mb-1">
                      Pronto para começar?
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-primary-foreground font-bold text-[24px] leading-tight tracking-tight">
                        Agendar limpeza
                      </h2>
                      <div className="w-10 h-10 rounded-full bg-primary-foreground text-primary flex items-center justify-center shrink-0">
                        <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* Serviços - estica para preencher altura */}
            <motion.div variants={item} className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  Serviços
                </h2>
                <button
                  onClick={() => navigate("/client/service")}
                  className="text-[12px] font-medium text-primary"
                >
                  Ver todos
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1 auto-rows-fr">
                {(services || []).slice(0, 4).map((service) => {
                  const IconComp = iconMap[service.icon || "Home"] || Home;
                  return (
                    <motion.button
                      key={service.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate("/client/service")}
                      className="relative flex flex-col items-start justify-between gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all text-left shadow-sm h-full min-h-[110px]"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <IconComp
                          className="w-5 h-5 text-primary"
                          strokeWidth={2}
                        />
                      </div>
                      <span className="text-[14px] font-semibold text-foreground leading-tight tracking-tight line-clamp-2">
                        {service.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Ações rápidas - 2 atalhos largos */}
            <motion.div variants={item} className="grid grid-cols-2 gap-3 shrink-0">
              <button
                onClick={() => navigate("/client/orders")}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card text-left shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarClock
                    className="w-[18px] h-[18px] text-primary"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    Pedidos
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Histórico
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/client/referral")}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card text-left shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Tag
                    className="w-[18px] h-[18px] text-primary"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    Indique
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Ganhe créditos
                  </p>
                </div>
              </button>
            </motion.div>

            {/* Suporte - linha discreta */}
            <motion.button
              variants={item}
              onClick={() => navigate("/client/support")}
              className="w-full p-3.5 rounded-2xl border border-border/60 bg-card flex items-center gap-3 text-left shadow-sm hover:border-primary/40 transition-colors shrink-0"
            >
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle
                  className="w-[18px] h-[18px] text-primary"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground leading-tight">
                  Precisa de ajuda?
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  Fale com o suporte
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
