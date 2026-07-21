import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  Download,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";

type Step = "welcome" | "hasAccountYes" | "hasAccountNo";

/**
 * Welcome / entry wizard.
 *
 * Dinâmica única (funciona em qualquer viewport, adaptando o texto):
 *  1. "Você já tem cadastro?"
 *      → Sim: pergunta se já instalou o app (só faz sentido em mobile-browser).
 *              - Instalado ou desktop/PWA → /login
 *              - Não instalado (mobile-browser) → /install
 *      → Não: em mobile-browser manda instalar antes; em desktop/PWA vai direto para /register.
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();

  // Precisa instalar antes? Só se estiver no navegador mobile e ainda não for standalone.
  const needsInstall = useMemo(() => isMobile && !isStandalone, [isMobile, isStandalone]);

  const [step, setStep] = useState<Step>("welcome");

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");
  const goInstall = () => navigate("/install");

  return (
    <AuthLayout
      onBack={step === "welcome" ? undefined : () => setStep("welcome")}
      eyebrow={
        <>
          <Sparkles className="w-3 h-3" /> Bem-vindo ao Já Limpo
        </>
      }
      title={
        step === "welcome"
          ? "Você já tem cadastro?"
          : step === "hasAccountYes"
            ? "Já instalou o app?"
            : "Vamos começar do jeito certo"
      }
      subtitle={
        step === "welcome"
          ? "Em poucos toques você agenda sua limpeza."
          : step === "hasAccountYes"
            ? "Assim você abre o Já Limpo sempre que precisar."
            : needsInstall
              ? "Instale o app antes de criar sua conta."
              : "Crie sua conta grátis em segundos."
      }
      showTrust={step === "welcome"}
    >
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <ChoiceCard
              icon={LogIn}
              title="Sim, já tenho conta"
              description={needsInstall ? "Abrir ou instalar o app" : "Entrar agora"}
              onClick={() => {
                if (needsInstall) setStep("hasAccountYes");
                else goLogin();
              }}
            />
            <ChoiceCard
              icon={UserPlus}
              title="Não, é minha primeira vez"
              description={needsInstall ? "Instalar o app e criar conta" : "Criar conta grátis"}
              onClick={() => {
                if (needsInstall) setStep("hasAccountNo");
                else goRegister();
              }}
              primary
            />
          </motion.div>
        )}

        {step === "hasAccountYes" && (
          <motion.div
            key="hasAccountYes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <ChoiceCard
              icon={CheckCircle2}
              title="Sim, já instalei"
              description="Abrir o app e entrar"
              onClick={goLogin}
              primary
            />
            <ChoiceCard
              icon={Download}
              title="Ainda não instalei"
              description="Ver como instalar em segundos"
              onClick={goInstall}
            />

            <InfoNote>
              Depois de instalar, abra o Já Limpo pelo ícone na tela inicial.
              As atualizações são automáticas ao reabrir o app.
            </InfoNote>
          </motion.div>
        )}

        {step === "hasAccountNo" && (
          <motion.div
            key="hasAccountNo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <ChoiceCard
              icon={Download}
              title="Instalar o app agora"
              description="Rápido, sem loja. Depois criamos sua conta."
              onClick={goInstall}
              primary
            />
            <ChoiceCard
              icon={UserPlus}
              title="Prefiro criar conta pelo navegador"
              description="Você pode instalar depois"
              onClick={goRegister}
            />

            <InfoNote>
              Instalar antes deixa o app na tela inicial, mais rápido e com
              atualizações automáticas.
            </InfoNote>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
        Ao continuar você aceita nossos{" "}
        <a href="/terms" className="text-primary hover:underline">termos</a>{" "}
        e{" "}
        <a href="/privacy" className="text-primary hover:underline">política de privacidade</a>.
      </p>
    </AuthLayout>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl bg-muted/40 border border-border/60 p-3.5 flex items-start gap-3">
      <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  description,
  onClick,
  primary,
}: {
  icon: typeof LogIn;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={
        primary
          ? "w-full flex items-center gap-3 p-4 rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 active:scale-[0.99] transition-transform text-left"
          : "w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 hover:bg-muted transition-colors text-left"
      }
    >
      <div
        className={
          primary
            ? "w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0"
            : "w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
        }
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={primary ? "text-sm font-semibold" : "text-sm font-semibold text-foreground"}>
          {title}
        </div>
        <div
          className={
            primary
              ? "text-xs opacity-90 mt-0.5"
              : "text-xs text-muted-foreground mt-0.5"
          }
        >
          {description}
        </div>
      </div>
      <ArrowRight className={primary ? "w-4 h-4 opacity-90" : "w-4 h-4 text-muted-foreground"} />
    </motion.button>
  );
}
