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

      // Fetch orders: completed, rated, in_review, paid_out
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_price, status")
        .eq("pro_id", user.id)
        .in("status", ["completed", "rated", "in_review", "paid_out"]);

      if (error) {
        console.error("Error fetching balance:", error);
        throw new Error("Erro ao buscar saldo");
      }

      // Get withdrawals (new statuses: pending, processing, completed, rejected)
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("amount, status")
        .eq("user_id", user.id)
        .in("status", ["pending", "processing", "completed"]);

      const calculateProEarning = (totalPrice: number) => Number(totalPrice) * PRO_COMMISSION_RATE;

      // rated = available for withdrawal
      const ratedEarnings = orders?.filter(o => o.status === "rated")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;
      // paid_out = already paid, NOT available
      const paidOutEarnings = orders?.filter(o => o.status === "paid_out")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;
      // completed = waiting client rating
      const pendingEarnings = orders?.filter(o => o.status === "completed")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;
      // in_review = blocked
      const blockedEarnings = orders?.filter(o => o.status === "in_review")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0) || 0;

      const totalEarned = ratedEarnings + paidOutEarnings + pendingEarnings;

      // Only deduct pending/processing from available (completed withdrawals already consumed rated→paid_out)
      const pendingWithdrawal = withdrawals?.filter(w => w.status === "pending" || w.status === "processing")
        .reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      // ONLY rated earnings minus active withdrawal requests
      const availableBalance = Math.max(0, ratedEarnings - pendingWithdrawal);

      return {
        availableBalance,
        pendingBalance: pendingEarnings,
        blockedBalance: blockedEarnings,
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

// Withdrawal requests are handled server-side via the process-withdrawal edge function.
// Use useWithdrawRequest hook from src/hooks/useWithdrawRequest.ts
