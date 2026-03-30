import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AnimatedSection } from "@/components/ui/AnimatedCard";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion } from "framer-motion";
import { Search, Home, Sparkles, HardHat, Zap, Sun, Sunrise, CalendarClock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useServices";

const iconMap: Record<string, any> = {
  Home, Sparkles, HardHat, Zap,
};

const quickSuggestions = [
  { icon: Sun, label: "Hoje à tarde", time: "14:00" },
  { icon: Sunrise, label: "Amanhã cedo", time: "08:00" },
  { icon: CalendarClock, label: "Recorrente", time: "Semanal" },
];

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
      
      <div className="h-full bg-background flex flex-col"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
        {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 glass border-b border-border/30 px-5 py-4"
      >
        <div className="flex items-center justify-between mb-3">
          <Logo size="lg" iconOnly />
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <ThemeToggle />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm"
            >
              {userName.charAt(0).toUpperCase()}
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-xl font-bold">
            Olá, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">O que você precisa hoje?</p>
        </motion.div>
      </motion.header>

      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Search */}
        <AnimatedSection delay={1}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="O que você precisa limpar?"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border/50 bg-card
                text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all duration-200 shadow-sm"
            />
          </div>
        </AnimatedSection>

        {/* Service Categories */}
        <AnimatedSection delay={2}>
          <h2 className="text-base font-bold text-foreground mb-3">
            Serviços
          </h2>
          <AnimatedList className="grid grid-cols-2 gap-3">
            {serviceCategories.map((service) => (
              <AnimatedListItem key={service.title}>
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  onClick={() => navigate("/client/service")}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </AnimatedSection>

        {/* Quick Suggestions */}
        <AnimatedSection delay={3}>
          <h2 className="text-base font-bold text-foreground mb-3">
            Sugestões rápidas
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {quickSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/client/service")}
                className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border/50
                  shadow-sm hover:shadow-md hover:border-primary/20 
                  transition-all duration-200 flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <suggestion.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">
                    {suggestion.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.time}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        {/* Next Appointment Banner */}
        <AnimatedSection delay={4}>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Próximo agendamento</p>
                <p className="font-bold text-foreground mt-1">Nenhum agendamento</p>
                <p className="text-sm text-muted-foreground mt-0.5">Agende seu primeiro serviço</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/client/service")}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold
                  shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-1.5"
              >
                Agendar
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <BottomNav variant="client" />
    </div>
    </>
  );
}
