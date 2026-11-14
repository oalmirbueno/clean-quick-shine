import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Pencil, Info } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Publico = "client" | "pro";
type Plano = { id: string; name: string; monthly_price: number; features: string[]; active: boolean };

const tabela = (p: Publico) => (p === "pro" ? "pro_plans" : "client_plans");
const assinaturas = (p: Publico) => (p === "pro" ? "pro_subscriptions" : "client_subscriptions");
const nomes: Record<Publico, string> = { pro: "Diaristas", client: "Clientes" };
const reais = (v: number) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

export default function AdminPlans() {
  const qc = useQueryClient();
  const [aba, setAba] = useState<Publico>("pro");
  const [edit, setEdit] = useState<{ id: string; name: string; price: string; features: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_planos", aba],
    queryFn: async () => {
      const [planos, subs] = await Promise.all([
        supabase.from(tabela(aba)).select("*").order("monthly_price"),
        supabase.from(assinaturas(aba)).select("plan_id, status").eq("status", "active"),
      ]);
      if (planos.error) throw planos.error;
      const ativos = new Map<string, number>();
      (subs.data || []).forEach((s: any) => ativos.set(s.plan_id, (ativos.get(s.plan_id) || 0) + 1));
      return {
        planos: (planos.data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          monthly_price: Number(p.monthly_price || 0),
          features: Array.isArray(p.features) ? p.features : [],
          active: !!p.active,
        })) as Plano[],
        ativos,
      };
    },
  });

  const atualizar = () => {
    qc.invalidateQueries({ queryKey: ["admin_planos"] });
    qc.invalidateQueries({ queryKey: ["planos"] });
  };

  const ligar = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from(tabela(aba)).update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: () => toast.error("Erro ao atualizar o plano"),
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!edit) return;
      const preco = Number(String(edit.price).replace(",", "."));
      if (!edit.name.trim()) throw new Error("Dê um nome ao plano");
      if (!Number.isFinite(preco) || preco < 0) throw new Error("Preço inválido");
      const features = edit.features.split("\n").map((f) => f.trim()).filter(Boolean);
      const { error } = await supabase
        .from(tabela(aba))
        .update({ name: edit.name.trim(), monthly_price: preco, features })
        .eq("id", edit.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plano salvo");
      setEdit(null);
      atualizar();
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao salvar"),
  });

  return (
    <AdminLayout fixo>
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Planos e mensalidade</h1>
        <p className="text-sm text-muted-foreground">Nome, preço e o que cada plano oferece. Só plano ligado aparece no app.</p>
      </div>

      <div className="flex gap-2">
        {(["pro", "client"] as Publico[]).map((p) => (
          <button
            key={p}
            onClick={() => setAba(p)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
              aba === p ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted",
            )}
          >
            {nomes[p]}
          </button>
        ))}
      </div>

      <div className="admin-rolagem space-y-3">
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-accent/50">
          <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            A mensalidade é cobrada todo mês, sozinha, no <strong>cartão de crédito</strong> que a pessoa cadastra na página segura do Asaas.
            Débito automático mensal o Asaas não oferece. Mudar o preço vale para novas assinaturas; quem já assinou continua no valor contratado.
          </p>
        </div>

        {isLoading && <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border/60 animate-pulse">Carregando…</div>}

        {(data?.planos || []).map((p) => (
          <div key={p.id} className={cn("p-4 rounded-2xl border bg-card", p.active ? "border-border" : "border-border/60")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", p.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                    {p.active ? "No app" : "Desligado"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {p.monthly_price > 0 ? `${reais(p.monthly_price)} por mês` : "Gratuito"} · {data?.ativos.get(p.id) || 0} assinantes ativos
                </p>
                {p.features.length > 0 && <p className="text-xs text-muted-foreground mt-2">{p.features.join(" · ")}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setEdit({ id: p.id, name: p.name, price: String(p.monthly_price), features: p.features.join("\n") })}
                  className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
                  aria-label={`Editar ${p.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <Switch checked={p.active} onCheckedChange={(v) => ligar.mutate({ id: p.id, active: v })} aria-label={`Ligar ${p.name}`} />
              </div>
            </div>
          </div>
        ))}

        <p className="flex items-start gap-2 text-xs text-muted-foreground px-1">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Os preços que estão aqui eram exemplos antigos. Ajuste para a tabela definida antes de ligar um plano.
        </p>
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <InputField label="Nome" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <InputField label="Mensalidade (R$)" inputMode="decimal" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">O que o plano oferece (um item por linha)</label>
                <textarea
                  rows={5}
                  value={edit.features}
                  onChange={(e) => setEdit({ ...edit, features: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <PrimaryButton fullWidth loading={salvar.isPending} onClick={() => salvar.mutate()}>
                Salvar
              </PrimaryButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
