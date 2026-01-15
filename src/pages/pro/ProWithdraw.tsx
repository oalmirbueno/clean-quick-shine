import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Wallet, ArrowDownToLine, Clock } from "lucide-react";
import { pros, withdrawals } from "@/lib/mockDataV2";
import { toast } from "sonner";

export default function ProWithdraw() {
  const navigate = useNavigate();
  const pro = pros[0]; // Mock current pro
  const proWithdrawals = withdrawals.filter(w => w.proId === pro.id);
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState(pro.pixKey || "");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (parseFloat(amount) > pro.balance) {
      toast.error("Saldo insuficiente");
      return;
    }
    if (!pixKey) {
      toast.error("Informe sua chave Pix");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Saque solicitado com sucesso!");
    setLoading(false);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
            R$ {pro.balance.toFixed(2).replace(".", ",")}
          </p>
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

          <InputField
            label="Chave Pix"
            placeholder="E-mail, CPF ou telefone"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />

          <PrimaryButton fullWidth loading={loading} onClick={handleWithdraw}>
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Solicitar saque
          </PrimaryButton>

          <p className="text-xs text-center text-muted-foreground">
            Saques são processados em até 24 horas úteis.
          </p>
        </div>

        {/* Withdrawals History */}
        {proWithdrawals.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-4">Histórico de saques</h3>
            
            <div className="space-y-3">
              {proWithdrawals.map((withdrawal) => (
                <div 
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        R$ {withdrawal.amount.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-sm text-muted-foreground">{withdrawal.createdAt}</p>
                    </div>
                  </div>
                  <StatusBadge status={withdrawal.status} />
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
