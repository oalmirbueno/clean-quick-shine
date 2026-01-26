import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

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

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch pro profile
      const { data: proProfile } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch metrics
      const { data: metrics } = await supabase
        .from("pro_metrics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch active subscription with plan
      const { data: subscription } = await supabase
        .from("pro_subscriptions")
        .select("*, plan:pro_plans(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      // Calculate balance from completed orders (simplified - in production this would be more complex)
      const { data: completedOrders } = await supabase
        .from("orders")
        .select("total_price")
        .eq("pro_id", user.id)
        .in("status", ["completed", "rated"]);

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

      // Get orders in matching status (not yet assigned)
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .is("pro_id", null)
        .in("status", ["scheduled", "matching"])
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(10);

      if (error || !orders || orders.length === 0) return [];

      // Get service and address details
      const serviceIds = [...new Set(orders.map(o => o.service_id))];
      const addressIds = [...new Set(orders.map(o => o.address_id))];

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

      return orders.map(order => {
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

        // Simplified distance calculation (random for now - in production would use real geo)
        const distance = Math.round((Math.random() * 5 + 0.5) * 10) / 10;

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
