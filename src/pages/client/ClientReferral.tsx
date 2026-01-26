import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ReferralCard } from "@/components/ui/ReferralCard";
import { ChevronRight, Users, Gift, CheckCircle } from "lucide-react";
import { mockUser, referrals } from "@/lib/mockDataV3";

export default function ClientReferral() {
  const navigate = useNavigate();
  const userReferrals = referrals.filter(r => r.referrerUserId === mockUser.id);
  const totalEarned = userReferrals.filter(r => r.status === "rewarded").reduce((sum, r) => sum + r.rewardValue, 0);

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Indique e Ganhe</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 animate-fade-in">
        <ReferralCard
          referralCode={mockUser.referralCode || "REF0001"}
          rewardValue={20}
          totalReferred={userReferrals.length}
          totalEarned={totalEarned}
        />

        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold text-foreground mb-4">Como funciona</h3>
          <div className="space-y-4">
            {[
              { icon: Gift, text: "Compartilhe seu código com amigos" },
              { icon: Users, text: "Seu amigo ganha R$ 20 de desconto na primeira limpeza" },
              { icon: CheckCircle, text: "Você ganha R$ 20 em crédito após a limpeza ser concluída" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {userReferrals.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">Suas indicações</h3>
            <div className="space-y-2">
              {userReferrals.slice(0, 5).map((ref) => (
                <div key={ref.id} className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{ref.refereeName}</p>
                    <p className="text-xs text-muted-foreground">{ref.createdAt}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ref.status === "rewarded" ? "bg-success/10 text-success" :
                    ref.status === "qualified" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {ref.status === "rewarded" ? "Pago" : ref.status === "qualified" ? "Qualificado" : "Pendente"}
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
