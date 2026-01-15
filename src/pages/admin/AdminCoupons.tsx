import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTable } from "@/components/ui/AdminTable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { coupons } from "@/lib/mockDataV2";
import type { Coupon } from "@/lib/mockDataV2";
import { Plus, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminCoupons() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: "",
    expiresAt: "",
    maxUses: "",
    minOrderValue: "",
  });

  const handleCreate = () => {
    toast.success(`Cupom ${newCoupon.code} criado com sucesso!`);
    setShowCreateModal(false);
    setNewCoupon({
      code: "",
      type: "percent",
      value: "",
      expiresAt: "",
      maxUses: "",
      minOrderValue: "",
    });
  };

  const columns = [
    { 
      key: "code", 
      header: "Código",
      render: (c: Coupon) => (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span className="font-mono font-medium">{c.code}</span>
        </div>
      )
    },
    { 
      key: "type", 
      header: "Tipo",
      render: (c: Coupon) => c.type === "percent" ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`
    },
    { key: "expiresAt", header: "Validade" },
    { 
      key: "uses", 
      header: "Uso",
      render: (c: Coupon) => `${c.currentUses}/${c.maxUses}`
    },
    { 
      key: "minOrderValue", 
      header: "Mín. pedido",
      render: (c: Coupon) => `R$ ${c.minOrderValue.toFixed(2)}`
    },
    { 
      key: "active", 
      header: "Status",
      render: (c: Coupon) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          c.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        )}>
          {c.active ? "Ativo" : "Inativo"}
        </span>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cupons</h1>
              <p className="text-muted-foreground">Gerenciar cupons de desconto</p>
            </div>
            <PrimaryButton onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo cupom
            </PrimaryButton>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
            <AdminTable
              columns={columns}
              data={coupons}
              keyField="id"
            />
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          
          <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-md card-shadow animate-scale-in">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h2 className="text-xl font-bold text-foreground mb-6">Criar cupom</h2>

            <div className="space-y-4">
              <InputField
                label="Código"
                placeholder="PROMO20"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as "percent" | "fixed" })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="percent">Porcentagem</option>
                    <option value="fixed">Valor fixo</option>
                  </select>
                </div>
                <InputField
                  label="Valor"
                  type="number"
                  placeholder={newCoupon.type === "percent" ? "20" : "30.00"}
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                />
              </div>

              <InputField
                label="Data de expiração"
                type="date"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Limite de uso"
                  type="number"
                  placeholder="100"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                />
                <InputField
                  label="Mín. pedido (R$)"
                  type="number"
                  placeholder="100.00"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                />
              </div>

              <PrimaryButton fullWidth onClick={handleCreate}>
                Criar cupom
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
