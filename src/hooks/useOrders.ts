import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type Order = Tables<"orders">;

export interface OrderWithDetails extends Order {
  service?: {
    name: string;
    icon: string | null;
  } | null;
  address?: {
    label: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  pro_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useClientOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client_orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, service:services(name, icon), address:addresses(label, street, number, neighborhood, city, state)")
        .eq("client_id", user.id)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false });

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Fetch pro profiles separately (cross-user RLS)
      const proIds = [...new Set(orders.filter(o => o.pro_id).map(o => o.pro_id!))];
      let proProfiles: { user_id: string; full_name: string | null; avatar_url: string | null }[] = [];
      if (proIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", proIds);
        proProfiles = data || [];
      }

      return orders.map(order => ({
        ...order,
        pro_profile: order.pro_id
          ? proProfiles.find(p => p.user_id === order.pro_id) || null
          : null,
      })) as OrderWithDetails[];
    },
    enabled: !!user?.id,
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data: order, error } = await supabase
        .from("orders")
        .select("*, service:services(id, name, icon, description, duration_hours, base_price), address:addresses(*)")
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      if (!order) return null;

      // Fetch pro profile if assigned (separate due to cross-user RLS)
      let proProfile = null;
      if (order.pro_id) {
        const [profileRes, proProRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name, avatar_url, phone").eq("user_id", order.pro_id).maybeSingle(),
          supabase.from("pro_profiles").select("rating, jobs_done, verified").eq("user_id", order.pro_id).maybeSingle(),
        ]);
        proProfile = { ...profileRes.data, ...proProRes.data };
      }

      return { ...order, pro_profile: proProfile };
    },
    enabled: !!orderId,
  });
}

export function useProOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pro_orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, service:services(id, name, icon), address:addresses(id, label, street, number, neighborhood, city, state)")
        .eq("pro_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Fetch client profiles separately (cross-user RLS)
      const clientIds = [...new Set(orders.map(o => o.client_id))];
      const { data: clientProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, phone")
        .in("user_id", clientIds);

      return orders.map(order => ({
        ...order,
        client_profile: clientProfiles?.find(p => p.user_id === order.client_id) || null,
      }));
    },
    enabled: !!user?.id,
  });
}
