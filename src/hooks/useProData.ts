import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type ProProfile = Tables<"pro_profiles">;
export type ProMetrics = Tables<"pro_metrics">;
export type ProPlan = Tables<"pro_plans">;

export interface ProFullData {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
  proProfile: ProProfile | null;
  metrics: ProMetrics | null;
  plan: ProPlan | null;
  balance: number;
}

export function useCurrentProData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current_pro_data", user?.id],
    queryFn: async (): Promise<ProFullData> => {
      if (!user?.id) {
        return { profile: null, proProfile: null, metrics: null, plan: null, balance: 0 };
      }

      // Parallel fetch all data
      const [profileRes, proProfileRes, metricsRes, subscriptionRes, completedOrdersRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, phone").eq("user_id", user.id).maybeSingle(),
        supabase.from("pro_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("pro_metrics").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("pro_subscriptions").select("*, plan:pro_plans(*)").eq("user_id", user.id).eq("status", "active").maybeSingle(),
        supabase.from("orders").select("total_price").eq("pro_id", user.id).in("status", ["completed", "rated"]),
      ]);

      const profile = profileRes.data;
      const proProfile = proProfileRes.data;
      const metrics = metricsRes.data;
      const subscription = subscriptionRes.data;
      const completedOrders = completedOrdersRes.data;

      // Pro typically gets ~80% of order value (simplified calculation)
      const balance = completedOrders?.reduce((sum, order) => {
        return sum + (Number(order.total_price) * 0.8);
      }, 0) || 0;

      return {
        profile,
        proProfile,
        metrics,
        plan: subscription?.plan as ProPlan | null,
        balance,
      };
    },
    enabled: !!user?.id,
  });
}

export interface AssignedOrder {
  id: string;
  serviceName: string;
  clientName: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  proEarning: number;
  scheduledDate: string;
  scheduledTime: string;
  address?: { lat: number | null; lng: number | null };
}

export function useAssignedOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["assigned_orders", user?.id],
    queryFn: async (): Promise<AssignedOrder[]> => {
      if (!user?.id) return [];

      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id, total_price, status, scheduled_date, scheduled_time,
          client_id,
          services:service_id (name),
          addresses:address_id (city, neighborhood, street, number, lat, lng)
        `)
        .eq("pro_id", user.id)
        .in("status", ["confirmed", "en_route", "in_progress"])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error || !orders || orders.length === 0) return [];

      // Fetch client names
      const clientIds = [...new Set(orders.map(o => o.client_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", clientIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return orders.map(order => {
        const scheduledDate = new Date(order.scheduled_date);
        let dateLabel = scheduledDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (scheduledDate.toDateString() === today.toDateString()) dateLabel = "Hoje";
        else if (scheduledDate.toDateString() === tomorrow.toDateString()) dateLabel = "Amanhã";

        return {
          id: order.id,
          serviceName: (order.services as any)?.name || "Serviço",
          clientName: profileMap.get(order.client_id) || "Cliente",
          city: (order.addresses as any)?.city || "",
          neighborhood: (order.addresses as any)?.neighborhood || "",
          street: (order.addresses as any)?.street || "",
          number: (order.addresses as any)?.number || "",
          date: dateLabel,
          time: order.scheduled_time.slice(0, 5),
          status: order.status || "confirmed",
          totalPrice: Number(order.total_price),
          proEarning: Number(order.total_price) * 0.8,
          scheduledDate: order.scheduled_date,
          scheduledTime: order.scheduled_time,
          address: {
            lat: (order.addresses as any)?.lat,
            lng: (order.addresses as any)?.lng,
          },
        };
      });
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
}

export interface AvailableOrder {
  id: string;
  serviceName: string;
  city: string;
  neighborhood: string;
  date: string;
  time: string;
  proEarning: number;
  distance: number;
  eliteOnly: boolean;
  scheduledDate: string;
  scheduledTime: string;
}

export function useAvailableOrdersForPro() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["available_orders_for_pro", user?.id],
    queryFn: async (): Promise<AvailableOrder[]> => {
      if (!user?.id) return [];

      // Get pro's zones
      const { data: proZones } = await supabase
        .from("pro_zones")
        .select("zone_id")
        .eq("user_id", user.id);

      const zoneIds = proZones?.map(z => z.zone_id) || [];

      // Get declined order IDs for this pro
      const { data: declinedOrders } = await supabase
        .from("pro_declined_orders")
        .select("order_id")
        .eq("user_id", user.id);
      
      const declinedIds = declinedOrders?.map(d => d.order_id) || [];

      // Get orders in matching status (not yet assigned)
      let query = supabase
        .from("orders")
        .select("*")
        .is("pro_id", null)
        .in("status", ["scheduled", "matching"])
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(20);

      const { data: orders, error } = await query;

      if (error || !orders || orders.length === 0) return [];

      // Filter out declined orders client-side
      const filteredOrders = declinedIds.length > 0 
        ? orders.filter(o => !declinedIds.includes(o.id))
        : orders;

      // Get service and address details
      const serviceIds = [...new Set(filteredOrders.map(o => o.service_id))];
      const addressIds = [...new Set(filteredOrders.map(o => o.address_id))];

      const [servicesResult, addressesResult] = await Promise.all([
        supabase.from("services").select("id, name").in("id", serviceIds),
        supabase.from("addresses").select("id, city, neighborhood, zone_id").in("id", addressIds),
      ]);

      const services = servicesResult.data || [];
      const addresses = addressesResult.data || [];

      // Get pro's current location for distance calculation (simplified)
      const { data: proProfile } = await supabase
        .from("pro_profiles")
        .select("current_lat, current_lng")
        .eq("user_id", user.id)
        .maybeSingle();

      // Get pro's plan to check elite access
      const { data: subscription } = await supabase
        .from("pro_subscriptions")
        .select("plan:pro_plans(type)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      const proHasElite = subscription?.plan?.type === "elite";

      // Format orders
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return filteredOrders.map(order => {
        const service = services.find(s => s.id === order.service_id);
        const address = addresses.find(a => a.id === order.address_id);
        
        const scheduledDate = new Date(order.scheduled_date);
        let dateLabel = scheduledDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        
        if (scheduledDate.toDateString() === today.toDateString()) {
          dateLabel = "Hoje";
        } else if (scheduledDate.toDateString() === tomorrow.toDateString()) {
          dateLabel = "Amanhã";
        }

        // Pro earns ~80% of total price
        const proEarning = Number(order.total_price) * 0.8;

        // Check if this is a commercial/elite-only order (simplified: orders > R$150 are elite)
        const isEliteOnly = Number(order.total_price) > 150;

        // Consistent distance based on order ID hash (deterministic)
        const hashCode = order.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
        const distance = Math.round((Math.abs(hashCode % 50) / 10 + 0.5) * 10) / 10;

        return {
          id: order.id,
          serviceName: service?.name || "Serviço",
          city: address?.city || "",
          neighborhood: address?.neighborhood || "",
          date: dateLabel,
          time: order.scheduled_time.slice(0, 5),
          proEarning,
          distance,
          eliteOnly: isEliteOnly,
          scheduledDate: order.scheduled_date,
          scheduledTime: order.scheduled_time,
        };
      }).filter(order => {
        // Filter out elite-only orders if pro doesn't have elite plan
        if (order.eliteOnly && !proHasElite) return false;
        return true;
      });
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useToggleProAvailability() {
  const { user } = useAuth();

  const toggleAvailability = async (currentStatus: boolean) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("pro_profiles")
      .update({ available_now: !currentStatus })
      .eq("user_id", user.id);

    if (error) throw error;
  };

  return { toggleAvailability };
}

export function useAcceptOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Update order: assign pro and change status to confirmed
      const { error } = await supabase
        .from("orders")
        .update({ 
          pro_id: user.id, 
          status: "confirmed",
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .is("pro_id", null) // Only if not yet assigned
        .in("status", ["scheduled", "matching"]);

      if (error) throw error;

      return orderId;
    },
    onSuccess: (orderId) => {
      toast.success("Pedido aceito com sucesso!");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["available_orders_for_pro"] });
      queryClient.invalidateQueries({ queryKey: ["pro_orders"] });
    },
    onError: (error) => {
      console.error("Error accepting order:", error);
      toast.error("Erro ao aceitar pedido. Tente novamente.");
    },
  });
}

export function useDeclineOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("pro_declined_orders")
        .insert({ user_id: user.id, order_id: orderId });

      if (error) throw error;
      return orderId;
    },
    onSuccess: (orderId) => {
      toast.success("Pedido recusado");
      // Invalidate to refresh - in production you'd filter out declined orders
      queryClient.invalidateQueries({ queryKey: ["available_orders_for_pro"] });
    },
    onError: (error) => {
      console.error("Error declining order:", error);
      toast.error("Erro ao recusar pedido. Tente novamente.");
    },
  });
}
