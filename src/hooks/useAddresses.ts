import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Address = Tables<"addresses">;
export type AddressInsert = TablesInsert<"addresses">;

export function useAddresses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Address[];
    },
    enabled: !!user?.id,
  });
}

export function useAddress(addressId: string | null) {
  return useQuery({
    queryKey: ["address", addressId],
    queryFn: async () => {
      if (!addressId) return null;
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .maybeSingle();

      if (error) throw error;
      return data as Address | null;
    },
    enabled: !!addressId,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (address: Omit<AddressInsert, "user_id">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Address> & { id: string }) => {
      const { data, error } = await supabase
        .from("addresses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (addressId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // First, unset all defaults
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Then set the new default
      const { data, error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .select()
        .single();

      if (error) throw error;
      return data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    },
  });
}
