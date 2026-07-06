import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Mail, MessageCircle, FileText, ShieldCheck, UserX } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SUPPORT_EMAIL = "suporte@jalimpo.com";

/**
 * Página pública de suporte — URL exigida pelas lojas (Google Play / App Store).
 * Não requer login; o suporte logado continua em /client/support e /pro/support.
 */
export default function Support() {
  const navigate = useNavigate();

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
              Suporte
            </h1>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Fale com a equipe do Já Limpo
            </p>
          </div>
        </div>
      </header>

      <main
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-16 safe-bottom space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Precisa de ajuda com um pedido, pagamento, cadastro ou qualquer outro
            assunto? Escolha um dos canais abaixo.
          </p>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">E-mail</p>
              <p className="text-xs text-muted-foreground">{SUPPORT_EMAIL}</p>
            </div>
          </a>

          <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Chat no app</p>
              <p className="text-xs text-muted-foreground">
                Com login, acesse Suporte no seu perfil de cliente ou diarista para
                abrir um chamado.
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Links úteis
            </p>
            <Link to="/terms" className="flex items-center gap-2 text-sm text-primary">
              <FileText className="w-4 h-4" /> Termos de Uso
            </Link>
            <Link to="/privacy" className="flex items-center gap-2 text-sm text-primary">
              <ShieldCheck className="w-4 h-4" /> Política de Privacidade
            </Link>
            <Link to="/account-deletion" className="flex items-center gap-2 text-sm text-primary">
              <UserX className="w-4 h-4" /> Como excluir minha conta
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
