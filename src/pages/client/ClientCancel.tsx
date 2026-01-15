import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { orders, adminSettings } from "@/lib/mockDataV2";
import { toast } from "sonner";

export default function ClientCancel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = orders.find(o => o.id === id) || orders[0];
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate if within free cancellation window
  const orderDate = new Date(order.dateTime);
  const now = new Date();
  const hoursUntilOrder = (orderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isFreeCancel = hoursUntilOrder >= adminSettings.cancelFreeHours;
  const penaltyAmount = isFreeCancel ? 0 : order.totalPrice * (adminSettings.cancelPenaltyPercent / 100);

  const handleCancel = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Pedido cancelado com sucesso");
    navigate("/client/orders");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Cancelar pedido</h1>
        </div>
      </header>

      <main className="flex-1 p-4 animate-fade-in">
        {/* Warning */}
        <div className={`p-4 rounded-xl border mb-6 ${
          isFreeCancel 
            ? "bg-success/10 border-success/20" 
            : "bg-warning/10 border-warning/20"
        }`}>
          <div className="flex items-start gap-3">
            {isFreeCancel ? (
              <Clock className="w-6 h-6 text-success flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {isFreeCancel 
                  ? "Cancelamento gratuito" 
                  : "Cancelamento com multa"
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isFreeCancel 
                  ? `Você ainda está dentro da janela de ${adminSettings.cancelFreeHours} horas para cancelamento gratuito.`
                  : `Como faltam menos de ${adminSettings.cancelFreeHours} horas para o serviço, será cobrada uma multa de ${adminSettings.cancelPenaltyPercent}%.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 card-shadow mb-6">
          <h3 className="font-semibold text-foreground mb-3">Resumo do pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço</span>
              <span className="text-foreground">{order.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="text-foreground">{order.date} às {order.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor pago</span>
              <span className="text-foreground">R$ {order.totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        {/* Penalty Info */}
        {!isFreeCancel && (
          <div className="bg-card rounded-xl border border-border p-4 card-shadow mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning" />
              Valor da multa
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multa ({adminSettings.cancelPenaltyPercent}%)</span>
                <span className="text-destructive font-medium">
                  R$ {penaltyAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Reembolso</span>
                <span className="text-success font-medium">
                  R$ {(order.totalPrice - penaltyAmount).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Policy */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-medium text-foreground mb-2">Política de cancelamento</h4>
          <p className="text-xs text-muted-foreground">
            {adminSettings.refundPolicyText}
          </p>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border">
        <PrimaryButton 
          fullWidth 
          onClick={() => setShowConfirm(true)}
          className="bg-destructive hover:bg-destructive/90"
        >
          Confirmar cancelamento
        </PrimaryButton>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCancel}
        title="Cancelar pedido?"
        description={
          isFreeCancel
            ? "Você receberá o reembolso integral em até 7 dias úteis."
            : `Será cobrada uma multa de R$ ${penaltyAmount.toFixed(2).replace(".", ",")}. O restante será reembolsado em até 7 dias úteis.`
        }
        confirmText="Sim, cancelar"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
