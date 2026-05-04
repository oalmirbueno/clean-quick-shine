import { motion } from "framer-motion";
import { Star, CheckCircle2, TrendingUp, Award, Loader2, Users } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { useProRanking } from "@/hooks/useProMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const tips = [
  "Responda rapidamente aos pedidos para aumentar sua taxa de aceitação",
  "Seja pontual - chegue no horário combinado",
  "Mantenha uma comunicação clara com os clientes",
  "Preste um serviço de qualidade para ganhar boas avaliações",
];

export default function ProRanking() {
  const { user } = useAuth();
  const { data: rankingData, isLoading } = useProRanking();

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
      <div className="h-full bg-background flex flex-col safe-top">
        <ProPageHeader title="Meu ranking" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
        <BottomNav variant="pro" />
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
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Meu ranking" subtitle="Sua posição entre os profissionais" />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          {/* Profile Card */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border/60 p-6 text-center shadow-sm">
            <div className="relative inline-block mb-3">
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || "Pro"}`}
                alt={profile?.full_name || "Profissional"}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/15"
              />
              {proProfile?.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-success rounded-full flex items-center justify-center border-2 border-background">
                  <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                </div>
              )}
            </div>

            <h2 className="text-base font-bold text-foreground">{profile?.full_name || "Profissional"}</h2>

            {proProfile?.verified && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-success/10 rounded-full mt-1.5">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span className="text-[10px] font-semibold text-success">Verificada</span>
              </div>
            )}

            <div className="mt-4 p-3 bg-accent rounded-xl">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Você está no</span>
                <span className="text-base font-bold text-primary">top {rankingData?.percentile ?? 100}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Posição #{rankingData?.rank ?? 1} de {rankingData?.totalPros ?? 1}
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} className="grid grid-cols-3 gap-2.5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border border-border/60 p-3.5 text-center shadow-sm"
              >
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
                <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Ranking Info */}
          <motion.div variants={item} className="bg-accent rounded-2xl p-4 border border-border/60">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Como subir no ranking
            </h3>
            <ul className="space-y-1.5">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="text-primary font-semibold">{index + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Progress */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Próximo nível</span>
              <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Complete mais {jobsRemaining} serviços para alcançar o próximo nível
            </p>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
