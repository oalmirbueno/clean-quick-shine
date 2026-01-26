import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ProMetrics = Database["public"]["Tables"]["pro_metrics"]["Row"];
type QualityLevel = Database["public"]["Enums"]["quality_level"];

interface ProQualityData {
  metrics: ProMetrics | null;
  loading: boolean;
  error: Error | null;
}

export function useProMetrics(): ProQualityData {
  const { user } = useAuth();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["pro_metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("pro_metrics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    metrics: metrics ?? null,
    loading: isLoading,
    error: error as Error | null,
  };
}

// Hook to get SLA rules for comparison
export function useSlaRules() {
  return useQuery({
    queryKey: ["sla_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sla_rules")
        .select("*")
        .eq("active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

// Calculate quality level based on metrics
export function calculateQualityLevel(
  onTimeRate: number,
  cancelRate: number,
  responseTimeAvg: number
): QualityLevel {
  if (onTimeRate >= 95 && cancelRate <= 3 && responseTimeAvg <= 5) {
    return "A";
  } else if (onTimeRate >= 90 && cancelRate <= 5 && responseTimeAvg <= 10) {
    return "B";
  } else if (onTimeRate >= 80 && cancelRate <= 10 && responseTimeAvg <= 15) {
    return "C";
  }
  return "D";
}

// Hook to get ranking data for all pros in the same zone
export function useProRanking() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pro_ranking", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get current pro's profile and zone
      const { data: currentProProfile } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Get current pro's zones
      const { data: proZones } = await supabase
        .from("pro_zones")
        .select("zone_id")
        .eq("user_id", user.id);

      const zoneIds = proZones?.map(z => z.zone_id) || [];

      // Get all pros in same zones for ranking comparison
      let competitorsQuery = supabase
        .from("pro_profiles")
        .select(`
          user_id,
          rating,
          jobs_done,
          verified,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq("verified", true)
        .order("rating", { ascending: false })
        .order("jobs_done", { ascending: false })
        .limit(100);

      const { data: allPros } = await competitorsQuery;

      // Get current user's metrics
      const { data: myMetrics } = await supabase
        .from("pro_metrics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Calculate rank
      const sortedPros = (allPros || []).sort((a, b) => {
        if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
        return (b.jobs_done || 0) - (a.jobs_done || 0);
      });

      const myRank = sortedPros.findIndex(p => p.user_id === user.id) + 1;

      return {
        profile: currentProProfile,
        metrics: myMetrics,
        rank: myRank || sortedPros.length + 1,
        totalPros: sortedPros.length || 1,
        percentile: myRank ? Math.round(((sortedPros.length - myRank + 1) / sortedPros.length) * 100) : 0,
      };
    },
    enabled: !!user?.id,
  });
}
