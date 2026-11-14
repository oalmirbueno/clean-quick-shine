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
  cpfValido,
  useCreatePayment,
  usePaymentByOrder,
  useHasAsaasCustomer,
} from "@/hooks/usePayments";
import { ArrowLeft, CreditCard, QrCode, Copy, Check, Loader2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "PIX" | "CREDIT_CARD";

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
    if (!cpfValido(cleanCpf)) {
      toast.error("CPF inválido. Confira os números.");
      return;
    }
    if (!name.trim()) {
      toast.error("Preencha seu nome completo");
      return;
    }

    try {
      await createCustomer.mutateAsync({
        name: name.trim(),
        email: user?.email || "",
        cpfCnpj: cleanCpf,
      });
    } catch {
      return; // o aviso já apareceu; a pessoa continua nesta etapa
    }

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
  onPaymentCreated: (result: any) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const createPayment = useCreatePayment();

  const handlePay = async () => {
    if (!method) return;
    const result = await createPayment.mutateAsync({ orderId, billingType: method });
    // Cartão: os dados são digitados na página segura do Asaas, nunca no app.
    if (method === "CREDIT_CARD" && result?.payment?.invoiceUrl) {
      window.open(result.payment.invoiceUrl, "_blank");
    }
    onPaymentCreated(result);
  };

  const methods = [
    { id: "PIX" as PaymentMethod, icon: QrCode, label: "Pix", desc: "Aprovação instantânea" },
    { id: "CREDIT_CARD" as PaymentMethod, icon: CreditCard, label: "Cartão", desc: "Crédito ou débito, em página segura" },
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

      {method === "CREDIT_CARD" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent/60 border border-border/60">
          <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Você digita o cartão na página segura do Asaas, nosso parceiro de pagamentos.
            O Já Limpo não guarda o número do seu cartão.
          </p>
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
          {method === "CREDIT_CARD" && `Pagar R$ ${orderTotal.toFixed(2).replace(".", ",")} no cartão`}
        </PrimaryButton>
      )}
    </div>
  );
}

// Etapa 3: Confirmação / Aguardando pagamento
function ConfirmationStep({ orderId, paymentResult, onTrocar }: { orderId: string; paymentResult?: any; onTrocar?: () => void }) {
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

  // Derive values with paymentResult fallback
  const pixQrCode = payment?.pix_qr_code || paymentResult?.payment?.pixQrCode;
  const pixCopyPaste = payment?.pix_copy_paste || paymentResult?.payment?.pixCopyPaste;
  const paymentStatus = payment?.status;
  const paymentMethod = payment?.method || paymentResult?.payment?.billingType?.toLowerCase();
  const invoiceUrl = payment?.invoice_url || paymentResult?.payment?.invoiceUrl;
  const isPixWithQr = paymentMethod === "pix" && pixQrCode;

  useEffect(() => {
    if (paymentStatus === "confirmed" && !isPixWithQr) {
      const timer = setTimeout(() => {
        navigate(`/client/order-tracking?orderId=${orderId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
    // Sandbox may auto-confirm PIX — still show QR briefly
    if (paymentStatus === "confirmed" && isPixWithQr) {
      const timer = setTimeout(() => {
        navigate(`/client/order-tracking?orderId=${orderId}`);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, isPixWithQr, orderId, navigate]);

  if (isLoading && !paymentResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando pagamento...</p>
      </div>
    );
  }

  if (!payment && !paymentResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-muted-foreground">Pagamento não encontrado</p>
      </div>
    );
  }

  // PIX with QR Code (even if already confirmed in sandbox)
  if (isPixWithQr) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center text-center gap-2">
          {paymentStatus === "confirmed" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Pix confirmado!</h2>
              <p className="text-sm text-muted-foreground">Pagamento recebido com sucesso</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Pague com Pix</h2>
              <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código abaixo</p>
            </>
          )}
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code Pix" className="w-56 h-56" />
          </div>
        </div>

        {pixCopyPaste && (
          <button
            onClick={() => handleCopy(pixCopyPaste)}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all"
          >
            {copied ? (
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm text-muted-foreground truncate flex-1 text-left">
              {pixCopyPaste}
            </span>
          </button>
        )}

        {paymentStatus === "confirmed" ? (
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Check className="w-4 h-4" />
            <span className="font-medium">Pagamento confirmado! Redirecionando...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Aguardando pagamento...
          </div>
        )}
      </div>
    );
  }

  // Pagamento confirmado (non-PIX)
  if (paymentStatus === "confirmed") {
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

  // (PIX QR Code case already handled by isPixWithQr above)

  // Cartão: aguardando a pessoa concluir na página segura
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Pague com cartão</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Conclua o pagamento na página segura. Assim que ele for aprovado, esta tela avança sozinha.
        </p>
      </div>

      {invoiceUrl && (
        <PrimaryButton fullWidth onClick={() => window.open(invoiceUrl, "_blank")}>
          Abrir página do cartão
        </PrimaryButton>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Aguardando pagamento...
      </div>

      {onTrocar && (
        <button onClick={onTrocar} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Prefiro pagar com Pix
        </button>
      )}
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
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [escolherDeNovo, setEscolherDeNovo] = useState(false);

  // Definir step inicial baseado no estado
  useEffect(() => {
    if (customerLoading || escolherDeNovo) return;

    if (existingPayment && existingPayment.status !== "cancelled") {
      setStep("confirmation");
    } else if (hasCustomer) {
      setStep("payment");
    } else {
      setStep("cpf");
    }
  }, [hasCustomer, customerLoading, existingPayment, escolherDeNovo]);

  if (!orderId) {
    return (
      <PageTransition>
        <div className="h-full bg-background flex flex-col items-center justify-center p-6">
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
        <div className="h-full bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="h-full bg-background flex flex-col safe-top">
        {/* Header */}
        <header
          className="shrink-0 px-5 pt-3 pb-4"
          style={{ paddingTop: "max(var(--safe-area-inset-top, env(safe-area-inset-top, 0px)), 12px)" }}
        >
          <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (step === "payment") setStep("cpf");
                  else navigate(-1);
                }}
                className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground hover:bg-accent transition-colors shadow-sm"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[12px] text-muted-foreground leading-none mb-1">
                  Passo {["cpf", "payment", "confirmation"].indexOf(step) + 1} de 3
                </p>
                <h1 className="text-[18px] font-semibold text-foreground leading-tight tracking-tight">
                  {step === "cpf" && "Dados para pagamento"}
                  {step === "payment" && "Forma de pagamento"}
                  {step === "confirmation" && "Confirmação"}
                </h1>
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-1.5 mt-4">
              {["cpf", "payment", "confirmation"].map((s, i) => {
                const currentIdx = ["cpf", "payment", "confirmation"].indexOf(step);
                const active = currentIdx >= i;
                return (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      active ? "bg-primary" : "bg-border/60"
                    }`}
                  />
                );
              })}
            </div>
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
              onPaymentCreated={(result) => {
                setPaymentResult(result);
                setEscolherDeNovo(false);
                setStep("confirmation");
              }}
            />
          )}

          {step === "confirmation" && orderId && (
            <ConfirmationStep
              orderId={orderId}
              paymentResult={paymentResult}
              onTrocar={() => { setEscolherDeNovo(true); setPaymentResult(null); setStep("payment"); }}
            />
          )}
        </main>

        <BottomNav variant="client" />
      </div>
    </PageTransition>
  );
}
