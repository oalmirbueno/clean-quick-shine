import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { adminSettings } from "@/lib/mockDataV2";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState(adminSettings);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Configurações salvas com sucesso!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Configurações gerais do marketplace</p>
          </div>

          <div className="max-w-xl space-y-6">
            {/* Commission */}
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Comissões</h3>
              <InputField
                label="Comissão padrão (%)"
                type="number"
                value={settings.commissionPercentDefault}
                onChange={(e) => setSettings({ ...settings, commissionPercentDefault: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Porcentagem do valor do serviço retida pela plataforma.
              </p>
            </div>

            {/* Fees */}
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Taxas</h3>
              <InputField
                label="Taxa fixa de serviço (R$)"
                type="number"
                step="0.01"
                value={settings.feeFixed}
                onChange={(e) => setSettings({ ...settings, feeFixed: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Taxa fixa cobrada em cada pedido.
              </p>
            </div>

            {/* Cancellation */}
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Cancelamento</h3>
              <div className="space-y-4">
                <InputField
                  label="Janela de cancelamento grátis (horas)"
                  type="number"
                  value={settings.cancelFreeHours}
                  onChange={(e) => setSettings({ ...settings, cancelFreeHours: Number(e.target.value) })}
                />
                <InputField
                  label="Multa por cancelamento (%)"
                  type="number"
                  value={settings.cancelPenaltyPercent}
                  onChange={(e) => setSettings({ ...settings, cancelPenaltyPercent: Number(e.target.value) })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cancelamentos após a janela permitida incorrem em multa.
              </p>
            </div>

            {/* Refund Policy */}
            <div className="bg-card rounded-xl border border-border p-4 card-shadow">
              <h3 className="font-semibold text-foreground mb-4">Política de reembolso</h3>
              <textarea
                value={settings.refundPolicyText}
                onChange={(e) => setSettings({ ...settings, refundPolicyText: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background
                  text-foreground placeholder:text-muted-foreground resize-none
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <PrimaryButton fullWidth loading={loading} onClick={handleSave}>
              Salvar configurações
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
