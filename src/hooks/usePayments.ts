import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

      if (error) throw new Error(error.message || "Erro ao cadastrar no gateway");
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
    mutationFn: async ({
      orderId,
      billingType,
      creditCard,
      creditCardHolderInfo,
    }: {
      orderId: string;
      billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
      creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
      };
      creditCardHolderInfo?: {
        name: string;
        email: string;
        cpfCnpj: string;
        postalCode: string;
        addressNumber: string;
        phone: string;
      };
    }) => {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { orderId, billingType, creditCard, creditCardHolderInfo },
      });

      if (error) throw new Error(error.message || "Erro ao processar pagamento");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });

      if (data.payment?.billingType === "PIX") {
        toast.success("Pix gerado! Escaneie o QR Code para pagar.");
      } else if (data.payment?.billingType === "CREDIT_CARD") {
        if (data.payment?.status === "CONFIRMED") {
          toast.success("Pagamento confirmado!");
        } else {
          toast.info("Pagamento em processamento...");
        }
      } else if (data.payment?.billingType === "BOLETO") {
        toast.success("Boleto gerado! Pague até o vencimento.");
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
