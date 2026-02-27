import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWithdrawRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      pixKeyType,
      pixKey,
    }: {
      amount: number;
      pixKeyType: "cpf" | "email" | "phone" | "random";
      pixKey: string;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "process-withdrawal",
        {
          body: { amount, pixKeyType, pixKey },
        }
      );

      if (error) throw new Error(error.message || "Erro ao solicitar saque");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Saque solicitado com sucesso! 💰");
      queryClient.invalidateQueries({ queryKey: ["pro_balance"] });
      queryClient.invalidateQueries({ queryKey: ["pro_withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["pro_earnings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao solicitar saque");
    },
  });
}
