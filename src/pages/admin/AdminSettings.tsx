import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const defaultSettings = {
  commissionPercentDefault: 20,
  feeFixed: 9.90,
  cancelFreeHours: 24,
  cancelPenaltyPercent: 30,
  refundPolicyText: "Reembolso parcial ou total conforme análise.",
};

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: configData } = useQuery({
    queryKey: ["admin_app_config"],
    queryFn: async () => {
      const { data } = await supabase.from("app_config").select("*");
      const configMap: Record<string, string> = {};
      data?.forEach((item: any) => { configMap[item.key] = item.value; });
      return configMap;
    },
  });

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (configData) {
      setSettings({
        commissionPercentDefault: Number(configData.commission_percent || defaultSettings.commissionPercentDefault),
        feeFixed: Number(configData.fee_fixed || defaultSettings.feeFixed),
        cancelFreeHours: Number(configData.cancel_free_hours || defaultSettings.cancelFreeHours),
        cancelPenaltyPercent: Number(configData.cancel_penalty_percent || defaultSettings.cancelPenaltyPercent),
        refundPolicyText: configData.refund_policy_text || defaultSettings.refundPolicyText,
      });
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = [
        { key: "commission_percent", value: String(settings.commissionPercentDefault) },
        { key: "fee_fixed", value: String(settings.feeFixed) },
        { key: "cancel_free_hours", value: String(settings.cancelFreeHours) },
        { key: "cancel_penalty_percent", value: String(settings.cancelPenaltyPercent) },
        { key: "refund_policy_text", value: settings.refundPolicyText },
      ];
      for (const entry of entries) {
        await supabase.from("app_config").upsert(entry, { onConflict: "key" });
      }
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin_app_config"] });
    },
  });

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configurações gerais do marketplace</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Comissões</h3>
          <InputField label="Comissão padrão (%)" type="number" value={settings.commissionPercentDefault} onChange={(e) => setSettings({ ...settings, commissionPercentDefault: Number(e.target.value) })} />
          <p className="text-xs text-muted-foreground mt-2">Porcentagem do valor do serviço retida pela plataforma.</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Taxas</h3>
          <InputField label="Taxa fixa de serviço (R$)" type="number" step="0.01" value={settings.feeFixed} onChange={(e) => setSettings({ ...settings, feeFixed: Number(e.target.value) })} />
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Cancelamento</h3>
          <div className="space-y-4">
            <InputField label="Janela de cancelamento grátis (horas)" type="number" value={settings.cancelFreeHours} onChange={(e) => setSettings({ ...settings, cancelFreeHours: Number(e.target.value) })} />
            <InputField label="Multa por cancelamento (%)" type="number" value={settings.cancelPenaltyPercent} onChange={(e) => setSettings({ ...settings, cancelPenaltyPercent: Number(e.target.value) })} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <h3 className="font-semibold text-foreground mb-4">Política de reembolso</h3>
          <textarea value={settings.refundPolicyText} onChange={(e) => setSettings({ ...settings, refundPolicyText: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        <PrimaryButton fullWidth loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          Salvar configurações
        </PrimaryButton>
      </div>
    </AdminLayout>
  );
}
