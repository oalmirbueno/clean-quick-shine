import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, ArrowDownToLine, Loader2, Wallet } from "lucide-react";
import { useProEarnings } from "@/hooks/useProEarnings";

type Period = "week" | "month";

export default function ProEarnings() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("week");
  const { data: earnings, isLoading } = useProEarnings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border p-4">
          <h1 className="text-xl font-semibold text-foreground">Meus ganhos</h1>
        </header>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav variant="pro" />
      </div>
    );
  }

  const totalPeriod = period === "week" ? earnings?.weekTotal || 0 : earnings?.monthTotal || 0;
  const maxValue = Math.max(...(earnings?.weeklyData.map(d => d.value) || [1]), 1);
  const weekChange = earnings?.weekChange || 0;

  return (
    <div className="min-h-screen bg-background pb-20 safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-xl font-semibold text-foreground">
          Meus ganhos
        </h1>
      </header>

      <main className="p-4 space-y-4 animate-fade-in">
        {/* Balance Card */}
        <div className="p-5 bg-primary rounded-xl text-primary-foreground">
          <p className="text-sm opacity-90">Saldo disponível</p>
          <p className="text-3xl font-bold mt-1">
            R$ {(earnings?.availableBalance || 0).toFixed(2).replace(".", ",")}
          </p>
          {earnings && earnings.pendingBalance > 0 && (
            <p className="text-sm opacity-75 mt-1">
              + R$ {earnings.pendingBalance.toFixed(2).replace(".", ",")} pendente
            </p>
          )}
          <PrimaryButton 
            variant="secondary" 
            size="sm" 
            className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={() => navigate("/pro/withdraw")}
            disabled={(earnings?.availableBalance || 0) <= 0}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Solicitar saque
          </PrimaryButton>
        </div>

        {/* Period Tabs */}
        <div className="flex bg-secondary rounded-lg p-1">
          <button
            onClick={() => setPeriod("week")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              period === "week" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              period === "month" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            Mês
          </button>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Total {period === "week" ? "da semana" : "do mês"}
              </p>
              <p className="text-xl font-bold text-foreground">
                R$ {totalPeriod.toFixed(2).replace(".", ",")}
              </p>
            </div>
            {period === "week" && weekChange !== 0 && (
              <div className={cn(
                "flex items-center gap-1 text-sm",
                weekChange >= 0 ? "text-success" : "text-destructive"
              )}>
                {weekChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{weekChange >= 0 ? "+" : ""}{weekChange}%</span>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          {period === "week" && earnings?.weeklyData && (
            <div className="flex items-end justify-between gap-2 h-32">
              {earnings.weeklyData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-full rounded-t-md transition-all",
                      day.value > 0 ? "bg-primary" : "bg-secondary"
                    )}
                    style={{ 
                      height: day.value > 0 ? `${(day.value / maxValue) * 100}%` : "4px",
                      minHeight: "4px"
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          )}

          {/* Monthly summary */}
          {period === "month" && (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Wallet className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {earnings?.transactions.length || 0} serviços concluídos
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <section>
          <h2 className="font-semibold text-foreground mb-3">Histórico de repasses</h2>
          
          {!earnings?.transactions.length ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center card-shadow">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum repasse ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete serviços para começar a ganhar
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
              {earnings.transactions.map((tx, index) => (
                <div 
                  key={tx.id}
                  className={cn(
                    "flex items-center justify-between p-4",
                    index !== earnings.transactions.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.service}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">
                      +R$ {tx.value.toFixed(2).replace(".", ",")}
                    </p>
                    <p className={cn(
                      "text-xs",
                      tx.status === "paid_out" 
                        ? "text-muted-foreground" 
                        : tx.status === "completed" 
                          ? "text-success"
                          : "text-warning"
                    )}>
                      {tx.status === "paid_out" 
                        ? "Pago" 
                        : tx.status === "completed"
                          ? "Disponível"
                          : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
