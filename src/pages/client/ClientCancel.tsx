import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, AlertTriangle, Clock, DollarSign, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useCancelOrder, CANCEL_SETTINGS } from "@/hooks/useCancelOrder";
import { cn } from "@/lib/utils";
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
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Cancelar pedido</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3 animate-fade-in">
        {/* Warning hero */}
        <div className={cn(
          "p-5 rounded-2xl border",
          isFreeCancel
            ? "bg-primary/5 border-primary/20"
            : "bg-warning/5 border-warning/25"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "size-11 rounded-full flex items-center justify-center shrink-0",
              isFreeCancel ? "bg-primary/15" : "bg-warning/15"
            )}>
              {isFreeCancel ? (
                <Clock className="w-5 h-5 text-primary" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">
                {isFreeCancel ? "Cancelamento gratuito" : "Cancelamento com multa"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {isFreeCancel
                  ? `Você está dentro da janela de ${CANCEL_SETTINGS.cancelFreeHours}h para cancelar sem custos.`
                  : `Faltam menos de ${CANCEL_SETTINGS.cancelFreeHours}h para o serviço. Será cobrada uma multa de ${CANCEL_SETTINGS.cancelPenaltyPercent}%.`}
              </p>
              {hoursUntilOrder > 0 && (
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-background/60 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Faltam {Math.floor(hoursUntilOrder)}h para o serviço
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Resumo do pedido</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Serviço</span>
              <span className="text-foreground font-medium text-right">{serviceName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Data</span>
              <span className="text-foreground text-right">
                {formatDate(order.scheduled_date)} · {order.scheduled_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex justify-between gap-3 pt-2.5 border-t border-border/50">
              <span className="text-muted-foreground">Valor pago</span>
              <span className="text-foreground font-semibold">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>

        {/* Penalty breakdown */}
        {!isFreeCancel && (
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">Detalhamento do reembolso</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multa ({CANCEL_SETTINGS.cancelPenaltyPercent}%)</span>
                <span className="text-destructive font-medium">
                  −R$ {penaltyAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-border/50">
                <span className="text-foreground font-medium">Você recebe de volta</span>
                <span className="text-primary font-bold text-base">
                  R$ {refundAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Policy */}
        <div className="bg-secondary/60 rounded-2xl p-4">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">Política de cancelamento</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {CANCEL_SETTINGS.refundPolicyText}
          </p>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card/95 backdrop-blur-md border-t border-border/60 safe-bottom space-y-2">
        <PrimaryButton
          fullWidth
          onClick={() => setShowConfirm(true)}
          className="bg-destructive hover:bg-destructive/90"
        >
          Confirmar cancelamento
        </PrimaryButton>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar sem cancelar
        </button>
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
