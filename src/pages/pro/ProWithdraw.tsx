import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { ChevronLeft, Wallet, ArrowDownToLine, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useProBalance, useProWithdrawals, useRequestWithdrawal } from "@/hooks/useWithdrawals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ProWithdraw() {
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useProBalance();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useProWithdrawals();
  const requestWithdrawal = useRequestWithdrawal();
  
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount.replace(",", "."));
    
    requestWithdrawal.mutate(
      { amount: numAmount, pixKey },
      {
        onSuccess: () => {
          setAmount("");
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "completed":
        return "Pago";
      case "pending":
        return "Processando";
      case "rejected":
        return "Rejeitado";
      default:
        return status || "Pendente";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-warning";
      case "rejected":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const isLoading = balanceLoading || withdrawalsLoading;
  const availableBalance = balance?.availableBalance || 0;
  const pendingBalance = balance?.pendingBalance || 0;
  const pendingWithdrawal = balance?.pendingWithdrawal || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Saque</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        {/* Balance Card */}
        <div className="p-5 bg-primary rounded-xl text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6" />
            <span className="text-sm opacity-90">Saldo disponível</span>
          </div>
          <p className="text-3xl font-bold">
            R$ {availableBalance.toFixed(2).replace(".", ",")}
          </p>
          {pendingBalance > 0 && (
            <p className="text-sm opacity-75 mt-1">
              + R$ {pendingBalance.toFixed(2).replace(".", ",")} aguardando avaliação
            </p>
          )}
          {pendingWithdrawal > 0 && (
            <p className="text-sm opacity-75 mt-1">
              R$ {pendingWithdrawal.toFixed(2).replace(".", ",")} em processamento
            </p>
          )}
        </div>

        {/* Withdraw Form */}
        <div className="bg-card rounded-xl border border-border p-4 card-shadow space-y-4">
          <h3 className="font-semibold text-foreground">Solicitar saque</h3>
          
          <InputField
            label="Valor do saque (R$)"
            type="number"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="flex gap-2">
            {[50, 100, 200].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(String(Math.min(value, availableBalance)))}
                disabled={availableBalance < value}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                  availableBalance >= value
                    ? "border-primary text-primary hover:bg-primary/10"
                    : "border-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                R$ {value}
              </button>
            ))}
            <button
              onClick={() => setAmount(String(availableBalance))}
              disabled={availableBalance <= 0}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                availableBalance > 0
                  ? "border-primary text-primary hover:bg-primary/10"
                  : "border-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Tudo
            </button>
          </div>

          <InputField
            label="Chave Pix"
            placeholder="E-mail, CPF ou telefone"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />

          <PrimaryButton 
            fullWidth 
            loading={requestWithdrawal.isPending} 
            onClick={handleWithdraw}
            disabled={!amount || !pixKey || availableBalance <= 0}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Solicitar saque
          </PrimaryButton>

          <p className="text-xs text-center text-muted-foreground">
            Saques são processados em até 24 horas úteis.
          </p>
        </div>

        {/* Withdrawals History */}
        {withdrawals.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Histórico de saques</h3>
            
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div 
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      {getStatusIcon(withdrawal.status)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        R$ {Number(withdrawal.amount).toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(withdrawal.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={cn("text-sm font-medium", getStatusColor(withdrawal.status))}>
                    {getStatusLabel(withdrawal.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
