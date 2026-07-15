import { motion } from "framer-motion";
import { Star, CheckCircle2, TrendingUp, Award, Loader2, Users, Trophy, Sparkles, Crown, Medal } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { useProRanking } from "@/hooks/useProMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const tips = [
  { title: "Responda rápido", text: "Aceitar pedidos em menos de 1 min aumenta sua prioridade." },
  { title: "Chegue no horário", text: "Pontualidade pesa direto na sua nota e no ranking." },
  { title: "Comunicação clara", text: "Confirme detalhes pelo chat antes do serviço." },
  { title: "Capriche no serviço", text: "Boas avaliações destravam pedidos de maior valor." },
];

type Tier = {
  key: string;
  label: string;
  min: number;
  max: number;
  icon: typeof Medal;
  color: string;
  bg: string;
  ring: string;
};

const tiers: Tier[] = [
  { key: "bronze", label: "Bronze", min: 0, max: 25, icon: Medal, color: "text-amber-700 dark:text-amber-500", bg: "from-amber-500/20 to-amber-500/5", ring: "ring-amber-500/30" },
  { key: "silver", label: "Prata", min: 25, max: 100, icon: Award, color: "text-slate-500 dark:text-slate-300", bg: "from-slate-400/25 to-slate-400/5", ring: "ring-slate-400/30" },
  { key: "gold", label: "Ouro", min: 100, max: 300, icon: Trophy, color: "text-warning", bg: "from-warning/25 to-warning/5", ring: "ring-warning/30" },
  { key: "diamond", label: "Diamante", min: 300, max: 999999, icon: Crown, color: "text-primary", bg: "from-primary/25 to-primary/5", ring: "ring-primary/30" },
];

function getTier(jobs: number): { current: Tier; next: Tier | null; progress: number; remaining: number } {
  const idx = tiers.findIndex(t => jobs >= t.min && jobs < t.max);
  const current = tiers[idx] ?? tiers[tiers.length - 1];
  const next = tiers[idx + 1] ?? null;
  const span = current.max - current.min;
  const progress = next ? Math.min(100, ((jobs - current.min) / span) * 100) : 100;
  const remaining = next ? Math.max(0, current.max - jobs) : 0;
  return { current, next, progress, remaining };
}

export default function ProRanking() {
  const { user } = useAuth();
  const { data: rankingData, isLoading } = useProRanking();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
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
  const jobsDone = proProfile?.jobs_done ?? 0;
  const { current: tier, next, progress, remaining } = getTier(jobsDone);
  const TierIcon = tier.icon;

  const stats = [
    { label: "Nota média", value: (proProfile?.rating ?? 5.0).toFixed(1), icon: Star, color: "text-warning" },
    { label: "Serviços", value: jobsDone.toString(), icon: Award, color: "text-primary" },
    { label: "Aceitação", value: `${(metrics?.acceptance_rate ?? 100).toFixed(0)}%`, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Meu ranking" subtitle="Sua posição entre os profissionais" />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          {/* Tier Hero */}
          <motion.div
            variants={item}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br p-6 shadow-sm",
              tier.bg
            )}
          >
            <div className="absolute -right-6 -top-6 opacity-10">
              <TierIcon className="w-40 h-40" />
            </div>

            <div className="relative flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || "Pro"}`}
                  alt={profile?.full_name || "Profissional"}
                  className={cn("size-20 rounded-full object-cover ring-4", tier.ring)}
                />
                {proProfile?.verified && (
                  <div className="absolute -bottom-1 -right-1 size-7 bg-primary rounded-full flex items-center justify-center ring-4 ring-background">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Nível atual</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TierIcon className={cn("w-6 h-6", tier.color)} />
                  <h2 className={cn("text-2xl font-bold leading-none", tier.color)}>{tier.label}</h2>
                </div>
                <p className="text-sm text-foreground font-medium mt-1.5 truncate">{profile?.full_name || "Profissional"}</p>
              </div>
            </div>

            {/* Rank chip */}
            <div className="relative mt-5 p-3 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/40 flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Sua posição</p>
                <p className="text-sm font-semibold text-foreground">
                  Top <span className="text-primary">{rankingData?.percentile ?? 100}%</span>
                  <span className="text-muted-foreground font-normal"> · #{rankingData?.rank ?? 1} de {rankingData?.totalPros ?? 1}</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress to next tier */}
          {next && (
            <motion.div variants={item} className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Próximo nível: {next.label}</span>
                </div>
                <span className="text-xs font-bold text-primary">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2.5">
                Faltam <span className="text-foreground font-semibold">{remaining} serviços</span> para chegar em {next.label}.
              </p>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div variants={item} className="grid grid-cols-3 gap-2.5">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Tips */}
          <motion.div variants={item} className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Como subir no ranking</h3>
            </div>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{tip.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}

