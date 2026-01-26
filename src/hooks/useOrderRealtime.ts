import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
          
          const newOrder = payload.new as Order;
          const oldOrder = payload.old as Partial<Order>;
          
          // Show status change notification
          if (newOrder.status !== oldOrder.status) {
            const statusMessages: Record<string, string> = {
              en_route: "🚗 O profissional está a caminho!",
              in_progress: "🧹 O serviço foi iniciado!",
              completed: "✅ Serviço concluído! Avalie sua experiência.",
              cancelled: "❌ O pedido foi cancelado.",
            };
            
            if (statusMessages[newOrder.status || ""]) {
              toast.info(statusMessages[newOrder.status || ""], {
                duration: 5000,
              });
            }
          }
          
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
  const previousOrdersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    // Subscribe to orders where pro_id matches OR where pro_id is being set to this user
    const channel = supabase
      .channel(`pro-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `pro_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("New order assigned via realtime:", payload.new);
          
          const newOrder = payload.new as Order;
          
          // Fetch service name for the notification
          const { data: service } = await supabase
            .from("services")
            .select("name")
            .eq("id", newOrder.service_id)
            .maybeSingle();
          
          toast.success(
            `🎉 Novo pedido atribuído! ${service?.name || "Serviço"} - R$ ${(Number(newOrder.total_price) * 0.8).toFixed(2).replace(".", ",")}`,
            {
              duration: 8000,
              action: {
                label: "Ver",
                onClick: () => {
                  window.location.href = `/pro/order/${newOrder.id}`;
                },
              },
            }
          );
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ["pro_orders", userId] });
          queryClient.invalidateQueries({ queryKey: ["pro_earnings", userId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `pro_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("Pro order updated via realtime:", payload);
          
          const newOrder = payload.new as Order;
          const oldOrder = payload.old as Partial<Order>;
          
          // Check if pro_id just got assigned (wasn't set before, now it is)
          if (!oldOrder.pro_id && newOrder.pro_id === userId) {
            // Fetch service name for the notification
            const { data: service } = await supabase
              .from("services")
              .select("name")
              .eq("id", newOrder.service_id)
              .maybeSingle();
            
            toast.success(
              `🎉 Novo pedido atribuído! ${service?.name || "Serviço"} - R$ ${(Number(newOrder.total_price) * 0.8).toFixed(2).replace(".", ",")}`,
              {
                duration: 8000,
                action: {
                  label: "Ver",
                  onClick: () => {
                    window.location.href = `/pro/order/${newOrder.id}`;
                  },
                },
              }
            );
          }
          
          // Check for cancellation
          if (newOrder.status === "cancelled" && oldOrder.status !== "cancelled") {
            toast.error("⚠️ Um pedido foi cancelado pelo cliente.", {
              duration: 5000,
            });
          }
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ["pro_orders", userId] });
          queryClient.invalidateQueries({ queryKey: ["pro_earnings", userId] });
          queryClient.invalidateQueries({ queryKey: ["order", newOrder.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

// Global notification hook for use in the app shell
export function useGlobalProNotifications(userId: string | null, isPro: boolean) {
  useEffect(() => {
    if (!userId || !isPro) return;

    // Listen for any order that gets assigned to this pro
    const channel = supabase
      .channel(`pro-global-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          const newOrder = payload.new as Order;
          const oldOrder = payload.old as Partial<Order>;
          
          // Check if this order just got assigned to the current pro
          if (newOrder.pro_id === userId && oldOrder.pro_id !== userId) {
            const { data: service } = await supabase
              .from("services")
              .select("name")
              .eq("id", newOrder.service_id)
              .maybeSingle();
            
            toast.success(
              `🎉 Novo pedido! ${service?.name || "Serviço"}`,
              {
                duration: 8000,
                description: `Ganho: R$ ${(Number(newOrder.total_price) * 0.8).toFixed(2).replace(".", ",")}`,
                action: {
                  label: "Ver detalhes",
                  onClick: () => {
                    window.location.href = `/pro/order/${newOrder.id}`;
                  },
                },
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isPro]);
}
