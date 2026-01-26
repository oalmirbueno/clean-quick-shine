import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];

export function useUpdateOrderStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const updateData: { status: OrderStatus; updated_at: string; completed_at?: string } = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add completed_at timestamp when order is completed
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .eq("pro_id", user.id); // Only the assigned pro can update

      if (error) {
        console.error("Error updating order status:", error);
        throw new Error("Erro ao atualizar status do pedido");
      }

      return { orderId, status };
    },
    onSuccess: (data) => {
      const statusMessages: Record<string, string> = {
        en_route: "Status atualizado: A caminho!",
        in_progress: "Serviço iniciado!",
        completed: "Serviço concluído! Aguardando avaliação.",
      };
      toast.success(statusMessages[data.status] || "Status atualizado!");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["pro_orders"] });
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast.error(error.message || "Erro ao atualizar pedido");
    },
  });
}
