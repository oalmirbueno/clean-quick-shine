import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Calendar, Clock, MapPin, CreditCard, Smartphone, Wallet, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { services, mockAddresses, mockProProfile } from "@/lib/mockData";

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
  const address = mockAddresses.find(a => a.id === addressId) || mockAddresses[0];
  const [selectedPayment, setSelectedPayment] = useState<string | null>("pix");
  const [loading, setLoading] = useState(false);

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
    navigate("/client/order-tracking", { state: { orderId: "1" } });
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
              src={mockProProfile.avatar}
              alt={mockProProfile.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-foreground">{mockProProfile.name}</p>
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
                <p className="font-medium text-foreground">{address.label}</p>
                <p className="text-muted-foreground">
                  {address.street}, {address.number} - {address.city}
                </p>
              </div>
            </div>
          </div>
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

        {/* Price */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">R$ {service.basePrice.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Taxa de serviço</span>
            <span className="text-foreground">R$ 0,00</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {service.basePrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </section>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <Shield className="w-4 h-4" />
          <span>Pagamento protegido. Liberação após conclusão.</span>
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
