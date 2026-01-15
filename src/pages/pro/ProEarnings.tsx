import { useState } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { cn } from "@/lib/utils";
import { TrendingUp, Calendar, ArrowDownToLine } from "lucide-react";

type Period = "week" | "month";

const weeklyEarnings = [
  { day: "Seg", value: 103.92 },
  { day: "Ter", value: 143.92 },
  { day: "Qua", value: 0 },
  { day: "Qui", value: 103.92 },
  { day: "Sex", value: 247.84 },
  { day: "Sáb", value: 0 },
  { day: "Dom", value: 0 },
];

const transactions = [
  { id: "1", date: "15/01", service: "Limpeza Padrão", value: 103.92, status: "completed" },
  { id: "2", date: "14/01", service: "Limpeza Pesada", value: 143.92, status: "completed" },
  { id: "3", date: "13/01", service: "Limpeza Padrão", value: 103.92, status: "completed" },
  { id: "4", date: "12/01", service: "Limpeza Pesada", value: 143.92, status: "pending" },
];

export default function ProEarnings() {
  const [period, setPeriod] = useState<Period>("week");

  const totalWeek = weeklyEarnings.reduce((acc, day) => acc + day.value, 0);
  const maxValue = Math.max(...weeklyEarnings.map(d => d.value));

  return (
    <div className="min-h-screen bg-background pb-20">
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
          <p className="text-3xl font-bold mt-1">R$ 320,00</p>
          <PrimaryButton 
            variant="secondary" 
            size="sm" 
            className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
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
              <p className="text-sm text-muted-foreground">Total da semana</p>
              <p className="text-xl font-bold text-foreground">
                R$ {totalWeek.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyEarnings.map((day) => (
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
        </div>

        {/* Transaction History */}
        <section>
          <h2 className="font-semibold text-foreground mb-3">Histórico de repasses</h2>
          
          <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
            {transactions.map((tx, index) => (
              <div 
                key={tx.id}
                className={cn(
                  "flex items-center justify-between p-4",
                  index !== transactions.length - 1 && "border-b border-border"
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
                    tx.status === "completed" ? "text-muted-foreground" : "text-warning"
                  )}>
                    {tx.status === "completed" ? "Pago" : "Pendente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
