import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TipoDePlano = "client" | "pro";

export type Plano = {
  id: string;
  name: string;
  monthly_price: number;
  features: string[];
  active: boolean;
};

export type Assinatura = {
  id: string;
  plan_id: string;
  status: "active" | "paused" | "cancelled" | "expired";
  start_at: string;
  renew_at: string | null;
};

/** Erro com o código devolvido pela função (ex.: "cpf" = falta cadastrar CPF). */
export class ErroDoPlano extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function chamar(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("plan-subscription", { body });
  if (error) {
    // resposta 4xx: o texto do erro vem no corpo
    let detalhe: { error?: string; code?: string } = {};
    try {
      detalhe = await (error as any).context?.json?.();
    } catch {
      /* sem corpo */
    }
    throw new ErroDoPlano(detalhe?.error || "Não foi possível falar com o servidor.", detalhe?.code);
  }
  if (data?.error) throw new ErroDoPlano(data.error, data.code);
  return data as { success: boolean; url?: string };
}

/** Planos à venda, assinatura atual e ações de assinar/cancelar (mensalidade no cartão). */
export function usePlano(kind: TipoDePlano) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const planos = kind === "pro" ? "pro_plans" : "client_plans";
  const assinaturas = kind === "pro" ? "pro_subscriptions" : "client_subscriptions";

  const plans = useQuery({
    queryKey: ["planos", kind],
    queryFn: async (): Promise<Plano[]> => {
      const { data, error } = await supabase.from(planos).select("*").eq("active", true).order("monthly_price");
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        monthly_price: Number(p.monthly_price || 0),
        features: Array.isArray(p.features) ? p.features : [],
        active: !!p.active,
      }));
    },
  });

  const subscription = useQuery({
    queryKey: ["assinatura", kind, user?.id],
    queryFn: async (): Promise<Assinatura | null> => {
      const { data, error } = await supabase
        .from(assinaturas)
        .select("id, plan_id, status, start_at, renew_at")
        .eq("user_id", user!.id)
        .in("status", ["active", "paused"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Assinatura | null;
    },
    enabled: !!user?.id,
  });

  const assinar = useMutation({
    mutationFn: async (planId: string) => {
      const r = await chamar({ action: "create", kind, planId });
      if (!r.url) throw new ErroDoPlano("O pagamento não abriu. Tente de novo.");
      return r.url;
    },
    onSuccess: (url) => {
      // página segura do Asaas: o cartão é digitado lá, não no app
      window.open(url, "_blank");
    },
    onError: (e: ErroDoPlano) => {
      if (e.code !== "cpf") toast.error(e.message);
    },
  });

  const cancelar = useMutation({
    mutationFn: () => chamar({ action: "cancel", kind }),
    onSuccess: () => {
      toast.success("Plano cancelado. Não haverá novas cobranças.");
      qc.invalidateQueries({ queryKey: ["assinatura", kind] });
    },
    onError: (e: ErroDoPlano) => toast.error(e.message),
  });

  return { plans, subscription, assinar, cancelar };
}
