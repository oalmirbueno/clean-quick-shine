import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Search, Home, Sparkles, HardHat, Building2, Sun, Sunrise, CalendarClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const serviceCategories = [
  { icon: Home, title: "Residencial", description: "Limpeza de casa" },
  { icon: Sparkles, title: "Pesada", description: "Limpeza profunda" },
  { icon: HardHat, title: "Pós-Obra", description: "Remoção de resíduos" },
  { icon: Building2, title: "Comercial", description: "Escritórios e lojas" },
];

const quickSuggestions = [
  { icon: Sun, label: "Hoje à tarde", time: "14:00" },
  { icon: Sunrise, label: "Amanhã cedo", time: "08:00" },
  { icon: CalendarClock, label: "Recorrente", time: "Semanal" },
];

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user profile
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" iconOnly />
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Olá, {userName} 👋
        </h1>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="O que você precisa limpar?"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card
              text-foreground placeholder:text-muted-foreground card-shadow
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-all duration-200"
          />
        </div>

        {/* Service Categories */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Serviços
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {serviceCategories.map((service) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                onClick={() => navigate("/client/service")}
              />
            ))}
          </div>
        </section>

        {/* Quick Suggestions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Sugestões rápidas
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => navigate("/client/service")}
                className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border
                  card-shadow hover:card-shadow-hover hover:border-primary/20 
                  transition-all duration-200 flex-shrink-0 active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
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
              </button>
            ))}
          </div>
        </section>

        {/* Recent Order Banner */}
        <section className="bg-accent rounded-xl p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Próximo agendamento</p>
              <p className="font-semibold text-foreground">Nenhum agendamento</p>
              <p className="text-sm text-primary">Agende seu primeiro serviço</p>
            </div>
            <button
              onClick={() => navigate("/client/service")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium
                hover:opacity-90 transition-opacity"
            >
              Agendar
            </button>
          </div>
        </section>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
