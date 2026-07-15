import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ReferralCard } from "@/components/ui/ReferralCard";
import { ChevronLeft, Users, Gift, CheckCircle, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { icon: Share2, title: "Compartilhe seu código", text: "Envie para quem quiser experimentar o Já Limpo." },
  { icon: Gift, title: "Seu amigo ganha R$ 20", text: "Desconto aplicado automaticamente na primeira limpeza." },
  { icon: CheckCircle, title: "Você ganha R$ 20", text: "Crédito na sua conta após o serviço ser concluído." },
];

export default function ClientReferral() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: referrals = [] } = useQuery({
    queryKey: ["client_referrals", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("referrals").select("*").eq("referrer_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ["client_referral_rewards", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("referral_rewards").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const totalEarned = rewards.filter((r: any) => r.status === "credited").reduce((sum: number, r: any) => sum + r.value, 0);
  const completedCount = referrals.filter((r: any) => r.status === "completed").length;
  const referralCode = referrals[0]?.code || "SEMCODIGO";

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground leading-tight">Indique e ganhe</h1>
            <p className="text-xs text-muted-foreground">R$ 20 para você, R$ 20 pro amigo</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in">
        <div className="p-4 space-y-4">
          <ReferralCard
            referralCode={referralCode}
            rewardValue={20}
            totalReferred={referrals.length}
            totalEarned={totalEarned}
          />

          {/* Stats */}
          <section className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-card rounded-2xl border border-border/60">
              <p className="text-xs text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completedCount}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <p className="text-xs text-muted-foreground">Total ganho</p>
              <p className="text-2xl font-bold text-primary mt-1">R$ {totalEarned}</p>
            </div>
          </section>

          {/* How it works */}
          <section className="p-5 bg-card rounded-2xl border border-border/60 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Como funciona</h3>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Referrals list */}
          {referrals.length > 0 ? (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Suas indicações</h3>
              <div className="space-y-2">
                {referrals.slice(0, 10).map((ref: any, i: number) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 bg-card rounded-2xl border border-border/60 flex items-center gap-3"
                  >
                    <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">Indicação #{ref.id.slice(0, 6)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      ref.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {ref.status === "completed" ? "Concluída" : "Pendente"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </section>
          ) : (
            <section className="p-6 bg-card rounded-2xl border border-border/60 border-dashed flex flex-col items-center text-center">
              <div className="size-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground text-sm">Nenhuma indicação ainda</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Compartilhe seu código acima e comece a ganhar créditos.
              </p>
            </section>
          )}
        </div>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}

