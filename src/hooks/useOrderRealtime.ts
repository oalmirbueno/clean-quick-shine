import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export function useOrderRealtime(orderId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Order updated via realtime:", payload.new);
          
          // Invalidate and refetch the order query
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
          queryClient.invalidateQueries({ queryKey: ["client_orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);
}

export function useClientOrdersRealtime(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`client-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `client_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Client orders updated via realtime:", payload);
          
          // Invalidate and refetch client orders
          queryClient.invalidateQueries({ queryKey: ["client_orders", userId] });
          
          // Also invalidate the specific order if it was updated
          if (payload.eventType === "UPDATE" && payload.new) {
            const order = payload.new as Order;
            queryClient.invalidateQueries({ queryKey: ["order", order.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

export function useProOrdersRealtime(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`pro-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `pro_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Pro orders updated via realtime:", payload);
          
          // Invalidate and refetch pro orders
          queryClient.invalidateQueries({ queryKey: ["pro_orders", userId] });
          queryClient.invalidateQueries({ queryKey: ["pro_earnings", userId] });
          
          // Also invalidate the specific order if it was updated
          if (payload.eventType === "UPDATE" && payload.new) {
            const order = payload.new as Order;
            queryClient.invalidateQueries({ queryKey: ["order", order.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
