import { cn } from "@/lib/utils";
import { Gift, Copy, Share2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReferralCardProps {
  referralCode: string;
  rewardValue: number;
  totalReferred?: number;
  totalEarned?: number;
  className?: string;
}

export function ReferralCard({
  referralCode,
  rewardValue,
  totalReferred = 0,
  totalEarned = 0,
  className,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "LimpaJá - Indicação",
        text: `Use meu código ${referralCode} e ganhe R$ ${rewardValue} de desconto na primeira limpeza!`,
        url: window.location.origin,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className={cn("p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Indique e Ganhe</h3>
          <p className="text-sm opacity-90">R$ {rewardValue} por indicação</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <p className="text-xs opacity-75 mb-1">Seu código</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-wider">{referralCode}</span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{totalReferred}</p>
          <p className="text-xs opacity-75">Indicações</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">R$ {totalEarned.toFixed(0)}</p>
          <p className="text-xs opacity-75">Ganhos</p>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 rounded-lg bg-white text-primary font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </button>
    </div>
  );
}
