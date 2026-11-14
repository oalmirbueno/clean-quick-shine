import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAsaasCustomer, cpfValido } from "@/hooks/usePayments";
import { usePlano, type TipoDePlano, type Plano } from "@/hooks/usePlano";

const reais = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const formatCpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

/** Lista de planos com mensalidade no cartão (cliente ou diarista). */
export function PlanosMensais({ kind }: { kind: TipoDePlano }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const { plans, subscription, assinar, cancelar } = usePlano(kind);
  const criarCliente = useCreateAsaasCustomer();

  const [pedeCpf, setPedeCpf] = useState<Plano | null>(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [aguardando, setAguardando] = useState(false);
  const [confirmaCancelar, setConfirmaCancelar] = useState(false);

  const sub = subscription.data;

  // Voltou da página do cartão: espera o Asaas avisar o servidor.
  useEffect(() => {
    const volta = params.get("pagamento");
    if (!volta) return;
    if (volta === "ok") setAguardando(true);
    else toast.info("O pagamento do plano não foi concluído.");
    params.delete("pagamento");
    setParams(params, { replace: true });
  }, [params, setParams]);

  useEffect(() => {
    if (!aguardando) return;
    if (sub?.status === "active") {
      setAguardando(false);
      return;
    }
    const t = setInterval(() => qc.invalidateQueries({ queryKey: ["assinatura", kind] }), 4000);
    const fim = setTimeout(() => setAguardando(false), 120000);
    return () => {
      clearInterval(t);
      clearTimeout(fim);
    };
  }, [aguardando, sub?.status, qc, kind]);

  const iniciar = async (plano: Plano) => {
    try {
      await assinar.mutateAsync(plano.id);
      setAguardando(true);
    } catch (e: any) {
      if (e?.code === "cpf") setPedeCpf(plano);
    }
  };

  const salvarCpf = async () => {
    const limpo = cpf.replace(/\D/g, "");
    if (!nome.trim()) return toast.error("Preencha seu nome completo");
    if (!cpfValido(limpo)) return toast.error("CPF inválido. Confira os números.");
    try {
      await criarCliente.mutateAsync({ name: nome.trim(), email: user?.email || "", cpfCnpj: limpo });
    } catch {
      return;
    }
    const plano = pedeCpf!;
    setPedeCpf(null);
    iniciar(plano);
  };

  if (plans.isLoading || subscription.isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  const lista = plans.data || [];
  const pagos = lista.filter((p) => p.monthly_price > 0);
  const planoAtual = sub ? lista.find((p) => p.id === sub.plan_id) : null;

  return (
    <div className="space-y-4">
      {aguardando && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/60 border border-border/60">
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
          <p className="text-sm text-foreground">
            Conclua o pagamento na página do cartão. Assim que for aprovado, o plano aparece aqui.
          </p>
        </div>
      )}

      {sub && (
        <section className="p-5 rounded-2xl border border-primary/25 bg-primary/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {sub.status === "paused" ? "Plano pausado (pagamento não passou)" : "Seu plano"}
              </p>
              <p className="font-semibold text-foreground truncate">{planoAtual?.name || "Plano Já Limpo"}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {sub.renew_at
              ? `Próxima cobrança no cartão: ${new Date(sub.renew_at).toLocaleDateString("pt-BR")}.`
              : "Cobrança mensal automática no cartão."}
          </p>
          <button
            onClick={() => setConfirmaCancelar(true)}
            className="text-sm font-medium text-destructive underline-offset-4 hover:underline"
          >
            Cancelar plano
          </button>
        </section>
      )}

      {!sub && pagos.length === 0 && (
        <div className="p-8 rounded-2xl border border-border/60 bg-card text-center">
          <p className="font-medium text-foreground">Planos em breve</p>
          <p className="text-sm text-muted-foreground mt-1">
            Estamos fechando os planos mensais. Avisaremos por aqui.
          </p>
        </div>
      )}

      {!sub &&
        pagos.map((plano) => (
          <section key={plano.id} className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">{plano.name}</h3>
              <p className="text-foreground">
                <span className="text-2xl font-bold">{reais(plano.monthly_price)}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </p>
            </div>
            {plano.features.length > 0 && (
              <ul className="space-y-1.5">
                {plano.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <PrimaryButton
              fullWidth
              loading={assinar.isPending && assinar.variables === plano.id}
              disabled={assinar.isPending}
              onClick={() => iniciar(plano)}
            >
              <span className="inline-flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Assinar no cartão de crédito
              </span>
            </PrimaryButton>
          </section>
        ))}

      {!sub && pagos.length > 0 && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground px-1">
          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Cobrança mensal automática no cartão de crédito, em página segura do Asaas. Cancele quando quiser.
        </p>
      )}

      <Dialog open={!!pedeCpf} onOpenChange={(o) => !o && setPedeCpf(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dados para o pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Precisamos do seu nome e CPF para emitir a cobrança.</p>
            <InputField label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            <InputField
              label="CPF"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
            />
            <PrimaryButton fullWidth loading={criarCliente.isPending} onClick={salvarCpf}>
              Continuar
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={confirmaCancelar}
        onClose={() => setConfirmaCancelar(false)}
        onConfirm={() => {
          setConfirmaCancelar(false);
          cancelar.mutate();
        }}
        title="Cancelar o plano?"
        description="As cobranças no cartão param e os benefícios do plano deixam de valer."
        confirmText="Cancelar plano"
        cancelText="Manter plano"
        variant="danger"
      />
    </div>
  );
}
