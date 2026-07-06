import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SUPPORT_EMAIL = "suporte@jalimpo.com";

/**
 * Página pública de exclusão de conta — URL exigida pelo Google Play
 * (Data safety) e pela App Store. Descreve o processo self-service que já
 * existe no app (botão "Excluir minha conta" → edge function LGPD) e o
 * canal alternativo por e-mail.
 */
export default function AccountDeletion() {
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
              Exclusão de conta
            </h1>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Já Limpo — direito de exclusão (LGPD)
            </p>
          </div>
        </div>
      </header>

      <main
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-16 safe-bottom space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Como excluir sua conta pelo app
            </h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Faça login no Já Limpo.</li>
              <li>
                Abra o seu <strong>Perfil</strong> (cliente ou diarista).
              </li>
              <li>
                Toque em <strong>Excluir minha conta</strong> e confirme.
              </li>
            </ol>
            <p>
              A exclusão é imediata: seu acesso é encerrado e seus dados pessoais
              (nome, e-mail, telefone, endereços e chaves de pagamento) são
              removidos ou anonimizados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Exclusão por e-mail
            </h2>
            <p>
              Se não conseguir acessar o app, envie um e-mail para{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary">
                {SUPPORT_EMAIL}
              </a>{" "}
              a partir do endereço cadastrado, com o assunto{" "}
              <strong>“Excluir minha conta”</strong>. Confirmaremos a identidade e
              concluiremos a exclusão em até 7 dias úteis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              O que é mantido
            </h2>
            <p>
              Registros de pedidos e pagamentos são mantidos de forma{" "}
              <strong>anonimizada</strong> pelo período exigido por obrigações
              fiscais e contábeis, sem vínculo com seus dados pessoais.
            </p>
          </section>

          <p className="text-xs">
            Detalhes completos na{" "}
            <Link to="/privacy" className="text-primary">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
