import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Loader2, Crown } from "lucide-react";

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  duration_hours: number;
  active: boolean | null;
  requires_pro_plan: boolean;
  icon: string | null;
  category: string;
};

const defaultForm = {
  name: "",
  description: "",
  base_price: 0,
  duration_hours: 0,
  icon: "",
  category: "limpeza",
  requires_pro_plan: false,
  active: true,
};

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("active", { ascending: false })
        .order("base_price");
      if (error) throw error;
      return data as ServiceRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        base_price: form.base_price,
        duration_hours: form.duration_hours,
        icon: form.icon || null,
        requires_pro_plan: form.requires_pro_plan,
        active: form.active,
      };

      if (editingId) {
        const { error } = await supabase.from("services").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Serviço atualizado!" : "Serviço criado!");
      queryClient.invalidateQueries({ queryKey: ["admin_services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      closeDialog();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao salvar"),
  });

  const openNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (s: ServiceRow) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description || "",
      base_price: s.base_price,
      duration_hours: s.duration_hours,
      icon: s.icon || "",
      category: (s as any).category || "limpeza",
      requires_pro_plan: s.requires_pro_plan,
      active: s.active ?? true,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const toggleActive = async (s: ServiceRow) => {
    const { error } = await supabase.from("services").update({ active: !s.active }).eq("id", s.id);
    if (error) {
      toast.error("Erro ao alterar status");
      return;
    }
    toast.success(s.active ? "Serviço desativado" : "Serviço ativado");
    queryClient.invalidateQueries({ queryKey: ["admin_services"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm">Gerencie o catálogo de serviços do marketplace</p>
        </div>
        <PrimaryButton onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Novo serviço
        </PrimaryButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {services?.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-foreground">{s.name}</span>
                  {s.requires_pro_plan && (
                    <Badge variant="outline" className="text-[10px] gap-0.5 border-amber-500/30 text-amber-600">
                      <Crown className="w-3 h-3" /> PRO
                    </Badge>
                  )}
                  {!s.active && (
                    <Badge variant="secondary" className="text-[10px]">Inativo</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] capitalize">{(s as any).category || "limpeza"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{s.description}</p>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>R$ {Number(s.base_price).toFixed(2).replace(".", ",")}</span>
                  <span>{s.duration_hours}h</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Switch checked={s.active ?? false} onCheckedChange={() => toggleActive(s)} />
                <button
                  onClick={() => openEdit(s)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog for create/edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <InputField
              label="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Limpeza Residencial"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="Descreva o serviço..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Preço base (R$)"
                type="number"
                step="0.01"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
              />
              <InputField
                label="Duração (horas)"
                type="number"
                step="0.5"
                value={form.duration_hours}
                onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Ícone (Lucide)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Ex: Home, Zap, HardHat"
              />
              <InputField
                label="Categoria"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ex: limpeza, reparos"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.requires_pro_plan}
                  onCheckedChange={(v) => setForm({ ...form, requires_pro_plan: v })}
                />
                Exige plano PRO
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                Ativo
              </label>
            </div>

            <PrimaryButton
              fullWidth
              loading={saveMutation.isPending}
              disabled={!form.name || form.base_price <= 0 || form.duration_hours <= 0}
              onClick={() => saveMutation.mutate()}
            >
              {editingId ? "Salvar alterações" : "Criar serviço"}
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
