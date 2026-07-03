import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Exclusão de conta pelo próprio usuário (LGPD / Apple 5.1.1(v) / Google Play).
 * Chama a edge function delete-account, que anonimiza/exclui no servidor.
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: { confirm: true },
      });
      if (error) throw new Error(error.message || "Erro ao excluir conta");
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; mode: "hard_delete" | "anonymized" };
    },
  });
}
