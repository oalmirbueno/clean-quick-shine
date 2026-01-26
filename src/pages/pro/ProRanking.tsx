import { useNavigate } from "react-router-dom";
import { ChevronLeft, Star, CheckCircle2, TrendingUp, Award, Loader2, Users } from "lucide-react";
import { useProRanking } from "@/hooks/useProMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const tips = [
  "Responda rapidamente aos pedidos para aumentar sua taxa de aceitação",
  "Seja pontual - chegue no horário combinado",
  "Mantenha uma comunicação clara com os clientes",
  "Preste um serviço de qualidade para ganhar boas avaliações",
];

export default function ProRanking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rankingData, isLoading } = useProRanking();

  // Fetch profile data
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const proProfile = rankingData?.profile;
  const metrics = rankingData?.metrics;

  const stats = [
    { 
      label: "Nota média", 
      value: (proProfile?.rating ?? 5.0).toFixed(1), 
      icon: Star, 
      color: "text-warning" 
    },
    { 
      label: "Total serviços", 
      value: (proProfile?.jobs_done ?? 0).toString(), 
      icon: Award, 
      color: "text-primary" 
    },
    { 
      label: "Taxa de aceitação", 
      value: `${(metrics?.acceptance_rate ?? 100).toFixed(0)}%`, 
      icon: TrendingUp, 
      color: "text-success" 
    },
  ];

  // Calculate progress to next level (based on jobs done)
  const jobsForNextLevel = Math.ceil((proProfile?.jobs_done ?? 0) / 100) * 100;
  const progress = ((proProfile?.jobs_done ?? 0) / jobsForNextLevel) * 100;
  const jobsRemaining = jobsForNextLevel - (proProfile?.jobs_done ?? 0);

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Meu ranking
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-4 space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 text-center card-shadow">
          <div className="relative inline-block mb-4">
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || "Pro"}`}
              alt={profile?.full_name || "Profissional"}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
            {proProfile?.verified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <CheckCircle2 className="w-5 h-5 text-success-foreground" />
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-foreground">{profile?.full_name || "Profissional"}</h2>
          
          {proProfile?.verified && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 rounded-full mt-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Profissional verificada</span>
            </div>
          )}

          {/* Ranking Position */}
          <div className="mt-4 p-3 bg-accent rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Você está no</span>
              <span className="text-lg font-bold text-primary">top {rankingData?.percentile ?? 100}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Posição #{rankingData?.rank ?? 1} de {rankingData?.totalPros ?? 1} profissionais
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-card rounded-xl border border-border p-4 text-center card-shadow"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Ranking Info */}
        <div className="bg-accent rounded-xl p-4 border border-primary/10">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Como subir no ranking
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Profissionais com ranking alto recebem mais pedidos e aparecem primeiro para os clientes.
          </p>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary font-medium">{index + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress to Next Level */}
        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">Próximo nível</span>
            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete mais {jobsRemaining} serviços para alcançar o próximo nível
          </p>
        </div>
      </main>
    </div>
  );
}
