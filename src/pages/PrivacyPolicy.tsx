import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { LEGAL_LAST_UPDATE, PRIVACY_POLICY } from "@/lib/legalContent";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-top">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-muted/60 active:scale-95 transition-all"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <Logo size="sm" iconOnly />
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-foreground tracking-[-0.01em] leading-none">
              Política de Privacidade
            </h1>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Última atualização: {LEGAL_LAST_UPDATE}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <LegalDocumentView document={PRIVACY_POLICY} />
      </main>
    </div>
  );
}
