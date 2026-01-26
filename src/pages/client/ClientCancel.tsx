import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, AlertTriangle, Clock, DollarSign, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useCancelOrder, CANCEL_SETTINGS } from "@/hooks/useCancelOrder";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClientCancel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id || null);
  const cancelOrder = useCancelOrder();
  const [showConfirm, setShowConfirm] = useState(false);

  // Calculate if within free cancellation window
  const { isFreeCancel, penaltyAmount, refundAmount, hoursUntilOrder } = useMemo(() => {
    if (!order) {
      return { isFreeCancel: true, penaltyAmount: 0, refundAmount: 0, hoursUntilOrder: 0 };
    }

    const orderDateTime = new Date(`${order.scheduled_date}T${order.scheduled_time}`);
    const now = new Date();
    const hoursUntil = (orderDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isFree = hoursUntil >= CANCEL_SETTINGS.cancelFreeHours;
    const penalty = isFree ? 0 : Number(order.total_price) * (CANCEL_SETTINGS.cancelPenaltyPercent / 100);
    const refund = Number(order.total_price) - penalty;

    return { 
      isFreeCancel: isFree, 
      penaltyAmount: penalty, 
      refundAmount: refund,
      hoursUntilOrder: hoursUntil,
    };
  }, [order]);

  const handleCancel = async () => {
    if (!id) return;

    cancelOrder.mutate(
      {
        orderId: id,
        penaltyAmount,
      },
      {
        onSuccess: () => {
          setShowConfirm(false);
          navigate("/client/orders");
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Pedido não encontrado</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">Não foi possível carregar o pedido.</p>
        </main>
      </div>
    );
  }

  // Check if order can be cancelled
  const cancellableStatuses = ["draft", "scheduled", "matching", "confirmed", "en_route", "in_progress"];
  const canCancel = cancellableStatuses.includes(order.status || "");

  if (!canCancel) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
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
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">Este pedido não pode ser cancelado</p>
          <p className="text-sm text-muted-foreground text-center">
            Pedidos com status "{order.status}" não podem mais ser cancelados.
          </p>
          <PrimaryButton 
            onClick={() => navigate("/client/orders")}
            className="mt-6"
          >
            Voltar aos pedidos
          </PrimaryButton>
        </main>
      </div>
    );
  }

  const serviceName = order.service?.name || "Serviço";
  const totalPrice = Number(order.total_price);

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
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
                  ? `Você ainda está dentro da janela de ${CANCEL_SETTINGS.cancelFreeHours} horas para cancelamento gratuito.`
                  : `Como faltam menos de ${CANCEL_SETTINGS.cancelFreeHours} horas para o serviço, será cobrada uma multa de ${CANCEL_SETTINGS.cancelPenaltyPercent}%.`
                }
              </p>
              {hoursUntilOrder > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Faltam {Math.floor(hoursUntilOrder)} horas para o serviço
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 card-shadow mb-6">
          <h3 className="font-semibold text-foreground mb-3">Resumo do pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço</span>
              <span className="text-foreground">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="text-foreground">
                {formatDate(order.scheduled_date)} às {order.scheduled_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor pago</span>
              <span className="text-foreground">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
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
                <span className="text-muted-foreground">
                  Multa ({CANCEL_SETTINGS.cancelPenaltyPercent}%)
                </span>
                <span className="text-destructive font-medium">
                  R$ {penaltyAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Reembolso</span>
                <span className="text-success font-medium">
                  R$ {refundAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Policy */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-medium text-foreground mb-2">Política de cancelamento</h4>
          <p className="text-xs text-muted-foreground">
            {CANCEL_SETTINGS.refundPolicyText}
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
        loading={cancelOrder.isPending}
      />
    </div>
  );
}
