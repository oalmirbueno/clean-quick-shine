import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subWeeks, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Commission rate: pro receives 80% of total price
const PRO_COMMISSION_RATE = 0.8;

export interface EarningsSummary {
  availableBalance: number;
  pendingBalance: number;
  weekTotal: number;
  monthTotal: number;
  weeklyData: { day: string; value: number; date: Date }[];
  weekChange: number; // percentage change from last week
  transactions: {
    id: string;
    date: string;
    service: string;
    value: number;
    status: "completed" | "pending" | "paid_out";
    orderId: string;
  }[];
}

export function useProEarnings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pro_earnings", user?.id],
    queryFn: async (): Promise<EarningsSummary> => {
      if (!user?.id) {
        return {
          availableBalance: 0,
          pendingBalance: 0,
          weekTotal: 0,
          monthTotal: 0,
          weeklyData: [],
          weekChange: 0,
          transactions: [],
        };
      }

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

      // Fetch all orders for this pro that are completed or paid_out
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_price,
          status,
          completed_at,
          scheduled_date,
          service_id,
          services:service_id (name)
        `)
        .eq("pro_id", user.id)
        .in("status", ["completed", "rated", "paid_out"])
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching earnings:", error);
        throw new Error("Erro ao buscar ganhos");
      }

      if (!orders || orders.length === 0) {
        // Return empty data with weekly structure
        const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        return {
          availableBalance: 0,
          pendingBalance: 0,
          weekTotal: 0,
          monthTotal: 0,
          weeklyData: daysOfWeek.map(date => ({
            day: format(date, "EEE", { locale: ptBR }).replace(".", ""),
            value: 0,
            date,
          })),
          weekChange: 0,
          transactions: [],
        };
      }

      // Calculate earnings (pro receives 80% of total)
      const calculateProEarning = (totalPrice: number) => Number(totalPrice) * PRO_COMMISSION_RATE;

      // Calculate available balance (rated orders not yet paid out)
      const availableBalance = orders
        .filter(o => o.status === "rated" || o.status === "completed")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0);

      // Calculate pending balance (completed but not yet rated)
      const pendingBalance = orders
        .filter(o => o.status === "completed")
        .reduce((sum, o) => sum + calculateProEarning(o.total_price), 0);

      // Calculate this week's total
      const thisWeekOrders = orders.filter(o => {
        const completedDate = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
        return completedDate >= weekStart && completedDate <= weekEnd;
      });
      const weekTotal = thisWeekOrders.reduce((sum, o) => sum + calculateProEarning(o.total_price), 0);

      // Calculate last week's total for comparison
      const lastWeekOrders = orders.filter(o => {
        const completedDate = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
        return completedDate >= lastWeekStart && completedDate <= lastWeekEnd;
      });
      const lastWeekTotal = lastWeekOrders.reduce((sum, o) => sum + calculateProEarning(o.total_price), 0);
      const weekChange = lastWeekTotal > 0 ? ((weekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

      // Calculate this month's total
      const thisMonthOrders = orders.filter(o => {
        const completedDate = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
        return completedDate >= monthStart && completedDate <= monthEnd;
      });
      const monthTotal = thisMonthOrders.reduce((sum, o) => sum + calculateProEarning(o.total_price), 0);

      // Build weekly chart data
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const weeklyData = daysOfWeek.map(date => {
        const dayOrders = orders.filter(o => {
          const completedDate = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
          return isSameDay(completedDate, date);
        });
        const dayTotal = dayOrders.reduce((sum, o) => sum + calculateProEarning(o.total_price), 0);

        return {
          day: format(date, "EEE", { locale: ptBR }).replace(".", "").charAt(0).toUpperCase() + 
               format(date, "EEE", { locale: ptBR }).replace(".", "").slice(1),
          value: dayTotal,
          date,
        };
      });

      // Build transactions list (recent 20)
      const transactions = orders.slice(0, 20).map(o => {
        const completedDate = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
        const serviceName = (o.services as any)?.name || "Serviço";
        
        let status: "completed" | "pending" | "paid_out" = "completed";
        if (o.status === "paid_out") status = "paid_out";
        else if (o.status === "completed") status = "pending";

        return {
          id: o.id,
          date: format(completedDate, "dd/MM", { locale: ptBR }),
          service: serviceName,
          value: calculateProEarning(o.total_price),
          status,
          orderId: o.id,
        };
      });

      return {
        availableBalance,
        pendingBalance,
        weekTotal,
        monthTotal,
        weeklyData,
        weekChange: Math.round(weekChange),
        transactions,
      };
    },
    enabled: !!user?.id,
  });
}
