import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProProfile = Tables<"pro_profiles">;

export interface ProWithDetails extends ProProfile {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useAvailablePros(zoneId?: string | null) {
  return useQuery({
    queryKey: ["available_pros", zoneId],
    queryFn: async () => {
      // Fetch verified, available pros
      const { data: proProfiles, error } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("verified", true)
        .eq("available_now", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      if (!proProfiles || proProfiles.length === 0) return [];

      // Fetch profiles for these pros
      const userIds = proProfiles.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Merge pro profiles with user profiles
      const prosWithDetails: ProWithDetails[] = proProfiles.map(pro => ({
        ...pro,
        profile: profiles?.find(p => p.user_id === pro.user_id) || null,
      }));

      return prosWithDetails;
    },
  });
}

export function useProProfile(userId: string | null) {
  return useQuery({
    queryKey: ["pro_profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as ProProfile | null;
    },
    enabled: !!userId,
  });
}

export function useProWithProfile(proUserId: string | null) {
  return useQuery({
    queryKey: ["pro_with_profile", proUserId],
    queryFn: async () => {
      if (!proUserId) return null;

      // Fetch pro profile
      const { data: proProfile, error: proError } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("user_id", proUserId)
        .maybeSingle();

      if (proError) throw proError;
      if (!proProfile) return null;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", proUserId)
        .maybeSingle();

      if (profileError) throw profileError;

      return {
        ...proProfile,
        profile,
      } as ProWithDetails;
    },
    enabled: !!proUserId,
  });
}

// Fetch all pros (for admin or matching purposes)
export function useAllPros() {
  return useQuery({
    queryKey: ["all_pros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pro_profiles")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      return data as ProProfile[];
    },
  });
}
