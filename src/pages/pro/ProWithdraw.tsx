import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { ChevronLeft, Wallet, ArrowDownToLine, Clock, Loader2, CheckCircle2, XCircle, Smartphone, Mail, CreditCard, Key } from "lucide-react";
import { useProBalance, useProWithdrawals } from "@/hooks/useWithdrawals";
import { useWithdrawRequest } from "@/hooks/useWithdrawRequest";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type PixKeyType = "cpf" | "email" | "phone" | "random";

const pixKeyOptions: { type: PixKeyType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { type: "cpf", label: "CPF", icon: <CreditCard className="w-4 h-4" />, placeholder: "000.000.000-00" },
  { type: "email", label: "E-mail", icon: <Mail className="w-4 h-4" />, placeholder: "seu@email.com" },
  { type: "phone", label: "Telefone", icon: <Smartphone className="w-4 h-4" />, placeholder: "(41) 99999-9999" },
  { type: "random", label: "Aleatória", icon: <Key className="w-4 h-4" />, placeholder: "Cole sua chave aleatória" },
];

export default function ProWithdraw() {
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useProBalance();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useProWithdrawals();
  const withdrawRequest = useWithdrawRequest();

  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(numAmount) || numAmount < 10) return;

    withdrawRequest.mutate(
      { amount: numAmount, pixKeyType, pixKey: pixKey.trim() },
      {
        onSuccess: () => {
          setAmount("");
          setPixKey("");
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
      case "processing":
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
        return "Pendente";
      case "processing":
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
      case "processing":
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
  const numAmount = parseFloat(amount.replace(",", ".")) || 0;
  const isValid = numAmount >= 10 && numAmount <= availableBalance && pixKey.trim().length > 0;
  const currentPlaceholder = pixKeyOptions.find((o) => o.type === pixKeyType)?.placeholder || "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Solicitar Saque</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 animate-fade-in">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-primary rounded-xl text-primary-foreground"
        >
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
        </motion.div>

        {/* Withdraw Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-4 card-shadow space-y-4"
        >
          <h3 className="font-semibold text-foreground">Valor do saque</h3>

          <InputField
            label="Valor (R$)"
            type="number"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {numAmount > 0 && numAmount < 10 && (
            <p className="text-xs text-destructive">Valor mínimo: R$ 10,00</p>
          )}
          {numAmount > availableBalance && (
            <p className="text-xs text-destructive">Saldo insuficiente</p>
          )}

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
        </motion.div>

        {/* Pix Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-4 card-shadow space-y-4"
        >
          <h3 className="font-semibold text-foreground">Chave Pix</h3>

          <div className="grid grid-cols-4 gap-2">
            {pixKeyOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  setPixKeyType(option.type);
                  setPixKey("");
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-colors",
                  pixKeyType === option.type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>

          <InputField
            label="Sua chave Pix"
            placeholder={currentPlaceholder}
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PrimaryButton
            fullWidth
            loading={withdrawRequest.isPending}
            onClick={handleWithdraw}
            disabled={!isValid}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Solicitar saque
          </PrimaryButton>

          <p className="text-xs text-center text-muted-foreground mt-3">
            Saques são processados via Pix em até 24 horas úteis.
          </p>
        </motion.div>

        {/* Withdrawals History */}
        {withdrawals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-4 card-shadow"
          >
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
                  <span
                    className={cn(
                      "text-sm font-medium",
                      getStatusColor(withdrawal.status)
                    )}
                  >
                    {getStatusLabel(withdrawal.status)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
