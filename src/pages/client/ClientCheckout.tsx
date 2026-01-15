import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { CouponInput } from "@/components/ui/CouponInput";
import { ChevronLeft, Calendar, Clock, MapPin, CreditCard, Smartphone, Wallet, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { services, addresses, pros, coupons, adminSettings, calculateOrderValues } from "@/lib/mockDataV2";

const paymentMethods = [
  { id: "pix", icon: Smartphone, label: "Pix", description: "Aprovação instantânea" },
  { id: "card", icon: CreditCard, label: "Cartão", description: "Crédito ou débito" },
  { id: "balance", icon: Wallet, label: "Saldo", description: "R$ 0,00 disponível" },
];

export default function ClientCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId, date, time, addressId } = location.state || {};
  
  const service = services.find(s => s.id === serviceId) || services[0];
  const address = addresses.find(a => a.id === addressId) || addresses[0];
  const pro = pros[0];
  
  const [selectedPayment, setSelectedPayment] = useState<string | null>("pix");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate values
  const coupon = appliedCoupon ? coupons.find(c => c.code === appliedCoupon.code) : undefined;
  const values = calculateOrderValues(service.basePrice, coupon);

  const handleApplyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupon = coupons.find(c => c.code === code && c.active);
    
    if (!coupon) {
      return { success: false, message: "Cupom inválido ou expirado" };
    }
    
    if (service.basePrice < coupon.minOrderValue) {
      return { success: false, message: `Valor mínimo: R$ ${coupon.minOrderValue.toFixed(2)}` };
    }
    
    const discount = coupon.type === "percent" 
      ? service.basePrice * (coupon.value / 100) 
      : coupon.value;
    
    setAppliedCoupon({ code: coupon.code, discount });
    return { success: true, message: "" };
  };

  const formatDate = (d: Date | string) => {
    const dateObj = d instanceof Date ? d : new Date(d);
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate("/client/order-tracking", { state: { orderId: "1001" } });
  };

  const breakdownItems = [
    { label: "Subtotal", value: values.subtotal },
    ...(values.discount > 0 ? [{ label: `Cupom (${appliedCoupon?.code})`, value: values.discount, negative: true }] : []),
    { label: "Taxa de serviço", value: values.fee },
  ];

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
        <section className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={pro.avatar}
              alt={pro.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-foreground">{pro.name}</p>
              <p className="text-sm text-muted-foreground">Profissional verificada</p>
            </div>
          </div>
        </section>

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
                <p className="font-medium text-foreground">{address?.label || "Casa"}</p>
                <p className="text-muted-foreground">
                  {address?.street}, {address?.number} - {address?.city}
                </p>
              </div>
            </div>
          </div>
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
            total={values.totalPrice}
          />
        </section>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <Shield className="w-4 h-4" />
          <span>Você está protegido. Pagamento só é liberado após confirmação.</span>
        </div>
        <PrimaryButton
          fullWidth
          loading={loading}
          onClick={handlePayment}
        >
          Pagar e confirmar
        </PrimaryButton>
      </div>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
