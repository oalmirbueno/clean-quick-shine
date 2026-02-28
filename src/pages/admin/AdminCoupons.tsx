import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable } from "@/components/ui/AdminTable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { Plus, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "", type: "percent" as "percent" | "fixed", value: "", expiresAt: "", maxUses: "", minOrderValue: "",
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["admin_coupons"],
    queryFn: async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("coupons").insert({
        code: newCoupon.code,
        discount_type: newCoupon.type,
        discount_value: Number(newCoupon.value),
        valid_until: newCoupon.expiresAt || null,
        max_uses: newCoupon.maxUses ? Number(newCoupon.maxUses) : null,
        min_order_value: newCoupon.minOrderValue ? Number(newCoupon.minOrderValue) : 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Cupom ${newCoupon.code} criado com sucesso!`);
      setShowCreateModal(false);
      setNewCoupon({ code: "", type: "percent", value: "", expiresAt: "", maxUses: "", minOrderValue: "" });
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] });
    },
    onError: () => toast.error("Erro ao criar cupom"),
  });

  const columns = [
    { key: "code", header: "Código", render: (c: any) => (
      <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /><span className="font-mono font-medium">{c.code}</span></div>
    )},
    { key: "type", header: "Tipo", render: (c: any) => c.discount_type === "percent" ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2)}` },
    { key: "valid_until", header: "Validade", render: (c: any) => c.valid_until ? new Date(c.valid_until).toLocaleDateString("pt-BR") : "Sem prazo" },
    { key: "uses", header: "Uso", render: (c: any) => `${c.uses_count || 0}/${c.max_uses || "∞"}` },
    { key: "active", header: "Status", render: (c: any) => (
      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
        {c.active ? "Ativo" : "Inativo"}
      </span>
    )},
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cupons</h1>
          <p className="text-muted-foreground">Gerenciar cupons de desconto</p>
        </div>
        <PrimaryButton onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Novo cupom</PrimaryButton>
      </div>
      <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <AdminTable columns={columns} data={coupons} keyField="id" />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-md card-shadow animate-scale-in">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 p-1 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
            <h2 className="text-xl font-bold text-foreground mb-6">Criar cupom</h2>
            <div className="space-y-4">
              <InputField label="Código" placeholder="PROMO20" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
                  <select value={newCoupon.type} onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground">
                    <option value="percent">Porcentagem</option>
                    <option value="fixed">Valor fixo</option>
                  </select>
                </div>
                <InputField label="Valor" type="number" placeholder={newCoupon.type === "percent" ? "20" : "30.00"} value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} />
              </div>
              <InputField label="Data de expiração" type="date" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Limite de uso" type="number" placeholder="100" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })} />
                <InputField label="Mín. pedido (R$)" type="number" placeholder="100.00" value={newCoupon.minOrderValue} onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })} />
              </div>
              <PrimaryButton fullWidth onClick={() => createCoupon.mutate()} loading={createCoupon.isPending}>Criar cupom</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
