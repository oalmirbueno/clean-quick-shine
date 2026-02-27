import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ReferralCard } from "@/components/ui/ReferralCard";
import { ChevronRight, Users, Gift, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const referralCode = referrals[0]?.code || "SEMCODIGO";

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></button>
          <h1 className="text-lg font-semibold">Indique e Ganhe</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 animate-fade-in">
        <ReferralCard referralCode={referralCode} rewardValue={20} totalReferred={referrals.length} totalEarned={totalEarned} />

        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-4">Como funciona</h3>
          <div className="space-y-4">
            {[
              { icon: Gift, text: "Compartilhe seu código com amigos" },
              { icon: Users, text: "Seu amigo ganha R$ 20 de desconto na primeira limpeza" },
              { icon: CheckCircle, text: "Você ganha R$ 20 em crédito após a limpeza ser concluída" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><step.icon className="w-5 h-5 text-primary" /></div>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {referrals.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">Suas indicações</h3>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((ref: any) => (
                <div key={ref.id} className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Indicação #{ref.id.slice(0, 6)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ref.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ref.status === "completed" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {ref.status === "completed" ? "Concluída" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
