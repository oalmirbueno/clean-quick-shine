import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, ArrowDownToLine, Loader2, Wallet } from "lucide-react";
import { useProEarnings } from "@/hooks/useProEarnings";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type Period = "week" | "month";

export default function ProEarnings() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("week");
  const { data: earnings, isLoading } = useProEarnings();

  if (isLoading) {
    return (
      <div className="h-full bg-background flex flex-col safe-top">
        <ProPageHeader title="Meus ganhos" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
        <BottomNav variant="pro" />
      </div>
    );
  }

  const totalPeriod = period === "week" ? earnings?.weekTotal || 0 : earnings?.monthTotal || 0;
  const maxValue = Math.max(...(earnings?.weeklyData.map(d => d.value) || [1]), 1);
  const weekChange = earnings?.weekChange || 0;

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Meus ganhos" subtitle="Acompanhe seu saldo e repasses" />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          {/* Hero Saldo */}
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 shadow-sm"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-4 top-4 opacity-20">
              <Wallet className="w-20 h-20" />
            </div>
            <p className="text-xs uppercase tracking-wider opacity-80 font-medium">Saldo disponível</p>
            <p className="text-[34px] font-bold leading-none mt-1.5">
              R$ {(earnings?.availableBalance || 0).toFixed(2).replace(".", ",")}
            </p>
            {earnings && earnings.pendingBalance > 0 && (
              <p className="text-xs opacity-80 mt-2">
                + R$ {earnings.pendingBalance.toFixed(2).replace(".", ",")} pendente
              </p>
            )}
            <PrimaryButton
              variant="secondary"
              size="sm"
              className="mt-4 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/pro/withdraw")}
              disabled={(earnings?.availableBalance || 0) <= 0}
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Solicitar saque
            </PrimaryButton>
          </motion.div>

          {/* Period Tabs */}
          <motion.div variants={item} className="flex bg-muted/60 rounded-2xl p-1">
            <button
              onClick={() => setPeriod("week")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-colors",
                period === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-xl transition-colors",
                period === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Mês
            </button>
          </motion.div>

          {/* Chart Card */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Total {period === "week" ? "da semana" : "do mês"}
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  R$ {totalPeriod.toFixed(2).replace(".", ",")}
                </p>
              </div>
              {period === "week" && weekChange !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  weekChange >= 0 ? "text-success" : "text-destructive"
                )}>
                  {weekChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{weekChange >= 0 ? "+" : ""}{weekChange}%</span>
                </div>
              )}
            </div>

            {period === "week" && earnings?.weeklyData && (
              <div className="flex items-end justify-between gap-2 h-32">
                {earnings.weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={cn("w-full rounded-t-md transition-all", day.value > 0 ? "bg-primary" : "bg-muted")}
                      style={{ height: day.value > 0 ? `${(day.value / maxValue) * 100}%` : "4px", minHeight: "4px" }}
                    />
                    <span className="text-[10px] text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            )}

            {period === "month" && (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Wallet className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {earnings?.transactions.length || 0} serviços concluídos
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Transactions */}
          <motion.section variants={item}>
            <h2 className="text-sm font-bold text-foreground mb-2.5">Histórico de repasses</h2>
            {!earnings?.transactions.length ? (
              <div className="bg-card rounded-2xl border border-border/60 p-8 text-center shadow-sm">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">Nenhum repasse ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Complete serviços para começar a ganhar</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                {earnings.transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between p-4",
                      index !== earnings.transactions.length - 1 && "border-b border-border/60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.service}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-success">
                        +R$ {tx.value.toFixed(2).replace(".", ",")}
                      </p>
                      <p className={cn(
                        "text-[10px] font-medium",
                        tx.status === "paid_out" ? "text-muted-foreground"
                          : tx.status === "completed" ? "text-success" : "text-warning"
                      )}>
                        {tx.status === "paid_out" ? "Pago" : tx.status === "completed" ? "Disponível" : "Pendente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
