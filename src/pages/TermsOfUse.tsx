import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import {
  ALL_TERMS,
  LEGAL_LAST_UPDATE,
  TERMS_PLATFORM,
} from "@/lib/legalContent";

export default function TermsOfUse() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = useMemo(() => {
    const t = params.get("tab");
    return ALL_TERMS.find((d) => d.id === t)?.id ?? TERMS_PLATFORM.id;
  }, [params]);
  const [tab, setTab] = useState(initial);

  return (
    <div className="h-full min-h-0 bg-background flex flex-col safe-top">
      <header className="flex-shrink-0 bg-background/85 backdrop-blur-md border-b border-border/60">
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
              Termos de Uso
            </h1>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Última atualização: {LEGAL_LAST_UPDATE}
            </p>
          </div>
        </div>
      </header>

      <main
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-16 safe-bottom">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setParams({ tab: v }, { replace: true });
            }}
          >
            <TabsList className="w-full grid grid-cols-4 h-auto p-1 rounded-xl bg-muted/50 border border-border/40 sticky top-0 z-10">
              {ALL_TERMS.map((doc) => (
                <TabsTrigger
                  key={doc.id}
                  value={doc.id}
                  className="text-[12px] font-medium py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground tracking-tight"
                >
                  {doc.shortTitle}
                </TabsTrigger>
              ))}
            </TabsList>

            {ALL_TERMS.map((doc) => (
              <TabsContent key={doc.id} value={doc.id} className="mt-6 focus:outline-none">
                <LegalDocumentView document={doc} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
