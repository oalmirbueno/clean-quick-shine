import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns services the current pro is eligible to accept,
 * filtering out requires_pro_plan services if the pro is on the free plan.
 */
export function useProEligibleServices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pro_eligible_services", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch pro subscription and all active services in parallel
      const [subRes, servicesRes] = await Promise.all([
        supabase
          .from("pro_subscriptions")
          .select("plan_id, plan:pro_plans(type)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("services")
          .select("*")
          .eq("active", true)
          .order("base_price"),
      ]);

      const planType = (subRes.data?.plan as any)?.type || "free";
      const services = servicesRes.data || [];
      const isPaid = planType === "pro" || planType === "elite";

      // Filter: free pros don't see requires_pro_plan services
      return services.filter((s: any) => isPaid || !s.requires_pro_plan);
    },
    enabled: !!user?.id,
  });
}
