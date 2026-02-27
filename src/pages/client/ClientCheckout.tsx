import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { BottomNav } from "@/components/ui/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/hooks/useOrders";
import {
  useCreateAsaasCustomer,
  useCreatePayment,
  usePaymentByOrder,
  useHasAsaasCustomer,
} from "@/hooks/usePayments";
import { ArrowLeft, CreditCard, QrCode, FileText, Copy, Check, Loader2, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

// Etapa 1: Cadastro CPF
function CpfStep({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const createCustomer = useCreateAsaasCustomer();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleSubmit = async () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return;
    }
    if (!name.trim()) {
      toast.error("Preencha seu nome completo");
      return;
    }

    await createCustomer.mutateAsync({
      name: name.trim(),
      email: user?.email || "",
      cpfCnpj: cleanCpf,
    });

    onComplete();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Cadastro para pagamento</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Para sua segurança, precisamos do seu CPF para processar o pagamento.
        </p>
      </div>

      <div className="space-y-4">
        <InputField
          label="Nome completo"
          placeholder="Seu nome como no documento"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          label="CPF"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          inputMode="numeric"
        />
      </div>

      <PrimaryButton
        fullWidth
        loading={createCustomer.isPending}
        disabled={createCustomer.isPending}
        onClick={handleSubmit}
      >
        Continuar para pagamento
      </PrimaryButton>
    </div>
  );
}

// Etapa 2: Seleção de método + dados
function PaymentStep({
  orderId,
  orderTotal,
  serviceName,
  onPaymentCreated,
}: {
  orderId: string;
  orderTotal: number;
  serviceName: string;
  onPaymentCreated: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const createPayment = useCreatePayment();

  const [cardData, setCardData] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  });
  const [holderInfo, setHolderInfo] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    postalCode: "",
    addressNumber: "",
    phone: "",
  });

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 16);
    return numbers.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handlePay = async () => {
    if (!method) return;

    const payload: any = {
      orderId,
      billingType: method,
    };

    if (method === "CREDIT_CARD") {
      if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
        toast.error("Preencha todos os dados do cartão");
        return;
      }
      if (!holderInfo.name || !holderInfo.cpfCnpj || !holderInfo.postalCode || !holderInfo.addressNumber || !holderInfo.phone) {
        toast.error("Preencha todos os dados do titular");
        return;
      }
      payload.creditCard = {
        ...cardData,
        number: cardData.number.replace(/\s/g, ""),
      };
      payload.creditCardHolderInfo = holderInfo;
    }

    await createPayment.mutateAsync(payload);
    onPaymentCreated();
  };

  const methods = [
    { id: "PIX" as PaymentMethod, icon: QrCode, label: "Pix", desc: "Aprovação instantânea" },
    { id: "CREDIT_CARD" as PaymentMethod, icon: CreditCard, label: "Cartão de Crédito", desc: "Aprovação imediata" },
    { id: "BOLETO" as PaymentMethod, icon: FileText, label: "Boleto", desc: "Até 2 dias úteis" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Resumo */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Resumo do pedido</h3>
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{serviceName}</span>
          <span className="text-lg font-bold text-primary">
            R$ {orderTotal.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Métodos */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Forma de pagamento</h3>
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              method === m.id
                ? "border-primary bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              method === m.id ? "bg-primary" : "bg-muted"
            }`}>
              <m.icon className={`w-6 h-6 ${method === m.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{m.label}</p>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              method === m.id ? "border-primary bg-primary" : "border-border"
            }`}>
              {method === m.id && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
          </button>
        ))}
      </div>

      {/* Formulário de Cartão */}
      {method === "CREDIT_CARD" && (
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Dados do cartão</h3>
          <InputField
            label="Nome no cartão"
            placeholder="Como impresso no cartão"
            value={cardData.holderName}
            onChange={(e) => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
          />
          <InputField
            label="Número do cartão"
            placeholder="0000 0000 0000 0000"
            value={cardData.number}
            onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
            inputMode="numeric"
          />
          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Mês"
              placeholder="MM"
              value={cardData.expiryMonth}
              onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value.replace(/\D/g, "").slice(0, 2) })}
              inputMode="numeric"
            />
            <InputField
              label="Ano"
              placeholder="AAAA"
              value={cardData.expiryYear}
              onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              inputMode="numeric"
            />
            <InputField
              label="CVV"
              placeholder="***"
              value={cardData.ccv}
              onChange={(e) => setCardData({ ...cardData, ccv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              inputMode="numeric"
              type="password"
            />
          </div>

          <h3 className="font-medium text-foreground pt-2">Dados do titular</h3>
          <InputField
            label="Nome completo"
            placeholder="Nome do titular"
            value={holderInfo.name}
            onChange={(e) => setHolderInfo({ ...holderInfo, name: e.target.value })}
          />
          <InputField
            label="CPF"
            placeholder="Somente números"
            value={holderInfo.cpfCnpj}
            onChange={(e) => setHolderInfo({ ...holderInfo, cpfCnpj: e.target.value.replace(/\D/g, "").slice(0, 11) })}
            inputMode="numeric"
          />
          <InputField
            label="Telefone"
            placeholder="DDD + número"
            value={holderInfo.phone}
            onChange={(e) => setHolderInfo({ ...holderInfo, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
            inputMode="numeric"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="CEP"
              placeholder="00000000"
              value={holderInfo.postalCode}
              onChange={(e) => setHolderInfo({ ...holderInfo, postalCode: e.target.value.replace(/\D/g, "").slice(0, 8) })}
              inputMode="numeric"
            />
            <InputField
              label="Nº endereço"
              placeholder="123"
              value={holderInfo.addressNumber}
              onChange={(e) => setHolderInfo({ ...holderInfo, addressNumber: e.target.value })}
            />
          </div>
          <InputField
            label="E-mail"
            placeholder="seu@exemplo.com"
            value={holderInfo.email}
            onChange={(e) => setHolderInfo({ ...holderInfo, email: e.target.value })}
            type="email"
          />
        </div>
      )}

      {/* Botão Pagar */}
      {method && (
        <PrimaryButton
          fullWidth
          loading={createPayment.isPending}
          disabled={createPayment.isPending}
          onClick={handlePay}
        >
          {method === "PIX" && "Gerar QR Code Pix"}
          {method === "CREDIT_CARD" && `Pagar R$ ${orderTotal.toFixed(2).replace(".", ",")}`}
          {method === "BOLETO" && "Gerar Boleto"}
        </PrimaryButton>
      )}
    </div>
  );
}

// Etapa 3: Confirmação / Aguardando pagamento
function ConfirmationStep({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const { data: payment, isLoading } = usePaymentByOrder(orderId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  useEffect(() => {
    if (payment?.status === "confirmed") {
      const timer = setTimeout(() => {
        navigate(`/client/order-tracking?orderId=${orderId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [payment?.status, orderId, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando pagamento...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-muted-foreground">Pagamento não encontrado</p>
      </div>
    );
  }

  // Pagamento confirmado
  if (payment.status === "confirmed") {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Pagamento confirmado!</h2>
        <p className="text-sm text-muted-foreground text-center">
          Redirecionando para o acompanhamento do pedido...
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  // PIX - Mostrar QR Code
  if (payment.method === "pix" && payment.pix_qr_code) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Pague com Pix</h2>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <img
              src={`data:image/png;base64,${payment.pix_qr_code}`}
              alt="QR Code Pix"
              className="w-56 h-56"
            />
          </div>
        </div>

        {/* Copia e Cola */}
        {payment.pix_copy_paste && (
          <button
            onClick={() => handleCopy(payment.pix_copy_paste!)}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all"
          >
            {copied ? (
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm text-muted-foreground truncate flex-1 text-left">
              {payment.pix_copy_paste}
            </span>
          </button>
        )}

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Aguardando pagamento...
        </div>

        <p className="text-xs text-center text-muted-foreground">
          O pagamento será confirmado automaticamente em segundos após o Pix.
        </p>
      </div>
    );
  }

  // Boleto
  if (payment.method === "boleto" && (payment.boleto_url || payment.invoice_url)) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Boleto gerado!</h2>
          <p className="text-sm text-muted-foreground">
            O pagamento será confirmado em até 2 dias úteis após o pagamento.
          </p>
        </div>

        <PrimaryButton
          fullWidth
          onClick={() => window.open(payment.boleto_url || payment.invoice_url || "", "_blank")}
        >
          Abrir Boleto
        </PrimaryButton>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Aguardando pagamento do boleto...
        </div>
      </div>
    );
  }

  // Cartão pendente
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <h2 className="text-lg font-semibold text-foreground">Processando pagamento...</h2>
      <p className="text-sm text-muted-foreground text-center">
        Aguarde enquanto confirmamos seu pagamento.
      </p>
    </div>
  );
}

// Página principal de Checkout
export default function ClientCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const { data: hasCustomer, isLoading: customerLoading } = useHasAsaasCustomer();
  const { data: existingPayment } = usePaymentByOrder(orderId);

  const [step, setStep] = useState<"cpf" | "payment" | "confirmation">("cpf");

  // Definir step inicial baseado no estado
  useEffect(() => {
    if (customerLoading) return;

    if (existingPayment) {
      setStep("confirmation");
    } else if (hasCustomer) {
      setStep("payment");
    } else {
      setStep("cpf");
    }
  }, [hasCustomer, customerLoading, existingPayment]);

  if (!orderId) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Pedido não encontrado</p>
            <PrimaryButton onClick={() => navigate("/client/home")}>
              Voltar ao início
            </PrimaryButton>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (orderLoading || customerLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="fixed inset-0 bg-background flex flex-col safe-top">
        {/* Header */}
        <header className="flex-shrink-0 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === "payment") setStep("cpf");
                else navigate(-1);
              }}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {step === "cpf" && "Dados para pagamento"}
              {step === "payment" && "Pagamento"}
              {step === "confirmation" && "Confirmação"}
            </h1>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mt-3">
            {["cpf", "payment", "confirmation"].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ["cpf", "payment", "confirmation"].indexOf(step) >= i
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {step === "cpf" && (
            <CpfStep onComplete={() => setStep("payment")} />
          )}

          {step === "payment" && order && (
            <PaymentStep
              orderId={orderId!}
              orderTotal={order.total_price}
              serviceName={(order as any).service?.name || "Serviço de limpeza"}
              onPaymentCreated={() => setStep("confirmation")}
            />
          )}

          {step === "confirmation" && orderId && (
            <ConfirmationStep orderId={orderId} />
          )}
        </main>

        <BottomNav variant="client" />
      </div>
    </PageTransition>
  );
}
