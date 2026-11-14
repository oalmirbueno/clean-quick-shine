import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus, Pencil, Star, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Publico = "client" | "pro";
type Grupo = {
  id: string;
  audience: Publico;
  name: string;
  invite_url: string;
  active: boolean;
  is_current: boolean;
  created_at: string;
};
type Resumo = { group_id: string; cliques: number; confirmados: number; cliques_site: number };

const db = supabase as any;
const LINK_VALIDO = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i;
const nomes: Record<Publico, string> = { pro: "Diaristas", client: "Clientes" };
const formVazio = { id: "", audience: "pro" as Publico, name: "", invite_url: "" };

const AUTOMACOES = [
  {
    key: "grupo_obrigatorio",
    titulo: "Tela obrigatória “Entre no grupo”",
    texto: "Depois do cadastro (app ou web), a pessoa só usa o Já Limpo depois de passar pelo grupo do tipo dela.",
  },
  {
    key: "auto_boas_vindas_grupo",
    titulo: "Boas-vindas com o convite do grupo",
    texto: "Assim que a conta é criada, a pessoa recebe um aviso no app com o caminho para o grupo.",
  },
];

export default function AdminGroups() {
  const qc = useQueryClient();
  const [aba, setAba] = useState<Publico>("pro");
  const [form, setForm] = useState(formVazio);
  const [aberto, setAberto] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_grupos"],
    queryFn: async () => {
      const [grupos, resumo, config, cadastros] = await Promise.all([
        db.from("whatsapp_groups").select("*").order("created_at", { ascending: false }),
        db.rpc("grupos_resumo"),
        supabase.from("app_config").select("key, value").in("key", AUTOMACOES.map((a) => a.key)),
        supabase.from("user_roles").select("role"),
      ]);
      if (grupos.error) throw grupos.error;
      const cfg: Record<string, string> = {};
      (config.data || []).forEach((c: any) => (cfg[c.key] = c.value));
      const total: Record<Publico, number> = { client: 0, pro: 0 };
      (cadastros.data || []).forEach((r: any) => {
        if (r.role === "client" || r.role === "pro") total[r.role as Publico] += 1;
      });
      return {
        grupos: (grupos.data || []) as Grupo[],
        resumo: (resumo.data || []) as Resumo[],
        cfg,
        total,
      };
    },
  });

  const atualizar = () => qc.invalidateQueries({ queryKey: ["admin_grupos"] });

  const salvar = useMutation({
    mutationFn: async () => {
      const nome = form.name.trim();
      const link = form.invite_url.trim();
      if (!nome) throw new Error("Dê um nome ao grupo");
      if (!LINK_VALIDO.test(link)) throw new Error("Cole o link de convite (começa com https://chat.whatsapp.com/)");
      if (form.id) {
        const { error } = await db.from("whatsapp_groups").update({ name: nome, invite_url: link }).eq("id", form.id);
        if (error) throw error;
        return;
      }
      const { data: novo, error } = await db
        .from("whatsapp_groups")
        .insert({ audience: form.audience, name: nome, invite_url: link })
        .select("id")
        .single();
      if (error) throw error;
      // primeiro grupo do público já vira o atual
      const temAtual = data?.grupos.some((g) => g.audience === form.audience && g.is_current);
      if (!temAtual) await db.rpc("grupo_definir_atual", { p_id: novo.id });
    },
    onSuccess: () => {
      toast.success("Grupo salvo");
      setAberto(false);
      atualizar();
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao salvar"),
  });

  const ligar = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await db.from("whatsapp_groups").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: () => toast.error("Erro ao atualizar o grupo"),
  });

  const tornarAtual = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.rpc("grupo_definir_atual", { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Este é o grupo atual");
      atualizar();
    },
    onError: () => toast.error("Erro ao definir o grupo atual"),
  });

  const automacao = useMutation({
    mutationFn: async ({ key, on }: { key: string; on: boolean }) => {
      const { error } = await supabase.from("app_config").upsert({ key, value: on ? "on" : "off" }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: atualizar,
    onError: () => toast.error("Erro ao salvar a automação"),
  });

  const grupos = (data?.grupos || []).filter((g) => g.audience === aba);
  const resumoDe = (id: string) => data?.resumo.find((r) => r.group_id === id);
  const confirmadosDaAba = grupos.reduce((s, g) => s + Number(resumoDe(g.id)?.confirmados || 0), 0);
  const semAtual = !isLoading && !grupos.some((g) => g.is_current);

  return (
    <AdminLayout fixo>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Grupos de WhatsApp</h1>
          <p className="text-sm text-muted-foreground">Links dos grupos, quem passou por eles e as automações do cadastro</p>
        </div>
        <PrimaryButton
          onClick={() => {
            setForm({ ...formVazio, audience: aba });
            setAberto(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo grupo
        </PrimaryButton>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
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
        <p className="text-sm text-muted-foreground ml-1">
          {confirmadosDaAba} de {data?.total[aba] ?? 0} {nomes[aba].toLowerCase()} confirmaram a entrada
        </p>
      </div>

      <div className="admin-rolagem space-y-5">
        {semAtual && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-warning/40 bg-warning/10">
            <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Ainda não há grupo atual para {nomes[aba].toLowerCase()}. Enquanto não houver, a tela “Entre no grupo” não aparece para esse público.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isLoading && <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border/60 animate-pulse">Carregando…</div>}
          {!isLoading && grupos.length === 0 && (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border/60">
              Nenhum grupo de {nomes[aba].toLowerCase()} cadastrado
            </div>
          )}
          {grupos.map((g) => {
            const r = resumoDe(g.id);
            return (
              <div key={g.id} className={cn("p-4 rounded-2xl border bg-card", g.is_current ? "border-primary/50" : "border-border/60", !g.active && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#128C7E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{g.name}</p>
                      {g.is_current && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Atual</span>}
                      {!g.active && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Desligado</span>}
                    </div>
                    <a href={g.invite_url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 break-all">
                      {g.invite_url} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong className="text-foreground">{Number(r?.confirmados || 0)}</strong> confirmaram ·{" "}
                      <strong className="text-foreground">{Number(r?.cliques || 0)}</strong> clicaram no app ·{" "}
                      <strong className="text-foreground">{Number(r?.cliques_site || 0)}</strong> cliques pelo site
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border/60">
                  <label className="inline-flex items-center gap-2 text-sm text-foreground mr-2">
                    <Switch checked={g.active} onCheckedChange={(v) => ligar.mutate({ id: g.id, active: v })} />
                    Ativo
                  </label>
                  {g.active && !g.is_current && (
                    <button onClick={() => tornarAtual.mutate(g.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">
                      <Star className="w-4 h-4" /> Tornar atual
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setForm({ id: g.id, audience: g.audience, name: g.name, invite_url: g.invite_url });
                      setAberto(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Automações</h2>
          {AUTOMACOES.map((a) => {
            const on = (data?.cfg[a.key] ?? "on") !== "off";
            return (
              <div key={a.key} className="flex items-start gap-4 p-4 rounded-2xl border border-border/60 bg-card">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{a.titulo}</p>
                  <p className="text-sm text-muted-foreground">{a.texto}</p>
                </div>
                <Switch checked={on} onCheckedChange={(v) => automacao.mutate({ key: a.key, on: v })} />
              </div>
            );
          })}
          <p className="flex items-start gap-2 text-xs text-muted-foreground px-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            O WhatsApp não informa quem entrou de verdade no grupo. O que fica guardado aqui é quem tocou no convite e quem confirmou “Já entrei”.
          </p>
        </section>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar grupo" : "Novo grupo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!form.id && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Para quem é</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as Publico })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground"
                >
                  <option value="pro">Diaristas</option>
                  <option value="client">Clientes</option>
                </select>
              </div>
            )}
            <InputField label="Nome do grupo" placeholder="Diaristas Já Limpo 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <InputField label="Link de convite" placeholder="https://chat.whatsapp.com/..." value={form.invite_url} onChange={(e) => setForm({ ...form, invite_url: e.target.value })} />
            <PrimaryButton fullWidth loading={salvar.isPending} onClick={() => salvar.mutate()}>
              Salvar
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
