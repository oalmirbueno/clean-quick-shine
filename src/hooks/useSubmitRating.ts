import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SubmitRatingInput {
  orderId: string;
  rating: number;
  review?: string;
  tags?: string[];
}

export function useSubmitRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitRatingInput) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Verify the order belongs to this client and is completed
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, client_id, pro_id, status, client_rating")
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

      if (order.status !== "completed") {
        throw new Error("O pedido ainda não foi concluído");
      }

      if (order.client_rating) {
        throw new Error("Este pedido já foi avaliado");
      }

      // Build review text including tags if any
      let fullReview = input.review || "";
      if (input.tags && input.tags.length > 0) {
        const tagLabels: Record<string, string> = {
          punctuality: "Pontualidade",
          quality: "Qualidade",
          organization: "Organização",
          politeness: "Educação",
        };
        const tagText = input.tags.map(t => tagLabels[t] || t).join(", ");
        fullReview = fullReview 
          ? `${fullReview}\n\nDestaques: ${tagText}`
          : `Destaques: ${tagText}`;
      }

      // Update order with client rating
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          client_rating: input.rating,
          client_review: fullReview || null,
          status: "rated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.orderId)
        .eq("client_id", user.id);

      if (updateError) {
        console.error("Error submitting rating:", updateError);
        throw new Error("Erro ao enviar avaliação");
      }

      // Update pro's average rating if pro exists
      if (order.pro_id) {
        // Get all ratings for this pro
        const { data: proOrders } = await supabase
          .from("orders")
          .select("client_rating")
          .eq("pro_id", order.pro_id)
          .not("client_rating", "is", null);

        if (proOrders && proOrders.length > 0) {
          const totalRating = proOrders.reduce((sum, o) => sum + (o.client_rating || 0), 0);
          const avgRating = totalRating / proOrders.length;

          // Update pro profile with new average
          await supabase
            .from("pro_profiles")
            .update({
              rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
              jobs_done: proOrders.length,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", order.pro_id);
        }
      }

      return { orderId: input.orderId };
    },
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: (error) => {
      console.error("Rating error:", error);
      toast.error(error.message || "Erro ao enviar avaliação");
    },
  });
}
