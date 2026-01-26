import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Commission rate: pro receives 80% of total price
const PRO_COMMISSION_RATE = 0.8;

interface WithdrawalInput {
  amount: number;
  pixKey: string;
}

export function useProBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pro_balance", user?.id],
    queryFn: async () => {
      if (!user?.id) return { availableBalance: 0, pendingBalance: 0 };

      // Get completed/rated orders that haven't been withdrawn yet
      // Available = rated orders (client approved)
      // Pending = completed orders (waiting for client rating)
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_price, status")
        .eq("pro_id", user.id)
        .in("status", ["completed", "rated"]);

      if (error) {
        console.error("Error fetching balance:", error);
        throw new Error("Erro ao buscar saldo");
      }

      // Get total already withdrawn
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("amount, status")
        .eq("user_id", user.id)
        .in("status", ["pending", "completed"]);

      const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const pendingWithdrawal = withdrawals?.filter(w => w.status === "pending")
        .reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      const calculateProEarning = (totalPrice: number) => Number(totalPrice) * PRO_COMMISSION_RATE;

      const totalEarned = orders?.reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;
      const ratedEarnings = orders?.filter(o => o.status === "rated")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;
      const pendingEarnings = orders?.filter(o => o.status === "completed")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;

      // Available balance = rated earnings - completed withdrawals
      const completedWithdrawals = withdrawals?.filter(w => w.status === "completed")
        .reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      
      const availableBalance = Math.max(0, ratedEarnings - completedWithdrawals - pendingWithdrawal);

      return {
        availableBalance,
        pendingBalance: pendingEarnings,
        pendingWithdrawal,
        totalEarned,
      };
    },
    enabled: !!user?.id,
  });
}

export function useProWithdrawals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pro_withdrawals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching withdrawals:", error);
        throw new Error("Erro ao buscar saques");
      }

      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useRequestWithdrawal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WithdrawalInput) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      if (input.amount <= 0) {
        throw new Error("Informe um valor válido");
      }

      if (!input.pixKey.trim()) {
        throw new Error("Informe sua chave Pix");
      }

      // Validate balance
      const balanceData = await queryClient.fetchQuery({
        queryKey: ["pro_balance", user.id],
      }) as { availableBalance: number };

      if (input.amount > balanceData.availableBalance) {
        throw new Error("Saldo insuficiente");
      }

      // Create withdrawal request
      const { data, error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user.id,
          amount: input.amount,
          pix_key: input.pixKey.trim(),
          method: "pix",
          status: "pending",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating withdrawal:", error);
        throw new Error("Erro ao solicitar saque");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Saque solicitado com sucesso! Processamento em até 24h úteis.");
      queryClient.invalidateQueries({ queryKey: ["pro_withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["pro_balance"] });
      queryClient.invalidateQueries({ queryKey: ["pro_earnings"] });
    },
    onError: (error) => {
      console.error("Withdrawal error:", error);
      toast.error(error.message || "Erro ao solicitar saque");
    },
  });
}
