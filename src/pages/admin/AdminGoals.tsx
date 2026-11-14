import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Target } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/planosCalc";

// As metas ficam em app_config (chave/valor), como as demais configurações.
type Chave = "meta_pedidos_dia" | "meta_comissao_mes" | "meta_diaristas_plano" | "meta_clientes_clube" | "meta_clientes_novas";

const METAS: { chave: Chave; nome: string; explica: string; dinheiro?: boolean; acumula?: boolean; padrao: number }[] = [
  { chave: "meta_pedidos_dia", nome: "Pedidos por dia", explica: "Média por dia útil neste mês", padrao: 10 },
  { chave: "meta_comissao_mes", nome: "Comissão no mês", explica: "20% do valor dos pedidos do mês", dinheiro: true, acumula: true, padrao: 15400 },
  { chave: "meta_diaristas_plano", nome: "Diaristas com plano pago", explica: "Assinaturas ativas agora", padrao: 0 },
  { chave: "meta_clientes_clube", nome: "Clientes com mensalidade", explica: "Assinaturas ativas agora", padrao: 0 },
  { chave: "meta_clientes_novas", nome: "Clientes novas no mês", explica: "Cadastros de cliente neste mês", acumula: true, padrao: 0 },
];

const COMISSAO_PADRAO = 0.2;

function diasUteis(ano: number, mes: number, ateDia: number) {
  let n = 0;
  for (let d = 1; d <= ateDia; d++) {
    const semana = new Date(ano, mes, d).getDay();
    if (semana !== 0 && semana !== 6) n++;
  }
  return n;
}

function numero(v: number, dinheiro?: boolean) {
  if (dinheiro) return brl(v);
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export default function AdminGoals() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Record<Chave, string> | null>(null);

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const uteisMes = diasUteis(ano, mes, ultimoDia);
  const uteisAteHoje = Math.max(1, diasUteis(ano, mes, hoje.getDate()));
  const nomeMes = hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const { data: metas } = useQuery({
    queryKey: ["admin_metas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_config").select("key, value").like("key", "meta_%");
      if (error) throw error;
      const mapa = Object.fromEntries(METAS.map((m) => [m.chave, m.padrao])) as Record<Chave, number>;
      (data || []).forEach((r) => {
        if (r.key in mapa) mapa[r.key as Chave] = Number(r.value) || 0;
      });
      return mapa;
    },
  });

  const { data: atual, isLoading } = useQuery({
    queryKey: ["admin_metas_atual", ano, mes],
    refetchInterval: 60000,
    queryFn: async () => {
      const inicio = new Date(ano, mes, 1).toISOString();
      const [pedidos, pros, clientes, novas] = await Promise.all([
        supabase.from("orders").select("status, total_price").gte("created_at", inicio).limit(10000),
        supabase.from("pro_subscriptions").select("id, plan:pro_plans(monthly_price)").eq("status", "active"),
        supabase.from("client_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "client").gte("created_at", inicio),
      ]);
      const validos = (pedidos.data || []).filter((o) => o.status !== "cancelled" && o.status !== "draft");
      const valor = validos.reduce((s, o) => s + Number(o.total_price), 0);
      const diaristasPagas = ((pros.data || []) as { plan: { monthly_price: number } | null }[]).filter((s) => Number(s.plan?.monthly_price || 0) > 0).length;
      return {
        meta_pedidos_dia: validos.length / uteisAteHoje,
        meta_comissao_mes: valor * COMISSAO_PADRAO,
        meta_diaristas_plano: diaristasPagas,
        meta_clientes_clube: clientes.count || 0,
        meta_clientes_novas: novas.count || 0,
        pedidosNoMes: validos.length,
      } as Record<Chave, number> & { pedidosNoMes: number };
    },
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!edit) return;
      for (const m of METAS) {
        const v = Number(String(edit[m.chave]).replace(/\./g, "").replace(",", "."));
        if (!Number.isFinite(v) || v < 0) throw new Error(`Valor inválido em "${m.nome}"`);
        const { error } = await supabase.from("app_config").upsert({ key: m.chave, value: String(v) }, { onConflict: "key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Metas salvas");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["admin_metas"] });
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao salvar as metas"),
  });

  const abrirEdicao = () =>
    setEdit(Object.fromEntries(METAS.map((m) => [m.chave, String(metas?.[m.chave] ?? m.padrao).replace(".", ",")])) as Record<Chave, string>);

  return (
    <AdminLayout fixo>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Metas</h1>
          <p className="text-sm text-muted-foreground">
            {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} · dia útil {uteisAteHoje} de {uteisMes}
          </p>
        </div>
        <button
          onClick={abrirEdicao}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0"
        >
          <Pencil className="w-4 h-4" /> Definir metas
        </button>
      </div>

      <div className="admin-rolagem">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {METAS.map((m) => {
            const meta = metas?.[m.chave] ?? m.padrao;
            const valor = atual?.[m.chave] ?? 0;
            const semMeta = meta <= 0;
            const pct = semMeta ? 0 : (valor / meta) * 100;
            const esperado = m.acumula ? (meta * uteisAteHoje) / uteisMes : meta;
            const batida = !semMeta && pct >= 100;
            const noRitmo = !semMeta && valor >= esperado;
            const projecao = m.acumula ? (valor / uteisAteHoje) * uteisMes : null;
            return (
              <div key={m.chave} className="p-4 lg:p-5 rounded-2xl border border-border/60 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">{m.explica}</p>
                  </div>
                  {!semMeta && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0",
                        batida ? "bg-success/10 text-success" : noRitmo ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning",
                      )}
                    >
                      {batida ? "Meta batida" : noRitmo ? "No ritmo" : "Abaixo do ritmo"}
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between gap-3 mt-4">
                  <p className={cn("text-2xl lg:text-3xl font-bold text-foreground tabular-nums", isLoading && "animate-pulse")}>{numero(valor, m.dinheiro)}</p>
                  <p className="text-2xl font-bold tabular-nums text-muted-foreground">{semMeta ? "" : `${Math.round(pct)}%`}</p>
                </div>

                <div
                  className="h-2.5 rounded-full bg-muted mt-3 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, Math.round(pct))}
                  aria-label={m.nome}
                >
                  <div className={cn("h-full rounded-full", batida ? "bg-success" : "bg-primary")} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>

                <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                  {semMeta ? (
                    "Sem meta definida. Toque em Definir metas."
                  ) : (
                    <>
                      Meta: {numero(meta, m.dinheiro)}
                      {!batida && <> · faltam {numero(Math.max(0, meta - valor), m.dinheiro)}</>}
                      {projecao !== null && <> · nesse ritmo fecha o mês em {numero(projecao, m.dinheiro)}</>}
                    </>
                  )}
                </p>
              </div>
            );
          })}

          <div className="p-4 lg:p-5 rounded-2xl border border-dashed border-border bg-transparent flex items-start gap-3">
            <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {atual ? `${atual.pedidosNoMes} pedidos neste mês até agora. ` : ""}
              Pedido cancelado ou não finalizado não entra. A comissão é contada a 20%; quando os planos de comissão menor estiverem valendo, o número real fica um pouco abaixo.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Definir metas</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              {METAS.map((m) => (
                <InputField
                  key={m.chave}
                  label={m.dinheiro ? `${m.nome} (R$)` : m.nome}
                  inputMode="decimal"
                  value={edit[m.chave]}
                  onChange={(e) => setEdit({ ...edit, [m.chave]: e.target.value })}
                />
              ))}
              <p className="text-xs text-muted-foreground">Deixe 0 para não acompanhar uma meta.</p>
              <PrimaryButton fullWidth loading={salvar.isPending} onClick={() => salvar.mutate()}>
                Salvar metas
              </PrimaryButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
