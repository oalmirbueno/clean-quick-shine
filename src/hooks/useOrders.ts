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

      // Fetch orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("client_id", user.id)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false });

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Get unique service IDs and address IDs
      const serviceIds = [...new Set(orders.map(o => o.service_id))];
      const addressIds = [...new Set(orders.map(o => o.address_id))];
      const proIds = [...new Set(orders.filter(o => o.pro_id).map(o => o.pro_id!))];

      // Fetch services
      const { data: services } = await supabase
        .from("services")
        .select("id, name, icon")
        .in("id", serviceIds);

      // Fetch addresses
      const { data: addresses } = await supabase
        .from("addresses")
        .select("id, label, street, number, neighborhood, city, state")
        .in("id", addressIds);

      // Fetch pro profiles if any
      let proProfiles: { user_id: string; full_name: string | null; avatar_url: string | null }[] = [];
      if (proIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", proIds);
        proProfiles = data || [];
      }

      // Merge data
      const ordersWithDetails: OrderWithDetails[] = orders.map(order => ({
        ...order,
        service: services?.find(s => s.id === order.service_id) || null,
        address: addresses?.find(a => a.id === order.address_id) || null,
        pro_profile: order.pro_id 
          ? proProfiles.find(p => p.user_id === order.pro_id) || null 
          : null,
      }));

      return ordersWithDetails;
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
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      if (!order) return null;

      // Fetch service
      const { data: service } = await supabase
        .from("services")
        .select("id, name, icon, description, duration_hours, base_price")
        .eq("id", order.service_id)
        .maybeSingle();

      // Fetch address
      const { data: address } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", order.address_id)
        .maybeSingle();

      // Fetch pro profile if assigned
      let proProfile = null;
      if (order.pro_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, phone")
          .eq("user_id", order.pro_id)
          .maybeSingle();

        const { data: proPro } = await supabase
          .from("pro_profiles")
          .select("rating, jobs_done, verified")
          .eq("user_id", order.pro_id)
          .maybeSingle();

        proProfile = { ...profile, ...proPro };
      }

      return {
        ...order,
        service,
        address,
        pro_profile: proProfile,
      };
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
        .select("*")
        .eq("pro_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Get unique service IDs and address IDs
      const serviceIds = [...new Set(orders.map(o => o.service_id))];
      const addressIds = [...new Set(orders.map(o => o.address_id))];
      const clientIds = [...new Set(orders.map(o => o.client_id))];

      // Fetch services
      const { data: services } = await supabase
        .from("services")
        .select("id, name, icon")
        .in("id", serviceIds);

      // Fetch addresses
      const { data: addresses } = await supabase
        .from("addresses")
        .select("id, label, street, number, neighborhood, city, state")
        .in("id", addressIds);

      // Fetch client profiles
      const { data: clientProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, phone")
        .in("user_id", clientIds);

      // Merge data
      const ordersWithDetails = orders.map(order => ({
        ...order,
        service: services?.find(s => s.id === order.service_id) || null,
        address: addresses?.find(a => a.id === order.address_id) || null,
        client_profile: clientProfiles?.find(p => p.user_id === order.client_id) || null,
      }));

      return ordersWithDetails;
    },
    enabled: !!user?.id,
  });
}
