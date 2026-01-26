import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CancelOrderInput {
  orderId: string;
  reason?: string;
  penaltyAmount?: number;
}

export function useCancelOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CancelOrderInput) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Verify the order belongs to this client and can be cancelled
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, client_id, status, total_price")
        .eq("id", input.orderId)
        .eq("client_id", user.id)
        .maybeSingle();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        throw new Error("Erro ao buscar pedido");
      }

      if (!order) {
        throw new Error("Pedido não encontrado");
      }

      const cancellableStatuses = ["draft", "scheduled", "matching", "confirmed", "en_route", "in_progress"];
      if (!cancellableStatuses.includes(order.status || "")) {
        throw new Error("Este pedido não pode mais ser cancelado");
      }

      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.orderId)
        .eq("client_id", user.id);

      if (updateError) {
        console.error("Error cancelling order:", updateError);
        throw new Error("Erro ao cancelar pedido");
      }

      return { 
        orderId: input.orderId, 
        penaltyAmount: input.penaltyAmount || 0,
        refundAmount: Number(order.total_price) - (input.penaltyAmount || 0),
      };
    },
    onSuccess: (data) => {
      if (data.penaltyAmount > 0) {
        toast.success(`Pedido cancelado. Multa: R$ ${data.penaltyAmount.toFixed(2).replace(".", ",")}. Reembolso: R$ ${data.refundAmount.toFixed(2).replace(".", ",")}`);
      } else {
        toast.success("Pedido cancelado. Reembolso integral em até 7 dias úteis.");
      }
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["pro_orders"] });
    },
    onError: (error) => {
      console.error("Cancel error:", error);
      toast.error(error.message || "Erro ao cancelar pedido");
    },
  });
}

// Default cancellation settings (could be fetched from DB in the future)
export const CANCEL_SETTINGS = {
  cancelFreeHours: 24, // Hours before service for free cancellation
  cancelPenaltyPercent: 30, // Penalty percentage after free window
  refundPolicyText: "Cancelamentos realizados com mais de 24 horas de antecedência são gratuitos. Após esse período, será cobrada uma taxa de 30% do valor total do serviço. O reembolso será processado em até 7 dias úteis.",
};
