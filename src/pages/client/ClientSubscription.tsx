import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { PlanosMensais } from "@/components/ui/PlanosMensais";

/** Planos do cliente: vêm do admin (Planos) e são pagos no cartão pelo Asaas. */
export default function ClientSubscription() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground leading-tight">Assinatura</h1>
            <p className="text-xs text-muted-foreground">Mensalidade no cartão, cancele quando quiser</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">
          <PlanosMensais kind="client" />
        </div>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
