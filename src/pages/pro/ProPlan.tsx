import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { PlanosMensais } from "@/components/ui/PlanosMensais";

/** Planos da diarista: vêm do admin (Planos) e são pagos no cartão pelo Asaas. */
export default function ProPlan() {
  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Planos" subtitle="Mensalidade no cartão, cancele quando quiser" />
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="px-5 pb-6">
          <PlanosMensais kind="pro" />
        </div>
      </main>
    </div>
  );
}
