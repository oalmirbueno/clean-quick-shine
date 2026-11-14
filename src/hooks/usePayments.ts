import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/** Em resposta 4xx/5xx o texto do erro vem no corpo; sem isto a pessoa só vê uma frase técnica. */
async function motivoDoErro(error: unknown, padrao: string): Promise<string> {
  try {
    const corpo = await (error as any)?.context?.json?.();
    if (corpo?.error) return String(corpo.error);
  } catch {
    /* sem corpo */
  }
  return padrao;
}

/** Confere os dois dígitos verificadores do CPF. */
export function cpfValido(valor: string): boolean {
  const c = valor.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const digito = (ate: number) => {
    let soma = 0;
    for (let i = 0; i < ate; i++) soma += Number(c[i]) * (ate + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(c[9]) && digito(10) === Number(c[10]);
}

// Hook para cadastrar cliente no Asaas (precisa de CPF)
export function useCreateAsaasCustomer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, cpfCnpj, phone }: {
      name: string;
      email: string;
      cpfCnpj: string;
      phone?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-asaas-customer", {
        body: { name, email, cpfCnpj, phone },
      });

      if (error) throw new Error(await motivoDoErro(error, "Não foi possível cadastrar agora. Tente de novo."));
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("CPF cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao cadastrar CPF");
    },
  });
}

// Hook para criar pagamento
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, billingType }: {
      orderId: string;
      billingType: "PIX" | "CREDIT_CARD";
    }) => {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { orderId, billingType },
      });

      if (error) throw new Error(await motivoDoErro(error, "Não foi possível gerar o pagamento. Tente de novo."));
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });

      if (data.payment?.billingType === "PIX") {
        toast.success("Pix gerado! Escaneie o QR Code para pagar.");
      } else if (data.payment?.billingType === "CREDIT_CARD") {
        toast.success("Abrimos a página segura do cartão.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro no pagamento. Tente novamente.");
    },
  });
}

// Hook para buscar pagamento de um pedido
export function usePaymentByOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    refetchInterval: (query) => {
      const payment = query.state.data;
      if (payment && payment.status === "pending") {
        return 5000;
      }
      return false;
    },
  });
}

// Hook para verificar se profile tem asaas_customer_id
export function useHasAsaasCustomer() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["asaas_customer", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from("profiles")
        .select("asaas_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data?.asaas_customer_id;
    },
    enabled: !!user?.id,
  });
}
