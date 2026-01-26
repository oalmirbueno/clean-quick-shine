import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { CouponInput } from "@/components/ui/CouponInput";
import { ChevronLeft, Calendar, Clock, MapPin, CreditCard, Smartphone, Wallet, Shield, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useService } from "@/hooks/useServices";
import { useAddress } from "@/hooks/useAddresses";
import { useCreateOrder, useValidateCoupon } from "@/hooks/useCreateOrder";
import { useAuth } from "@/contexts/AuthContext";

const paymentMethods = [
  { id: "pix", icon: Smartphone, label: "Pix", description: "Aprovação instantânea" },
  { id: "card", icon: CreditCard, label: "Cartão", description: "Crédito ou débito" },
  { id: "balance", icon: Wallet, label: "Saldo", description: "R$ 0,00 disponível" },
];

export default function ClientCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { serviceId, date, time, addressId, proId, proName, proRating } = location.state || {};
  
  const { data: service, isLoading: isLoadingService } = useService(serviceId);
  const { data: address, isLoading: isLoadingAddress } = useAddress(addressId);
  
  const createOrderMutation = useCreateOrder();
  const validateCouponMutation = useValidateCoupon();
  
  const [selectedPayment, setSelectedPayment] = useState<string | null>("pix");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [notes, setNotes] = useState("");

  const isLoading = isLoadingService || isLoadingAddress;
  const basePrice = Number(service?.base_price || 0);
  const serviceFee = basePrice * 0.1; // 10% service fee
  const discount = appliedCoupon?.discount || 0;
  const totalPrice = Math.max(0, basePrice + serviceFee - discount);

  const handleApplyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await validateCouponMutation.mutateAsync({
        code,
        orderValue: basePrice,
      });
      
      setAppliedCoupon({ code: result.code, discount: result.discount });
      return { success: true, message: "" };
    } catch (error: any) {
      return { success: false, message: error.message || "Cupom inválido" };
    }
  };

  const formatDate = (d: Date | string) => {
    if (!d) return "Data não selecionada";
    const dateObj = d instanceof Date ? d : new Date(d);
    return dateObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateForDB = (d: Date | string): string => {
    if (!d) return "";
    const dateObj = d instanceof Date ? d : new Date(d);
    return dateObj.toISOString().split("T")[0];
  };

  const handlePayment = async () => {
    if (!user?.id || !serviceId || !addressId || !date || !time) {
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        serviceId,
        addressId,
        scheduledDate: formatDateForDB(date),
        scheduledTime: time,
        proId: proId || null,
        couponCode: appliedCoupon?.code || null,
        notes: notes || undefined,
      });

      navigate("/client/order-tracking", { 
        state: { orderId: result.orderId } 
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const breakdownItems = [
    { label: "Subtotal", value: basePrice },
    ...(discount > 0 ? [{ label: `Cupom (${appliedCoupon?.code})`, value: discount, negative: true }] : []),
    { label: "Taxa de serviço", value: serviceFee },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service || !address) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Dados do pedido não encontrados</p>
        <PrimaryButton onClick={() => navigate("/client/home")}>
          Voltar ao início
        </PrimaryButton>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-foreground">
            Finalizar pedido
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Pro Info */}
        {proName && (
          <section className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {proName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{proName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-warning">★</span> {proRating?.toFixed(1) || "5.0"} · Profissional verificado(a)
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Order Summary */}
        <section className="p-4 border-b border-border">
          <h2 className="font-medium text-foreground mb-3">Resumo do pedido</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-muted-foreground">{service.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Duração: ~{service.duration_hours}h
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formatDate(date)}</p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{address.label}</p>
                <p className="text-muted-foreground">
                  {address.street}, {address.number} - {address.neighborhood}, {address.city}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="p-4 border-b border-border">
          <h2 className="font-medium text-foreground mb-3">Observações (opcional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Tenho um cachorro amigável, a chave está embaixo do tapete..."
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            maxLength={500}
          />
        </section>

        {/* Coupon */}
        <section className="p-4 border-b border-border">
          <h2 className="font-medium text-foreground mb-3">Cupom de desconto</h2>
          <CouponInput
            onApply={handleApplyCoupon}
            appliedCoupon={appliedCoupon || undefined}
            onRemove={() => setAppliedCoupon(null)}
          />
        </section>

        {/* Payment Methods */}
        <section className="p-4 border-b border-border">
          <h2 className="font-medium text-foreground mb-3">Forma de pagamento</h2>
          
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all duration-200",
                  "flex items-center gap-3",
                  selectedPayment === method.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/20"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  selectedPayment === method.id ? "bg-primary" : "bg-secondary"
                )}>
                  <method.icon className={cn(
                    "w-5 h-5",
                    selectedPayment === method.id ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {selectedPayment === method.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Price Breakdown */}
        <section className="p-4">
          <MoneyBreakdown
            items={breakdownItems}
            total={totalPrice}
          />
        </section>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <Shield className="w-4 h-4" />
          <span>Pagamento seguro. Liberado após confirmação do serviço.</span>
        </div>
        <PrimaryButton
          fullWidth
          loading={createOrderMutation.isPending}
          disabled={!selectedPayment || createOrderMutation.isPending}
          onClick={handlePayment}
        >
          Pagar R$ {totalPrice.toFixed(2).replace(".", ",")}
        </PrimaryButton>
      </div>
    </div>
  );
}
